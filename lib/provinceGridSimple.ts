/**
 * Grid layout สำหรับแผนที่จังหวัดแบบ Tile Grid Map
 * แต่ละจังหวัดมีตำแหน่ง (row, col) บนกริด
 * ดูจากภาพที่ user ส่งมา
 */

export interface ProvinceGridPosition {
  row: number;
  col: number;
  abbr: string; // ชื่อย่อ
}

export const provinceGridLayout: Record<string, ProvinceGridPosition> = {
  // ภาคเหนือ - แถว 0-3
  เชียงราย: { row: 0, col: 2, abbr: "ชร" },
  แม่ฮ่องสอน: { row: 1, col: 0, abbr: "มส" },
  เชียงใหม่: { row: 1, col: 1, abbr: "ชม" },
  พะเยา: { row: 1, col: 2, abbr: "พย" },
  น่าน: { row: 1, col: 3, abbr: "นน" },
  ลำพูน: { row: 2, col: 0, abbr: "ลพ" },
  ลำปาง: { row: 2, col: 1, abbr: "ลบ" },
  แพร่: { row: 2, col: 2, abbr: "พร" },
  อุตรดิตถ์: { row: 2, col: 3, abbr: "อต" },
  ตาก: { row: 3, col: 0, abbr: "ตก" },
  สุโขทัย: { row: 3, col: 1, abbr: "สท" },
  พิษณุโลก: { row: 3, col: 2, abbr: "พล" },

  // ภาคตะวันออกเฉียงเหนือ - แถว 4-7
  กำแพงเพชร: { row: 4, col: 0, abbr: "กพ" },
  กาญจนบุรี: { row: 4, col: 1, abbr: "กจ" },
  พิจิตร: { row: 4, col: 2, abbr: "พจ" },
  เลย: { row: 4, col: 3, abbr: "ลย" },
  หนองคาย: { row: 4, col: 4, abbr: "นค" },
  บึงกาฬ: { row: 4, col: 5, abbr: "บก" },
  สกลนคร: { row: 4, col: 6, abbr: "สน" },
  นครพนม: { row: 4, col: 7, abbr: "นพ" },

  อุทัยธานี: { row: 5, col: 1, abbr: "อน" },
  นครสวรรค์: { row: 5, col: 2, abbr: "นว" },
  เพชรบูรณ์: { row: 5, col: 3, abbr: "พช" },
  หนองบัวลำภู: { row: 5, col: 4, abbr: "นภ" },
  อุดรธานี: { row: 5, col: 5, abbr: "อด" },
  กาฬสินธุ์: { row: 5, col: 6, abbr: "กส" },
  มุกดาหาร: { row: 5, col: 7, abbr: "มห" },

  ชัยนาท: { row: 6, col: 0, abbr: "ชน" },
  สิงห์บุรี: { row: 6, col: 1, abbr: "สห" },
  ลพบุรี: { row: 6, col: 2, abbr: "ลบ" },
  ชัยภูมิ: { row: 6, col: 3, abbr: "ชย" },
  ขอนแก่น: { row: 6, col: 4, abbr: "ขก" },
  มหาสารคาม: { row: 6, col: 5, abbr: "มค" },
  ร้อยเอ็ด: { row: 6, col: 6, abbr: "รอ" },
  ยโสธร: { row: 6, col: 7, abbr: "ยส" },
  อำนาจเจริญ: { row: 6, col: 8, abbr: "อจ" },

  สุพรรณบุรี: { row: 7, col: 0, abbr: "สพ" },
  อ่างทอง: { row: 7, col: 1, abbr: "อท" },
  อยุธยา: { row: 7, col: 2, abbr: "อย" },
  สระบุรี: { row: 7, col: 3, abbr: "สบ" },
  นครราชสีมา: { row: 7, col: 4, abbr: "นม" },
  บุรีรัมย์: { row: 7, col: 5, abbr: "บร" },
  สุรินทร์: { row: 7, col: 6, abbr: "สร" },
  ศรีสะเกษ: { row: 7, col: 7, abbr: "ศก" },
  อุบลราชธานี: { row: 7, col: 8, abbr: "อบ" },

  // ภาคกลาง - แถว 8-10
  นนทบุรี: { row: 8, col: 2, abbr: "นบ" },
  ปทุมธานี: { row: 8, col: 3, abbr: "ปท" },
  นครนายก: { row: 8, col: 4, abbr: "นย" },
  ปราจีนบุรี: { row: 8, col: 5, abbr: "ปจ" },
  สระแก้ว: { row: 8, col: 6, abbr: "สก" },

  ราชบุรี: { row: 9, col: 1, abbr: "รบ" },
  นครปฐม: { row: 9, col: 2, abbr: "นฐ" },
  กรุงเทพมหานคร: { row: 9, col: 3, abbr: "กทม" },
  สมุทรปราการ: { row: 9, col: 4, abbr: "สป" },
  ฉะเชิงเทรา: { row: 9, col: 5, abbr: "ฉช" },
  ชลบุรี: { row: 9, col: 6, abbr: "ชบ" },

  เพชรบุรี: { row: 10, col: 1, abbr: "พบ" },
  สมุทรสาคร: { row: 10, col: 2, abbr: "สค" },
  สมุทรสงคราม: { row: 10, col: 3, abbr: "สส" },
  ระยอง: { row: 10, col: 4, abbr: "รย" },
  จันทบุรี: { row: 10, col: 5, abbr: "จบ" },

  // ภาคใต้ - แถว 11-14
  ประจวบคีรีขันธ์: { row: 11, col: 1, abbr: "ปข" },
  ตราด: { row: 11, col: 5, abbr: "ตร" },

  ระนอง: { row: 12, col: 0, abbr: "รน" },
  ชุมพร: { row: 12, col: 1, abbr: "ชพ" },

  พังงา: { row: 13, col: 0, abbr: "พง" },
  สุราษฎร์ธานี: { row: 13, col: 1, abbr: "สฎ" },

  ภูเก็ต: { row: 14, col: 0, abbr: "ภก" },
  กระบี่: { row: 14, col: 1, abbr: "กบ" },
  นครศรีธรรมราช: { row: 14, col: 2, abbr: "นศ" },

  ตรัง: { row: 15, col: 2, abbr: "ตง" },
  พัทลุง: { row: 15, col: 3, abbr: "พท" },
  
  สตูล: { row: 16, col: 3, abbr: "สต" },
  สงขลา: { row: 16, col: 4, abbr: "สข" },
  ปัตตานี: { row: 16, col: 5, abbr: "ปน" },

  ยะลา: { row: 17, col: 5, abbr: "ยล" },
  นราธิวาส: { row: 17, col: 6, abbr: "นธ" },
};

// ฟังก์ชันช่วยหาตำแหน่ง grid ของจังหวัด
export function getProvinceGridPosition(
  provinceName: string
): ProvinceGridPosition | null {
  return provinceGridLayout[provinceName] || null;
}
