#!/usr/bin/env node

/**
 * Script สำหรับ generate ข้อมูลทั้งหมดที่ app ต้องการ
 * รันทุกวันอาทิตย์ผ่าน GitHub Actions
 */

const GRAPHQL_ENDPOINT = "https://politigraph.wevis.info/graphql";

async function fetchGraphQL(query, variables = {}) {
  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables }),
    });

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error("Error fetching GraphQL:", error);
    throw error;
  }
}

/**
 * Generate ข้อมูล Politicians (ส.ส. แบ่งเขต)
 */
async function generatePoliticians() {
  console.log("🔄 Generating Politicians data...");

  const query = `
    query {
      people(limit: 1000) {
        id
        prefix
        firstname
        lastname
        image
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

  const data = await fetchGraphQL(query);

  if (!data?.people) {
    throw new Error("No people data received");
  }

  // กรองเฉพาะ ส.ส. แบ่งเขต
  const politicians = data.people
    .filter((person) => {
      if (!person.memberships || person.memberships.length === 0) return false;
      return person.memberships.some(
        (m) => m.province && m.label === "แบ่งเขต" && m.end_date === null
      );
    })
    .map((person) => {
      const activeMembership = person.memberships.find(
        (m) => m.province && m.label === "แบ่งเขต" && m.end_date === null
      );

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
        province: activeMembership?.province || null,
        party: party
          ? { name: party.name, color: party.color || "#6b7280" }
          : null,
        image: person.image,
      };
    });

  console.log(`✅ Generated ${politicians.length} politicians`);
  return politicians;
}

/**
 * Generate ข้อมูล Party List MPs (ส.ส. บัญชีรายชื่อ)
 */
async function generatePartyListMPs() {
  console.log("🔄 Generating Party List MPs...");

  const query = `
    query {
      people(limit: 1000) {
        id
        prefix
        firstname
        lastname
        image
        memberships {
          province
          label
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

  const data = await fetchGraphQL(query);

  if (!data?.people) return [];

  const partyListMPs = data.people
    .filter((person) => {
      if (!person.memberships) return false;
      return person.memberships.some(
        (m) => m.label === "บัญชีรายชื่อ" && m.end_date === null
      );
    })
    .map((person) => {
      const partyMembership = person.memberships.find(
        (m) => m.label === "บัญชีรายชื่อ" && m.end_date === null
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
        party: party
          ? { name: party.name, color: party.color || "#6b7280" }
          : null,
        image: person.image,
      };
    });

  console.log(`✅ Generated ${partyListMPs.length} party list MPs`);
  return partyListMPs;
}

/**
 * Generate ข้อมูล Vote Events
 */
async function generateVoteEvents() {
  console.log("🔄 Generating Vote Events...");

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

  const data = await fetchGraphQL(query);
  const voteEvents = data?.voteEvents || [];

  console.log(`✅ Generated ${voteEvents.length} vote events`);
  return voteEvents;
}

/**
 * Generate ข้อมูล Latest Vote with Province Stats
 */
async function generateLatestVoteStats(politicians) {
  console.log("🔄 Generating Latest Vote Stats...");

  const query = `
    query {
      voteEvents(limit: 1, sort: [{start_date: DESC}]) {
        id
        title
        nickname
        start_date
        result
        votes {
          option
          voter {
            id
            name
          }
        }
      }
    }
  `;

  const data = await fetchGraphQL(query);
  const latestVote = data?.voteEvents?.[0] || null;

  if (!latestVote) {
    return { voteEvent: null, provinceStats: {} };
  }

  // คำนวณสถิติแยกตามจังหวัด
  const provinceStats = {};

  politicians.forEach((mp) => {
    if (!mp.province) return;

    if (!provinceStats[mp.province]) {
      provinceStats[mp.province] = {
        province: mp.province,
        agreeCount: 0,
        disagreeCount: 0,
        abstainCount: 0,
        absentCount: 0,
        totalCount: 0,
      };
    }

    // หาคะแนนของ ส.ส. คนนี้
    const mpVote = latestVote.votes?.find(
      (v) =>
        v.voter?.id === mp.id ||
        v.voter?.name === `${mp.firstname} ${mp.lastname}`
    );

    if (mpVote) {
      const option = mpVote.option;
      if (option === "เห็นด้วย") {
        provinceStats[mp.province].agreeCount++;
      } else if (option === "ไม่เห็นด้วย") {
        provinceStats[mp.province].disagreeCount++;
      } else if (option === "งดออกเสียง") {
        provinceStats[mp.province].abstainCount++;
      } else {
        provinceStats[mp.province].absentCount++;
      }
    } else {
      provinceStats[mp.province].absentCount++;
    }

    provinceStats[mp.province].totalCount++;
  });

  console.log(
    `✅ Generated stats for ${Object.keys(provinceStats).length} provinces`
  );

  return {
    voteEvent: {
      id: latestVote.id,
      title: latestVote.title,
      nickname: latestVote.nickname,
      start_date: latestVote.start_date,
      result: latestVote.result,
    },
    provinceStats,
  };
}

/**
 * Main function
 */
async function main() {
  const fs = await import("fs/promises");
  const path = await import("path");

  console.log("🚀 Starting complete data generation...\n");

  try {
    const dataDir = path.join(process.cwd(), "public", "data");
    await fs.mkdir(dataDir, { recursive: true });

    // 1. Generate Politicians
    const politicians = await generatePoliticians();
    await fs.writeFile(
      path.join(dataDir, "politicians.json"),
      JSON.stringify(politicians, null, 2),
      "utf-8"
    );

    // 2. Generate Party List MPs
    const partyListMPs = await generatePartyListMPs();
    await fs.writeFile(
      path.join(dataDir, "party-list-mps.json"),
      JSON.stringify(partyListMPs, null, 2),
      "utf-8"
    );

    // 3. Generate Vote Events
    const voteEvents = await generateVoteEvents();
    await fs.writeFile(
      path.join(dataDir, "vote-events.json"),
      JSON.stringify(voteEvents, null, 2),
      "utf-8"
    );

    // 4. Generate Latest Vote Stats
    const latestVoteData = await generateLatestVoteStats(politicians);
    await fs.writeFile(
      path.join(dataDir, "latest-vote.json"),
      JSON.stringify(latestVoteData, null, 2),
      "utf-8"
    );

    // 5. Generate Overall Statistics
    const overallStats = {
      totalMPs: politicians.length + partyListMPs.length,
      totalBills: 0,
      passedBills: 0,
      failedBills: 0,
      pendingBills: 0,
      latestVotingDate: latestVoteData.voteEvent?.start_date || null,
    };

    await fs.writeFile(
      path.join(dataDir, "overall-stats.json"),
      JSON.stringify(overallStats, null, 2),
      "utf-8"
    );

    console.log("\n✨ All data generated successfully!");
    console.log("📁 Files created in public/data/:");
    console.log("   - politicians.json");
    console.log("   - party-list-mps.json");
    console.log("   - vote-events.json");
    console.log("   - latest-vote.json");
    console.log("   - overall-stats.json");
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

main();
