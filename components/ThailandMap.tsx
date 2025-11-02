"use client";

import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { Politician, groupPoliticiansByProvince, VotingStats } from "@/lib/api";
import { provinceGridLayout } from "@/lib/provinceGridSimple";
import MapTooltip from "./MapTooltip";

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
  const [tooltip, setTooltip] = useState<{
    isVisible: boolean;
    position: { x: number; y: number };
    provinceName: string;
    mps: Politician[];
    votingStats?: VotingStats | null;
    totalVotes: number;
  }>({
    isVisible: false,
    position: { x: 0, y: 0 },
    provinceName: "",
    mps: [],
    votingStats: null,
    totalVotes: 0,
  });

  // วาดแผนที่แบบ Tile Grid
  useEffect(() => {
    if (!svgRef.current) return;

    const tileSize = 35; // ขนาดของแต่ละสี่เหลี่ยม (ลดลงเพิ่ม)
    const tileSpacing = 3; // ระยะห่างระหว่างสี่เหลี่ยม (ลดลงเพิ่ม)
    const totalTileSize = tileSize + tileSpacing;
    const marginLeft = 20; // margin ซ้าย (ลดลงเพิ่ม)
    const marginTop = 20; // margin บน (ลดลงเพิ่ม)

    const svg = d3.select(svgRef.current);

    // Clear existing
    svg.selectAll("*").remove();

    const politiciansByProvince = groupPoliticiansByProvince(politicians);

    // Helper function to get fill color
    const getProvinceFill = (provinceName: string): string => {
      if (selectedBillId && votingStats) {
        const stats = votingStats[provinceName];

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
      const totalVotes = totalVotes2025?.[provinceName] || 0;
      if (totalVotes === 0) return "#e5e7eb";

      const maxVotes = Math.max(...Object.values(totalVotes2025 || {}));
      const colorScale = d3
        .scaleSequential(d3.interpolateRdYlGn)
        .domain([0, maxVotes]);

      return colorScale(totalVotes);
    };

    // Draw provinces
    const g = svg.append("g").attr("class", "provinces-group");

    // เพิ่ม zoom behavior
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 8]) // จำกัด zoom ระหว่าง 1x ถึง 8x
      .on("zoom", (event) => {
        const transform = event.transform;

        // ถ้า zoom = 1 (zoom out สุด) ให้ล็อคตำแหน่งไว้ที่กลาง
        if (transform.k === 1) {
          g.attr("transform", `translate(0,0) scale(1)`);
        } else {
          g.attr("transform", transform);
        }
      });

    svg.call(zoom);

    // วาด tile สำหรับแต่ละจังหวัด
    Object.entries(provinceGridLayout).forEach(([provinceName, position]) => {
      const { row, col, abbr } = position;

      const x = col * totalTileSize + marginLeft;
      const y = row * totalTileSize + marginTop;

      // สร้าง group สำหรับแต่ละจังหวัด
      const provinceGroup = g
        .append("g")
        .attr("class", "province-tile")
        .attr("data-province", provinceName)
        .style("cursor", "pointer");

      // วาดสี่เหลี่ยม
      provinceGroup
        .append("rect")
        .attr("x", x)
        .attr("y", y)
        .attr("width", tileSize)
        .attr("height", tileSize)
        .attr("rx", 4) // มุมโค้ง
        .attr("fill", getProvinceFill(provinceName))
        .attr("stroke", "#ffffff")
        .attr("stroke-width", 2)
        .style("transition", "all 0.3s ease");

      // เพิ่มตัวย่อจังหวัด
      provinceGroup
        .append("text")
        .attr("x", x + tileSize / 2)
        .attr("y", y + tileSize / 2)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("font-size", "10px") // ลดขนาดฟอนต์เพิ่ม
        .attr("font-weight", "bold")
        .attr("fill", "#1f2937")
        .attr("pointer-events", "none") // ไม่รับ mouse events
        .text(abbr);

      // เพิ่ม event handlers
      provinceGroup
        .on("mouseover", function (event: MouseEvent) {
          d3.select(this).select("rect").style("opacity", 0.7);

          const mps = politiciansByProvince[provinceName] || [];
          const totalVotes = totalVotes2025?.[provinceName] || 0;
          const stats = votingStats?.[provinceName] || null;

          // Get the position relative to the SVG container
          const svgRect = svgRef.current?.getBoundingClientRect();
          const mouseX = event.clientX - (svgRect?.left || 0);
          const mouseY = event.clientY - (svgRect?.top || 0);

          setTooltip({
            isVisible: true,
            position: { x: mouseX, y: mouseY },
            provinceName,
            mps,
            votingStats: stats,
            totalVotes,
          });
        })
        .on("mousemove", function (event: MouseEvent) {
          // Get the position relative to the SVG container
          const svgRect = svgRef.current?.getBoundingClientRect();
          const mouseX = event.clientX - (svgRect?.left || 0);
          const mouseY = event.clientY - (svgRect?.top || 0);

          setTooltip((prev) => ({
            ...prev,
            position: { x: mouseX, y: mouseY },
          }));
        })
        .on("mouseout", function () {
          d3.select(this).select("rect").style("opacity", 1);
          setTooltip((prev) => ({ ...prev, isVisible: false }));
        })
        .on("click", function () {
          const mps = politiciansByProvince[provinceName] || [];
          onProvinceSelected(provinceName, mps);
        });
    });
  }, [
    politicians,
    selectedBillId,
    votingStats,
    totalVotes2025,
    onProvinceSelected,
  ]);

  return (
    <div className="relative w-full h-full">
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        viewBox="0 0 400 700"
        preserveAspectRatio="xMidYMid meet"
      />
      <MapTooltip
        provinceName={tooltip.provinceName}
        mps={tooltip.mps}
        selectedBillId={selectedBillId}
        votingStats={tooltip.votingStats}
        totalVotes={tooltip.totalVotes}
        position={tooltip.position}
        isVisible={tooltip.isVisible}
      />
    </div>
  );
}
