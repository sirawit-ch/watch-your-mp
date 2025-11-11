"use client";

import React, { useMemo } from "react";
import type { PersonData } from "@/lib/types";

interface ProvinceVoteStats {
  province: string;
  agreeCount: number;
  disagreeCount: number;
  abstainCount: number;
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
}

export default function MapTooltip({
  provinceName,
  mps,
  voteStats,
  position,
  isVisible,
  selectedVoteOption,
}: MapTooltipProps) {
  // Simple position calculation with offset
  const tooltipPosition = useMemo(() => {
    const offset = 15;
    return {
      x: position.x + offset,
      y: position.y + offset,
    };
  }, [position]);

  if (!isVisible) return null;

  return (
    <div
      className="absolute z-50 pointer-events-none"
      style={{
        left: `${tooltipPosition.x}px`,
        top: `${tooltipPosition.y}px`,
      }}
    >
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-3 min-w-[200px] max-w-[280px]">
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
                  <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                  <span className="text-lg font-bold text-purple-600">
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
                          ? "#00C758"
                          : selectedVoteOption === "ไม่เห็นด้วย"
                          ? "#EF4444"
                          : selectedVoteOption === "งดออกเสียง"
                          ? "#EDB200"
                          : selectedVoteOption === "ไม่ลงคะแนนเสียง"
                          ? "#1F2937"
                          : selectedVoteOption === "ลา / ขาดลงมติ"
                          ? "#6B7280"
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
                          ? "#00C758"
                          : selectedVoteOption === "ไม่เห็นด้วย"
                          ? "#EF4444"
                          : selectedVoteOption === "งดออกเสียง"
                          ? "#EDB200"
                          : selectedVoteOption === "ไม่ลงคะแนนเสียง"
                          ? "#1F2937"
                          : selectedVoteOption === "ลา / ขาดลงมติ"
                          ? "#6B7280"
                          : "#6B7280",
                    }}
                  >
                    {(
                      (selectedVoteOption === "เห็นด้วย"
                        ? voteStats.agreeCount
                        : selectedVoteOption === "ไม่เห็นด้วย"
                        ? voteStats.disagreeCount
                        : selectedVoteOption === "งดออกเสียง"
                        ? voteStats.abstainCount
                        : selectedVoteOption === "ลา / ขาดลงมติ"
                        ? voteStats.absentCount
                        : 0) * 100
                    ).toFixed(1)}
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
