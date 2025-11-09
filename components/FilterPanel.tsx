"use client";

import React, { useState } from "react";
import {
  Paper,
  Typography,
  Autocomplete,
  TextField,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Box,
} from "@mui/material";

interface FilterPanelProps {
  voteEvents: string[];
  selectedVoteEvent: string | null;
  onVoteEventChange: (voteEvent: string | null) => void;
}

export default function FilterPanel({
  voteEvents,
  selectedVoteEvent,
  onVoteEventChange,
}: FilterPanelProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [voteResult, setVoteResult] = useState<string>("");

  // ตัวอย่างหมวดหมู่ (สามารถดึงจาก API ได้)
  const categories = [
    "กฎหมายเกี่ยวกับการเมือง",
    "กฎหมายเศรษฐกิจ",
    "กฎหมายสังคม",
    "กฎหมายสิ่งแวดล้อม",
  ];

  const handleVoteResultChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setVoteResult(event.target.value);
  };

  return (
    <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        หมวดหมู่
      </Typography>

      {/* หมวดหมู่ Autocomplete */}
      <Box sx={{ mb: 3 }}>
        <Autocomplete
          options={categories}
          value={selectedCategory}
          onChange={(event, newValue) => setSelectedCategory(newValue)}
          renderInput={(params) => (
            <TextField
              {...params}
              label="หมวดหมู่ร่างกฎหมาย"
              placeholder="ค้นหาหมวดหมู่ที่สนใจ..."
              size="small"
            />
          )}
          sx={{ mb: 2 }}
        />
      </Box>

      {/* ร่างกฎหมาย Section */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" fontWeight="600" gutterBottom>
          ร่างกฎหมาย
        </Typography>
        <Autocomplete
          options={voteEvents}
          value={selectedVoteEvent}
          onChange={(event, newValue) => onVoteEventChange(newValue)}
          getOptionLabel={(option) => option}
          renderOption={(props, option) => (
            <Box component="li" {...props}>
              <Typography variant="body2">{option}</Typography>
            </Box>
          )}
          renderInput={(params) => (
            <TextField
              {...params}
              label="ชื่อร่างกฎหมาย"
              placeholder="ค้นหาร่างกฎหมายที่สนใจ..."
              size="small"
            />
          )}
        />
      </Box>

      {/* รูปแบบการโหวต Section */}
      <Box>
        <FormControl component="fieldset">
          <FormLabel component="legend">
            <Typography variant="subtitle1" fontWeight="600">
              รูปแบบการโหวต
            </Typography>
          </FormLabel>
          <RadioGroup
            value={voteResult}
            onChange={handleVoteResultChange}
            sx={{ mt: 1 }}
          >
            <FormControlLabel
              value="passed"
              control={<Radio size="small" />}
              label="ผ่าน"
            />
            <FormControlLabel
              value="failed"
              control={<Radio size="small" />}
              label="ไม่ผ่าน"
            />
          </RadioGroup>
        </FormControl>
      </Box>
    </Paper>
  );
}
