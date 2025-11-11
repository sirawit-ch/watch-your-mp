"use client";

import React, { useState, useEffect } from "react";
import { Paper } from "@mui/material";
import ThailandMap from "@/components/ThailandMap";
import InfoPanel from "@/components/InfoPanel";
import FilterPanel from "@/components/FilterPanel";
import {
  loadPersonData,
  loadFactData,
  loadVoteDetailData,
  groupPersonByProvince,
  getProvinceVoteStats,
  getVoteEvents,
} from "@/lib/new-api";
import type { PersonData, FactData, VoteDetailData } from "@/lib/types";

export default function Home() {
  const [people, setPeople] = useState<PersonData[]>([]);
  const [groupedPeople, setGroupedPeople] = useState<
    Record<string, PersonData[]>
  >({});
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [selectedMPs, setSelectedMPs] = useState<PersonData[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Fact data for heatmap and statistics
  const [factData, setFactData] = useState<FactData[]>([]);
  const [voteDetailData, setVoteDetailData] = useState<VoteDetailData[]>([]);

  // Vote events for filter
  const [allVoteEvents, setAllVoteEvents] = useState<string[]>([]);
  const [selectedVoteEvent, setSelectedVoteEvent] = useState<string | null>(
    null
  );
  const [selectedVoteOption, setSelectedVoteOption] = useState<string | null>(
    null
  );

  // Filtered data based on selected vote event and option
  const [filteredVoteDetailData, setFilteredVoteDetailData] = useState<
    VoteDetailData[]
  >([]);
  const [filteredProvinceVoteStats, setFilteredProvinceVoteStats] = useState<
    Record<
      string,
      {
        province: string;
        agreeCount: number;
        disagreeCount: number;
        abstainCount: number;
        absentCount: number;
        total: number;
      }
    >
  >({});

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    async function loadData() {
      setLoading(true);
      try {
        // Load all data in parallel
        const [personData, factDataResult, voteDetailDataResult] =
          await Promise.all([
            loadPersonData(),
            loadFactData(),
            loadVoteDetailData(),
          ]);

        setPeople(personData);
        setFactData(factDataResult);
        setVoteDetailData(voteDetailDataResult);

        // Group people by province
        const grouped = groupPersonByProvince(personData, voteDetailDataResult);
        setGroupedPeople(grouped);

        // Get unique vote events
        const events = getVoteEvents(factDataResult);
        setAllVoteEvents(events);

        // Auto-select the latest vote event (last in array)
        if (events.length > 0) {
          const latestEvent = events[events.length - 1];
          setSelectedVoteEvent(latestEvent);
        }
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [mounted]);

  // Filter data based on selected vote event and option
  useEffect(() => {
    let filteredDetails = voteDetailData;
    let filteredFacts = factData;

    // Filter by vote event
    if (selectedVoteEvent) {
      filteredDetails = filteredDetails.filter(
        (vote) => vote.title === selectedVoteEvent
      );
      filteredFacts = filteredFacts.filter(
        (fact) => fact.title === selectedVoteEvent
      );
    }

    // Filter by vote option
    if (selectedVoteOption) {
      // Filter vote details by option
      filteredDetails = filteredDetails.filter(
        (vote) => vote.option === selectedVoteOption
      );

      // Filter facts by both option AND type
      // type field should match the selected option for specific filtering
      filteredFacts = filteredFacts.filter(
        (fact) =>
          fact.option === selectedVoteOption && fact.type === selectedVoteOption
      );
    } else {
      // When no option selected (ทั้งหมด), use type === "All"
      filteredFacts = filteredFacts.filter((fact) => fact.type === "All");
    }

    setFilteredVoteDetailData(filteredDetails);

    // Calculate province stats from filtered fact data
    const statsMap = getProvinceVoteStats(filteredFacts);
    const statsRecord: Record<
      string,
      {
        province: string;
        agreeCount: number;
        disagreeCount: number;
        abstainCount: number;
        absentCount: number;
        total: number;
      }
    > = {};
    statsMap.forEach((value, key) => {
      statsRecord[key] = value;
    });
    setFilteredProvinceVoteStats(statsRecord);
  }, [selectedVoteEvent, selectedVoteOption, factData, voteDetailData]);

  const handleProvinceSelected = (province: string, mps: PersonData[]) => {
    // ถ้า province เป็นค่าว่าง แสดงว่า deselect
    if (!province) {
      setSelectedProvince(null);
      setSelectedMPs([]);
    } else {
      setSelectedProvince(province);
      setSelectedMPs(mps);
    }
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
                ข้อมูลทั้งหมด: {people.length} คน
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
                  selectedVoteOption={selectedVoteOption}
                  onVoteOptionChange={setSelectedVoteOption}
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
                    แผนที่การลงมติ
                  </h2>
                  {selectedVoteEvent ? (
                    <div>
                      <p className="text-sm font-medium text-blue-600 mb-1">
                        ร่างกฎหมายที่เลือก:
                      </p>
                      <p className="text-sm text-gray-700 line-clamp-2">
                        {selectedVoteEvent}
                      </p>
                    </div>
                  ) : allVoteEvents.length > 0 ? (
                    <p className="text-sm text-gray-600">
                      จำนวนการลงมติทั้งหมด: {allVoteEvents.length} ครั้ง
                    </p>
                  ) : null}
                </div>

                <div className="flex-1 overflow-hidden flex items-center justify-center">
                  <ThailandMap
                    politicians={Object.values(groupedPeople).flat()}
                    partyListMPs={[]}
                    provinceVoteStats={filteredProvinceVoteStats}
                    onProvinceSelected={handleProvinceSelected}
                    selectedVoteOption={selectedVoteOption}
                  />
                </div>
              </Paper>
            </div>

            {/* Info Panel - Right */}
            <div className="w-96 h-full overflow-hidden">
              <InfoPanel
                key={selectedProvince || "no-province"}
                province={selectedProvince}
                mps={selectedMPs}
                totalMPs={people.length}
                totalBills={allVoteEvents.length}
                passedBills={0}
                failedBills={0}
                pendingBills={0}
                latestVotingDate=""
                voteDetailData={filteredVoteDetailData}
                allVoteDetailData={voteDetailData}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
