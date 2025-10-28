"use client";

import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { Politician, groupPoliticiansByProvince, VotingStats } from "@/lib/api";
import { englishToThai } from "@/lib/provinceMapping";

interface GeoFeature {
  type: string;
  properties: {
    name: string;
    name_en: string;
  };
  geometry: {
    type: string;
    coordinates: number[][][];
  };
}

interface GeoData {
  type: string;
  features: GeoFeature[];
}

interface ThailandMapProps {
  politicians: Politician[];
  selectedBillId?: string | null;
  votingStats?: Record<string, VotingStats> | null;
  totalVotes2025?: Record<string, number> | null;
  onProvinceSelected: (province: string, mps: Politician[]) => void;
}

export default function ThailandMap({
  politicians,
  selectedBillId,
  votingStats,
  totalVotes2025,
  onProvinceSelected,
}: ThailandMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [geoData, setGeoData] = useState<GeoData | null>(null);

  // โหลด GeoJSON
  useEffect(() => {
    fetch("/thailand-provinces.json")
      .then((res) => res.json())
      .then((data) => setGeoData(data))
      .catch((error) => console.error("Error loading GeoJSON:", error));
  }, []);

  // วาดแผนที่
  useEffect(() => {
    if (!svgRef.current || !geoData) return;

    const width = 800;
    const height = 600;
    const svg = d3.select(svgRef.current);
    const tooltip = d3.select(tooltipRef.current);

    // Clear existing
    svg.selectAll("*").remove();

    // Setup projection - ใช้ fitSize เพื่อให้แสดงทั้งประเทศ
    const projection = d3.geoMercator();
    const path = d3.geoPath().projection(projection);

    // คำนวณ bounds และ fit ให้พอดีกับ SVG
    projection.fitSize([width, height], geoData as any);

    const politiciansByProvince = groupPoliticiansByProvince(politicians);

    // Helper function to get fill color
    const getProvinceFill = (provinceName: string): string => {
      // Convert English name from GeoJSON to Thai name for matching
      const thaiProvinceName = englishToThai(provinceName);

      if (selectedBillId && votingStats) {
        const stats = votingStats[thaiProvinceName];

        if (!stats) return "#e5e7eb";

        const { approve, disapprove, total } = stats;
        if (total === 0) return "#e5e7eb";

        const approvePercent = approve / total;
        const disapprovePercent = disapprove / total;

        if (approvePercent > 0.5) {
          return d3.interpolateGreens(approvePercent);
        } else if (disapprovePercent > 0.5) {
          return d3.interpolateReds(disapprovePercent);
        } else {
          return "#fbbf24";
        }
      }

      // โหมดแสดงจำนวนการลงคะแนนรวมทั้งหมดในปี 2025
      const totalVotes = totalVotes2025?.[thaiProvinceName] || 0;
      if (totalVotes === 0) return "#e5e7eb";

      const maxVotes = Math.max(
        ...Object.values(totalVotes2025 || {})
      );
      const colorScale = d3
        .scaleSequential(d3.interpolateBlues)
        .domain([0, maxVotes]);

      return colorScale(totalVotes);
    };

    // Draw provinces
    const g = svg.append("g");

    // เพิ่ม zoom behavior
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 8]) // จำกัด zoom ระหว่าง 1x ถึง 8x
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg.call(zoom);

    g.selectAll("path")
      .data(geoData.features)
      .enter()
      .append("path")
      .attr("d", (d) => path(d as any) || "")
      .attr("class", "province-path")
      .attr("fill", (d: GeoFeature) => getProvinceFill(d.properties.name))
      .attr("stroke", "#ffffff")
      .attr("stroke-width", 1)
      .style("cursor", "pointer")
      .style("transition", "all 0.3s ease")
      .on("mouseover", function (event: MouseEvent, d: GeoFeature) {
        d3.select(this).style("opacity", 0.7);

        const provinceName = d.properties.name;
        const thaiProvinceName = englishToThai(provinceName);
        const mps = politiciansByProvince[thaiProvinceName] || [];

        let html = `<div class="font-semibold text-lg mb-2">${thaiProvinceName}</div>`;

        if (selectedBillId && votingStats) {
          const stats = votingStats[thaiProvinceName];
          if (stats) {
            html += `
              <div class="text-sm space-y-1">
                <div>เห็นด้วย: <span class="font-semibold text-green-600">${stats.approve}</span></div>
                <div>ไม่เห็นด้วย: <span class="font-semibold text-red-600">${stats.disapprove}</span></div>
                <div>งดออกเสียง: <span class="font-semibold text-yellow-600">${stats.abstain}</span></div>
              </div>
            `;
          } else {
            html += `<div class="text-sm text-gray-500">ไม่มีข้อมูลการลงคะแนน</div>`;
          }
        } else {
          const totalVotes = totalVotes2025?.[thaiProvinceName] || 0;
          html += `<div class="text-sm mb-2">จำนวนการลงคะแนนรวม (2025): <span class="font-semibold">${totalVotes}</span> ครั้ง</div>`;
          html += `<div class="text-sm mb-2">จำนวน ส.ส.: <span class="font-semibold">${mps.length}</span> คน</div>`;
          if (mps.length > 0) {
            html += `<div class="text-xs text-gray-600">คลิกเพื่อดูรายละเอียด</div>`;
          }
        }

        tooltip.html(html).classed("hidden", false);
      })
      .on("mousemove", function (event: MouseEvent) {
        tooltip
          .style("left", event.pageX + 15 + "px")
          .style("top", event.pageY - 10 + "px");
      })
      .on("mouseout", function () {
        d3.select(this).style("opacity", 1);
        tooltip.classed("hidden", true);
      })
      .on("click", function (event: MouseEvent, d: GeoFeature) {
        const provinceName = d.properties.name;
        const thaiProvinceName = englishToThai(provinceName);
        const mps = politiciansByProvince[thaiProvinceName] || [];
        onProvinceSelected(thaiProvinceName, mps);
      });
  }, [geoData, politicians, selectedBillId, votingStats, totalVotes2025, onProvinceSelected]);

  return (
    <div className="relative">
      <svg ref={svgRef} width="100%" height="600" />
      <div
        ref={tooltipRef}
        className="hidden absolute pointer-events-none bg-white border border-gray-200 rounded-lg p-3 shadow-lg z-50 max-w-sm"
      />
    </div>
  );
}
