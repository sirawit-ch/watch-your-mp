"use client";

import React, { useState, useRef, useEffect } from "react";
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
  const [voteResult, setVoteResult] = useState<string>("");

  // Combobox states
  const [categorySearch, setCategorySearch] = useState<string>("");
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [billSearch, setBillSearch] = useState<string>("");
  const [showBillDropdown, setShowBillDropdown] = useState(false);

  const categoryRef = useRef<HTMLDivElement>(null);
  const billRef = useRef<HTMLDivElement>(null);

  // ตัวอย่างหมวดหมู่ (สามารถดึงจาก API ได้)
  const categories = [
    "กฎหมายเกี่ยวกับการเมือง",
    "กฎหมายเศรษฐกิจ",
    "กฎหมายสังคม",
    "กฎหมายสิ่งแวดล้อม",
  ];

  const handleVoteResultChange = (type: string) => {
    setVoteResult(type);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        categoryRef.current &&
        !categoryRef.current.contains(event.target as Node)
      ) {
        setShowCategoryDropdown(false);
      }
      if (billRef.current && !billRef.current.contains(event.target as Node)) {
        setShowBillDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter categories based on search
  const filteredCategories = categories.filter((cat) =>
    cat.toLowerCase().includes(categorySearch.toLowerCase())
  );

  // Filter vote events based on search
  const filteredVoteEvents = voteEvents.filter(
    (event) =>
      event.title.toLowerCase().includes(billSearch.toLowerCase()) ||
      event.nickname?.toLowerCase().includes(billSearch.toLowerCase())
  );

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setCategorySearch(category);
    setShowCategoryDropdown(false);
  };

  const handleBillSelect = (event: VoteEvent) => {
    onVoteEventChange(event);
    setBillSearch(event.nickname || event.title);
    setShowBillDropdown(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 space-y-6">
      <h2 className="text-lg font-bold text-gray-900">หมวดหมู่</h2>

      {/* หมวดหมู่ Combobox */}
      <div ref={categoryRef} className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          -- หมวดหมู่ร่างกฎหมาย --
        </label>
        <div className="relative">
          <input
            type="text"
            value={categorySearch}
            onChange={(e) => {
              setCategorySearch(e.target.value);
              setShowCategoryDropdown(true);
            }}
            onFocus={() => setShowCategoryDropdown(true)}
            placeholder="ค้นหาหมวดหมู่ที่สนใจ..."
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
          />
          {showCategoryDropdown && filteredCategories.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {filteredCategories.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategorySelect(category)}
                  className="w-full px-3 py-2 text-sm text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none"
                >
                  {category}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ร่างกฎหมาย Section */}
      <div>
        <h3 className="text-base font-semibold text-gray-900 mb-3">
          ร่างกฎหมาย
        </h3>
        <div ref={billRef} className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            -- ชื่อร่างกฎหมาย / ความเห็น --
          </label>
          <div className="relative">
            <input
              type="text"
              value={billSearch}
              onChange={(e) => {
                setBillSearch(e.target.value);
                setShowBillDropdown(true);
              }}
              onFocus={() => setShowBillDropdown(true)}
              placeholder="ค้นหาร่างกฎหมายที่สนใจ..."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            />
            {showBillDropdown && filteredVoteEvents.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {filteredVoteEvents.map((event) => (
                  <button
                    key={event.id}
                    onClick={() => handleBillSelect(event)}
                    className="w-full px-3 py-2 text-sm text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none border-b border-gray-100 last:border-b-0"
                  >
                    <div className="font-medium text-gray-900 truncate">
                      {event.nickname || event.title}
                    </div>
                    {event.nickname && (
                      <div className="text-xs text-gray-500 truncate mt-0.5">
                        {event.title}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* รูปแบบการโหวต Section */}
      <div>
        <h3 className="text-base font-semibold text-gray-900 mb-3">
          รูปแบบการโหวต
        </h3>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="voteResult"
              value="passed"
              checked={voteResult === "passed"}
              onChange={(e) => handleVoteResultChange(e.target.value)}
              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">ผ่าน</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="voteResult"
              value="failed"
              checked={voteResult === "failed"}
              onChange={(e) => handleVoteResultChange(e.target.value)}
              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">ไม่ผ่าน</span>
          </label>
        </div>
      </div>
    </div>
  );
}
