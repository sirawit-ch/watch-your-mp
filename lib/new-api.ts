import type {
  PersonData,
  PersonVoteData,
  FactData,
  VoteDetailData,
  ProvinceVoteStats,
  GroupedPersonData,
} from "./types";

const NEW_DATA_PATH = "/data/new-data";

/**
 * Load person data from static JSON
 */
export async function loadPersonData(): Promise<PersonData[]> {
  try {
    const response = await fetch(`${NEW_DATA_PATH}/person_data.json`);
    if (!response.ok) {
      console.error("Failed to load person data:", response.statusText);
      return [];
    }
    const data: PersonData[] = await response.json();
    console.log(`Loaded ${data.length} people from person_data.json`);
    return data;
  } catch (error) {
    console.error("Error loading person data:", error);
    return [];
  }
}

/**
 * Load person vote data from static JSON
 */
export async function loadPersonVoteData(): Promise<PersonVoteData[]> {
  try {
    const response = await fetch(`${NEW_DATA_PATH}/person_vote_data.json`);
    if (!response.ok) {
      console.error("Failed to load person vote data:", response.statusText);
      return [];
    }
    const data: PersonVoteData[] = await response.json();
    console.log(`Loaded ${data.length} person vote records`);
    return data;
  } catch (error) {
    console.error("Error loading person vote data:", error);
    return [];
  }
}

/**
 * Load fact data from static JSON
 */
export async function loadFactData(): Promise<FactData[]> {
  try {
    const response = await fetch(`${NEW_DATA_PATH}/fact_data.json`);
    if (!response.ok) {
      console.error("Failed to load fact data:", response.statusText);
      return [];
    }
    const data: FactData[] = await response.json();
    console.log(`Loaded ${data.length} fact records`);
    return data;
  } catch (error) {
    console.error("Error loading fact data:", error);
    return [];
  }
}

/**
 * Load vote detail data from static JSON
 */
export async function loadVoteDetailData(): Promise<VoteDetailData[]> {
  try {
    const response = await fetch(`${NEW_DATA_PATH}/vote_detail_data.json`);
    if (!response.ok) {
      console.error("Failed to load vote detail data:", response.statusText);
      return [];
    }
    const data: VoteDetailData[] = await response.json();
    console.log(`Loaded ${data.length} vote detail records`);
    return data;
  } catch (error) {
    console.error("Error loading vote detail data:", error);
    return [];
  }
}

/**
 * Group people by province from vote detail data
 */
export function groupPersonByProvince(
  personData: PersonData[],
  voteDetailData: VoteDetailData[]
): GroupedPersonData {
  const grouped: GroupedPersonData = {};

  // Get unique person-province mapping from vote details
  const personProvinceMap = new Map<string, string>();
  voteDetailData.forEach((vote) => {
    if (!personProvinceMap.has(vote.person_name)) {
      personProvinceMap.set(vote.person_name, vote.province);
    }
  });

  // Add province info to person data and group
  personData.forEach((person) => {
    const province = personProvinceMap.get(person.person_name);
    if (province) {
      // Add province to person object
      const personWithProvince: PersonData = {
        ...person,
        m__province: province,
      };

      if (!grouped[province]) {
        grouped[province] = [];
      }
      grouped[province].push(personWithProvince);
    }
  });

  return grouped;
}

/**
 * Get province vote statistics from fact data
 * Aggregates all vote events for each province
 */
export function getProvinceVoteStats(
  factData: FactData[]
): Map<string, ProvinceVoteStats> {
  const statsMap = new Map<string, ProvinceVoteStats>();

  factData.forEach((fact) => {
    if (!statsMap.has(fact.province)) {
      statsMap.set(fact.province, {
        province: fact.province,
        agreeCount: 0,
        disagreeCount: 0,
        abstainCount: 0,
        absentCount: 0,
        total: 0,
      });
    }

    const stats = statsMap.get(fact.province)!;

    // Map option to counts (using portion as a weight)
    if (fact.option === "เห็นด้วย") {
      stats.agreeCount += fact.portion;
    } else if (fact.option === "ไม่เห็นด้วย") {
      stats.disagreeCount += fact.portion;
    } else if (fact.option === "งดออกเสียง") {
      stats.abstainCount += fact.portion;
    } else if (fact.option === "ลา / ขาดลงมติ") {
      stats.absentCount += fact.portion;
    }

    stats.total += fact.portion;
  });

  return statsMap;
}

/**
 * Get vote statistics for a specific person
 */
export function getPersonVoteStats(
  personName: string,
  personVoteData: PersonVoteData[]
): PersonVoteData[] {
  return personVoteData.filter((vote) => vote.person_name === personName);
}

/**
 * Get all vote events (unique titles)
 */
export function getVoteEvents(factData: FactData[]): string[] {
  const uniqueTitles = new Set<string>();
  factData.forEach((fact) => uniqueTitles.add(fact.title));
  return Array.from(uniqueTitles);
}

/**
 * Get vote details for a specific event and province
 */
export function getVoteDetailsForProvinceEvent(
  eventTitle: string,
  province: string,
  voteDetailData: VoteDetailData[]
): VoteDetailData[] {
  return voteDetailData.filter(
    (vote) => vote.title === eventTitle && vote.province === province
  );
}
