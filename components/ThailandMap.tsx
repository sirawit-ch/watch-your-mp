"use client";

import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import {
  Politician,
  groupPoliticiansByProvince,
  ProvinceVoteStats,
} from "@/lib/api";
import { provinceGridLayout } from "@/lib/provinceGridSimple";
import MapTooltip from "./MapTooltip";
import {
  Paper,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";

interface ThailandMapProps {
  politicians: Politician[];
  partyListMPs: Politician[];
  provinceVoteStats: Record<string, ProvinceVoteStats>;
  onProvinceSelected: (province: string, mps: Politician[]) => void;
}

export default function ThailandMap({
  politicians,
  partyListMPs,
  provinceVoteStats,
  onProvinceSelected,
}: ThailandMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<{
    isVisible: boolean;
    position: { x: number; y: number };
    provinceName: string;
    mps: Politician[];
    voteStats?: ProvinceVoteStats;
  }>({
    isVisible: false,
    position: { x: 0, y: 0 },
    provinceName: "",
    mps: [],
    voteStats: undefined,
  });

  // วาดแผนที่แบบ Tile Grid พร้อม Heatmap
  useEffect(() => {
    if (!svgRef.current) return;

    const tileSize = 35;
    const tileSpacing = 3;
    const totalTileSize = tileSize + tileSpacing;
    const marginLeft = 20;
    const marginTop = 20;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const politiciansByProvince = groupPoliticiansByProvince(politicians);

    /**
     * คำนวณสี Heatmap สำหรับแต่ละจังหวัด
     * - สีเขียว: เห็นด้วยมากกว่า
     * - สีแดง: ไม่เห็นด้วยมากกว่า
     * - ความเข้ม: ยิ่งมี ส.ส. มาลงมติมาก (agree + disagree) สียิ่งเข้ม
     */
    const getProvinceHeatmapColor = (provinceName: string): string => {
      const stats = provinceVoteStats[provinceName];
      const mps = politiciansByProvince[provinceName] || [];
      const totalMPsInProvince = mps.length;

      // ถ้าไม่มีข้อมูลการลงมติ หรือไม่มี ส.ส. ในจังหวัด
      if (!stats || totalMPsInProvince === 0) {
        return "#e5e7eb"; // สีเทาอ่อน
      }

      const { agreeCount, disagreeCount } = stats;

      // ถ้าไม่มีการลงมติเลย
      if (agreeCount === 0 && disagreeCount === 0) {
        return "#e5e7eb";
      }

      // คำนวณ participation rate (ผู้ที่มาลงมติเห็นด้วย/ไม่เห็นด้วย)
      const participationCount = agreeCount + disagreeCount;
      const participationRate = participationCount / totalMPsInProvince;

      // จำกัด opacity ระหว่าง 0.3 ถึง 0.9 (ไม่ให้จางหรือเข้มเกินไป)
      const opacity = Math.max(0.3, Math.min(0.9, participationRate));

      // เลือกสีตามเสียงข้างมาก
      if (agreeCount > disagreeCount) {
        // สีเขียว (เห็นด้วย) - RGB: 34, 197, 94
        return `rgba(34, 197, 94, ${opacity})`;
      } else if (disagreeCount > agreeCount) {
        // สีแดง (ไม่เห็นด้วย) - RGB: 239, 68, 68
        return `rgba(239, 68, 68, ${opacity})`;
      } else {
        // เท่ากัน - สีเทา
        return `rgba(156, 163, 175, ${opacity})`;
      }
    };

    // Draw provinces
    const g = svg.append("g").attr("class", "provinces-group");

    // เพิ่ม zoom behavior
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 8])
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
        .attr("rx", 4)
        .attr("fill", getProvinceHeatmapColor(provinceName))
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
        .attr("font-size", "10px")
        .attr("font-weight", "bold")
        .attr("fill", "#1f2937")
        .attr("pointer-events", "none")
        .text(abbr);

      // เพิ่ม event handlers
      provinceGroup
        .on("mouseover", function (event: MouseEvent) {
          d3.select(this).select("rect").style("opacity", 0.7);

          const mps = politiciansByProvince[provinceName] || [];
          const stats = provinceVoteStats[provinceName];

          const svgRect = svgRef.current?.getBoundingClientRect();
          const mouseX = event.clientX - (svgRect?.left || 0);
          const mouseY = event.clientY - (svgRect?.top || 0);

          setTooltip({
            isVisible: true,
            position: { x: mouseX, y: mouseY },
            provinceName,
            mps,
            voteStats: stats,
          });
        })
        .on("mousemove", function (event: MouseEvent) {
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
  }, [politicians, provinceVoteStats, onProvinceSelected]);

  return (
    <div className="relative w-full h-full flex flex-col gap-3">
      {/* Party List MPs Block - ขวาบน */}
      <Paper
        elevation={3}
        sx={{
          position: "absolute",
          top: 0,
          right: 0,
          zIndex: 10,
          width: 256,
          p: 2,
          border: 2,
          borderColor: "secondary.main",
        }}
      >
        <Typography
          variant="subtitle1"
          fontWeight="bold"
          color="secondary"
          gutterBottom
        >
          ส.ส. บัญชีรายชื่อ
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mb: 1.5, display: "block" }}
        >
          จำนวน {partyListMPs.length} คน
        </Typography>
        <Box sx={{ maxHeight: 160, overflowY: "auto" }}>
          <List disablePadding>
            {partyListMPs.map((mp) => (
              <ListItem
                key={mp.id}
                sx={{
                  bgcolor: "secondary.lighter",
                  borderRadius: 1,
                  border: 1,
                  borderColor: "secondary.light",
                  mb: 0.5,
                  p: 1,
                }}
              >
                <ListItemText
                  primary={
                    <Typography variant="caption" fontWeight="500" noWrap>
                      {mp.prefix}
                      {mp.firstname} {mp.lastname}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Box>
      </Paper>

      {/* Map SVG */}
      <div className="flex-1 relative">
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          viewBox="-150 -150 700 1200"
          preserveAspectRatio="xMidYMid meet"
        />
        <MapTooltip
          provinceName={tooltip.provinceName}
          mps={tooltip.mps}
          voteStats={tooltip.voteStats}
          position={tooltip.position}
          isVisible={tooltip.isVisible}
        />
      </div>
    </div>
  );
}
