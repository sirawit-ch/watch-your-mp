"use client";

import React from "react";

interface StatisticsProps {
  totalMPs: number;
  totalBills: number;
  totalProposals: number;
  latestVoting: string;
}

export default function Statistics({
  totalMPs,
  totalBills,
  totalProposals,
  latestVoting,
}: StatisticsProps) {
  return (
    <div className="grid grid-cols-4 gap-3">
      <StatCard label="จำนวน ส.ส. ทั้งหมด" value={totalMPs.toLocaleString()} />
      <StatCard label="ร่างกฎหมายทั้งหมด" value={totalBills.toLocaleString()} />
      <StatCard label="การเสนอกฎหมาย" value={totalProposals.toLocaleString()} />
      <StatCard label="การลงมติล่าสุด" value={latestVoting} />
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-3">
      <div className="text-xs text-gray-600">{label}</div>
      <div className="text-xl font-bold text-gray-900 mt-1">{value}</div>
    </div>
  );
}
