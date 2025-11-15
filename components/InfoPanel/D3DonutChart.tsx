"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";
import type { MPStats } from "./types";
import { USAGE_COLORS, DEFAULT_COLORS } from "../ThailandMap/constants";

interface D3DonutChartProps {
  stats: MPStats;
  width?: number;
  height?: number;
}

/**
 * D3 Donut Chart Component
 * Visualizes voting participation using a donut chart
 * Shows percentage of votes cast vs. abstained/absent with external labels
 */
export default function D3DonutChart({
  stats,
  width = 140,
  height = 140,
}: D3DonutChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !stats) return;

    const used = stats.agreeCount + stats.disagreeCount;
    const other = stats.abstainCount + stats.noVoteCount + stats.absentCount;
    const total = stats.total;

    const data = [
      { label: "ใช้สิทธิ์", value: used, color: USAGE_COLORS.USED },
      { label: "ไม่ใช้สิทธิ์", value: other, color: USAGE_COLORS.NOT_USED },
    ];

    // Reserve space for labels
    const chartSize = Math.min(width, height);
    const radius = chartSize * 0.35; // Reduce donut size to make room for labels
    const innerRadius = radius * 0.6;

    // Clear previous content
    d3.select(containerRef.current).selectAll("*").remove();

    const svg = d3
      .select(containerRef.current)
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    const g = svg
      .append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`);

    // Create pie layout
    const pie = d3
      .pie<{ label: string; value: number; color: string }>()
      .value((d) => d.value)
      .sort(null)
      .startAngle(-Math.PI / 2)
      .endAngle((3 * Math.PI) / 2);

    // Create arc generator
    const arc = d3
      .arc<d3.PieArcDatum<{ label: string; value: number; color: string }>>()
      .innerRadius(innerRadius)
      .outerRadius(radius);

    // Arc for label positioning (outside the donut)
    const outerArc = d3
      .arc<d3.PieArcDatum<{ label: string; value: number; color: string }>>()
      .innerRadius(radius * 1.15)
      .outerRadius(radius * 1.15);

    // Draw arcs
    const arcs = g
      .selectAll(".arc")
      .data(pie(data))
      .join("path")
      .attr("class", "arc")
      .attr("fill", (d) => d.data.color)
      .attr("stroke", "none");

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

    // Add text labels positioned at segment centroids
    const pieData = pie(data);

    pieData.forEach((d) => {
      const percent = ((d.data.value / total) * 100).toFixed(1);
      const centroid = outerArc.centroid(d);

      // Position labels closer to donut
      const x = centroid[0] * 1.15;
      const y = centroid[1] * 1.15;

      // Create text group
      const textGroup = g.append("g").attr("transform", `translate(${x},${y})`);

      // Add label text
      textGroup
        .append("text")
        .attr("text-anchor", x > 0 ? "start" : "end")
        .attr("dy", "-0.2em")
        .attr("font-size", "8px")
        .attr("font-weight", "600")
        .attr("fill", DEFAULT_COLORS.GRAY_700)
        .attr("font-family", "var(--font-sukhumvit), system-ui, sans-serif")
        .text(d.data.label);

      // Add percentage text
      textGroup
        .append("text")
        .attr("text-anchor", x > 0 ? "start" : "end")
        .attr("dy", "0.7em")
        .attr("font-size", "9px")
        .attr("font-weight", "700")
        .attr(
          "fill",
          d.data.label === "ใช้สิทธิ์"
            ? d.data.color
            : USAGE_COLORS.NOT_USED_TEXT
        )
        .attr("font-family", "var(--font-sukhumvit), system-ui, sans-serif")
        .text(`${percent}%`);
    });
  }, [stats, width, height]);

  return (
    <div
      ref={containerRef}
      style={{ position: "relative", width, height }}
    ></div>
  );
}
