"use client";

import React from "react";
import { Politician, VotingStats } from "@/lib/api";

interface MapTooltipProps {
  provinceName: string;
  mps: Politician[];
  selectedBillId?: string | null;
  votingStats?: VotingStats | null;
  totalVotes?: number;
  position: { x: number; y: number };
  isVisible: boolean;
}

export default function MapTooltip({
  provinceName,
  mps,
  selectedBillId,
  votingStats,
  totalVotes = 0,
  position,
  isVisible,
}: MapTooltipProps) {
  if (!isVisible) return null;

  return (
    <div
      className="absolute pointer-events-none bg-white border border-gray-200 rounded-lg p-3 shadow-lg z-50 max-w-sm"
      style={{
        left: `${position.x + 15}px`,
        top: `${position.y + 15}px`,
      }}
    >
      <div className="font-semibold text-lg mb-2">{provinceName}</div>

      {selectedBillId && votingStats ? (
        <div className="text-sm space-y-1">
          <div>
            เห็นด้วย:{" "}
            <span className="font-semibold text-green-600">
              {votingStats.approve}
            </span>
          </div>
          <div>
            ไม่เห็นด้วย:{" "}
            <span className="font-semibold text-red-600">
              {votingStats.disapprove}
            </span>
          </div>
          <div>
            งดออกเสียง:{" "}
            <span className="font-semibold text-yellow-600">
              {votingStats.abstain}
            </span>
          </div>
        </div>
      ) : (
        <>
          <div className="text-sm mb-2">
            จำนวนการลงคะแนนรวม (2025):{" "}
            <span className="font-semibold">{totalVotes}</span> ครั้ง
          </div>
          <div className="text-sm mb-2">
            จำนวน ส.ส.: <span className="font-semibold">{mps.length}</span> คน
          </div>
          {mps.length > 0 && (
            <div className="text-xs text-gray-600">คลิกเพื่อดูรายละเอียด</div>
          )}
        </>
      )}
    </div>
  );
}
