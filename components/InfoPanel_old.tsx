"use client";

import React from "react";
import { Politician, Voting } from "@/lib/api";

interface InfoPanelProps {
  province: string | null;
  mps: Politician[];
  selectedBillId?: string;
  votings?: Voting[];
  totalMPs: number;
  totalBills: number;
  totalProposals: number;
  latestVoting: string;
}

export default function InfoPanel({
  province,
  mps,
  selectedBillId,
  votings = [],
  totalMPs,
  totalBills,
  totalProposals,
  latestVoting,
}: InfoPanelProps) {
  if (!province || mps.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm h-full flex flex-col overflow-hidden">
        {/* Statistics Section - Always Show */}
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">
            สถิติภาพรวม
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">จำนวน ส.ส. ทั้งหมด</span>
              <span className="text-sm font-bold text-gray-900">
                {totalMPs.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">ร่างกฎหมายทั้งหมด</span>
              <span className="text-sm font-bold text-gray-900">
                {totalBills.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">การเสนอกฎหมาย</span>
              <span className="text-sm font-bold text-gray-900">
                {totalProposals.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">การลงมติล่าสุด</span>
              <span className="text-sm font-bold text-gray-900">
                {latestVoting}
              </span>
            </div>
          </div>
        </div>

        {/* Empty State */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center text-gray-500">
            <svg
              className="w-12 h-12 mx-auto mb-3 text-gray-300"
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
            <p className="text-sm">เลือกจังหวัดบนแผนที่</p>
            <p className="text-xs mt-1">เพื่อดูข้อมูล ส.ส. และการทำงาน</p>
          </div>
        </div>
      </div>
    );
  }

  // คำนวณสถิติการลงมติ
  const voteStats = {
    approve: 0,
    disapprove: 0,
    abstain: 0,
    absent: 0,
  };

  if (selectedBillId) {
    mps.forEach((mp) => {
      const mpVote = votings.find((v) =>
        v.participatedBy?.some((p) => p.id === mp.id)
      );

      if (mpVote) {
        if (mpVote.voteOption === "เห็นด้วย") voteStats.approve++;
        else if (mpVote.voteOption === "ไม่เห็นด้วย") voteStats.disapprove++;
        else if (mpVote.voteOption === "งดออกเสียง") voteStats.abstain++;
      } else {
        voteStats.absent++;
      }
    });
  }

  return (
    <div className="bg-white rounded-lg shadow-sm h-full flex flex-col overflow-hidden">
      {/* Statistics Section */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">
          สถิติภาพรวม
        </h3>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-600">จำนวน ส.ส. ทั้งหมด</span>
            <span className="text-sm font-bold text-gray-900">
              {totalMPs.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-600">ร่างกฎหมายทั้งหมด</span>
            <span className="text-sm font-bold text-gray-900">
              {totalBills.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-600">การเสนอกฎหมาย</span>
            <span className="text-sm font-bold text-gray-900">
              {totalProposals.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-600">การลงมติล่าสุด</span>
            <span className="text-sm font-bold text-gray-900">
              {latestVoting}
            </span>
          </div>
        </div>
      </div>

      {/* Province Header Section */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-2">{province}</h3>
        <div className="text-sm text-gray-600">
          จำนวน ส.ส.{" "}
          <span className="font-semibold text-gray-900">{mps.length}</span> คน
        </div>

        {/* Vote Statistics */}
        {selectedBillId && (
          <div className="grid grid-cols-2 gap-2 text-xs mt-3">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-gray-600">เห็นด้วย:</span>
              <span className="font-semibold">{voteStats.approve}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-gray-600">ไม่เห็นด้วย:</span>
              <span className="font-semibold">{voteStats.disapprove}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span className="text-gray-600">งดออกเสียง:</span>
              <span className="font-semibold">{voteStats.abstain}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-gray-400"></div>
              <span className="text-gray-600">ไม่ลงมติ:</span>
              <span className="font-semibold">{voteStats.absent}</span>
            </div>
          </div>
        )}
      </div>

      {/* MP List */}
      <div className="space-y-2 flex-1 overflow-y-auto p-4">
        {mps.map((mp) => (
          <MPCard
            key={mp.id}
            mp={mp}
            selectedBillId={selectedBillId}
            votings={votings}
          />
        ))}
      </div>
    </div>
  );
}

function MPCard({
  mp,
  selectedBillId,
  votings = [],
}: {
  mp: Politician;
  selectedBillId?: string;
  votings?: Voting[];
}) {
  const fullName = `${mp.title || ""}${mp.firstname} ${mp.lastname}`;
  const partyName = mp.party?.name || "ไม่ระบุพรรค";
  const partyColor = mp.party?.color || "#6b7280";

  // หาข้อมูลการโหวตของ MP คนนี้
  const mpVote = votings.find((v) =>
    v.participatedBy?.some((p) => p.id === mp.id)
  );

  // กำหนดสีและสถานะตามการโหวต
  const getVoteStatus = () => {
    if (!selectedBillId) {
      return null;
    }

    if (!mpVote) {
      return {
        label: "ไม่ลงมติ",
        bgColor: "bg-gray-100",
        textColor: "text-gray-700",
        dotColor: "bg-gray-500",
      };
    }

    const voteOption = mpVote.voteOption;

    if (voteOption === "เห็นด้วย") {
      return {
        label: "เห็นด้วย",
        bgColor: "bg-green-100",
        textColor: "text-green-700",
        dotColor: "bg-green-500",
      };
    } else if (voteOption === "ไม่เห็นด้วย") {
      return {
        label: "ไม่เห็นด้วย",
        bgColor: "bg-red-100",
        textColor: "text-red-700",
        dotColor: "bg-red-500",
      };
    } else if (voteOption === "งดออกเสียง") {
      return {
        label: "งดออกเสียง",
        bgColor: "bg-yellow-100",
        textColor: "text-yellow-700",
        dotColor: "bg-yellow-500",
      };
    }

    return {
      label: voteOption,
      bgColor: "bg-gray-100",
      textColor: "text-gray-700",
      dotColor: "bg-gray-500",
    };
  };

  const voteStatus = getVoteStatus();

  return (
    <div className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors cursor-pointer">
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0"
          style={{ backgroundColor: partyColor }}
        >
          {mp.firstname.charAt(0)}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm text-gray-900">{fullName}</div>
          <div className="text-xs text-gray-600">{partyName}</div>
        </div>

        {/* Vote Status */}
        {voteStatus && (
          <div
            className={`px-3 py-1.5 rounded-full text-xs font-medium ${voteStatus.bgColor} ${voteStatus.textColor} flex items-center gap-1.5 shrink-0`}
          >
            <div
              className={`w-2 h-2 rounded-full ${voteStatus.dotColor}`}
            ></div>
            <span>{voteStatus.label}</span>
          </div>
        )}
      </div>
    </div>
  );
}
