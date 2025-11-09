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
 */
export interface ProvinceVoteStats {
  province: string;
  agreeCount: number;
  disagreeCount: number;
  abstainCount: number;
  absentCount: number;
  total: number;
}

/**
 * Helper type for grouping people by province
 */
export interface GroupedPersonData {
  [province: string]: PersonData[];
}
