#!/usr/bin/env node

/**
 * สร้าง placeholder files จาก mp-action-summary.json
 * ใช้เมื่อ API ล่มและไม่สามารถ generate ข้อมูลใหม่ได้
 */

const fs = await import("fs/promises");
const path = await import("path");

console.log("📦 Creating placeholder data files...\n");

const dataDir = path.join(process.cwd(), "public", "data");

try {
  // อ่านข้อมูลจาก mp-action-summary.json
  const mpSummaryPath = path.join(dataDir, "mp-action-summary.json");
  const mpSummary = JSON.parse(await fs.readFile(mpSummaryPath, "utf-8"));

  // 1. สร้าง politicians.json จาก mp-action-summary
  const politicians = mpSummary
    .filter((mp) => mp.province)
    .map((mp, index) => {
      const [firstname, lastname] = mp.person.split(" ");
      return {
        id: `mp-${index}`,
        firstname: firstname || mp.person,
        lastname: lastname || "",
        prefix: "",
        province: mp.province,
        party: null,
        image: mp.image,
      };
    });

  await fs.writeFile(
    path.join(dataDir, "politicians.json"),
    JSON.stringify(politicians, null, 2),
    "utf-8"
  );
  console.log(`✅ Created politicians.json (${politicians.length} records)`);

  // 2. สร้าง party-list-mps.json (ว่างเปล่า - ไม่มีใน mp-action-summary)
  await fs.writeFile(
    path.join(dataDir, "party-list-mps.json"),
    JSON.stringify([], null, 2),
    "utf-8"
  );
  console.log("✅ Created party-list-mps.json (empty)");

  // 3. สร้าง vote-events.json (ว่างเปล่า)
  await fs.writeFile(
    path.join(dataDir, "vote-events.json"),
    JSON.stringify([], null, 2),
    "utf-8"
  );
  console.log("✅ Created vote-events.json (empty)");

  // 4. สร้าง latest-vote.json จาก province-summary
  const provinceSummaryPath = path.join(dataDir, "province-summary.json");
  const provinceSummaryData = JSON.parse(
    await fs.readFile(provinceSummaryPath, "utf-8")
  );

  // คำนวณสถิติจาก province-summary (ซึ่งเป็น array ของ MPs)
  const provinceStats = {};

  provinceSummaryData.forEach((mp) => {
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

    provinceStats[mp.province].agreeCount += mp.เห็นด้วย || 0;
    provinceStats[mp.province].disagreeCount += mp.ไม่เห็นด้วย || 0;
    provinceStats[mp.province].abstainCount += mp.งดออกเสียง || 0;
    provinceStats[mp.province].absentCount += mp["ลา / ขาดลงมติ"] || 0;
    provinceStats[mp.province].totalCount++;
  });

  const latestVoteData = {
    voteEvent: {
      id: "placeholder",
      title: "ข้อมูลการลงมติล่าสุด",
      nickname: null,
      start_date: new Date().toISOString().split("T")[0],
      result: null,
    },
    provinceStats,
  };

  await fs.writeFile(
    path.join(dataDir, "latest-vote.json"),
    JSON.stringify(latestVoteData, null, 2),
    "utf-8"
  );
  console.log(
    `✅ Created latest-vote.json (${
      Object.keys(provinceStats).length
    } provinces)`
  );

  // 5. สร้าง overall-stats.json
  const overallStats = {
    totalMPs: politicians.length,
    totalBills: 0,
    passedBills: 0,
    failedBills: 0,
    pendingBills: 0,
    latestVotingDate: new Date().toISOString().split("T")[0],
  };

  await fs.writeFile(
    path.join(dataDir, "overall-stats.json"),
    JSON.stringify(overallStats, null, 2),
    "utf-8"
  );
  console.log("✅ Created overall-stats.json");

  console.log("\n✨ All placeholder files created successfully!");
} catch (error) {
  console.error("❌ Error:", error);
  process.exit(1);
}
