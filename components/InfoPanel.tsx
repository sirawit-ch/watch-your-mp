"use client";

import React from "react";
import { Politician, ProvinceVoteStats } from "@/lib/api";
import {
  Paper,
  Typography,
  Box,
  Divider,
  Card,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Chip,
} from "@mui/material";
import MapIcon from "@mui/icons-material/Map";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import EventBusyIcon from "@mui/icons-material/EventBusy";

interface InfoPanelProps {
  province: string | null;
  mps: Politician[];
  totalMPs: number;
  totalBills: number;
  passedBills: number;
  failedBills: number;
  pendingBills: number;
  latestVotingDate: string;
  provinceVoteStats?: ProvinceVoteStats;
}

export default function InfoPanel({
  province,
  mps,
  totalMPs,
  totalBills,
  passedBills,
  failedBills,
  pendingBills,
  latestVotingDate,
  provinceVoteStats,
}: InfoPanelProps) {
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "ไม่มีข้อมูล";
    const date = new Date(dateStr);
    return date.toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (!province || mps.length === 0) {
    return (
      <Paper
        elevation={1}
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
          <Typography variant="subtitle2" fontWeight="600" gutterBottom>
            ภาพรวมสถิติ
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="body2" color="text.secondary">
                ส.ส. ทั้งหมด
              </Typography>
              <Typography variant="h6" color="primary" fontWeight="bold">
                {totalMPs.toLocaleString()}
              </Typography>
            </Box>
            <Divider />
            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mb: 1, display: "block" }}
              >
                กฎหมาย
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    จำนวนทั้งหมด
                  </Typography>
                  <Typography variant="body1" fontWeight="600">
                    {totalBills.toLocaleString()}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    ผ่าน
                  </Typography>
                  <Typography
                    variant="body1"
                    fontWeight="600"
                    color="success.main"
                  >
                    {passedBills.toLocaleString()}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    ไม่ผ่าน
                  </Typography>
                  <Typography
                    variant="body1"
                    fontWeight="600"
                    color="error.main"
                  >
                    {failedBills.toLocaleString()}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    รอตรวจสอบ
                  </Typography>
                  <Typography
                    variant="body1"
                    fontWeight="600"
                    color="warning.main"
                  >
                    {pendingBills.toLocaleString()}
                  </Typography>
                </Box>
              </Box>
            </Box>
            <Divider />
            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mb: 0.5, display: "block" }}
              >
                วันที่ลงมติล่าสุด
              </Typography>
              <Typography variant="body2" fontWeight="500">
                {formatDate(latestVotingDate)}
              </Typography>
            </Box>
          </Box>
        </Box>
        <Box
          sx={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            p: 3,
          }}
        >
          <Box sx={{ textAlign: "center", color: "text.secondary" }}>
            <MapIcon sx={{ fontSize: 48, color: "action.disabled", mb: 2 }} />
            <Typography variant="body2" fontWeight="500">
              เลือกจังหวัดบนแผนที่
            </Typography>
            <Typography variant="caption" sx={{ mt: 0.5, display: "block" }}>
              เพื่อดูข้อมูล ส.ส. และการลงมติ
            </Typography>
          </Box>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper
      elevation={1}
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <Box sx={{ p: 1.5, borderBottom: 1, borderColor: "divider" }}>
        <Typography variant="subtitle2" fontWeight="600" gutterBottom>
          ภาพรวมสถิติ
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 1,
          }}
        >
          <Box>
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="caption" color="text.secondary">
                ส.ส. ทั้งหมด
              </Typography>
              <Typography variant="h6" color="primary" fontWeight="bold">
                {totalMPs.toLocaleString()}
              </Typography>
            </Box>
          </Box>
          <Box>
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="caption" color="text.secondary">
                กฎหมาย
              </Typography>
              <Typography variant="h6" fontWeight="bold">
                {totalBills.toLocaleString()}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          {province}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          ส.ส. จำนวน{" "}
          <Box component="span" fontWeight="600" color="text.primary">
            {mps.length}
          </Box>{" "}
          คน
        </Typography>
        {provinceVoteStats && (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: 1,
            }}
          >
            <Box>
              <Card sx={{ bgcolor: "success.lighter", p: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <ThumbUpIcon sx={{ fontSize: 14, color: "success.main" }} />
                  <Typography variant="caption" color="text.secondary">
                    เห็นด้วย
                  </Typography>
                </Box>
                <Typography
                  variant="h6"
                  color="success.main"
                  fontWeight="bold"
                  sx={{ mt: 0.5 }}
                >
                  {provinceVoteStats.agreeCount}
                </Typography>
              </Card>
            </Box>
            <Box>
              <Card sx={{ bgcolor: "error.lighter", p: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <ThumbDownIcon sx={{ fontSize: 14, color: "error.main" }} />
                  <Typography variant="caption" color="text.secondary">
                    ไม่เห็นด้วย
                  </Typography>
                </Box>
                <Typography
                  variant="h6"
                  color="error.main"
                  fontWeight="bold"
                  sx={{ mt: 0.5 }}
                >
                  {provinceVoteStats.disagreeCount}
                </Typography>
              </Card>
            </Box>
            <Box>
              <Card sx={{ bgcolor: "warning.lighter", p: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <RemoveCircleOutlineIcon
                    sx={{ fontSize: 14, color: "warning.main" }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    งดออกเสียง
                  </Typography>
                </Box>
                <Typography
                  variant="body1"
                  color="warning.main"
                  fontWeight="600"
                  sx={{ mt: 0.5 }}
                >
                  {provinceVoteStats.abstainCount}
                </Typography>
              </Card>
            </Box>
            <Box>
              <Card sx={{ bgcolor: "grey.100", p: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <EventBusyIcon sx={{ fontSize: 14, color: "grey.600" }} />
                  <Typography variant="caption" color="text.secondary">
                    ขาด/ลา
                  </Typography>
                </Box>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  fontWeight="600"
                  sx={{ mt: 0.5 }}
                >
                  {provinceVoteStats.absentCount}
                </Typography>
              </Card>
            </Box>
          </Box>
        )}
      </Box>
      <Box sx={{ flex: 1, overflow: "auto", p: 2 }}>
        <List
          disablePadding
          sx={{ display: "flex", flexDirection: "column", gap: 1 }}
        >
          {mps.map((mp) => (
            <MPCard key={mp.id} mp={mp} />
          ))}
        </List>
      </Box>
    </Paper>
  );
}

function MPCard({ mp }: { mp: Politician }) {
  const fullName = `${mp.prefix || ""}${mp.firstname} ${mp.lastname}`;
  const partyColor = mp.party?.color || "#6b7280";

  return (
    <ListItem
      sx={{
        border: 1,
        borderColor: "divider",
        borderRadius: 1,
        p: 1.5,
        "&:hover": { bgcolor: "action.hover" },
      }}
    >
      <ListItemAvatar>
        <Avatar
          src={mp.imageUrl}
          alt={fullName}
          sx={{ bgcolor: partyColor, width: 40, height: 40 }}
        >
          {!mp.imageUrl && mp.firstname.charAt(0)}
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={
          <Typography variant="body2" fontWeight="600" noWrap>
            {fullName}
          </Typography>
        }
        secondary={
          <Typography variant="caption" color="text.secondary" noWrap>
            {mp.party?.name || "ไม่ระบุพรรค"}
          </Typography>
        }
      />
      {mp.party && (
        <Chip
          size="small"
          sx={{
            bgcolor: partyColor,
            color: "white",
            height: 20,
            fontSize: "0.65rem",
          }}
        />
      )}
    </ListItem>
  );
}
