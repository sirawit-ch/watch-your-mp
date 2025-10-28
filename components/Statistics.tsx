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
    <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
      <StatCard label="จำนวน ส.ส. ทั้งหมด" value={totalMPs.toLocaleString()} />
      <StatCard label="ร่างกฎหมายทั้งหมด" value={totalBills.toLocaleString()} />
      <StatCard label="การเสนอกฎหมาย" value={totalProposals.toLocaleString()} />
      <StatCard label="การลงมติล่าสุด" value={latestVoting} />
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="text-sm text-gray-600">{label}</div>
      <div className="text-3xl font-bold text-gray-900 mt-2">{value}</div>
    </div>
  );
}
