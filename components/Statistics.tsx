"use client";

import React from "react";
import { Box, Card, CardContent, Typography } from "@mui/material";

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
    <Box
      sx={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 2 }}
    >
      <StatCard label="จำนวน ส.ส. ทั้งหมด" value={totalMPs.toLocaleString()} />
      <StatCard label="ร่างกฎหมายทั้งหมด" value={totalBills.toLocaleString()} />
      <StatCard label="การเสนอกฎหมาย" value={totalProposals.toLocaleString()} />
      <StatCard label="การลงมติล่าสุด" value={latestVoting} />
    </Box>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card elevation={1}>
      <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
        <Typography variant="caption" color="text.secondary" gutterBottom>
          {label}
        </Typography>
        <Typography variant="h5" fontWeight="bold" sx={{ mt: 0.5 }}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
}
