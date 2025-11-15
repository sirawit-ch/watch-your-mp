"use client";

import React, { useMemo, useState } from "react";
import type { PersonData, VoteDetailData } from "@/lib/types";
import { Paper, Typography, Box, Avatar, Tooltip } from "@mui/material";
import D3DonutChart from "./InfoPanel/D3DonutChart";
import D3BarChart from "./InfoPanel/D3BarChart";
import { getMajorityAction, getActionColor } from "./InfoPanel/helpers";
import type { MPStats } from "./InfoPanel/types";

interface InfoPanelProps {
  province: string | null;
  mps: PersonData[];
  totalMPs: number;
  voteDetailData: VoteDetailData[];
  allVoteDetailData?: VoteDetailData[];
  backgroundColor?: string;
}

export default function InfoPanel({
  province,
  mps,
  totalMPs,
  voteDetailData,
  allVoteDetailData,
  backgroundColor = "#E8FBFF",
}: InfoPanelProps) {
  const [selectedMP, setSelectedMP] = useState<PersonData | null>(null);

  // Use all data for charts if provided, otherwise use filtered data
  const chartVoteDetailData = allVoteDetailData || voteDetailData;

  // นับจำนวนร่างกฎหมายที่มีการลงมติจริงๆ จาก voteDetailData
  const uniqueVoteEvents = useMemo(() => {
    const titles = new Set(allVoteDetailData?.map((vote) => vote.title) || []);
    return titles.size;
  }, [allVoteDetailData]);

  // Calculate MP stats from vote detail data for selected province
  const mpStats = useMemo(() => {
    if (!province) return [];

    // Filter vote details for this province
    const provinceVotes = voteDetailData.filter(
      (vote) => vote.province === province
    );

    // Group by person and count options
    const statsMap = new Map<string, MPStats>();

    provinceVotes.forEach((vote) => {
      if (!statsMap.has(vote.person_name)) {
        statsMap.set(vote.person_name, {
          person_name: vote.person_name,
          agreeCount: 0,
          disagreeCount: 0,
          abstainCount: 0,
          noVoteCount: 0,
          absentCount: 0,
          total: 0,
        });
      }

      const stats = statsMap.get(vote.person_name)!;

      if (vote.option === "เห็นด้วย") {
        stats.agreeCount++;
      } else if (vote.option === "ไม่เห็นด้วย") {
        stats.disagreeCount++;
      } else if (vote.option === "งดออกเสียง") {
        stats.abstainCount++;
      } else if (vote.option === "ไม่ลงคะแนนเสียง") {
        stats.noVoteCount++;
      } else if (vote.option === "ลา / ขาดลงมติ") {
        stats.absentCount++;
      }

      stats.total++;
    });

    // Convert to array and sort by total votes
    return Array.from(statsMap.values()).sort((a, b) => b.total - a.total);
  }, [province, voteDetailData]);

  // Get selected MP stats (using ALL data for charts)
  const selectedMPStats = useMemo(() => {
    if (!selectedMP || !province) return null;

    // Calculate stats from ALL vote data, not just filtered data
    const mpVotes = chartVoteDetailData.filter(
      (vote) =>
        vote.person_name === selectedMP.person_name &&
        vote.province === province
    );

    const stats: MPStats = {
      person_name: selectedMP.person_name,
      agreeCount: 0,
      disagreeCount: 0,
      abstainCount: 0,
      noVoteCount: 0,
      absentCount: 0,
      total: 0,
    };

    mpVotes.forEach((vote) => {
      if (vote.option === "เห็นด้วย") {
        stats.agreeCount++;
      } else if (vote.option === "ไม่เห็นด้วย") {
        stats.disagreeCount++;
      } else if (vote.option === "งดออกเสียง") {
        stats.abstainCount++;
      } else if (vote.option === "ไม่ลงคะแนนเสียง") {
        stats.noVoteCount++;
      } else if (vote.option === "ลา / ขาดลงมติ") {
        stats.absentCount++;
      }
      stats.total++;
    });

    return stats;
  }, [selectedMP, province, chartVoteDetailData]);

  // Get selected MP vote for CURRENT FILTERED bill
  const selectedMPCurrentVote = useMemo(() => {
    if (!selectedMP || !province) return null;

    // Use FILTERED data (voteDetailData) to get vote for current bill
    const mpFilteredVote = voteDetailData.find(
      (vote) =>
        vote.person_name === selectedMP.person_name &&
        vote.province === province
    );

    return mpFilteredVote || null;
  }, [selectedMP, province, voteDetailData]);

  // Filter MPs based on voteDetailData
  const filteredMPs = useMemo(() => {
    if (!province) return mps;

    return mps.filter((mp) => {
      return voteDetailData.some(
        (vote) =>
          vote.person_name === mp.person_name && vote.province === province
      );
    });
  }, [mps, voteDetailData, province]);

  // Default view - Overall statistics
  if (!province || mps.length === 0) {
    return (
      <Paper
        elevation={0}
        sx={{
          height: "100%",
          backgroundColor: backgroundColor,
          transition: "background-color 0.3s ease",
          borderRadius: "20px",
          p: 3,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
        }}
      >
        <Typography variant="h6" color="text.secondary" textAlign="center">
          เลือกจังหวัดบนแผนที่
        </Typography>
        <Typography variant="body2" color="text.secondary" textAlign="center">
          เพื่อดูข้อมูล ส.ส. และการลงมติ
        </Typography>

        <Box sx={{ mt: 3, textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            ส.ส. ทั้งหมด
          </Typography>
          <Typography variant="h3" fontWeight="bold" color="primary">
            {totalMPs}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            คน
          </Typography>
        </Box>

        <Box sx={{ mt: 2, textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            การลงมติทั้งหมด
          </Typography>
          <Typography variant="h4" fontWeight="bold" color="primary">
            {uniqueVoteEvents}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            ครั้ง
          </Typography>
        </Box>
      </Paper>
    );
  }

  // Province selected - Show MPs visualization
  return (
    <Paper
      elevation={0}
      sx={{
        height: "100%",
        backgroundColor: backgroundColor,
        transition: "background-color 0.3s ease",
        borderRadius: "20px",
        p: 2,
        display: "flex",
        flexDirection: "column",
        overflow: "auto",
      }}
    >
      {/* Header - Fixed */}
      <Box
        sx={{
          mb: 1,
          pb: 0.5,
          borderBottom: 1,
          borderColor: "divider",
          flexShrink: 0,
        }}
      >
        <Typography variant="subtitle1" fontWeight="bold" color="primary">
          {province}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          ส.ส. ทั้งหมด {filteredMPs.length} คน
        </Typography>
      </Box>

      {/* Scrollable Content */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 1.5 }}>
        {/* MPs Visualization - Circles */}
        <Box sx={{ flexShrink: 0 }}>
          <Typography
            variant="caption"
            fontWeight="600"
            gutterBottom
            sx={{ display: "block", mb: 0.5 }}
          >
            ส.ส. ทั้งหมด
          </Typography>
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 0.75,
              p: 1,
              bgcolor: "white",
              borderRadius: 1.5,
              maxHeight: "120px",
              overflowY: "auto",
            }}
          >
            {filteredMPs.map((mp, index) => {
              const stats = mpStats.find(
                (s) => s.person_name === mp.person_name
              );
              const majorityAction = stats
                ? getMajorityAction(stats)
                : "ไม่ระบุ";
              const color = getActionColor(majorityAction);
              const isSelected = selectedMP?.person_name === mp.person_name;

              return (
                <Tooltip
                  key={index}
                  title={mp.person_name}
                  arrow
                  placement="top"
                >
                  <Box
                    onClick={() => setSelectedMP(mp)}
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      bgcolor: color,
                      cursor: "pointer",
                      border: isSelected
                        ? "2px solid gray"
                        : "1.5px solid white",

                      transition: "all 0.2s",
                      "&:hover": {
                        transform: "scale(1.1)",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                      },
                    }}
                  />
                </Tooltip>
              );
            })}
          </Box>
        </Box>

        {/* Selected MP Info */}
        {selectedMP && selectedMPStats && (
          <>
            <Box
              sx={{
                flexShrink: 0,
                p: 1.5,
                bgcolor: "white",
                borderRadius: 1.5,
              }}
            >
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}
              >
                <Avatar
                  src={selectedMP.image || undefined}
                  variant="square"
                  sx={{
                    width: 48,
                    height: 48,
                    boxShadow: `4px 4px 0px ${selectedMP.party_color}`,
                    border: "2px solid white",
                  }}
                >
                  {selectedMP.person_name.charAt(0)}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" fontWeight="600">
                    {selectedMP.person_name}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontSize: "0.7rem" }}
                  >
                    {selectedMP.member_of}
                  </Typography>
                </Box>
                {selectedMP.party_image && (
                  <Avatar
                    src={selectedMP.party_image}
                    sx={{ width: 32, height: 32 }}
                    variant="square"
                  />
                )}
              </Box>

              {/* การลงมติในร่างกฎหมายที่เลือก */}
              {selectedMPCurrentVote ? (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.75,
                    p: 0.75,
                    bgcolor: "#F9FAFB",
                    borderRadius: 1,
                  }}
                >
                  <Box
                    sx={{
                      width: 14,
                      height: 14,
                      borderRadius: "50%",
                      bgcolor: getActionColor(selectedMPCurrentVote.option),
                    }}
                  />
                  <Typography variant="caption" fontWeight="500">
                    {selectedMPCurrentVote.option}
                  </Typography>
                </Box>
              ) : (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.75,
                    p: 0.75,
                    bgcolor: "#F9FAFB",
                    borderRadius: 1,
                  }}
                >
                  <Box
                    sx={{
                      width: 14,
                      height: 14,
                      borderRadius: "50%",
                      bgcolor: "#9CA3AF",
                    }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    ไม่มีข้อมูลการลงมติ
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Donut Chart - สัดส่วนการใช้สิทธิ */}
            <Box
              sx={{
                flexShrink: 0,
                mb: 1.5,
              }}
            >
              <Typography
                variant="caption"
                fontWeight="600"
                sx={{ display: "block", mb: 0.5 }}
              >
                สัดส่วนการใช้สิทธิ์
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  position: "relative",
                }}
              >
                <D3DonutChart
                  stats={selectedMPStats}
                  width={250}
                  height={200}
                />
              </Box>
            </Box>

            {/* Bar Chart - ภาพรวมการโหวต */}
            <Box sx={{ flexShrink: 0 }}>
              <Typography
                variant="caption"
                fontWeight="600"
                sx={{ display: "block", mb: 0.5 }}
              >
                ภาพรวมการโหวต
              </Typography>
              <Box
                sx={{
                  p: 1.5,
                  bgcolor: "white",
                  borderRadius: 1.5,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                {/* D3 Vertical Bar Chart */}
                <D3BarChart stats={selectedMPStats} />
              </Box>
            </Box>
          </>
        )}

        {/* No MP selected message */}
        {!selectedMP && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              py: 4,
            }}
          >
            <Typography
              variant="body2"
              color="text.secondary"
              textAlign="center"
            >
              คลิกที่วงกลม (ส.ส.) เพื่อดูรายละเอียด
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
}
