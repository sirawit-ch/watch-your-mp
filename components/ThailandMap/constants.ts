// Map visualization constants
export const MAP_CONFIG = {
  TILE_SIZE: 35,
  TILE_SPACING: 3,
  MARGIN_LEFT: 20,
  MARGIN_TOP: 20,
  TILE_BORDER_RADIUS: 4,
  FONT_SIZE: 10,
  ZOOM_MIN: 1,
  ZOOM_MAX: 8,
} as const;

export const STROKE_CONFIG = {
  DEFAULT_WIDTH: 2,
  SELECTED_WIDTH: 4,
  DEFAULT_COLOR: "transparent",
  SELECTED_COLOR: "gray",
} as const;

export const OPACITY_CONFIG = {
  MIN: 0.2,
  MAX: 0.9,
} as const;

// 3-bin color system for vote options
export const VOTE_OPTION_COLORS_3BIN = {
  ทั้งหมด: ["#678967", "#9db49d", "#bae4c1"], // เข้ม -> กลาง -> อ่อน
  เห็นด้วย: ["#2d3470", "#677590", "#9ca3af"], // เข้ม -> กลาง -> อ่อน
  ไม่เห็นด้วย: ["#9d0606", "#ef5958", "#fdacaf"], // เข้ม -> กลาง -> อ่อน
  งดออกเสียง: ["#4b5563", "#6b7280", "#9ca3af"], // gray เข้ม -> กลาง -> อ่อน
  ไม่ลงคะแนนเสียง: ["#4b5563", "#6b7280", "#9ca3af"], // gray เข้ม -> กลาง -> อ่อน
  "ลา / ขาดลงมติ": ["#4b5563", "#6b7280", "#9ca3af"], // gray เข้ม -> กลาง -> อ่อน
} as const;

// Old vote option colors (kept for reference, but not used with 3-bin system)
export const VOTE_OPTION_COLORS = {
  เห็นด้วย: "0, 199, 88", // #00C758 in RGB
  ไม่เห็นด้วย: "239, 68, 68", // #EF4444 in RGB
  งดออกเสียง: "237, 178, 0", // #EDB200 in RGB TODO CHANGE COLOR
  ไม่ลงคะแนนเสียง: "31, 41, 55", // #1F2937 in RGB
  "ลา / ขาดลงมติ": "107, 114, 128", // #6B7280 in RGB
} as const;

export const DEFAULT_COLORS = {
  NO_DATA: "#d4d4d4", // สีเทาเมื่อไม่มีข้อมูล
  ALL_OPTION_BASE: "139, 92, 246", // #8B5CF6 in RGB (สีม่วงสำหรับ "ทั้งหมด")
} as const;
