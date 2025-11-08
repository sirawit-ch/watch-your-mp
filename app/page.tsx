"use client";

import React, { useState, useEffect } from "react";
import { Paper } from "@mui/material";
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
  const [mounted, setMounted] = useState(false);

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
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

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
  }, [mounted]);

  const handleProvinceSelected = (province: string, mps: Politician[]) => {
    setSelectedProvince(province);
    setSelectedMPs(mps);
  };

  if (!mounted || loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background: "linear-gradient(135deg, #6DD5ED 0%, #2193B0 100%)",
        }}
      >
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
          <p className="text-white font-medium">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="h-screen flex flex-col overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #6DD5ED 0%, #2193B0 100%)",
      }}
    >
      {/* Header */}
      <header
        className="shrink-0"
        style={{
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.3)",
          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
        }}
      >
        <div className="container mx-auto px-6 py-3">
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
      <main className="flex-1 overflow-hidden">
        <div className="container mx-auto px-6 py-4 h-full">
          <div className="h-full flex gap-4">
            {/* Filter Panel - Left */}
            <div className="w-64 shrink-0 h-full overflow-hidden">
              <Paper
                elevation={3}
                sx={{
                  background: "rgba(255, 255, 255, 0.95)",
                  backdropFilter: "blur(10px)",
                  borderRadius: "16px",
                  height: "100%",
                  overflow: "auto",
                }}
              >
                <FilterPanel
                  voteEvents={allVoteEvents}
                  selectedVoteEvent={selectedVoteEvent}
                  onVoteEventChange={setSelectedVoteEvent}
                />
              </Paper>
            </div>

            {/* Map Section - Center */}
            <div className="flex-1 h-full overflow-hidden">
              <Paper
                elevation={3}
                sx={{
                  background: "#E8FBFF",
                  borderRadius: "20px",
                  p: 2.5,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                  overflow: "hidden",
                }}
              >
                <div className="mb-2 shrink-0">
                  <h2 className="text-lg font-semibold text-gray-900 mb-1">
                    {latestVote?.title || "แผนที่การลงมติ"}
                  </h2>
                  {latestVote?.nickname && (
                    <p className="text-sm text-gray-600">
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
              </Paper>
            </div>

            {/* Info Panel - Right */}
            <div className="w-96 h-full overflow-hidden">
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
        </div>
      </main>
    </div>
  );
}
