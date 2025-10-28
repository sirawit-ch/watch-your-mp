/**
 * API Module for Politigraph GraphQL
 * เชื่อมต่อกับ Politigraph API และดึงข้อมูล ส.ส. และการลงคะแนน
 * (ปัจจุบันใช้ Mock Data)
 */

export interface Politician {
  id: string;
  firstname: string;
  lastname: string;
  province: string;
  title?: string;
  party?: {
    name: string;
    color: string;
  };
  educationLevel?: string;
}

export interface Bill {
  id: string;
  title: string;
  nickname?: string;
  created_at: string;
  proposedBy?: string[];
  proposedOn?: string;
}

export interface Voting {
  id: string;
  date: string;
  title: string;
  voteOption: string;
  participatedBy?: Politician[];
}

/**
 * ดึงข้อมูล ส.ส. ทั้งหมด (ใช้ Mock Data)
 */
export async function fetchPoliticians(): Promise<Politician[]> {
  // Mock data สำหรับจังหวัดต่างๆ ในไทย
  const provinces = [
    "กรุงเทพมหานคร",
    "เชียงใหม่",
    "นครราชสีมา",
    "ขอนแก่น",
    "สงขลา",
    "ชลบุรี",
    "ภูเก็ต",
    "อุบลราชธานี",
    "เชียงราย",
    "นครศรีธรรมราช",
    "กาญจนบุรี",
    "อุดรธานี",
    "สุราษฎร์ธานี",
    "ระยอง",
    "ลำปาง",
    "นครสวรรค์",
    "พิษณุโลก",
    "ตรัง",
    "สุรินทร์",
    "ศรีสะเกษ",
  ];

  const parties = [
    { name: "เพื่อไทย", color: "#FF0000" },
    { name: "ก้าวไกล", color: "#FF6B00" },
    { name: "ภูมิใจไทย", color: "#0066CC" },
    { name: "ประชาธิปัตย์", color: "#00ADEF" },
    { name: "พลังประชารัฐ", color: "#1E40AF" },
    { name: "ชาติไทยพัฒนา", color: "#FFA500" },
    { name: "ไทยสร้างไทย", color: "#800080" },
  ];

  const firstnames = [
    "สมชาย",
    "สมหญิง",
    "วิชัย",
    "วิภา",
    "ประเสริฐ",
    "ศรีสุดา",
    "อนุชา",
    "อรพรรณ",
    "ธนา",
    "ธัญญา",
    "รัตน์",
    "รุ่งทิวา",
    "ชัยวัฒน์",
    "ชนิดา",
    "สุรชัย",
    "สุดาพร",
    "มานิต",
    "มาลี",
    "ประยุทธ์",
    "ปรียา",
    "วิโรจน์",
    "วิไล",
    "อาทิตย์",
    "อารีย์",
  ];

  const lastnames = [
    "ใจดี",
    "มั่นคง",
    "สุขสันต์",
    "รุ่งเรือง",
    "เจริญสุข",
    "ศรีสวัสดิ์",
    "พัฒนา",
    "วิทยา",
    "กิจการ",
    "สมบูรณ์",
    "ชัยชนะ",
    "บุญมี",
    "เกียรติศักดิ์",
    "วงศ์ใหญ่",
    "ทองดี",
    "แสงจันทร์",
    "ดวงดี",
    "เพชรรัตน์",
  ];

  const educations = [
    "ปริญญาตรี นิติศาสตร์",
    "ปริญญาโท รัฐศาสตร์",
    "ปริญญาเอก เศรษฐศาสตร์",
    "ปริญญาตรี บริหารธุรกิจ",
    "ปริญญาโท การจัดการ",
    "ปริญญาตรี วิศวกรรมศาสตร์",
    "ปริญญาโท นิเทศศาสตร์",
  ];

  // สร้าง mock politicians
  const mockPoliticians: Politician[] = [];
  let id = 1;

  provinces.forEach((province) => {
    // แต่ละจังหวัดมี 3-8 ส.ส.
    const mpCount = Math.floor(Math.random() * 6) + 3;

    for (let i = 0; i < mpCount; i++) {
      mockPoliticians.push({
        id: `mp-${id++}`,
        firstname: firstnames[Math.floor(Math.random() * firstnames.length)],
        lastname: lastnames[Math.floor(Math.random() * lastnames.length)],
        province: province,
        title: Math.random() > 0.5 ? "นาย" : "นาง",
        party: parties[Math.floor(Math.random() * parties.length)],
        educationLevel:
          educations[Math.floor(Math.random() * educations.length)],
      });
    }
  });

  return mockPoliticians;
}

/**
 * ดึงข้อมูลร่างกฎหมาย (ใช้ Mock Data)
 */
export async function fetchBills(): Promise<Bill[]> {
  const mockBills: Bill[] = [
    {
      id: "bill-1",
      title: "ร่างพระราชบัญญัติการศึกษาแห่งชาติ (ฉบับที่ 5) พ.ศ. 2568",
      nickname: "ร่าง พ.ร.บ. การศึกษาฯ",
      created_at: "2025-10-15T10:00:00Z",
      proposedOn: "2025-10-15",
      proposedBy: ["mp-1", "mp-5", "mp-12"],
    },
    {
      id: "bill-2",
      title: "ร่างพระราชบัญญัติสาธารณสุข (ฉบับที่ 3) พ.ศ. 2568",
      nickname: "ร่าง พ.ร.บ. สาธารณสุขฯ",
      created_at: "2025-10-10T14:30:00Z",
      proposedOn: "2025-10-10",
      proposedBy: ["mp-3", "mp-8"],
    },
    {
      id: "bill-3",
      title: "ร่างพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล (ฉบับที่ 2) พ.ศ. 2568",
      nickname: "ร่าง พ.ร.บ. PDPA ฉบับแก้ไข",
      created_at: "2025-10-05T09:15:00Z",
      proposedOn: "2025-10-05",
      proposedBy: ["mp-2", "mp-7", "mp-15", "mp-20"],
    },
    {
      id: "bill-4",
      title: "ร่างพระราชบัญญัติพลังงานทดแทน พ.ศ. 2568",
      nickname: "ร่าง พ.ร.บ. พลังงานสะอาด",
      created_at: "2025-09-28T11:00:00Z",
      proposedOn: "2025-09-28",
      proposedBy: ["mp-4", "mp-9"],
    },
    {
      id: "bill-5",
      title: "ร่างพระราชบัญญัติการท่องเที่ยวแห่งชาติ พ.ศ. 2568",
      nickname: "ร่าง พ.ร.บ. ท่องเที่ยว",
      created_at: "2025-09-20T13:45:00Z",
      proposedOn: "2025-09-20",
      proposedBy: ["mp-6", "mp-11", "mp-18"],
    },
  ];

  return mockBills;
}

/**
 * ดึงข้อมูลการลงคะแนนสำหรับร่างกฎหมายที่ระบุ (ใช้ Mock Data)
 */
export async function fetchVotingByBill(billId: string): Promise<Voting[]> {
  // จำลองข้อมูลการลงคะแนนตามจังหวัด
  const provinces = [
    "กรุงเทพมหานคร",
    "เชียงใหม่",
    "นครราชสีมา",
    "ขอนแก่น",
    "สงขลา",
    "ชลบุรี",
    "ภูเก็ต",
    "อุบลราชธานี",
    "เชียงราย",
    "นครศรีธรรมราช",
    "กาญจนบุรี",
    "อุดรธานี",
    "สุราษฎร์ธานี",
    "ระยอง",
    "ลำปาง",
    "นครสวรรค์",
    "พิษณุโลก",
    "ตรัง",
    "สุรินทร์",
    "ศรีสะเกษ",
  ];

  const voteOptions = ["เห็นด้วย", "ไม่เห็นด้วย", "งดออกเสียง"];

  const mockVotings: Voting[] = [];
  let votingId = 1;

  // สร้างข้อมูลการลงคะแนนสำหรับแต่ละจังหวัด
  provinces.forEach((province) => {
    const mpCount = Math.floor(Math.random() * 6) + 3; // 3-8 ส.ส. ต่อจังหวัด

    for (let i = 0; i < mpCount; i++) {
      // สร้างรูปแบบการลงคะแนนที่แตกต่างกันตาม bill
      let voteOption: string;

      if (billId === "bill-1") {
        // Bill 1: ส่วนใหญ่ไม่เห็นด้วยอย่างหนัก (85%)
        const rand = Math.random();
        voteOption =
          rand < 0.85 ? "ไม่เห็นด้วย" : rand < 0.93 ? "งดออกเสียง" : "เห็นด้วย";
      } else if (billId === "bill-2") {
        // Bill 2: แบ่งขั้วชัดเจน - บางจังหวัดไม่เห็นด้วยมากๆ
        const strongOpposition = [
          "สงขลา",
          "ภูเก็ต",
          "นครศรีธรรมราช",
          "ตรัง",
          "ขอนแก่น",
          "อุบลราชธานี",
          "อุดรธานี",
          "สุรินทร์",
          "ศรีสะเกษ",
        ];
        if (strongOpposition.includes(province)) {
          voteOption = Math.random() < 0.9 ? "ไม่เห็นด้วย" : "เห็นด้วย";
        } else {
          voteOption = Math.random() < 0.65 ? "ไม่เห็นด้วย" : "เห็นด้วย";
        }
      } else if (billId === "bill-3") {
        // Bill 3: ไม่เห็นด้วยเกือบทั้งหมด (80%)
        const rand = Math.random();
        voteOption =
          rand < 0.8 ? "ไม่เห็นด้วย" : rand < 0.9 ? "งดออกเสียง" : "เห็นด้วย";
      } else if (billId === "bill-4") {
        // Bill 4: ไม่เห็นด้วยทั่วประเทศ (90%)
        const rand = Math.random();
        voteOption =
          rand < 0.9 ? "ไม่เห็นด้วย" : rand < 0.95 ? "งดออกเสียง" : "เห็นด้วย";
      } else if (billId === "bill-5") {
        // Bill 5: กทม.และปริมณฑลไม่เห็นด้วยมากๆ, ต่างจังหวัดก็ไม่เห็นด้วยส่วนใหญ่
        const centralProvinces = [
          "กรุงเทพมหานคร",
          "นนทบุรี",
          "ปทุมธานี",
          "สมุทรปราการ",
        ];
        if (centralProvinces.includes(province)) {
          voteOption = Math.random() < 0.95 ? "ไม่เห็นด้วย" : "เห็นด้วย";
        } else {
          voteOption = Math.random() < 0.75 ? "ไม่เห็นด้วย" : "เห็นด้วย";
        }
      } else {
        // Bills อื่นๆ: ส่วนใหญ่ไม่เห็นด้วย
        const rand = Math.random();
        voteOption =
          rand < 0.7 ? "ไม่เห็นด้วย" : rand < 0.85 ? "งดออกเสียง" : "เห็นด้วย";
      }

      mockVotings.push({
        id: `voting-${votingId++}`,
        date: "2025-10-25",
        title: `การลงคะแนนร่างกฎหมาย ${billId}`,
        voteOption: voteOption,
        participatedBy: [
          {
            id: `mp-${votingId}`,
            firstname: "Mock",
            lastname: "MP",
            province: province,
          },
        ],
      });
    }
  });

  return mockVotings;
}

/**
 * จัดกลุ่ม ส.ส. ตามจังหวัด
 */
export function groupPoliticiansByProvince(
  politicians: Politician[]
): Record<string, Politician[]> {
  const grouped: Record<string, Politician[]> = {};

  politicians.forEach((politician) => {
    const province = politician.province || "อื่นๆ";
    if (!grouped[province]) {
      grouped[province] = [];
    }
    grouped[province].push(politician);
  });

  return grouped;
}

export interface VotingStats {
  approve: number;
  disapprove: number;
  abstain: number;
  absent: number;
  total: number;
}

/**
 * คำนวณสถิติการลงคะแนนตามจังหวัด
 */
export function calculateVotingStatsByProvince(
  votings: Voting[]
): Record<string, VotingStats> {
  const provinceStats: Record<string, VotingStats> = {};

  votings.forEach((voting) => {
    voting.participatedBy?.forEach((participant) => {
      const province = participant.province || "อื่นๆ";

      if (!provinceStats[province]) {
        provinceStats[province] = {
          approve: 0,
          disapprove: 0,
          abstain: 0,
          absent: 0,
          total: 0,
        };
      }

      const voteType = voting.voteOption?.toLowerCase() || "absent";

      if (voteType.includes("เห็นด้วย") || voteType.includes("approve")) {
        provinceStats[province].approve++;
      } else if (
        voteType.includes("ไม่เห็นด้วย") ||
        voteType.includes("disapprove")
      ) {
        provinceStats[province].disapprove++;
      } else if (
        voteType.includes("งดออกเสียง") ||
        voteType.includes("abstain")
      ) {
        provinceStats[province].abstain++;
      } else {
        provinceStats[province].absent++;
      }

      provinceStats[province].total++;
    });
  });

  return provinceStats;
}

/**
 * ดึงการลงคะแนนทั้งหมดของปี 2025 (รวมทุก Bill)
 */
export async function fetchAllVotings2025(): Promise<Voting[]> {
  const bills = await fetchBills();
  const allVotings: Voting[] = [];

  // ดึงข้อมูลการลงคะแนนจากทุก bill
  for (const bill of bills) {
    const votings = await fetchVotingByBill(bill.id);
    allVotings.push(...votings);
  }

  return allVotings;
}

/**
 * คำนวณจำนวนการลงคะแนนรวมทั้งหมดของแต่ละจังหวัดในปี 2025
 */
export function calculateTotalVotesByProvince(
  votings: Voting[]
): Record<string, number> {
  const provinceTotalVotes: Record<string, number> = {};

  votings.forEach((voting) => {
    voting.participatedBy?.forEach((participant) => {
      const province = participant.province || "อื่นๆ";
      provinceTotalVotes[province] = (provinceTotalVotes[province] || 0) + 1;
    });
  });

  return provinceTotalVotes;
}
