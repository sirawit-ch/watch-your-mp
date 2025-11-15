import type { MPStats } from "./types";
import {
  VOTE_OPTION_SINGLE_COLORS,
  DEFAULT_COLORS,
} from "../ThailandMap/constants";

/**
 * Determines the voting action with the highest count
 */
export function getMajorityAction(stats: MPStats): string {
  const counts = [
    { action: "เห็นด้วย", count: stats.agreeCount },
    { action: "ไม่เห็นด้วย", count: stats.disagreeCount },
    { action: "งดออกเสียง", count: stats.abstainCount },
    { action: "ไม่ลงคะแนนเสียง", count: stats.noVoteCount },
    { action: "ลา / ขาดลงมติ", count: stats.absentCount },
  ];

  const max = Math.max(...counts.map((c) => c.count));
  const majority = counts.find((c) => c.count === max);
  return majority?.action || "ไม่ระบุ";
}

/**
 * Returns the appropriate color for each voting action
 */
export function getActionColor(action: string): string {
  switch (action) {
    case "เห็นด้วย":
      return VOTE_OPTION_SINGLE_COLORS.เห็นด้วย;
    case "ไม่เห็นด้วย":
      return VOTE_OPTION_SINGLE_COLORS["ไม่เห็นด้วย"];
    case "งดออกเสียง":
      return VOTE_OPTION_SINGLE_COLORS["งดออกเสียง"];
    case "ไม่ลงคะแนนเสียง":
      return VOTE_OPTION_SINGLE_COLORS["ไม่ลงคะแนนเสียง"];
    case "ลา / ขาดลงมติ":
      return VOTE_OPTION_SINGLE_COLORS["ลา / ขาดลงมติ"];
    default:
      return DEFAULT_COLORS.GRAY_400; // Light gray (default/no data)
  }
}
