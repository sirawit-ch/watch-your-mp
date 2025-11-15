import type { ProvinceVoteStats } from "./types";
import { VOTE_OPTION_COLORS_3BIN, DEFAULT_COLORS } from "./constants";

/**
 * Determines which color bin (0-2) a portion value falls into
 * Divides the 0-1 range into 3 equal bins
 */
function getColorBin(portion: number): number {
  if (portion <= 0) return -1; // No data
  if (portion <= 0.33) return 2; // Lightest (0-33%)
  if (portion <= 0.67) return 1; // Medium (33-67%)
  return 0; // Darkest (67-100%)
}

/**
 * Calculates heatmap color for a province based on vote statistics
 * Uses 3-bin color system instead of opacity gradient
 */
export function getProvinceHeatmapColor(
  provinceName: string,
  provinceVoteStats: Record<string, ProvinceVoteStats>,
  selectedVoteOption: string | null
): string {
  const stats = provinceVoteStats[provinceName];

  // No voting data available
  if (!stats) {
    return DEFAULT_COLORS.NO_DATA;
  }

  // "All" option selected - show winning option color with usage portion intensity
  if (!selectedVoteOption) {
    const bin = getColorBin(stats.portion);
    if (bin === -1) return DEFAULT_COLORS.NO_DATA;

    // Use winning option color instead of default "ทั้งหมด" color
    const winningOption = stats.winningOption || "ทั้งหมด";
    const colorArray =
      VOTE_OPTION_COLORS_3BIN[
        winningOption as keyof typeof VOTE_OPTION_COLORS_3BIN
      ];

    if (!colorArray) {
      // Fallback to default color if winning option not found
      return VOTE_OPTION_COLORS_3BIN.ทั้งหมด[bin];
    }

    return colorArray[bin];
  }

  // Specific option selected
  const { portionValue, voteOption } = getVoteOptionData(
    selectedVoteOption,
    stats
  );

  if (!voteOption) {
    return DEFAULT_COLORS.NO_DATA;
  }

  const bin = getColorBin(portionValue);
  if (bin === -1) return DEFAULT_COLORS.NO_DATA;

  return VOTE_OPTION_COLORS_3BIN[voteOption][bin];
}

/**
 * Gets portion value and vote option key for a specific vote option
 */
function getVoteOptionData(
  selectedVoteOption: string,
  stats: ProvinceVoteStats
): {
  portionValue: number;
  voteOption: keyof typeof VOTE_OPTION_COLORS_3BIN | null;
} {
  let portionValue = 0;
  let voteOption: keyof typeof VOTE_OPTION_COLORS_3BIN | null = null;

  switch (selectedVoteOption) {
    case "เห็นด้วย":
      portionValue = stats.agreeCount;
      voteOption = "เห็นด้วย";
      break;
    case "ไม่เห็นด้วย":
      portionValue = stats.disagreeCount;
      voteOption = "ไม่เห็นด้วย";
      break;
    case "งดออกเสียง":
      portionValue = stats.abstainCount;
      voteOption = "งดออกเสียง";
      break;
    case "ไม่ลงคะแนนเสียง":
      portionValue = stats.noVoteCount;
      voteOption = "ไม่ลงคะแนนเสียง";
      break;
    case "ลา / ขาดลงมติ":
      portionValue = stats.absentCount;
      voteOption = "ลา / ขาดลงมติ";
      break;
  }

  return { portionValue, voteOption };
}

/**
 * Calculates relative luminance of a color to determine if it's dark
 * Returns true if the color is dark (needs white text)
 */
function isColorDark(hexColor: string): boolean {
  // Convert hex to RGB
  const hex = hexColor.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  // Apply gamma correction
  const rLinear = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
  const gLinear = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
  const bLinear = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);

  // Calculate relative luminance
  const luminance = 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;

  // Return true if luminance is less than 0.5 (dark color)
  return luminance < 0.5;
}

/**
 * Gets appropriate text color (white or dark gray) based on background color
 */
export function getTextColorForBackground(backgroundColor: string): string {
  return isColorDark(backgroundColor) ? "#ffffff" : DEFAULT_COLORS.GRAY_800;
}
