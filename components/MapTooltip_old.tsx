"use client";

import React, { useRef, useEffect, useMemo } from "react";
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
  const tooltipRef = useRef<HTMLDivElement>(null);

  // คำนวณตำแหน่งที่เหมาะสม
  const adjustedPosition = useMemo(() => {
    // ระยะห่างจาก cursor
    const offset = 15;
    // ประมาณการขนาด tooltip
    const estimatedWidth = 250;
    const estimatedHeight = 150;

    // สมมติขนาดพื้นที่แสดงผล (จะถูกปรับในภายหลัง)
    const viewportWidth =
      typeof window !== "undefined" ? window.innerWidth : 1920;
    const viewportHeight =
      typeof window !== "undefined" ? window.innerHeight : 1080;

    let x = position.x + offset;
    let y = position.y + offset;

    // ตรวจสอบขอบขวา - ถ้าเกินให้แสดงทางซ้ายของ cursor
    if (x + estimatedWidth > viewportWidth - 50) {
      x = position.x - estimatedWidth - offset;
    }

    // ตรวจสอบขอบล่าง - ถ้าเกินให้แสดงด้านบนของ cursor
    if (y + estimatedHeight > viewportHeight - 50) {
      y = position.y - estimatedHeight - offset;
    }

    // ตรวจสอบขอบซ้าย - ถ้าติดลบให้แสดงทางขวา
    if (x < 0) {
      x = position.x + offset;
    }

    // ตรวจสอบขอบบน - ถ้าติดลบให้แสดงด้านล่าง
    if (y < 0) {
      y = position.y + offset;
    }

    return { x, y };
  }, [position]);

  // ปรับตำแหน่งจริงๆ หลังจาก render
  useEffect(() => {
    if (!tooltipRef.current || !isVisible) return;

    const tooltip = tooltipRef.current;
    const tooltipRect = tooltip.getBoundingClientRect();
    const parentRect = tooltip.parentElement?.getBoundingClientRect();

    if (!parentRect) return;

    const offset = 15;
    let x = position.x + offset;
    let y = position.y + offset;

    // ตรวจสอบขอบขวา
    if (x + tooltipRect.width > parentRect.width) {
      x = position.x - tooltipRect.width - offset;
    }

    // ตรวจสอบขอบล่าง
    if (y + tooltipRect.height > parentRect.height) {
      y = position.y - tooltipRect.height - offset;
    }

    // ตรวจสอบขอบซ้าย
    if (x < 0) {
      x = position.x + offset;
    }

    // ตรวจสอบขอบบน
    if (y < 0) {
      y = position.y + offset;
    }

    // อัพเดทตำแหน่งโดยตรงผ่าน style
    tooltip.style.left = `${x}px`;
    tooltip.style.top = `${y}px`;
  }, [position, isVisible]);

  if (!isVisible) return null;

  return (
    <div
      ref={tooltipRef}
      className="absolute pointer-events-none bg-white border border-gray-200 rounded-lg p-3 shadow-lg z-50 max-w-sm"
      style={{
        left: `${adjustedPosition.x}px`,
        top: `${adjustedPosition.y}px`,
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
