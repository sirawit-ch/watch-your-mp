"use client";

import React, { useState } from "react";
import { VoteEvent } from "@/lib/api";

interface FilterPanelProps {
  voteEvents: VoteEvent[];
  selectedVoteEvent: VoteEvent | null;
  onVoteEventChange: (voteEvent: VoteEvent | null) => void;
}

export default function FilterPanel({
  voteEvents,
  selectedVoteEvent,
  onVoteEventChange,
}: FilterPanelProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [voteResult, setVoteResult] = useState({
    passed: false,
    failed: false,
  });

  // ตัวอย่างหมวดหมู่ (สามารถดึงจาก API ได้)
  const categories = [
    "กฎหมายเกี่ยวกับการเมือง",
    "กฎหมายเศรษฐกิจ",
    "กฎหมายสังคม",
    "กฎหมายสิ่งแวดล้อม",
  ];

  const handleVoteResultChange = (type: "passed" | "failed") => {
    setVoteResult((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 space-y-6">
      <h2 className="text-lg font-bold text-gray-900">หมวดหมู่</h2>

      {/* หมวดหมู่ Dropdown */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          -- หมวดหมู่ร่างกฎหมาย --
        </label>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
        >
          <option value="">ค้นหาหมวดหมู่ที่สนใจ...</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {/* ร่างกฎหมาย Section */}
      <div>
        <h3 className="text-base font-semibold text-gray-900 mb-3">
          ร่างกฎหมาย
        </h3>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          -- ชื่อร่างกฎหมาย / ความเห็น --
        </label>
        <select
          value={selectedVoteEvent?.id || ""}
          onChange={(e) => {
            const event = voteEvents.find((v) => v.id === e.target.value);
            onVoteEventChange(event || null);
          }}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
        >
          <option value="">ค้นหาร่างกฎหมายที่สนใจ...</option>
          {voteEvents.map((event) => (
            <option key={event.id} value={event.id}>
              {event.nickname || event.title}
            </option>
          ))}
        </select>
      </div>

      {/* รูปแบบการโหวต Section */}
      <div>
        <h3 className="text-base font-semibold text-gray-900 mb-3">
          รูปแบบการโหวต
        </h3>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={voteResult.passed}
              onChange={() => handleVoteResultChange("passed")}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">ผ่าน</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={voteResult.failed}
              onChange={() => handleVoteResultChange("failed")}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">ไม่ผ่าน</span>
          </label>
        </div>
      </div>
    </div>
  );
}
