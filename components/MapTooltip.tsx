"use client";

import React, { useMemo, useEffect, useRef, useState } from "react";
import type { PersonData } from "@/lib/types";

interface ProvinceVoteStats {
  province: string;
  agreeCount: number;
  disagreeCount: number;
  abstainCount: number;
  noVoteCount: number;
  absentCount: number;
  total: number;
}

interface MapTooltipProps {
  provinceName: string;
  mps: PersonData[];
  voteStats?: ProvinceVoteStats;
  position: { x: number; y: number };
  isVisible: boolean;
  selectedVoteOption?: string | null;
  containerWidth?: number; // เพิ่ม prop สำหรับความกว้างของ container
}

export default function MapTooltip({
  provinceName,
  mps,
  voteStats,
  position,
  isVisible,
  selectedVoteOption,
  containerWidth,
}: MapTooltipProps) {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [tooltipWidth, setTooltipWidth] = useState(0);

  // วัดความกว้างของ tooltip
  useEffect(() => {
    if (tooltipRef.current) {
      setTooltipWidth(tooltipRef.current.offsetWidth);
    }
  }, [isVisible, provinceName]);

  // คำนวณตำแหน่ง tooltip โดยตรวจสอบว่าใกล้ขอบขวาหรือไม่
  const tooltipPosition = useMemo(() => {
    const offset = 15;
    const tooltipEstimatedWidth = tooltipWidth || 280; // ใช้ 280 เป็นค่าประมาณถ้ายังไม่ได้วัด
    const containerW = containerWidth || 800; // ค่า default ถ้าไม่ได้ส่งมา

    // ตรวจสอบว่าถ้าแสดง tooltip ทางขวาแล้วจะเกินขอบหรือไม่
    const wouldOverflowRight =
      position.x + offset + tooltipEstimatedWidth > containerW;

    return {
      x: wouldOverflowRight
        ? position.x - tooltipEstimatedWidth - offset // แสดงทางซ้าย
        : position.x + offset, // แสดงทางขวาตามปกติ
      y: position.y + offset,
    };
  }, [position, tooltipWidth, containerWidth]);

  if (!isVisible) return null;

  return (
    <div
      ref={tooltipRef}
      className="absolute z-50 pointer-events-none"
      style={{
        left: `${tooltipPosition.x}px`,
        top: `${tooltipPosition.y}px`,
        fontFamily: "var(--font-sukhumvit), system-ui, sans-serif",
      }}
    >
      <div className="bg-white rounded-lg border border-gray-200 p-3 min-w-[200px] max-w-[280px]">
        {/* Province Name */}
        <div className="font-bold text-sm text-gray-900 mb-2">
          {provinceName}
        </div>

        {/* MP Count */}
        <div className="text-xs text-gray-600 mb-2">
          จำนวน ส.ส.: <span className="font-semibold">{mps.length}</span> คน
        </div>

        {/* Vote Statistics */}
        {voteStats && (
          <div className="space-y-1.5 pt-2 border-t border-gray-200">
            {!selectedVoteOption ? (
              // แสดง "สัดส่วนการใช้สิทธิ" เมื่อเลือก "ทั้งหมด"
              <>
                <div className="text-xs font-semibold text-gray-700 mb-1.5">
                  สัดส่วนการใช้สิทธิ:
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: "#678967" }}
                  ></div>
                  <span
                    className="text-lg font-bold"
                    style={{ color: "#678967" }}
                  >
                    {(
                      (voteStats.agreeCount + voteStats.disagreeCount) *
                      100
                    ).toFixed(1)}
                    %
                  </span>
                </div>
              </>
            ) : (
              // แสดง "สัดส่วนคะแนนโหวต" เมื่อเลือก filter เฉพาะ
              <>
                <div className="text-xs font-semibold text-gray-700 mb-1.5">
                  สัดส่วนคะแนนโหวต:
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor:
                        selectedVoteOption === "เห็นด้วย"
                          ? "#060b7d"
                          : selectedVoteOption === "ไม่เห็นด้วย"
                          ? "#9d0606"
                          : selectedVoteOption === "งดออกเสียง"
                          ? "#d9d9d9"
                          : selectedVoteOption === "ไม่ลงคะแนนเสียง"
                          ? "#b4b4b4"
                          : selectedVoteOption === "ลา / ขาดลงมติ"
                          ? "#545454"
                          : "#D1D5DB",
                    }}
                  ></div>
                  <span className="text-xs text-gray-600">
                    {selectedVoteOption}:
                  </span>
                  <span
                    className="text-lg font-bold"
                    style={{
                      color:
                        selectedVoteOption === "เห็นด้วย"
                          ? "#060b7d"
                          : selectedVoteOption === "ไม่เห็นด้วย"
                          ? "#9d0606"
                          : selectedVoteOption === "งดออกเสียง"
                          ? "#d9d9d9"
                          : selectedVoteOption === "ไม่ลงคะแนนเสียง"
                          ? "#b4b4b4"
                          : selectedVoteOption === "ลา / ขาดลงมติ"
                          ? "#545454"
                          : "#9CA3AF", // สีเทากลาง (gray-400) สำหรับ default
                    }}
                  >
                    {(
                      (selectedVoteOption === "เห็นด้วย"
                        ? voteStats.agreeCount
                        : selectedVoteOption === "ไม่เห็นด้วย"
                        ? voteStats.disagreeCount
                        : selectedVoteOption === "งดออกเสียง"
                        ? voteStats.abstainCount
                        : selectedVoteOption === "ไม่ลงคะแนนเสียง"
                        ? voteStats.noVoteCount
                        : selectedVoteOption === "ลา / ขาดลงมติ"
                        ? voteStats.absentCount
                        : 0) * 100
                    ).toFixed(2)}
                    %
                  </span>
                </div>
              </>
            )}
          </div>
        )}

        {!voteStats && (
          <div className="text-xs text-gray-500 italic pt-2 border-t border-gray-200">
            ไม่มีข้อมูลการลงมติ
          </div>
        )}
      </div>
    </div>
  );
}
