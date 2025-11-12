/**
 * Load metadata about data update timestamp
 */
export async function loadMetadata(): Promise<{
  last_updated: string;
  timestamp: number;
} | null> {
  try {
    const response = await fetch("/data/new-data/metadata.json");
    if (!response.ok) {
      console.warn("Metadata not found");
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error("Error loading metadata:", error);
    return null;
  }
}

/**
 * Format timestamp to Thai locale
 */
export function formatThaiDateTime(isoString: string): string {
  const date = new Date(isoString);
  return new Intl.DateTimeFormat("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Bangkok",
  }).format(date);
}

/**
 * Format timestamp to relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "เมื่อสักครู่";
  if (diffMins < 60) return `${diffMins} นาทีที่แล้ว`;
  if (diffHours < 24) return `${diffHours} ชั่วโมงที่แล้ว`;
  if (diffDays < 7) return `${diffDays} วันที่แล้ว`;

  return formatThaiDateTime(isoString);
}
