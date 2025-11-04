"use client";

import React from "react";
import { Politician, ProvinceVoteStats } from "@/lib/api";

interface InfoPanelProps {
  province: string | null;
  mps: Politician[];
  totalMPs: number;
  totalBills: number;
  passedBills: number;
  failedBills: number;
  pendingBills: number;
  latestVotingDate: string;
  provinceVoteStats?: ProvinceVoteStats;
}

export default function InfoPanel({
  province,
  mps,
  totalMPs,
  totalBills,
  passedBills,
  failedBills,
  pendingBills,
  latestVotingDate,
  provinceVoteStats,
}: InfoPanelProps) {
  // Format date to Thai format
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "ไม่มีข้อมูล";
    const date = new Date(dateStr);
    return date.toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Empty state - show overall statistics
  if (!province || mps.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm h-full flex flex-col overflow-hidden">
        {/* Overall Statistics Section */}
        <div className="p-3 border-b border-gray-200">
          <h3 className="text-xs font-semibold text-gray-900 mb-2">
            ภาพรวมสถิติ
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">ส.ส. ทั้งหมด</span>
              <span className="text-base font-bold text-blue-600">
                {totalMPs.toLocaleString()}
              </span>
            </div>
            <div className="h-px bg-gray-200"></div>

            <div>
              <div className="text-[10px] text-gray-500 mb-1.5">กฎหมาย</div>
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">จำนวนทั้งหมด</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {totalBills.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">ผ่าน</span>
                  <span className="text-sm font-semibold text-green-600">
                    {passedBills.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">ไม่ผ่าน</span>
                  <span className="text-sm font-semibold text-red-600">
                    {failedBills.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">รอตรวจสอบ</span>
                  <span className="text-sm font-semibold text-yellow-600">
                    {pendingBills.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="h-px bg-gray-200"></div>

            <div>
              <div className="text-[10px] text-gray-500 mb-0.5">
                วันที่ลงมติล่าสุด
              </div>
              <div className="text-xs font-medium text-gray-900">
                {formatDate(latestVotingDate)}
              </div>
            </div>
          </div>
        </div>

        {/* Empty State Message */}
        <div className="flex-1 flex items-center justify-center p-3">
          <div className="text-center text-gray-500">
            <svg
              className="w-12 h-12 mx-auto mb-2 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
              ></path>
            </svg>
            <p className="text-xs font-medium">เลือกจังหวัดบนแผนที่</p>
            <p className="text-[10px] mt-0.5">เพื่อดูข้อมูล ส.ส. และการลงมติ</p>
          </div>
        </div>
      </div>
    );
  }

  // Province selected - show province stats and MPs
  return (
    <div className="bg-white rounded-lg shadow-sm h-full flex flex-col overflow-hidden">
      {/* Overall Statistics Section - Still Show */}
      <div className="p-2.5 border-b border-gray-200 shrink-0">
        <h3 className="text-xs font-semibold text-gray-900 mb-2">
          ภาพรวมสถิติ
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <div className="text-center">
            <div className="text-[10px] text-gray-500">ส.ส. ทั้งหมด</div>
            <div className="text-base font-bold text-blue-600">
              {totalMPs.toLocaleString()}
            </div>
          </div>
          <div className="text-center">
            <div className="text-[10px] text-gray-500">กฎหมาย</div>
            <div className="text-base font-bold text-gray-900">
              {totalBills.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Province Header Section */}
      <div className="p-3 border-b border-gray-200 shrink-0">
        <h3 className="text-base font-bold text-gray-900 mb-0.5">{province}</h3>
        <div className="text-xs text-gray-600 mb-2">
          ส.ส. จำนวน{" "}
          <span className="font-semibold text-gray-900">{mps.length}</span> คน
        </div>

        {/* Province Vote Statistics */}
        {provinceVoteStats && (
          <div className="grid grid-cols-2 gap-1.5">
            <div className="bg-green-50 rounded-lg p-1.5">
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                <span className="text-[10px] text-gray-600">เห็นด้วย</span>
              </div>
              <div className="text-base font-bold text-green-600 mt-0.5">
                {provinceVoteStats.agreeCount}
              </div>
            </div>
            <div className="bg-red-50 rounded-lg p-1.5">
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                <span className="text-[10px] text-gray-600">ไม่เห็นด้วย</span>
              </div>
              <div className="text-base font-bold text-red-600 mt-0.5">
                {provinceVoteStats.disagreeCount}
              </div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-1.5">
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-yellow-500"></div>
                <span className="text-[10px] text-gray-600">งดออกเสียง</span>
              </div>
              <div className="text-sm font-semibold text-yellow-600 mt-0.5">
                {provinceVoteStats.abstainCount}
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-1.5">
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
                <span className="text-[10px] text-gray-600">ขาด/ลา</span>
              </div>
              <div className="text-sm font-semibold text-gray-600 mt-0.5">
                {provinceVoteStats.absentCount}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MP List */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="space-y-1.5">
          {mps.map((mp) => (
            <MPCard key={mp.id} mp={mp} />
          ))}
        </div>
      </div>
    </div>
  );
}

function MPCard({ mp }: { mp: Politician }) {
  const fullName = `${mp.prefix || ""}${mp.firstname} ${mp.lastname}`;
  const partyColor = mp.party?.color || "#6b7280";

  return (
    <div className="border border-gray-200 rounded-lg p-2 hover:bg-gray-50 transition-colors">
      <div className="flex items-center gap-2">
        {/* Avatar with Image */}
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0 overflow-hidden bg-gray-200">
          {mp.imageUrl ? (
            <img
              src={mp.imageUrl}
              alt={fullName}
              className="w-full h-full object-cover"
              onError={(e) => {
                // ถ้าโหลดรูปไม่ได้ ให้แสดง fallback
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
                const parent = target.parentElement;
                if (parent) {
                  parent.style.backgroundColor = partyColor;
                  parent.textContent = mp.firstname.charAt(0);
                }
              }}
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{ backgroundColor: partyColor }}
            >
              {mp.firstname.charAt(0)}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-xs text-gray-900 truncate">
            {fullName}
          </div>
          <div className="text-[10px] text-gray-500 truncate">
            {mp.party?.name || "ไม่ระบุพรรค"}
          </div>
        </div>
      </div>
    </div>
  );
}
