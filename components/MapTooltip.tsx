"use client";

import React, { useMemo } from "react";
import { Politician, ProvinceVoteStats } from "@/lib/api";

interface MapTooltipProps {
  provinceName: string;
  mps: Politician[];
  voteStats?: ProvinceVoteStats;
  position: { x: number; y: number };
  isVisible: boolean;
}

export default function MapTooltip({
  provinceName,
  mps,
  voteStats,
  position,
  isVisible,
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
            <div className="text-xs font-semibold text-gray-700 mb-1.5">
              การลงมติล่าสุด:
            </div>
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-gray-600">เห็นด้วย:</span>
                <span className="font-semibold">{voteStats.agreeCount}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <span className="text-gray-600">ไม่เห็นด้วย:</span>
                <span className="font-semibold">{voteStats.disagreeCount}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                <span className="text-gray-600">งดออกเสียง:</span>
                <span className="font-semibold">{voteStats.abstainCount}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                <span className="text-gray-600">ขาด/ลา:</span>
                <span className="font-semibold">{voteStats.absentCount}</span>
              </div>
            </div>
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
