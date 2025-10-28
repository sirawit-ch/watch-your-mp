/**
 * Province name mapping between English (GeoJSON) and Thai (API data)
 */
export const provinceMapping: Record<string, string> = {
  // English name from GeoJSON -> Thai name from API
  "Mae Hong Son": "แม่ฮ่องสอน",
  "Chiang Mai": "เชียงใหม่",
  "Chiang Rai": "เชียงราย",
  Nan: "น่าน",
  Lamphun: "ลำพูน",
  Lampang: "ลำปาง",
  Phrae: "แพร่",
  Tak: "ตาก",
  Sukhothai: "สุโขทัย",
  Uttaradit: "อุตรดิตถ์",
  "Kamphaeng Phet": "กำแพงเพชร",
  Phitsanulok: "พิษณุโลก",
  Phichit: "พิจิตร",
  Phetchabun: "เพชรบูรณ์",
  "Nakhon Sawan": "นครสวรรค์",
  "Uthai Thani": "อุทัยธานี",
  "Chai Nat": "ชัยนาท",
  "Sing Buri": "สิงห์บุรี",
  "Lop Buri": "ลพบุรี",
  "Ang Thong": "อ่างทอง",
  Saraburi: "สระบุรี",
  "Phra Nakhon Si Ayutthaya": "พระนครศรีอยุธยา",
  Nonthaburi: "นนทบุรี",
  "Pathum Thani": "ปทุมธานี",
  "Nakhon Pathom": "นครปฐม",
  "Samut Prakan": "สมุทรปราการ",
  "Samut Songkhram": "สมุทรสงคราม",
  "Samut Sakhon": "สมุทรสาคร",
  "Krung Thep Maha Nakhon": "กรุงเทพมหานคร",
  Bangkok: "กรุงเทพมหานคร",
  "Bangkok Metropolis": "กรุงเทพมหานคร",
  Ratchaburi: "ราชบุรี",
  Kanchanaburi: "กาญจนบุรี",
  "Suphan Buri": "สุพรรณบุรี",
  "Prachuap Khiri Khan": "ประจวบคีรีขันธ์",
  Phetchaburi: "เพชรบุรี",
  "Nakhon Ratchasima": "นครราชสีมา",
  "Buri Ram": "บุรีรัมย์",
  Surin: "สุรินทร์",
  "Si Sa Ket": "ศรีสะเกษ",
  "Ubon Ratchathani": "อุบลราชธานี",
  Yasothon: "ยโสธร",
  Chaiyaphum: "ชัยภูมิ",
  "Amnat Charoen": "อำนาจเจริญ",
  "Nong Bua Lam Phu": "หนองบัวลำภู",
  "Khon Kaen": "ขอนแก่น",
  "Udon Thani": "อุดรธานี",
  Loei: "เลย",
  "Nong Khai": "หนองคาย",
  "Maha Sarakham": "มหาสารคาม",
  "Roi Et": "ร้อยเอ็ด",
  Kalasin: "กาฬสินธุ์",
  "Sakon Nakhon": "สกลนคร",
  "Nakhon Phanom": "นครพนม",
  Mukdahan: "มุกดาหาร",
  "Chon Buri": "ชลบุรี",
  Rayong: "ระยอง",
  Chanthaburi: "จันทบุรี",
  Trat: "ตราด",
  Chachoengsao: "ฉะเชิงเทรา",
  "Prachin Buri": "ปราจีนบุรี",
  "Sa Kaeo": "สระแก้ว",
  "Nakhon Nayok": "นครนายก",
  "Nakhon Si Thammarat": "นครศรีธรรมราช",
  Krabi: "กระบี่",
  Phangnga: "พังงา",
  Phuket: "ภูเก็ต",
  "Surat Thani": "สุราษฎร์ธานี",
  Ranong: "ระนอง",
  Chumphon: "ชุมพร",
  Songkhla: "สงขลา",
  Satun: "สตูล",
  Trang: "ตรัง",
  Phatthalung: "พัทลุง",
  Pattani: "ปัตตานี",
  Yala: "ยะลา",
  Narathiwat: "นราธิวาส",
  "Bueng Kan": "บึงกาฬ",
};

/**
 * Convert English province name to Thai
 */
export function englishToThai(englishName: string): string {
  return provinceMapping[englishName] || englishName;
}

/**
 * Convert Thai province name to English
 */
export function thaiToEnglish(thaiName: string): string {
  const reverseMapping = Object.entries(provinceMapping).find(
    ([, thai]) => thai === thaiName
  );
  return reverseMapping?.[0] || thaiName;
}
