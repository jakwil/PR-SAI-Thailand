import { BureauGroupId, BureauGroupInfo, GroupWorkItem } from '../types';

export const BUREAU_TITLE = 'สำนักประชาสัมพันธ์และสื่อสารองค์กร';
export const BUREAU_EXECUTIVE_TITLE = 'ผู้อำนวยการสำนักประชาสัมพันธ์และสื่อสารองค์กร';
export const BUREAU_SUBTITLE = 'สำนักงานการตรวจเงินแผ่นดิน (สตง.)';

export const BUREAU_GROUPS: BureauGroupInfo[] = [
  {
    id: 'group-media-relations',
    order: 1,
    name: 'กลุ่มงานสื่อมวลชนสัมพันธ์และเครือข่าย',
    shortName: 'สื่อมวลชนสัมพันธ์และเครือข่าย',
    englishName: 'Media Relations & Network Group',
    accentColor: 'amber',
    summary:
      'สร้างและบริหารความสัมพันธ์กับสื่อมวลชนและเครือข่ายการสื่อสารของ สตง. ประสานเผยแพร่ข้อมูลและสนับสนุนข้อเท็จจริงอย่างถูกต้อง รวดเร็ว และน่าเชื่อถือ',
    missions: [
      'ประชาสัมพันธ์และเผยแพร่ข้อมูลข่าวสารของคณะกรรมการตรวจเงินแผ่นดิน และสำนักงานการตรวจเงินแผ่นดิน',
      'สนับสนุนภารกิจโฆษก สตง. อาทิ การประสานการให้สัมภาษณ์ คำชี้แจง และข่าวประชาสัมพันธ์',
      'บริหารจัดการฐานข้อมูลและสร้างความสัมพันธ์อันดีกับเครือข่ายสื่อมวลชนทุกแขนง ทั้งสื่อโทรทัศน์และสื่อออนไลน์ รวมถึงหน่วยงานภายนอก เช่น การจัดนิทรรศการ',
      'ผลิตสื่อประชาสัมพันธ์ที่เกี่ยวข้อง (อาทิ อินโฟกราฟิก คลิปวิดีโอ) และประสานงานสนับสนุนภารกิจส่วนราชการภายใน สตง.',
    ],
  },
  {
    id: 'group-corp-strategy',
    order: 2,
    name: 'กลุ่มสื่อสารองค์กรและกลยุทธ์',
    shortName: 'สื่อสารองค์กรและกลยุทธ์',
    englishName: 'Corporate Communication & Strategy Group',
    accentColor: 'cyan',
    summary:
      'กำหนดและขับเคลื่อนกลยุทธ์การสื่อสารองค์กร บริหารจัดการประเด็นอ่อนไหวและสถานการณ์วิกฤต เฝ้าระวังวิเคราะห์กระแสข่าว และเผยแพร่ข้อเท็จจริงเพื่อเสริมสร้างความเชื่อมั่นแก่สาธารณชน',
    missions: [
      'กำหนดกลยุทธ์ แผนการสื่อสารองค์กร และประเด็นสารสำคัญ (Key Messages) ทั้งในภาวะปกติและภาวะวิกฤต',
      'วิเคราะห์และบริหารจัดการประเด็นอ่อนไหวและสถานการณ์วิกฤต ประเมินความเสี่ยง และจัดทำคำชี้แจงข้อเท็จจริงเชิงรุก',
      'ติดตาม เฝ้าระวัง และวิเคราะห์กระแสข่าวจากสื่อมวลชนและสื่อสังคมออนไลน์ พร้อมระบบแจ้งเตือนประเด็นสำคัญล่วงหน้า',
      'จัดทำข้อมูลและสื่อเชิงกลยุทธ์ (อินโฟกราฟิก วิดีโออธิบายประเด็น ชุดข้อเท็จจริง และคำถามที่พบบ่อย) รวมถึงประสานกลั่นกรองข้อมูลภายใน',
      'ติดตามประเมินผลการสื่อสารเชิงกลยุทธ์ และรวบรวม อนุรักษ์ ให้บริการเอกสารจดหมายเหตุขององค์กร',
    ],
  },
  {
    id: 'group-media-production',
    order: 3,
    name: 'กลุ่มผลิตสื่อประชาสัมพันธ์',
    shortName: 'ผลิตสื่อประชาสัมพันธ์',
    englishName: 'Media Production Group',
    accentColor: 'emerald',
    summary:
      'วางแผน ออกแบบ ผลิต และควบคุมคุณภาพสื่อประชาสัมพันธ์ทุกรูปแบบ พร้อมบริหารคลังสื่อ ถ่ายทอดสด และกำกับมาตรฐานอัตลักษณ์องค์กร (CI)',
    missions: [
      'ผลิตและเผยแพร่ภาพนิ่งงานพิธีการ กิจกรรมผู้บริหาร และ สตง. ทั้งในและนอกสถานที่ รวมถึงบันทึกภาพจากช่องทางออนไลน์ (Online Capture)',
      'วางแผน ออกแบบ และผลิตสื่อประชาสัมพันธ์ทุกรูปแบบ ทั้งภาพนิ่ง กราฟิก วีดิทัศน์ โสตทัศนูปกรณ์ มัลติมีเดีย และสื่อดิจิทัลยุคใหม่',
      'เตรียมความพร้อม ควบคุม และดำเนินการถ่ายทอดสด (Live Broadcast) ผ่านช่องทางออนไลน์ให้ได้มาตรฐานภาพและเสียง',
      'บริหารจัดการทรัพยากรและคลังสื่อ กำกับดูแลมาตรฐานอัตลักษณ์องค์กร (Corporate Identity: CI) และให้คำปรึกษาด้านการผลิตสื่อแก่หน่วยงาน',
    ],
  },
  {
    id: 'group-general-admin',
    order: 4,
    name: 'กลุ่มบริหารงานทั่วไป',
    shortName: 'บริหารงานทั่วไป',
    englishName: 'General Administration Group',
    accentColor: 'indigo',
    summary:
      'สนับสนุนการบริหารจัดการภายในสำนักประชาสัมพันธ์และสื่อสารองค์กรให้เป็นระบบ คล่องตัว โปร่งใส และมีประสิทธิภาพ',
    missions: [
      'ดำเนินการเกี่ยวกับงานสารบรรณ งานธุรการ และงานอำนวยการสนับสนุนภารกิจของสำนักฯ',
      'บริหารงานบุคคล งานพัสดุ การเงิน บัญชี และงบประมาณของสำนักฯ',
      'ประสานงานและสนับสนุนการปฏิบัติงานร่วมกับหน่วยงานภายในและภายนอก สตง.',
    ],
    showWorks: false,
  },
];

export const BUREAU_GROUPS_WITH_WORKS: BureauGroupInfo[] = BUREAU_GROUPS.filter(
  (g) => g.showWorks !== false
);

export function getBureauGroupById(groupId?: string): BureauGroupInfo | undefined {
  return BUREAU_GROUPS.find((g) => g.id === groupId);
}

export function getBureauGroupLabel(groupId?: string): string {
  return getBureauGroupById(groupId)?.name || 'ไม่ระบุกลุ่มงาน';
}

export const defaultGroupWorks: GroupWorkItem[] = [
  {
    id: 'gw-media-1',
    groupId: 'group-media-relations',
    missionIndexes: [1, 2, 3],
    title: 'เครือข่ายสื่อมวลชนและข่าวประชาสัมพันธ์เชิงรุก สตง.',
    description:
      'ประสานงานเผยแพร่ข้อมูลข่าวสารผลการตรวจเงินแผ่นดิน สนับสนุนภารกิจโฆษก สตง. และการสื่อสารร่วมกับเครือข่ายสื่อโทรทัศน์และสื่อออนไลน์ทั่วประเทศ',
    imageUrl: '/src/assets/images/sai_press_photo_1791791796122.jpg',
    galleryImages: [
      '/src/assets/images/sai_hero_inspection_1792297056517.jpg',
      '/src/assets/images/sai_video_broadcast_1791791820641.jpg',
    ],
    workDate: '2026-10-12',
    linkUrl: '#published-works',
    badge: 'สื่อมวลชนสัมพันธ์',
    mediaType: 'photo',
  },
  {
    id: 'gw-media-2',
    groupId: 'group-media-relations',
    missionIndexes: [3, 4],
    title: 'นิทรรศการและแคมเปญพลังพลเมือง สายด่วน สตง. 1730',
    description:
      'จัดกิจกรรมสร้างเครือข่ายความร่วมมือกับหน่วยงานภายนอกและภาคประชาชน เพื่อส่งเสริมการมีส่วนร่วมเฝ้าระวังการใช้จ่ายงบประมาณแผ่นดิน',
    imageUrl: '/src/assets/images/sai_public_campaign_1791689820118.jpg',
    galleryImages: [
      '/src/assets/images/sai_infographic_stats_1791791809566.jpg',
    ],
    workDate: '2026-10-08',
    linkUrl: '#public-interest',
    badge: 'เครือข่ายภาคประชาชน',
    mediaType: 'photo',
  },
  {
    id: 'gw-strategy-1',
    groupId: 'group-corp-strategy',
    missionIndexes: [1, 2, 3],
    title: 'ชุดข้อมูลข้อเท็จจริงและการสื่อสารภาวะวิกฤต (Crisis PR)',
    description:
      'วิเคราะห์ประเด็นอ่อนไหว เฝ้าระวังกระแสข่าว และจัดทำคำชี้แจงข้อเท็จจริงเหตุการณ์อาคาร สตง. พร้อมประสานกลั่นกรองสารสำคัญอย่างเป็นระบบ',
    imageUrl: '/src/assets/images/sai_building_inspection_1791689807795.jpg',
    galleryImages: [
      '/src/assets/images/sai_hero_inspection_1792297056517.jpg',
      '/src/assets/images/sai_digital_audit_ai_1792297056483.jpg',
    ],
    workDate: '2026-10-14',
    linkUrl: '#incident-timeline',
    badge: 'สื่อสารเชิงกลยุทธ์',
    mediaType: 'report',
  },
  {
    id: 'gw-strategy-2',
    groupId: 'group-corp-strategy',
    missionIndexes: [1, 4, 5],
    title: 'สารคดีและอินโฟกราฟิกชี้แจงประเด็นสำคัญ (Key Messages)',
    description:
      'สรุปผลสัมฤทธิ์การตรวจเงินแผ่นดินและจัดทำสื่อเชิงกลยุทธ์อธิบายประเด็นสาธารณะ เพื่อเสริมสร้างความเข้าใจและความเชื่อมั่นแก่องค์กร',
    imageUrl: '/src/assets/images/sai_infographic_stats_1791791809566.jpg',
    workDate: '2026-10-11',
    linkUrl: '#published-works',
    badge: 'Key Messages',
    mediaType: 'infographic',
  },
  {
    id: 'gw-prod-1',
    groupId: 'group-media-production',
    missionIndexes: [2, 3],
    title: 'ห้องส่งสตูดิโอและระบบถ่ายทอดสด (Live Broadcast Studio)',
    description:
      'วางแผน ออกแบบ ผลิต และควบคุมคุณภาพการถ่ายทอดสดรายการพิเศษและแถลงข่าวผ่านช่องทางออนไลน์ด้วยมาตรฐานภาพและเสียงระดับมืออาชีพ',
    imageUrl: '/src/assets/images/sai_video_broadcast_1791791820641.jpg',
    galleryImages: [
      '/src/assets/images/sai_press_photo_1791791796122.jpg',
    ],
    workDate: '2026-10-10',
    linkUrl: '#viral-clips',
    badge: 'Live Studio',
    mediaType: 'video',
  },
  {
    id: 'gw-prod-2',
    groupId: 'group-media-production',
    missionIndexes: [1, 2, 4],
    title: 'นวัตกรรมมัลติมีเดีย ดิจิทัล และมาตรฐานอัตลักษณ์องค์กร (CI)',
    description:
      'ออกแบบกราฟิก วิดีโอสั้น โมชันอินโฟกราฟิก และบริหารคลังสื่อภาพนิ่ง-วิดีโอ พร้อมกำกับดูแลมาตรฐาน CI ขององค์กร',
    imageUrl: '/src/assets/images/sai_digital_innovation_1791689830942.jpg',
    galleryImages: [
      '/src/assets/images/sai_digital_network_1791693065277.jpg',
      '/src/assets/images/sai_earth_hologram_1791693076088.jpg',
    ],
    workDate: '2026-10-06',
    linkUrl: '#published-works',
    badge: 'ผลิตสื่อดิจิทัล',
    mediaType: 'video',
  },
];

export const BUREAU_GROUP_IDS: BureauGroupId[] = BUREAU_GROUPS.map((g) => g.id);
