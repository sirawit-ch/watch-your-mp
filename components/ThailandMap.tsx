"use client";

import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import type { PersonData } from "@/lib/types";
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

interface ProvinceVoteStats {
  province: string;
  agreeCount: number;
  disagreeCount: number;
  abstainCount: number;
  absentCount: number;
  total: number;
}

interface ThailandMapProps {
  politicians: PersonData[];
  partyListMPs: PersonData[];
  provinceVoteStats: Record<string, ProvinceVoteStats>;
  onProvinceSelected: (province: string, mps: PersonData[]) => void;
  selectedVoteOption?: string | null;
}

export default function ThailandMap({
  politicians,
  partyListMPs,
  provinceVoteStats,
  onProvinceSelected,
  selectedVoteOption,
}: ThailandMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const zoomStateRef = useRef<d3.ZoomTransform | null>(null); // เก็บ zoom state
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null); // เก็บจังหวัดที่เลือก
  const [tooltip, setTooltip] = useState<{
    isVisible: boolean;
    position: { x: number; y: number };
    provinceName: string;
    mps: PersonData[];
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

    // Group people by province using m__province field
    const politiciansByProvince: Record<string, PersonData[]> = {};
    politicians.forEach((person) => {
      if (person.m__province) {
        if (!politiciansByProvince[person.m__province]) {
          politiciansByProvince[person.m__province] = [];
        }
        politiciansByProvince[person.m__province].push(person);
      }
    });

    /**
     * คำนวณสี Heatmap สำหรับแต่ละจังหวัด
     * - ถ้าเลือก "ทั้งหมด" (selectedVoteOption = null): สีม่วง fade ตามสัดส่วนการใช้สิทธิ
     * - ถ้าเลือก option อื่นๆ: สีตาม status และ fade ตาม portion (คำนวณมาแล้ว)
     */
    const getProvinceHeatmapColor = (provinceName: string): string => {
      const stats = provinceVoteStats[provinceName];

      // ถ้าไม่มีข้อมูลการลงมติ
      if (!stats) {
        return "#e5e7eb"; // สีเทาอ่อน
      }

      const { agreeCount, disagreeCount, abstainCount, absentCount, total } =
        stats;

      // ถ้าไม่มีการลงมติเลย
      if (total === 0) {
        return "#e5e7eb";
      }

      // === กรณีเลือก "ทั้งหมด" (All) ===
      if (!selectedVoteOption) {
        // portion ของการใช้สิทธิ (เห็นด้วย + ไม่เห็นด้วย) คำนวณมาแล้ว
        const usageRate = agreeCount + disagreeCount;

        // จำกัด opacity ระหว่าง 0.2 ถึง 0.9
        const opacity = Math.max(0.2, Math.min(0.9, usageRate));

        // สีม่วง - RGB: 139, 92, 246 (purple-500)
        return `rgba(139, 92, 246, ${opacity})`;
      }

      // === กรณีเลือก option เฉพาะ ===
      // portion คำนวณมาแล้วในข้อมูล
      let portionRate = 0;
      let baseColor = "";

      switch (selectedVoteOption) {
        case "เห็นด้วย":
          portionRate = agreeCount;
          baseColor = "0, 199, 88"; // #00C758 สีเขียว
          break;
        case "ไม่เห็นด้วย":
          portionRate = disagreeCount;
          baseColor = "239, 68, 68"; // #EF4444 สีแดง
          break;
        case "งดออกเสียง":
          portionRate = abstainCount;
          baseColor = "237, 178, 0"; // #EDB200 สีเหลือง
          break;
        case "ไม่ลงคะแนนเสียง":
          // คำนวณจาก total - (agree + disagree + abstain + absent)
          portionRate =
            total - (agreeCount + disagreeCount + abstainCount + absentCount);
          baseColor = "31, 41, 55"; // #1F2937 สีดำ
          break;
        case "ลา / ขาดลงมติ":
          portionRate = absentCount;
          baseColor = "107, 114, 128"; // #6B7280 สีเทาเข้ม
          break;
        default:
          return "#e5e7eb";
      }

      // จำกัด opacity ระหว่าง 0.2 ถึง 0.9
      const opacity = Math.max(0.2, Math.min(0.9, portionRate));

      return `rgba(${baseColor}, ${opacity})`;
    };

    // Draw provinces
    const g = svg.append("g").attr("class", "provinces-group");

    // เพิ่ม zoom behavior
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 8])
      .on("zoom", (event) => {
        const transform = event.transform;

        // บันทึก zoom state
        zoomStateRef.current = transform;

        // ถ้า zoom = 1 (zoom out สุด) ให้ล็อคตำแหน่งไว้ที่กลาง
        if (transform.k === 1) {
          g.attr("transform", `translate(0,0) scale(1)`);
        } else {
          g.attr("transform", transform);
        }
      });

    svg.call(zoom);

    // กู้คืน zoom state ถ้ามี (เมื่อ re-render)
    if (zoomStateRef.current) {
      svg.call(zoom.transform, zoomStateRef.current);
    }

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
      const rect = provinceGroup
        .append("rect")
        .attr("x", x)
        .attr("y", y)
        .attr("width", tileSize)
        .attr("height", tileSize)
        .attr("rx", 4)
        .attr("fill", getProvinceHeatmapColor(provinceName))
        .attr(
          "stroke",
          selectedProvince === provinceName ? "#ff6b00" : "#ffffff"
        )
        .attr("stroke-width", selectedProvince === provinceName ? 4 : 2)
        .style("transition", "all 0.3s ease");

      // เพิ่ม highlight indicator ถ้าถูกเลือก
      if (selectedProvince === provinceName) {
        rect.style("filter", "drop-shadow(0 0 8px rgba(255, 107, 0, 0.8))");
      }

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

          // Toggle selection
          if (selectedProvince === provinceName) {
            // Deselect - ส่งค่า null
            setSelectedProvince(null);
            onProvinceSelected("", []); // Clear selection
          } else {
            // Select - เลือกจังหวัดใหม่
            setSelectedProvince(provinceName);
            onProvinceSelected(provinceName, mps);
          }
        });
    });
  }, [
    politicians,
    provinceVoteStats,
    onProvinceSelected,
    selectedProvince,
    selectedVoteOption,
  ]);

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
            {partyListMPs.map((mp, index) => (
              <ListItem
                key={`party-mp-${index}`}
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
                      {mp.person_name}
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
