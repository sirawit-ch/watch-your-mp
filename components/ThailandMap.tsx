"use client";

import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import type { PersonData } from "@/lib/types";
import { provinceGridLayout } from "@/lib/provinceGridSimple";
import MapTooltip from "./MapTooltip";
import { MAP_CONFIG, STROKE_CONFIG } from "./ThailandMap/constants";
import {
  groupPoliticiansByProvince,
  calculateTotalTileSize,
  calculateTilePosition,
} from "./ThailandMap/helpers";
import {
  getProvinceHeatmapColor,
  getTextColorForBackground,
} from "./ThailandMap/colorUtils";
import type { ProvinceVoteStats, TooltipState } from "./ThailandMap/types";

interface ThailandMapProps {
  politicians: PersonData[];
  partyListMPs: PersonData[];
  provinceVoteStats: Record<string, ProvinceVoteStats>;
  onProvinceSelected: (province: string, mps: PersonData[]) => void;
  selectedVoteOption?: string | null;
  selectedProvince?: string | null;
}

export default function ThailandMap({
  politicians,
  // partyListMPs,
  provinceVoteStats,
  onProvinceSelected,
  selectedVoteOption,
  selectedProvince = null,
}: ThailandMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null); // เพิ่ม ref สำหรับ container
  const zoomStateRef = useRef<d3.ZoomTransform | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [tooltip, setTooltip] = useState<TooltipState>({
    isVisible: false,
    position: { x: 0, y: 0 },
    provinceName: "",
    mps: [],
    voteStats: undefined,
  });

  // วัดความกว้างของ container
  useEffect(() => {
    if (containerRef.current) {
      setContainerWidth(containerRef.current.offsetWidth);

      // ติดตั้ง resize observer เพื่ออัพเดทความกว้างเมื่อ resize
      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          setContainerWidth(entry.contentRect.width);
        }
      });

      resizeObserver.observe(containerRef.current);

      return () => {
        resizeObserver.disconnect();
      };
    }
  }, []);

  // วาดแผนที่แบบ Tile Grid พร้อม Heatmap
  useEffect(() => {
    if (!svgRef.current) return;

    const totalTileSize = calculateTotalTileSize(
      MAP_CONFIG.TILE_SIZE,
      MAP_CONFIG.TILE_SPACING
    );

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const politiciansByProvince = groupPoliticiansByProvince(politicians);

    // Draw provinces
    const g = svg.append("g").attr("class", "provinces-group");

    // เพิ่ม zoom behavior
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([MAP_CONFIG.ZOOM_MIN, MAP_CONFIG.ZOOM_MAX])
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

      const { x, y } = calculateTilePosition(
        row,
        col,
        totalTileSize,
        MAP_CONFIG.MARGIN_LEFT,
        MAP_CONFIG.MARGIN_TOP
      );

      // สร้าง group สำหรับแต่ละจังหวัด
      const provinceGroup = g
        .append("g")
        .attr("class", "province-tile")
        .attr("data-province", provinceName)
        .style("cursor", "pointer");

      // วาดสี่เหลี่ยม
      const backgroundColor = getProvinceHeatmapColor(
        provinceName,
        provinceVoteStats,
        selectedVoteOption ?? null
      );

      provinceGroup
        .append("rect")
        .attr("x", x)
        .attr("y", y)
        .attr("width", MAP_CONFIG.TILE_SIZE)
        .attr("height", MAP_CONFIG.TILE_SIZE)
        .attr("rx", 4)
        .attr("fill", backgroundColor)
        .attr("stroke", STROKE_CONFIG.DEFAULT_COLOR)
        .attr("stroke-width", STROKE_CONFIG.DEFAULT_WIDTH)
        .style("transition", "all 0.3s ease");

      // เพิ่ม highlight indicator ถ้าถูกเลือก
      // if (selectedProvince === provinceName) {
      //   rect.style("filter", "drop-shadow(0 0 8px gray)");
      // }

      // เพิ่มตัวย่อจังหวัด - ใช้สีที่เหมาะสมกับพื้นหลัง
      const textColor = getTextColorForBackground(backgroundColor);

      provinceGroup
        .append("text")
        .attr("x", x + MAP_CONFIG.TILE_SIZE / 2)
        .attr("y", y + MAP_CONFIG.TILE_SIZE / 2)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("font-size", `${MAP_CONFIG.FONT_SIZE}px`)
        .attr("font-weight", "bold")
        .attr("font-family", "var(--font-sukhumvit), system-ui, sans-serif")
        .attr("fill", textColor)
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
            onProvinceSelected("", []); // Clear selection
          } else {
            // Select - เลือกจังหวัดใหม่
            onProvinceSelected(provinceName, mps);
          }
        });
    });
  }, [
    politicians,
    provinceVoteStats,
    onProvinceSelected,
    selectedVoteOption,
    selectedProvince,
  ]);

  // Update stroke when selectedProvince changes
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);

    // Reset all strokes to default
    svg
      .selectAll(".province-tile rect")
      .attr("stroke", STROKE_CONFIG.DEFAULT_COLOR)
      .attr("stroke-width", STROKE_CONFIG.DEFAULT_WIDTH);

    // Highlight selected province
    if (selectedProvince) {
      svg
        .select(`.province-tile[data-province="${selectedProvince}"] rect`)
        .attr("stroke", STROKE_CONFIG.SELECTED_COLOR)
        .attr("stroke-width", STROKE_CONFIG.SELECTED_WIDTH);
    }
  }, [selectedProvince]);

  return (
    <div className="relative w-full h-full flex flex-col gap-3">
      {/* Party List MPs Block - ขวาบน */}
      {/* <Paper
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
      </Paper> */}

      {/* Map SVG */}
      <div ref={containerRef} className="flex-1 relative">
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          viewBox="-450 0 1200 900"
          preserveAspectRatio="xMidYMid meet"
        />

        <MapTooltip
          provinceName={tooltip.provinceName}
          mps={tooltip.mps}
          voteStats={tooltip.voteStats}
          position={tooltip.position}
          isVisible={tooltip.isVisible}
          selectedVoteOption={selectedVoteOption}
          containerWidth={containerWidth}
        />
      </div>

      {/* Color Legend - อยู่ข้างนอก SVG container */}
      {/* <div
        className="absolute bottom-3 left-3 bg-white rounded border border-gray-200 px-2 py-1.5 z-10"
        style={{ fontFamily: "var(--font-sukhumvit), system-ui, sans-serif" }}
      >
        <div className="text-[10px] font-semibold text-gray-700 mb-1">
          {!selectedVoteOption ? "สัดส่วนการใช้สิทธิ" : "สัดส่วนคะแนนโหวต"}
        </div> */}

      {/* Gradient Bar */}
      {/* <div className="flex items-center gap-1.5">
          <span className="text-[9px] text-gray-500">น้อย</span>
          <div
            className="w-20 h-2.5 rounded"
            style={{
              background: !selectedVoteOption
                ? "linear-gradient(to right, rgba(139, 92, 246, 0.2), rgba(139, 92, 246, 0.9))"
                : selectedVoteOption === "เห็นด้วย"
                ? "linear-gradient(to right, rgba(0, 199, 88, 0.2), rgba(0, 199, 88, 0.9))"
                : selectedVoteOption === "ไม่เห็นด้วย"
                ? "linear-gradient(to right, rgba(239, 68, 68, 0.2), rgba(239, 68, 68, 0.9))"
                : selectedVoteOption === "งดออกเสียง"
                ? "linear-gradient(to right, rgba(237, 178, 0, 0.2), rgba(237, 178, 0, 0.9))"
                : selectedVoteOption === "ไม่ลงคะแนนเสียง"
                ? "linear-gradient(to right, rgba(31, 41, 55, 0.2), rgba(31, 41, 55, 0.9))"
                : selectedVoteOption === "ลา / ขาดลงมติ"
                ? "linear-gradient(to right, rgba(107, 114, 128, 0.2), rgba(107, 114, 128, 0.9))"
                : "linear-gradient(to right, rgba(156, 163, 175, 0.2), rgba(156, 163, 175, 0.9))",
            }}
          />
          <span className="text-[9px] text-gray-500">มาก</span>
        </div>
      </div> */}
    </div>
  );
}
