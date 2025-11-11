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
  selectedVoteOption: string | null;
  onVoteOptionChange: (voteOption: string | null) => void;
}

export default function FilterPanel({
  voteEvents,
  selectedVoteEvent,
  onVoteEventChange,
  selectedVoteOption,
  onVoteOptionChange,
}: FilterPanelProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // ตัวอย่างหมวดหมู่ (สามารถดึงจาก API ได้)
  const categories = [
    "กฎหมายเกี่ยวกับการเมือง",
    "กฎหมายเศรษฐกิจ",
    "กฎหมายสังคม",
    "กฎหมายสิ่งแวดล้อม",
  ];

  const handleVoteOptionChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;
    onVoteOptionChange(value === "" ? null : value);
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
            value={selectedVoteOption || ""}
            onChange={handleVoteOptionChange}
            sx={{ mt: 1 }}
          >
            <FormControlLabel
              value=""
              control={<Radio size="small" />}
              label="ทั้งหมด"
            />
            <FormControlLabel
              value="เห็นด้วย"
              control={<Radio size="small" />}
              label="เห็นด้วย"
            />
            <FormControlLabel
              value="ไม่เห็นด้วย"
              control={<Radio size="small" />}
              label="ไม่เห็นด้วย"
            />
            <FormControlLabel
              value="งดออกเสียง"
              control={<Radio size="small" />}
              label="งดออกเสียง"
            />
            <FormControlLabel
              value="ไม่ลงคะแนนเสียง"
              control={<Radio size="small" />}
              label="ไม่ลงคะแนนเสียง"
            />
            <FormControlLabel
              value="ลา / ขาดลงมติ"
              control={<Radio size="small" />}
              label="ลา/ขาดลงมติ"
            />
          </RadioGroup>
        </FormControl>
      </Box>
    </Paper>
  );
}
