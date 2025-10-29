"use client";

import React from "react";
import { Politician, Voting } from "@/lib/api";

interface InfoPanelProps {
  province: string | null;
  mps: Politician[];
  selectedBillId?: string;
  votings?: Voting[];
}

export default function InfoPanel({
  province,
  mps,
  selectedBillId,
  votings = [],
}: InfoPanelProps) {
  if (!province || mps.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="text-center py-12 text-gray-500">
          <svg
            className="w-16 h-16 mx-auto mb-4 text-gray-300"
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
          <p>เลือกจังหวัดบนแผนที่</p>
          <p className="text-sm mt-2">เพื่อดูข้อมูล ส.ส. และการทำงาน</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">{province}</h3>

      <div className="mb-4">
        <div className="text-sm text-gray-600">จำนวน ส.ส.</div>
        <div className="text-2xl font-bold text-blue-600">{mps.length} คน</div>
      </div>

      <div className="space-y-3 max-h-[600px] overflow-y-auto">
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

  // กำหนดสีและไอคอนตามการโหวต
  const getVoteDisplay = () => {
    if (!selectedBillId || !mpVote) {
      return null;
    }

    const voteOption = mpVote.voteOption;
    let bgColor = "";
    let textColor = "";
    let icon = "";

    if (voteOption === "เห็นด้วย") {
      bgColor = "bg-green-100";
      textColor = "text-green-700";
      icon = "✓";
    } else if (voteOption === "ไม่เห็นด้วย") {
      bgColor = "bg-red-100";
      textColor = "text-red-700";
      icon = "✗";
    } else if (voteOption === "งดออกเสียง") {
      bgColor = "bg-yellow-100";
      textColor = "text-yellow-700";
      icon = "−";
    } else {
      bgColor = "bg-gray-100";
      textColor = "text-gray-700";
      icon = "?";
    }

    return (
      <div
        className={`mt-2 px-2 py-1 rounded text-xs font-medium ${bgColor} ${textColor} inline-flex items-center gap-1`}
      >
        <span>{icon}</span>
        <span>{voteOption}</span>
      </div>
    );
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
      <div className="flex items-start gap-3">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
          style={{ backgroundColor: partyColor }}
        >
          {mp.firstname.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-gray-900 truncate">{fullName}</div>
          <div className="text-sm text-gray-600">{partyName}</div>
          {getVoteDisplay()}
        </div>
      </div>
    </div>
  );
}
