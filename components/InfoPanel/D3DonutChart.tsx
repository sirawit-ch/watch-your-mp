"use client";

import React, { useRef, useEffect } from "react";
import * as d3 from "d3";
import type { MPStats } from "./types";

interface D3DonutChartProps {
  stats: MPStats;
  width?: number;
  height?: number;
}

/**
 * D3 Donut Chart Component
 * Visualizes voting participation using a donut chart
 * Shows percentage of votes cast vs. abstained/absent
 */
export default function D3DonutChart({
  stats,
  width = 150,
  height = 150,
}: D3DonutChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !stats) return;

    const used = stats.agreeCount + stats.disagreeCount;
    const other = stats.abstainCount + stats.noVoteCount + stats.absentCount;
    const total = stats.total;

    const data = [
      { label: "ใช้สิทธิ์", value: used, color: "##065f46" },
      { label: "ไม่ใช้สิทธิ์", value: other, color: "##fffdfd" },
    ];

    const radius = Math.min(width, height) / 2;
    const innerRadius = radius * 0.6;

    // Clear previous content
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height);

    const g = svg
      .append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`);

    // Create pie layout
    const pie = d3
      .pie<{ label: string; value: number; color: string }>()
      .value((d) => d.value)
      .sort(null);

    // Create arc generator
    const arc = d3
      .arc<d3.PieArcDatum<{ label: string; value: number; color: string }>>()
      .innerRadius(innerRadius)
      .outerRadius(radius);

    // Draw arcs
    const arcs = g
      .selectAll(".arc")
      .data(pie(data))
      .join("path")
      .attr("class", "arc")
      .attr("fill", (d) => d.data.color)
      .attr("stroke", "white")
      .attr("stroke-width", 2);

    // Animate arcs
    arcs
      .transition()
      .duration(800)
      .attrTween("d", function (d) {
        const interpolate = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
        return function (t) {
          return arc(interpolate(t)) || "";
        };
      });

    // Add center text (percentage)
    const usedPercent = (used / total) * 100;
    g.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .attr("font-size", width > 130 ? "20px" : "16px")
      .attr("font-weight", "bold")
      .attr("font-family", "var(--font-sukhumvit), system-ui, sans-serif")
      .attr("fill", "#8B5CF6")
      .text(`${usedPercent.toFixed(0)}%`)
      .style("opacity", 0)
      .transition()
      .duration(800)
      .style("opacity", 1);
  }, [stats, width, height]);

  return <svg ref={svgRef}></svg>;
}
