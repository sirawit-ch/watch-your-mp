"use client";

import React, { useRef, useEffect } from "react";
import * as d3 from "d3";
import type { MPStats } from "./types";
import {
  VOTE_OPTION_SINGLE_COLORS,
  DEFAULT_COLORS,
} from "../ThailandMap/constants";

interface D3BarChartProps {
  stats: MPStats;
}

/**
 * D3 Horizontal Bar Chart Component
 * Displays vote breakdown across all voting categories
 * Shows count for each: Agree, Disagree, Abstain, No Vote, Absent
 */
export default function D3BarChart({ stats }: D3BarChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !stats) return;

    const data = [
      {
        label: "เห็นด้วย",
        count: stats.agreeCount,
        color: VOTE_OPTION_SINGLE_COLORS.เห็นด้วย,
      },
      {
        label: "ไม่เห็นด้วย",
        count: stats.disagreeCount,
        color: VOTE_OPTION_SINGLE_COLORS["ไม่เห็นด้วย"],
      },
      {
        label: "งดออกเสียง",
        count: stats.abstainCount,
        color: VOTE_OPTION_SINGLE_COLORS["งดออกเสียง"],
      },
      {
        label: "ไม่ลงคะแนน",
        count: stats.noVoteCount,
        color: VOTE_OPTION_SINGLE_COLORS["ไม่ลงคะแนนเสียง"],
      },
      {
        label: "ลา/ขาดลงมติ",
        count: stats.absentCount,
        color: VOTE_OPTION_SINGLE_COLORS["ลา / ขาดลงมติ"],
      },
    ];

    const containerWidth = containerRef.current.clientWidth || 360;
    const barHeight = 10;
    const itemSpacing = 38;
    const totalHeight = data.length * itemSpacing + 20;

    // Clear previous content
    d3.select(containerRef.current).selectAll("*").remove();

    const svg = d3
      .select(containerRef.current)
      .append("svg")
      .attr("width", containerWidth)
      .attr("height", totalHeight)
      .style("background", "white")
      .style("border-radius", "8px")
      .style("padding", "8px");

    // Scale for bar width
    const xScale = d3
      .scaleLinear()
      .domain([0, stats.total || 1])
      .range([0, containerWidth - 16]);

    // Create groups for each item
    const items = svg
      .selectAll(".item")
      .data(data)
      .join("g")
      .attr("class", "item")
      .attr("transform", (_, i) => `translate(0, ${i * itemSpacing})`);

    // Add labels (left)
    items
      .append("text")
      .attr("x", 0)
      .attr("y", 10)
      .attr("font-size", "11px")
      .attr("font-family", "var(--font-sukhumvit), system-ui, sans-serif")
      .attr("fill", DEFAULT_COLORS.GRAY_500)
      .text((d) => d.label);

    // Add counts (right)
    items
      .append("text")
      .attr("x", containerWidth - 16)
      .attr("y", 10)
      .attr("text-anchor", "end")
      .attr("font-size", "11px")
      .attr("font-weight", "600")
      .attr("font-family", "var(--font-sukhumvit), system-ui, sans-serif")
      .attr("fill", DEFAULT_COLORS.GRAY_700)
      .text((d) => d.count);

    // Add background bars
    items
      .append("rect")
      .attr("x", 0)
      .attr("y", 16)
      .attr("width", containerWidth - 16)
      .attr("height", barHeight)
      .attr("fill", DEFAULT_COLORS.GRAY_200)
      .attr("rx", 4);

    // Add colored bars with animation
    items
      .append("rect")
      .attr("x", 0)
      .attr("y", 16)
      .attr("width", 0)
      .attr("height", barHeight)
      .attr("fill", (d) => d.color)
      .attr("rx", 3)
      .transition()
      .duration(500)
      .attr("width", (d) => xScale(d.count));
  }, [stats]);

  return (
    <div ref={containerRef} style={{ width: "100%", minHeight: "210px" }} />
  );
}
