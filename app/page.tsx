"use client";

import React, { useState, useEffect } from "react";
import ThailandMap from "@/components/ThailandMap";
import InfoPanel from "@/components/InfoPanel";
import FilterPanel from "@/components/FilterPanel";
import {
  Politician,
  fetchPoliticians,
  fetchPartyListMPs,
  fetchOverallStatistics,
  fetchLatestVoteWithProvinceStats,
  fetchAllVoteEvents,
  OverallStatistics,
  ProvinceVoteStats,
  VoteEvent,
} from "@/lib/api";

export default function Home() {
  const [politicians, setPoliticians] = useState<Politician[]>([]);
  const [partyListMPs, setPartyListMPs] = useState<Politician[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [selectedMPs, setSelectedMPs] = useState<Politician[]>([]);
  const [loading, setLoading] = useState(true);

  // Overall statistics
  const [overallStats, setOverallStats] = useState<OverallStatistics | null>(
    null
  );

  // Latest vote event and province stats for heatmap
  const [latestVote, setLatestVote] = useState<VoteEvent | null>(null);
  const [provinceVoteStats, setProvinceVoteStats] = useState<
    Record<string, ProvinceVoteStats>
  >({});

  // All vote events for filter
  const [allVoteEvents, setAllVoteEvents] = useState<VoteEvent[]>([]);
  const [selectedVoteEvent, setSelectedVoteEvent] = useState<VoteEvent | null>(
    null
  );

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [
          politiciansData,
          partyListData,
          statsData,
          voteData,
          voteEventsData,
        ] = await Promise.all([
          fetchPoliticians(),
          fetchPartyListMPs(),
          fetchOverallStatistics(),
          fetchLatestVoteWithProvinceStats(),
          fetchAllVoteEvents(),
        ]);

        setPoliticians(politiciansData);
        setPartyListMPs(partyListData);
        setOverallStats(statsData);
        setLatestVote(voteData.voteEvent);
        setAllVoteEvents(voteEventsData);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shrink-0">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                Politigraph
              </h1>
              <p className="text-sm text-gray-600">
                การลงมติของสมาชิกสภาผู้แทนราษฎร
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500 mb-1">
                ข้อมูลล่าสุด: {latestVote?.start_date || "ไม่มีข้อมูล"}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-3 flex-1 overflow-hidden">
        <div className="h-full flex gap-4 overflow-hidden">
          {/* Filter Panel - Left */}
          <div className="w-64 shrink-0 overflow-y-auto">
            <FilterPanel
              voteEvents={allVoteEvents}
              selectedVoteEvent={selectedVoteEvent}
              onVoteEventChange={setSelectedVoteEvent}
            />
          </div>

          {/* Map Section - Center */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="bg-white rounded-lg shadow-sm p-4 flex flex-col h-full overflow-hidden">
              <div className="mb-3 shrink-0">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  {latestVote?.title || "แผนที่ประเทศไทย"}
                </h2>
                {latestVote?.nickname && (
                  <p className="text-sm text-gray-600 mb-2">
                    {latestVote.nickname}
                  </p>
                )}
              </div>

              <div className="flex-1 overflow-hidden flex items-center justify-center">
                <ThailandMap
                  politicians={politicians}
                  partyListMPs={partyListMPs}
                  provinceVoteStats={provinceVoteStats}
                  onProvinceSelected={handleProvinceSelected}
                />
              </div>

              {/* Legend */}
              <div className="mt-2 shrink-0">
                <div className="flex items-center gap-3 text-xs flex-wrap">
                  <span className="font-medium text-gray-700">Heatmap:</span>
                  <div className="flex items-center gap-1.5">
                    <div
                      className="w-3 h-3 rounded"
                      style={{ backgroundColor: "rgba(34, 197, 94, 0.9)" }}
                    ></div>
                    <span>เห็นด้วย (เข้ม = มาลงมติมาก)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div
                      className="w-3 h-3 rounded"
                      style={{ backgroundColor: "rgba(239, 68, 68, 0.9)" }}
                    ></div>
                    <span>ไม่เห็นด้วย (เข้ม = มาลงมติมาก)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div
                      className="w-3 h-3 rounded"
                      style={{ backgroundColor: "#e5e7eb" }}
                    ></div>
                    <span>ไม่มีข้อมูล</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Info Panel - Right */}
          <div className="w-96 overflow-hidden">
            <InfoPanel
              province={selectedProvince}
              mps={selectedMPs}
              totalMPs={overallStats?.totalMPs || 0}
              totalBills={overallStats?.totalBills || 0}
              passedBills={overallStats?.passedBills || 0}
              failedBills={overallStats?.failedBills || 0}
              pendingBills={overallStats?.pendingBills || 0}
              latestVotingDate={latestVote?.start_date || ""}
              provinceVoteStats={
                selectedProvince && provinceVoteStats[selectedProvince]
                  ? provinceVoteStats[selectedProvince]
                  : undefined
              }
            />
          </div>
        </div>
      </main>
    </div>
  );
}
