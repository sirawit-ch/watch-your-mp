"use client";

import React, { useState, useEffect } from "react";
import ThailandMap from "@/components/ThailandMap";
import InfoPanel from "@/components/InfoPanel";
import {
  Politician,
  Bill,
  Voting,
  fetchPoliticians,
  fetchBills,
  fetchVotingByBill,
  calculateVotingStatsByProvince,
  fetchAllVotings2025,
  calculateTotalVotesByProvince,
  VotingStats,
} from "@/lib/api";

export default function Home() {
  const [politicians, setPoliticians] = useState<Politician[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [selectedMPs, setSelectedMPs] = useState<Politician[]>([]);
  const [selectedBillId, setSelectedBillId] = useState<string>("");
  const [votingStats, setVotingStats] = useState<Record<
    string,
    VotingStats
  > | null>(null);
  const [selectedBillVotings, setSelectedBillVotings] = useState<Voting[]>([]);
  const [totalVotes2025, setTotalVotes2025] = useState<Record<
    string,
    number
  > | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState("");

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [politiciansData, billsData] = await Promise.all([
          fetchPoliticians(),
          fetchBills(),
        ]);

        setPoliticians(politiciansData);
        setBills(billsData);

        // โหลดข้อมูลการลงคะแนนรวมทั้งหมดในปี 2025
        const allVotings = await fetchAllVotings2025();
        const totalVotes = calculateTotalVotesByProvince(allVotings);
        setTotalVotes2025(totalVotes);

        const now = new Date().toLocaleDateString("th-TH", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
        setLastUpdated(now);
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

  const handleBillSelected = async (billId: string) => {
    setSelectedBillId(billId);

    if (!billId) {
      setVotingStats(null);
      setSelectedBillVotings([]);
      return;
    }

    try {
      const votings = await fetchVotingByBill(billId);
      const stats = calculateVotingStatsByProvince(votings);
      console.log("🗳️ Bill ID:", billId);
      console.log("📊 Voting Stats:", stats);
      console.log(
        "📍 Sample province:",
        Object.keys(stats)[0],
        stats[Object.keys(stats)[0]]
      );
      setVotingStats(stats);
      setSelectedBillVotings(votings);
    } catch (error) {
      console.error("Error loading voting data:", error);
    }
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
