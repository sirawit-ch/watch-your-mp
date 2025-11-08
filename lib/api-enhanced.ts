/**
 * Enhanced API Module for Politigraph GraphQL
 * ฟังก์ชันเพิ่มเติมสำหรับดึงข้อมูลการทำงานของ ส.ส. และรายละเอียดร่างกฎหมาย
 */

// เรียก API โดยตรงเพราะ GitHub Pages ไม่ support API Routes
const GRAPHQL_ENDPOINT = "https://politigraph.wevis.info/graphql";

/**
 * Interface สำหรับข้อมูลการทำงานของ ส.ส.
 * ตามโครงสร้างใน example.json
 */
export interface MPActionSummary {
  person: string;
  province: string | null;
  image: string | null;
  งดออกเสียง: number;
  "ลา / ขาดลงมติ": number;
  เห็นด้วย: number;
  ไม่ลงคะแนนเสียง: number;
  ไม่เห็นด้วย: number;
  รวมลงมติ: number;
}

/**
 * Interface สำหรับรายละเอียดการลงมติในแต่ละร่างกฎหมาย
 * ตามโครงสร้างใน example2.json
 */
export interface BillVoteDetail {
  person: string;
  province: string | null;
  option: string;
  law: string;
  result: string | null;
}

/**
 * ดึงข้อมูลการทำงานของ ส.ส. ทั้งหมด (Action Summary)
 * คล้ายกับ data.json ที่ได้จาก Python script
 */
export async function fetchMPActionSummary(): Promise<MPActionSummary[]> {
  const query = `
    query ($where: OrganizationWhere) {
      people(limit: 1000) {
        name
        image
        memberships {
          province
          label
          end_date
        }
        votes {
          option
          vote_events {
            title
            result
            organizations(where: $where) {
              name
              term
            }
          }
        }
      }
    }
  `;

  const variables = {
    where: {
      classification_EQ: "HOUSE_OF_REPRESENTATIVE",
    },
  };

  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables }),
    });

    const { data } = await response.json();

    if (!data?.people) return [];

    // สร้าง Map สำหรับเก็บสถิติของแต่ละคน
    const mpStatsMap = new Map<string, MPActionSummary>();

    for (const person of data.people) {
      // หาจังหวัดล่าสุดที่ยังดำรงตำแหน่ง
      const activeMemberships = person.memberships?.filter(
        (m: { province?: string; label?: string; end_date?: string | null }) =>
          m.province && m.label === "แบ่งเขต" && m.end_date === null
      );
      const province = activeMemberships?.[0]?.province || null;

      // สร้าง initial stats
      if (!mpStatsMap.has(person.name)) {
        mpStatsMap.set(person.name, {
          person: person.name,
          province,
          image: person.image || null,
          งดออกเสียง: 0,
          "ลา / ขาดลงมติ": 0,
          เห็นด้วย: 0,
          ไม่ลงคะแนนเสียง: 0,
          ไม่เห็นด้วย: 0,
          รวมลงมติ: 0,
        });
      }

      const stats = mpStatsMap.get(person.name)!;

      // นับคะแนนจาก votes ที่เป็นสมัยที่ 26
      for (const vote of person.votes || []) {
        for (const voteEvent of vote.vote_events || []) {
          // เช็คว่าเป็นสมัยที่ 26
          const isTerm26 = voteEvent.organizations?.some(
            (org: { term?: number }) => org.term === 26
          );

          if (!isTerm26) continue;

          const option = vote.option;

          // นับตามประเภทการลงมติ
          if (option === "งดออกเสียง") {
            stats.งดออกเสียง++;
          } else if (option === "ลา / ขาดลงมติ") {
            stats["ลา / ขาดลงมติ"]++;
          } else if (option === "เห็นด้วย") {
            stats.เห็นด้วย++;
            stats.รวมลงมติ++;
          } else if (option === "ไม่ลงคะแนนเสียง") {
            stats.ไม่ลงคะแนนเสียง++;
          } else if (option === "ไม่เห็นด้วย") {
            stats.ไม่เห็นด้วย++;
            stats.รวมลงมติ++;
          }
        }
      }
    }

    return Array.from(mpStatsMap.values());
  } catch (error) {
    console.error("Error fetching MP action summary:", error);
    return [];
  }
}

/**
 * ดึงรายละเอียดการลงมติในแต่ละร่างกฎหมาย
 * คล้ายกับ bill.json ที่ได้จาก Python script
 */
export async function fetchBillVoteDetails(): Promise<BillVoteDetail[]> {
  const query = `
    query ($where: OrganizationWhere) {
      people(limit: 1000) {
        name
        memberships {
          province
          label
          end_date
        }
        votes {
          option
          vote_events {
            title
            result
            organizations(where: $where) {
              name
              term
            }
          }
        }
      }
    }
  `;

  const variables = {
    where: {
      classification_EQ: "HOUSE_OF_REPRESENTATIVE",
    },
  };

  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables }),
    });

    const { data } = await response.json();

    if (!data?.people) return [];

    const records: BillVoteDetail[] = [];

    for (const person of data.people) {
      // หาจังหวัดล่าสุดที่ยังดำรงตำแหน่ง
      const activeMemberships = person.memberships?.filter(
        (m: { province?: string; label?: string; end_date?: string | null }) =>
          m.province && m.label === "แบ่งเขต" && m.end_date === null
      );
      const province = activeMemberships?.[0]?.province || null;

      // วนลูปผ่าน votes
      for (const vote of person.votes || []) {
        for (const voteEvent of vote.vote_events || []) {
          // เช็คว่าเป็นสมัยที่ 26
          const isTerm26 = voteEvent.organizations?.some(
            (org: { term?: number }) => org.term === 26
          );

          if (!isTerm26) continue;

          records.push({
            person: person.name,
            province,
            option: vote.option,
            law: voteEvent.title,
            result: voteEvent.result || null,
          });
        }
      }
    }

    return records;
  } catch (error) {
    console.error("Error fetching bill vote details:", error);
    return [];
  }
}

/**
 * ดึงข้อมูลการลงมติตามจังหวัด
 */
export async function fetchProvinceVoteSummary(
  provinceName: string
): Promise<MPActionSummary[]> {
  const allData = await fetchMPActionSummary();
  return allData.filter((mp) => mp.province === provinceName);
}

/**
 * ดึงข้อมูลการลงมติของ ส.ส. คนใดคนหนึ่ง
 */
export async function fetchMPVoteHistory(mpName: string): Promise<{
  summary: MPActionSummary | null;
  details: BillVoteDetail[];
}> {
  const [summaryData, detailsData] = await Promise.all([
    fetchMPActionSummary(),
    fetchBillVoteDetails(),
  ]);

  const summary = summaryData.find((mp) => mp.person === mpName) || null;
  const details = detailsData.filter((vote) => vote.person === mpName);

  return { summary, details };
}

/**
 * สรุปสถิติการลงมติแบ่งตามจังหวัด
 */
export async function fetchProvinceSummaryStats(): Promise<
  Record<
    string,
    {
      totalMPs: number;
      avgAgree: number;
      avgDisagree: number;
      avgAbstain: number;
      avgAbsent: number;
    }
  >
> {
  const allData = await fetchMPActionSummary();
  const provinceStats: Record<string, typeof allData> = {};

  // จัดกลุ่มตามจังหวัด
  for (const mp of allData) {
    if (!mp.province) continue;

    if (!provinceStats[mp.province]) {
      provinceStats[mp.province] = [];
    }
    provinceStats[mp.province].push(mp);
  }

  // คำนวณค่าเฉลี่ย
  const summary: Record<
    string,
    {
      totalMPs: number;
      avgAgree: number;
      avgDisagree: number;
      avgAbstain: number;
      avgAbsent: number;
    }
  > = {};

  for (const [province, mps] of Object.entries(provinceStats)) {
    const totalMPs = mps.length;
    const avgAgree = mps.reduce((sum, mp) => sum + mp.เห็นด้วย, 0) / totalMPs;
    const avgDisagree =
      mps.reduce((sum, mp) => sum + mp.ไม่เห็นด้วย, 0) / totalMPs;
    const avgAbstain =
      mps.reduce((sum, mp) => sum + mp.งดออกเสียง, 0) / totalMPs;
    const avgAbsent =
      mps.reduce((sum, mp) => sum + mp["ลา / ขาดลงมติ"], 0) / totalMPs;

    summary[province] = {
      totalMPs,
      avgAgree: Math.round(avgAgree * 100) / 100,
      avgDisagree: Math.round(avgDisagree * 100) / 100,
      avgAbstain: Math.round(avgAbstain * 100) / 100,
      avgAbsent: Math.round(avgAbsent * 100) / 100,
    };
  }

  return summary;
}
