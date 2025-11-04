"use client";

import React, { useState, useEffect } from "react";
import ThailandMap from "@/components/ThailandMap";
import InfoPanel from "@/components/InfoPanel";
import {
  Politician,
  fetchPoliticians,
  fetchOverallStatistics,
  fetchLatestVoteWithProvinceStats,
  OverallStatistics,
  ProvinceVoteStats,
  VoteEvent,
} from "@/lib/api";

export default function Home() {
  const [politicians, setPoliticians] = useState<Politician[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [selectedMPs, setSelectedMPs] = useState<Politician[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Overall statistics
  const [overallStats, setOverallStats] = useState<OverallStatistics | null>(null);
  
  // Latest vote event and province stats for heatmap
  const [latestVote, setLatestVote] = useState<VoteEvent | null>(null);
  const [provinceVoteStats, setProvinceVoteStats] = useState<Record<string, ProvinceVoteStats>>({});

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [politiciansData, statsData, voteData] = await Promise.all([
          fetchPoliticians(),
          fetchOverallStatistics(),
          fetchLatestVoteWithProvinceStats(),
        ]);

        setPoliticians(politiciansData);
        setOverallStats(statsData);
        setLatestVote(voteData.voteEvent);
        setProvinceVoteStats(voteData.provinceStats);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const handleProvinceSelected = (province: string, mps: Politician[]) => {
    setSelectedProvince(province);
    setSelectedMPs(mps);
  };
  };

  const totalProposals = bills.reduce((sum, bill) => {
    return sum + (bill.proposedBy?.length || 0);
  }, 0);

  const latestBill = bills[0];
  const latestVoting =
    latestBill && latestBill.proposedOn
      ? new Date(latestBill.proposedOn).toLocaleDateString("th-TH", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "-";

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 shrink-0">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Politigraph Thailand
              </h1>
              <p className="text-xs text-gray-600">
                ติดตามการทำงานของสมาชิกสภาผู้แทนราษฎร ปี 2025
              </p>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500">อัพเดทล่าสุด</div>
              <div className="text-xs font-semibold text-gray-700">
                {lastUpdated}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-3 flex-1 overflow-hidden">
        <div className="h-full flex gap-4 overflow-hidden">
          {/* Map Section - Left */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="bg-white rounded-lg shadow-sm p-4 flex flex-col h-full overflow-hidden">
                <div className="mb-3 shrink-0">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">
                    แผนที่ประเทศไทย
                  </h2>
                  <div className="flex items-center gap-3">
                    <label
                      htmlFor="bill-select"
                      className="text-sm font-medium text-gray-700"
                    >
                      เลือกร่างกฎหมาย:
                    </label>
                    <select
                      id="bill-select"
                      value={selectedBillId}
                      onChange={(e) => handleBillSelected(e.target.value)}
                      className="flex-1 max-w-md px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">-- ดูภาพรวม --</option>
                      {bills.map((bill) => (
                        <option key={bill.id} value={bill.id}>
                          {bill.nickname || bill.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex-1 overflow-hidden flex items-center justify-center">
                  <ThailandMap
                    politicians={politicians}
                    selectedBillId={selectedBillId}
                    votingStats={votingStats}
                    totalVotes2025={totalVotes2025}
                    onProvinceSelected={handleProvinceSelected}
                  />
                </div>

                {/* Legend */}
                {selectedBillId ? (
                  <div className="mt-2 shrink-0">
                    <div className="flex items-center gap-3 text-xs flex-wrap">
                      <span className="font-medium text-gray-700">
                        การลงคะแนน:
                      </span>
                      <div className="flex items-center gap-1.5">
                        <div
                          className="w-3 h-3 rounded"
                          style={{ backgroundColor: "#22c55e" }}
                        ></div>
                        <span>เห็นด้วย</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div
                          className="w-3 h-3 rounded"
                          style={{ backgroundColor: "#ef4444" }}
                        ></div>
                        <span>ไม่เห็นด้วย</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div
                          className="w-3 h-3 rounded"
                          style={{ backgroundColor: "#fbbf24" }}
                        ></div>
                        <span>งดออกเสียง</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div
                          className="w-3 h-3 rounded"
                          style={{ backgroundColor: "#d1d5db" }}
                        ></div>
                        <span>ไม่มีข้อมูล</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-2 shrink-0">
                    <div className="flex items-center gap-3 text-xs flex-wrap">
                      <span className="font-medium text-gray-700">
                        จำนวนการลงคะแนนรวม (ทุก พรบ. ในปี 2025):
                      </span>
                      <div className="flex items-center gap-1.5">
                        <div
                          className="w-3 h-3 rounded"
                          style={{ backgroundColor: "#d73027" }}
                        ></div>
                        <span>น้อย</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div
                          className="w-3 h-3 rounded"
                          style={{ backgroundColor: "#fee08b" }}
                        ></div>
                        <span>ปานกลาง</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div
                          className="w-3 h-3 rounded"
                          style={{ backgroundColor: "#1a9850" }}
                        ></div>
                        <span>มาก</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
          </div>

          {/* Info Panel - Right */}
          <div className="w-96 overflow-hidden">
            <InfoPanel
              province={selectedProvince}
              mps={selectedMPs}
              selectedBillId={selectedBillId}
              votings={selectedBillVotings}
              totalMPs={politicians.length}
              totalBills={bills.length}
              totalProposals={totalProposals}
              latestVoting={latestVoting}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
