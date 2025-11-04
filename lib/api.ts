/**
 * API Module for Politigraph GraphQL
 * เชื่อมต่อกับ Politigraph API และดึงข้อมูล ส.ส. และการลงคะแนน
 */

const GRAPHQL_ENDPOINT = "/api/graphql";

/**
 * แมพรูปภาพนักการเมืองจากชื่อ
 */
export function getPoliticianImageUrl(
  firstname: string,
  lastname: string
): string {
  const imageName = `${firstname}-${lastname}.webp`;
  const placeholderUrl = "/politicians/_placeholder.webp";

  // ตรวจสอบว่ามีรูปภาพหรือไม่โดยใช้ path
  const imageUrl = `/politicians/${imageName}`;

  // ใน production จะต้องตรวจสอบว่าไฟล์มีจริงหรือไม่
  // แต่ใน client-side เราจะใช้ onerror ของ img tag แทน
  return imageUrl;
}

export interface Politician {
  id: string;
  firstname: string;
  lastname: string;
  province: string;
  prefix?: string;
  party?: {
    name: string;
    color: string;
  };
  imageUrl?: string;
}

export interface Bill {
  id: string;
  title: string;
  nickname?: string;
  status?: string;
  proposal_date?: string;
}

export interface VoteEvent {
  id: string;
  title: string;
  nickname?: string;
  start_date: string;
  result?: string;
  agree_count?: number;
  disagree_count?: number;
  abstain_count?: number;
  novote_count?: number;
}

export interface Vote {
  id: string;
  option: string;
  voter?: Politician;
}

export interface ProvinceVoteStats {
  province: string;
  agreeCount: number;
  disagreeCount: number;
  abstainCount: number;
  absentCount: number;
  totalCount: number;
}

export interface OverallStatistics {
  totalMPs: number;
  totalBills: number;
  passedBills: number;
  failedBills: number;
  pendingBills: number;
  latestVotingDate?: string;
}

/**
 * ดึงข้อมูล ส.ส. ทั้งหมด พร้อมจังหวัด
 */
export async function fetchPoliticians(): Promise<Politician[]> {
  const query = `
    query {
      people(limit: 1000) {
        id
        prefix
        firstname
        lastname
        memberships {
          province
          label
          start_date
          end_date
          posts {
            organizations {
              name
              color
            }
          }
        }
      }
    }
  `;

  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });

    const { data } = await response.json();

    if (!data?.people) return [];

    // แปลงข้อมูลและดึงจังหวัดจาก membership
    return data.people
      .filter((person: { memberships?: unknown[] }) => {
        if (!person.memberships || person.memberships.length === 0)
          return false;

        // ต้องมี membership ที่เป็น "แบ่งเขต" และยังดำรงตำแหน่งอยู่
        return person.memberships.some(
          (m: {
            province?: string;
            label?: string;
            end_date?: string | null;
          }) => m.province && m.label === "แบ่งเขต" && m.end_date === null
        );
      })
      .map(
        (person: {
          id: string;
          prefix: string;
          firstname: string;
          lastname: string;
          memberships: {
            province?: string;
            label?: string;
            end_date?: string | null;
            posts?: {
              organizations?: { name: string; color: string | null }[];
            }[];
          }[];
        }) => {
          // หา membership ที่เป็น "แบ่งเขต" และยังดำรงตำแหน่งอยู่
          const activeMembership = person.memberships.find(
            (m) => m.province && m.label === "แบ่งเขต" && m.end_date === null
          );

          // หาข้อมูลพรรคจาก membership ที่มี province = null (บัญชีรายชื่อ)
          const partyMembership = person.memberships.find(
            (m) => m.province === null && m.end_date === null
          );

          const party = partyMembership?.posts?.[0]?.organizations?.find(
            (org) =>
              org.name !== "สภาผู้แทนราษฎร ชุดที่ 26" &&
              org.name !== "สภาผู้แทนราษฎร ชุดที่ 25"
          );

          return {
            id: person.id,
            firstname: person.firstname,
            lastname: person.lastname,
            prefix: person.prefix,
            province: activeMembership?.province || "ไม่ระบุ",
            party: party
              ? { name: party.name, color: party.color || "#6b7280" }
              : undefined,
            imageUrl: getPoliticianImageUrl(person.firstname, person.lastname),
          };
        }
      );
  } catch (error) {
    console.error("Error fetching politicians:", error);
    return [];
  }
}

/**
 * ดึงข้อมูล ส.ส. บัญชีรายชื่อ (ไม่มีจังหวัด)
 */
export async function fetchPartyListMPs(): Promise<Politician[]> {
  const query = `
    query {
      people(limit: 1000) {
        id
        prefix
        firstname
        lastname
        memberships {
          province
          label
          start_date
          end_date
          posts {
            organizations {
              name
              color
            }
          }
        }
      }
    }
  `;

  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });

    const { data } = await response.json();

    if (!data?.people) return [];

    // กรองเฉพาะ ส.ส. บัญชีรายชื่อ (province = null, label ไม่ใช่ "แบ่งเขต")
    return data.people
      .filter((person: { memberships?: unknown[] }) => {
        if (!person.memberships || person.memberships.length === 0)
          return false;

        // ต้องมี membership ที่ province = null และยังดำรงตำแหน่งอยู่
        return person.memberships.some(
          (m: {
            province?: string | null;
            label?: string;
            end_date?: string | null;
          }) => m.province === null && m.end_date === null
        );
      })
      .map(
        (person: {
          id: string;
          prefix: string;
          firstname: string;
          lastname: string;
          memberships: {
            province?: string | null;
            label?: string;
            end_date?: string | null;
            posts?: {
              organizations?: { name: string; color: string | null }[];
            }[];
          }[];
        }) => {
          // หาข้อมูลพรรคจาก membership ที่มี province = null
          const partyMembership = person.memberships.find(
            (m) => m.province === null && m.end_date === null
          );

          const party = partyMembership?.posts?.[0]?.organizations?.find(
            (org) =>
              org.name !== "สภาผู้แทนราษฎร ชุดที่ 26" &&
              org.name !== "สภาผู้แทนราษฎร ชุดที่ 25"
          );

          return {
            id: person.id,
            firstname: person.firstname,
            lastname: person.lastname,
            prefix: person.prefix,
            province: "บัญชีรายชื่อ",
            party: party
              ? { name: party.name, color: party.color || "#6b7280" }
              : undefined,
            imageUrl: getPoliticianImageUrl(person.firstname, person.lastname),
          };
        }
      );
  } catch (error) {
    console.error("Error fetching party list MPs:", error);
    return [];
  }
}

/**
 * ดึงข้อมูลร่างกฎหมายทั้งหมด
 */
export async function fetchBills(): Promise<Bill[]> {
  const query = `
    query {
      bills(limit: 500, sort: [{proposal_date: DESC}]) {
        id
        title
        nickname
        status
        proposal_date
      }
    }
  `;

  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });

    const { data } = await response.json();
    return data?.bills || [];
  } catch (error) {
    console.error("Error fetching bills:", error);
    return [];
  }
}

/**
 * ดึงข้อมูล Vote Events ทั้งหมด
 */
export async function fetchAllVoteEvents(): Promise<VoteEvent[]> {
  const query = `
    query {
      voteEvents(limit: 500, sort: [{start_date: DESC}]) {
        id
        title
        nickname
        start_date
        result
        agree_count
        disagree_count
        abstain_count
        novote_count
      }
    }
  `;

  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });

    const { data } = await response.json();
    return data?.voteEvents || [];
  } catch (error) {
    console.error("Error fetching all vote events:", error);
    return [];
  }
}

/**
 * ดึงข้อมูล Vote Events ล่าสุด
 */
export async function fetchLatestVoteEvent(): Promise<VoteEvent | null> {
  const query = `
    query {
      voteEvents(limit: 1, sort: [{start_date: DESC}]) {
        id
        title
        nickname
        start_date
        result
        agree_count
        disagree_count
        abstain_count
        novote_count
      }
    }
  `;

  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });

    const { data } = await response.json();
    return data?.voteEvents?.[0] || null;
  } catch (error) {
    console.error("Error fetching latest vote event:", error);
    return null;
  }
}

/**
 * ดึงข้อมูลการลงมติล่าสุด พร้อมข้อมูลการลงคะแนนแยกตามจังหวัด
 */
export async function fetchLatestVoteWithProvinceStats(): Promise<{
  voteEvent: VoteEvent | null;
  provinceStats: Record<string, ProvinceVoteStats>;
}> {
  const query = `
    query {
      voteEvents(limit: 1, sort: [{start_date: DESC}]) {
        id
        title
        nickname
        start_date
        result
        agree_count
        disagree_count
        abstain_count
        novote_count
        votes {
          id
          option
          voters {
            id
            firstname
            lastname
            memberships {
              province
            }
          }
        }
      }
    }
  `;

  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });

    const { data } = await response.json();

    if (!data?.voteEvents?.[0]) {
      return { voteEvent: null, provinceStats: {} };
    }

    const voteEvent = data.voteEvents[0];
    const provinceStats: Record<string, ProvinceVoteStats> = {};

    // วิเคราะห์การลงคะแนนแยกตามจังหวัด
    voteEvent.votes?.forEach(
      (vote: {
        option?: string;
        voters?: { memberships?: { province?: string }[] }[];
      }) => {
        vote.voters?.forEach(
          (voter: { memberships?: { province?: string }[] }) => {
            const province = voter.memberships?.[0]?.province;
            if (!province) return;

            if (!provinceStats[province]) {
              provinceStats[province] = {
                province,
                agreeCount: 0,
                disagreeCount: 0,
                abstainCount: 0,
                absentCount: 0,
                totalCount: 0,
              };
            }

            const option = vote.option?.toLowerCase() || "";

            if (option.includes("เห็นด้วย") || option.includes("approve")) {
              provinceStats[province].agreeCount++;
            } else if (
              option.includes("ไม่เห็นด้วย") ||
              option.includes("disapprove")
            ) {
              provinceStats[province].disagreeCount++;
            } else if (
              option.includes("งดออกเสียง") ||
              option.includes("abstain")
            ) {
              provinceStats[province].abstainCount++;
            } else {
              provinceStats[province].absentCount++;
            }

            provinceStats[province].totalCount++;
          }
        );
      }
    );

    return {
      voteEvent: {
        id: voteEvent.id,
        title: voteEvent.title,
        nickname: voteEvent.nickname,
        start_date: voteEvent.start_date,
        result: voteEvent.result,
        agree_count: voteEvent.agree_count,
        disagree_count: voteEvent.disagree_count,
        abstain_count: voteEvent.abstain_count,
        novote_count: voteEvent.novote_count,
      },
      provinceStats,
    };
  } catch (error) {
    console.error("Error fetching vote with province stats:", error);
    return { voteEvent: null, provinceStats: {} };
  }
}

/**
 * ดึงข้อมูลสถิติภาพรวม
 */
export async function fetchOverallStatistics(): Promise<OverallStatistics> {
  try {
    const [politicians, bills, latestVote] = await Promise.all([
      fetchPoliticians(),
      fetchBills(),
      fetchLatestVoteEvent(),
    ]);

    // นับจำนวนกฎหมายตามสถานะ
    const passedBills = bills.filter(
      (bill) =>
        bill.status?.includes("ผ่าน") ||
        bill.status?.includes("passed") ||
        bill.status?.includes("บังคับใช้")
    ).length;

    const failedBills = bills.filter(
      (bill) =>
        bill.status?.includes("ไม่ผ่าน") ||
        bill.status?.includes("rejected") ||
        bill.status?.includes("ตก")
    ).length;

    const pendingBills = bills.filter(
      (bill) =>
        !bill.status ||
        bill.status?.includes("รอ") ||
        bill.status?.includes("pending") ||
        bill.status?.includes("พิจารณา")
    ).length;

    return {
      totalMPs: politicians.length,
      totalBills: bills.length,
      passedBills,
      failedBills,
      pendingBills,
      latestVotingDate: latestVote?.start_date,
    };
  } catch (error) {
    console.error("Error fetching overall statistics:", error);
    return {
      totalMPs: 0,
      totalBills: 0,
      passedBills: 0,
      failedBills: 0,
      pendingBills: 0,
    };
  }
}

/**
 * จัดกลุ่ม ส.ส. ตามจังหวัด
 */
export function groupPoliticiansByProvince(
  politicians: Politician[]
): Record<string, Politician[]> {
  const grouped: Record<string, Politician[]> = {};

  politicians.forEach((politician) => {
    const province = politician.province || "ไม่ระบุ";
    if (!grouped[province]) {
      grouped[province] = [];
    }
    grouped[province].push(politician);
  });

  return grouped;
}
