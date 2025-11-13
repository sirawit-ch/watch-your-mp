// Types for new data structure from public/data/new-data/

/**
 * Person data with party information
 * Source: person_data.json
 */
export interface PersonData {
  prefix: string;
  person_name: string;
  image: string | null;
  member_of: string;
  party_image: string;
  party_color: string;
  m__province?: string; // Added by transformation, may not be in all records
}

/**
 * Vote summary per person
 * Source: person_vote_data.json
 */
export interface PersonVoteData {
  person_name: string;
  option: string;
  no_of_option: number;
}

/**
 * Vote results by province with portion
 * Source: fact_data.json
 */
export interface FactData {
  title: string;
  province: string;
  option: string;
  portion: number;
  type: string;
}

/**
 * Detailed vote record
 * Source: vote_detail_data.json
 */
export interface VoteDetailData {
  title: string;
  province: string;
  person_name: string;
  option: string;
}

/**
 * Province-level vote statistics (derived from FactData)
 * agreeCount, disagreeCount, etc. เก็บ portion (0.0-1.0) โดยตรงจาก fact_data
 * portion เก็บค่าสำหรับ type="All"
 */
export interface ProvinceVoteStats {
  province: string;
  agreeCount: number; // portion ของ option="เห็นด้วย"
  disagreeCount: number; // portion ของ option="ไม่เห็นด้วย"
  abstainCount: number; // portion ของ option="งดออกเสียง"
  noVoteCount: number; // portion ของ option="ไม่ลงคะแนนเสียง"
  absentCount: number; // portion ของ option="ลา / ขาดลงมติ"
  total: number;
  portion: number; // portion สำหรับ type="All" (ใช้ในกรณีไม่เลือก option)
  winningOption?: string; // option ที่ชนะในจังหวัดนั้นๆ (จาก type="All")
}

/**
 * Helper type for grouping people by province
 */
export interface GroupedPersonData {
  [province: string]: PersonData[];
}
