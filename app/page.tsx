"use client";

import React, { useState, useEffect } from "react";
import { Paper } from "@mui/material";
import ThailandMap from "@/components/ThailandMap";
import InfoPanel from "@/components/InfoPanel";
import FilterPanel from "@/components/FilterPanel";
import type { PersonData, VoteDetailData } from "@/lib/types";
import {
  loadAllData,
  applyFilters,
  type ProvinceVoteStats,
} from "./dataHelpers";
import { loadMetadata, formatRelativeTime } from "@/lib/metadata";

export default function Home() {
  const [people, setPeople] = useState<PersonData[]>([]);
  const [groupedPeople, setGroupedPeople] = useState<
    Record<string, PersonData[]>
  >({});
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [selectedMPs, setSelectedMPs] = useState<PersonData[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  const [voteDetailData, setVoteDetailData] = useState<VoteDetailData[]>([]);

  // Vote events for filter
  const [allVoteEvents, setAllVoteEvents] = useState<string[]>([]);
  const [selectedVoteEvent, setSelectedVoteEvent] = useState<string | null>(
    null
  );
  const [selectedVoteOption, setSelectedVoteOption] = useState<string | null>(
    null
  );

  // Background color helper function based on selected vote option
  const getBackgroundColor = () => {
    switch (selectedVoteOption) {
      case null:
      case "":
        return "#e8dbcf"; // ทั้งหมด
      case "เห็นด้วย":
        return "#9bb4c6"; // เห็นด้วย
      case "ไม่เห็นด้วย":
        return "#ffd7ce"; // ไม่เห็นด้วย
      case "งดออกเสียง":
        return "#e1e1e1"; // งดออกเสียง
      case "ไม่ลงคะแนนเสียง":
        return "#e1e1e1"; // ไม่ลงคะแนนเสียง
      case "ลา / ขาดลงมติ":
        return "#e1e1e1"; // ลา / ขาดลงมติ
      default:
        return "#e8dbcf"; // default
    }
  };

  // Background color helper function based on selected vote option
  const getBackgroundColorForMap = () => {
    switch (selectedVoteOption) {
      case null:
      case "":
      case "เห็นด้วย":
      case "ไม่เห็นด้วย":
        return "white"; // ไม่เห็นด้วย
      case "งดออกเสียง":
      case "ไม่ลงคะแนนเสียง":
      case "ลา / ขาดลงมติ":
      default:
        return "#E6FCFF"; // default
    }
  };

  // Filtered data based on selected vote event and option
  const [filteredVoteDetailData, setFilteredVoteDetailData] = useState<
    VoteDetailData[]
  >([]);
  const [filteredProvinceVoteStats, setFilteredProvinceVoteStats] = useState<
    Record<string, ProvinceVoteStats>
  >({});

  // Store fact data separately to avoid re-loading
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [factData, setFactData] = useState<any[]>([]);

  // Last updated timestamp
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    async function loadData() {
      setLoading(true);
      try {
        const data = await loadAllData();

        setPeople(data.personData);
        setFactData(data.factData);
        setVoteDetailData(data.voteDetailData);
        setGroupedPeople(data.groupedPeople);
        setAllVoteEvents(data.voteEvents);

        // Auto-select the latest vote event
        if (data.voteEvents.length > 0) {
          const latestEvent = data.voteEvents[data.voteEvents.length - 1];
          setSelectedVoteEvent(latestEvent);
        }

        // Load metadata
        const metadata = await loadMetadata();
        if (metadata) {
          setLastUpdated(metadata.last_updated);
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
    const { filteredVoteDetailData, filteredProvinceVoteStats } = applyFilters(
      voteDetailData,
      factData,
      selectedVoteEvent,
      selectedVoteOption
    );

    setFilteredVoteDetailData(filteredVoteDetailData);
    setFilteredProvinceVoteStats(filteredProvinceVoteStats);
  }, [selectedVoteEvent, selectedVoteOption, factData, voteDetailData]);

  // Reset selected MPs when filter changes, but keep selected province
  useEffect(() => {
    if (selectedProvince && selectedMPs.length > 0) {
      // Re-fetch MPs for the selected province from groupedPeople
      const mps = groupedPeople[selectedProvince] || [];
      setSelectedMPs(mps);
    }
  }, [selectedVoteEvent, selectedVoteOption]); // eslint-disable-line react-hooks/exhaustive-deps

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
          background: "#f4eeeb",
        }}
      >
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800 mb-4"></div>
          <p className="text-gray-800 font-medium">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="h-screen flex flex-col overflow-hidden"
      style={{
        background: "#f4eeeb",
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
          fontFamily: "var(--font-sukhumvit), system-ui, sans-serif",
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
              {lastUpdated && (
                <div className="text-xs text-gray-500">
                  <div className="mb-0.5">อัพเดทล่าสุด</div>
                  <div className="font-medium text-gray-700">
                    {formatRelativeTime(lastUpdated)}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        <div className="mx-auto px-8 py-4 h-full max-w-[1800px]">
          <div className="h-full flex gap-6">
            {/* Filter Panel - Left */}
            <div className="w-80 shrink-0 h-full overflow-hidden">
              <Paper
                elevation={0}
                sx={{
                  background: "rgba(255, 255, 255, 0.95)",
                  backdropFilter: "blur(10px)",
                  borderRadius: "16px",
                  height: "full",
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
                elevation={0}
                sx={{
                  backgroundColor: getBackgroundColorForMap(),
                  transition: "background-color 0.3s ease",
                  borderRadius: "20px",
                  p: 2.5,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",

                  overflow: "hidden",
                }}
              >
                <div
                  className="mb-2 shrink-0"
                  style={{
                    fontFamily: "var(--font-sukhumvit), system-ui, sans-serif",
                  }}
                >
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
            <div className="w-[420px] h-full overflow-hidden">
              <InfoPanel
                key={`${selectedProvince || "no-province"}-${selectedVoteEvent || "no-event"}-${selectedVoteOption || "no-option"}`}
                province={selectedProvince}
                mps={selectedMPs}
                totalMPs={people.length}
                voteDetailData={filteredVoteDetailData}
                allVoteDetailData={voteDetailData}
                backgroundColor={getBackgroundColor()}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
