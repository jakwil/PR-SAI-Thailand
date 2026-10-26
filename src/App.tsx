import React, { useState, useEffect } from 'react';
import { ThreeCanvas } from './components/ThreeCanvas';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { BuildingIncidentSection } from './components/BuildingIncidentSection';
import { PublishedWorksSection } from './components/PublishedWorksSection';
import { PublicInterestSection } from './components/PublicInterestSection';
import { AIChatbotWidget } from './components/AIChatbotWidget';
import { AdminPanel } from './components/AdminPanel';
import { Footer } from './components/Footer';
import { ExecutiveDashboardModal } from './components/ExecutiveDashboardModal';
import {
  subscribeToAppData,
  seedFirestoreIfEmpty,
  syncAllDataToFirestore,
  logVisitorAction,
  defaultMusicSettings,
  defaultChatbotSettings,
  defaultNewsSubscribers,
  defaultNewsBroadcasts,
  defaultMarqueeTicker
} from './firebase';
import { AppData } from './types';
import { ShieldCheck } from 'lucide-react';
import { recordVisitorVisit } from './utils/analytics';

// Default initial state
const initialData: AppData = {
  musicSettings: defaultMusicSettings,
  chatbotSettings: defaultChatbotSettings,
  newsSubscribers: defaultNewsSubscribers,
  newsBroadcasts: defaultNewsBroadcasts,
  marqueeTicker: defaultMarqueeTicker,
  heroStories: [
    {
      id: 'story-photo-1',
      title: 'ข่าวภาพนิ่ง: คณะผู้บริหารและผู้ตรวจเงินแผ่นดินลงพื้นที่ตรวจสอบงานโครงสร้างและข้อเท็จจริง',
      subtitle: 'ภาพชุดการประชุมแถลงข่าวและตรวจสอบแบบแปลนวิศวกรรมร่วมกับ วสท. และกรมโยธาธิการฯ เพื่อความปลอดภัยสูงสุดของบุคลากรและประชาชน',
      category: 'ข่าวภาพนิ่ง / ภาพกิจกรรม',
      imageUrl: '/src/assets/images/sai_press_photo_1791791796122.jpg',
      linkUrl: '#incident-timeline',
      date: '12 ตุลาคม 2569',
      badge: '📷 ข่าวภาพนิ่ง',
      mediaType: 'photo',
      order: 1
    },
    {
      id: 'story-info-1',
      title: 'Infographic: สรุปผลสัมฤทธิ์การตรวจเงินแผ่นดิน คืนเงินหลวงกลับสู่ชาติกว่า 1.8 หมื่นล้านบาท',
      subtitle: 'เปิด 4 ยุทธศาสตร์การตรวจสอบเชิงรุก สถิติการตรวจพบข้อบกพร่อง และดัชนีความโปร่งใสทางการเงินการคลังภาครัฐ 98%',
      category: 'อินโฟกราฟิกสรุปสาระสำคัญ',
      imageUrl: '/src/assets/images/sai_infographic_stats_1791791809566.jpg',
      linkUrl: '#published-works',
      date: '11 ตุลาคม 2569',
      badge: '📊 Infographic',
      mediaType: 'infographic',
      order: 2
    },
    {
      id: 'story-video-1',
      title: 'ข่าววิดีโอ: เปิดห้องส่งสตูดิโอ สตง. ถ่ายทอดสดเจาะลึกงบประมาณและข้อมูลการตรวจสอบแบบเรียลไทม์',
      subtitle: 'รายการพิเศษ PR - SAI Thailand Global Broadcast อัปเดตภารกิจป้องปรามการทุจริตและการใช้จ่ายงบประมาณแผ่นดิน',
      category: 'รายการโทรทัศน์ / วิดีโอ',
      imageUrl: '/src/assets/images/sai_video_broadcast_1791791820641.jpg',
      linkUrl: '#viral-clips',
      date: '10 ตุลาคม 2569',
      badge: '🎬 ข่าววิดีโอ',
      mediaType: 'video',
      order: 3
    },
    {
      id: 'story-1',
      title: 'นวัตกรรม Digital Audit & MRV พลิกโฉมความโปร่งใสภาครัฐด้วย Data Analytics',
      subtitle: 'ระบบเชื่อมโยงข้อมูล Data Analytics และมาตรวัดอัจฉริยะ ติดตามการใช้จ่ายงบประมาณแผ่นดินแบบเรียลไทม์',
      category: 'นวัตกรรมดิจิทัล สตง.',
      imageUrl: '/src/assets/images/sai_digital_network_1791693065277.jpg',
      linkUrl: 'https://pr-request-system.vercel.app',
      date: '10 ตุลาคม 2569',
      badge: '📊 Digital Map',
      mediaType: 'infographic',
      order: 4
    },
    {
      id: 'story-4',
      title: 'ศูนย์บัญชาการตรวจเงินแผ่นดิน: เทคโนโลยี AI สกัดกั้นการทุจริตเชิงรุก',
      subtitle: 'ทีมผู้ตรวจการมืออาชีพใช้ AI ตรวจสอบเส้นทางงบประมาณและข้อมูลการจัดซื้อจัดจ้างภาครัฐ',
      category: 'ภารกิจตรวจสอบ',
      imageUrl: '/src/assets/images/sai_audit_hero_1791689796943.jpg',
      linkUrl: 'https://youtube.com',
      date: '8 ตุลาคม 2569',
      badge: '🎬 สารคดีวิดีโอ',
      mediaType: 'video',
      order: 5
    },
    {
      id: 'story-5',
      title: 'แคมเปญพลังพลเมือง: ร่วมตรวจสอบงบประมาณท้องถิ่นทั่วไทย',
      subtitle: 'เปิดช่องทางประชาชนมีส่วนร่วมแจ้งเบาะแสผ่านสายด่วน 1730 และสื่อประชาสัมพันธ์สร้างสรรค์',
      category: 'การมีส่วนร่วมประชาชน',
      imageUrl: '/src/assets/images/sai_public_campaign_1791689820118.jpg',
      linkUrl: 'https://pr-request-system.vercel.app',
      date: '6 ตุลาคม 2569',
      badge: '📷 ภาพกิจกรรม',
      mediaType: 'photo',
      order: 6
    },
    {
      id: 'story-2',
      title: 'เชื่อมโยงเครือข่ายความโปร่งใสไทยสู่มาตรฐานสากล (Global Data Node)',
      subtitle: 'การประสานพลังองค์กรตรวจเงินแผ่นดินระดับโลก ขับเคลื่อนธรรมาภิบาลและความรับผิดชอบทางการเงิน',
      category: 'ความร่วมมือสากล',
      imageUrl: '/src/assets/images/sai_earth_hologram_1791693076088.jpg',
      linkUrl: 'https://pr-request-system.vercel.app',
      date: '4 ตุลาคม 2569',
      badge: 'ยุทธศาสตร์ สตง.',
      mediaType: 'infographic',
      order: 7
    },
    {
      id: 'story-3',
      title: 'รายงานสถานการณ์และมาตรการวิศวกรรม: อาคาร สตง. ทรุดตัว ล่าสุด',
      subtitle: 'วสท. และกรมโยธาธิการฯ ยืนยันโครงสร้างแกนกลางมั่นคง แผนความปลอดภัยฉุกเฉินและ Digital Audit 100%',
      category: 'แถลงการณ์สำคัญ',
      imageUrl: '/src/assets/images/sai_building_inspection_1791689807795.jpg',
      linkUrl: '#incident-timeline',
      date: '2 ตุลาคม 2569',
      badge: '📷 ข้อเท็จจริง',
      mediaType: 'photo',
      order: 8
    }
  ],
  knowledgeBase: [
    {
      id: 'kb-1',
      title: 'ภารกิจและอำนาจหน้าที่ของ สตง. (SAI Thailand)',
      category: 'องค์กรและภารกิจ',
      content: 'สำนักงานการตรวจเงินแผ่นดิน (สตง.) เป็นองค์กรอิสระตามรัฐธรรมนูญ ทำหน้าที่ตรวจสอบการใช้จ่ายเงินแผ่นดินของหน่วยงานของรัฐทุกแห่ง เพื่อให้การใช้จ่ายเงินงบประมาณเป็นไปอย่างคุ้มค่า โปร่งใส เกิดประโยชน์สูงสุดแก่ประเทศชาติและประชาชน ตามหลักธรรมาภิบาลและความรับผิดชอบต่อสาธารณะ',
      sourceType: 'raw_text',
      dateAdded: '2026-10-01'
    },
    {
      id: 'kb-2',
      title: 'บทบาทของสำนักประชาสัมพันธ์และสื่อสารองค์กร',
      category: 'งานประชาสัมพันธ์',
      content: 'สำนักประชาสัมพันธ์และสื่อสารองค์กร (PR - SAI Thailand) รับผิดชอบการเผยแพร่ข้อมูลข่าวสาร ผลการตรวจสอบ นโยบาย กิจกรรม และสื่อสารสร้างความรู้ความเข้าใจเกี่ยวกับการตรวจเงินแผ่นดินแก่ประชาชน สื่อมวลชน และหน่วยรับตรวจ พร้อมทั้งเปิดช่องทางบริการขอรับการสนับสนุนสื่อประชาสัมพันธ์ผ่านระบบ https://pr-request-system.vercel.app',
      sourceType: 'url',
      sourceUrl: 'https://pr-request-system.vercel.app',
      dateAdded: '2026-10-02'
    },
    {
      id: 'kb-3',
      title: 'ข้อเท็จจริงและมาตรการ: เหตุการณ์อาคาร สตง. ทรุดตัว',
      category: 'สถานการณ์อาคาร สตง.',
      content: 'จากเหตุการณ์ตรวจพบการทรุดตัวของโครงสร้างฐานรากบางจุดของอาคารสำนักงาน สตง. ทางผู้บริหารได้สั่งการอพยพตามแผนความปลอดภัยฉุกเฉินทันที พร้อมแต่งตั้งคณะทำงานร่วมกับวิศวกรรมสถานแห่งประเทศไทย (วสท.) และกรมโยธาธิการและผังเมืองเข้าตรวจสอบเชิงวิศวกรรม ผลการตรวจสอบเบื้องต้นพบว่าเป็นปัญหาการทรุดตัวเฉพาะส่วนฐานรากย่อย ไม่กระทบเสาหลักของอาคารหลัก แต่เพื่อความปลอดภัยสูงสุด ได้สั่งปิดพื้นที่ควบคุมและเปิดระบบศูนย์ปฏิบัติการชั่วคราวและการทำงานแบบ Hybrid/Digital Audit โดยการให้บริการประชาชนและภารกิจตรวจสอบเงินแผ่นดินทั่วประเทศยังดำเนินไปอย่างต่อเนื่อง 100%',
      sourceType: 'pdf_summary',
      dateAdded: '2026-10-05'
    },
    {
      id: 'kb-4',
      title: 'ช่องทางติดต่อและร้องเรียนเบาะแสการใช้เงินแผ่นดิน',
      category: 'บริการประชาชน',
      content: 'ประชาชนสามารถแจ้งเบาะแสการใช้จ่ายเงินแผ่นดินที่น่าสงสัย หรือติดตามผลการตรวจสอบได้ผ่านสายด่วน สตง. 1730 หรือช่องทางออนไลน์ เว็บไซต์หลัก และสำนักประชาสัมพันธ์และสื่อสารองค์กร',
      sourceType: 'raw_text',
      dateAdded: '2026-10-06'
    }
  ],
  publishedWorks: [
    {
      id: 'work-v-reel1',
      title: '1 นาทีเข้าใจ! เงินภาษีของเรา สตง. ตรวจสอบอย่างไร? (Shorts)',
      category: 'วิดีโอ & สารคดี',
      description: 'คลิปสั้นแนวตั้งสรุปเข้าใจง่ายใน 1 นาที เจาะลึกกระบวนการตรวจสอบเงินแผ่นดินตั้งแต่ต้นน้ำถึงปลายน้ำ พร้อมตัวอย่างการคืนเงินหลวงกลับสู่แผ่นดิน',
      linkUrl: 'https://youtube.com',
      imageUrl: '/src/assets/images/sai_video_broadcast_1791791820641.jpg',
      publishDate: '2026-10-13',
      views: '320,400',
      badge: '📱 9:16 Short',
      mediaType: 'video',
      resolution: '9:16',
      duration: '00:58',
      creator: 'PR - SAI Thailand'
    },
    {
      id: 'work-video-1',
      title: 'วิดีโอข่าว: สตูดิโอสื่อสารองค์กร สตง. รายงานความคืบหน้าการทำงานเชิงรุกผ่านระบบคลาวด์',
      category: 'วิดีโอ & สารคดี',
      description: 'คลิปวิดีโอรายงานข่าวพิเศษจากศูนย์บัญชาการประชาสัมพันธ์และการสื่อสาร แสดงระบบ Digital Audit ที่ดำเนินงานต่อเนื่อง 100% แม้ในสถานการณ์ฉุกเฉิน',
      linkUrl: 'https://youtube.com',
      imageUrl: '/src/assets/images/sai_video_broadcast_1791791820641.jpg',
      publishDate: '2026-10-10',
      views: '185,300',
      badge: '🎬 16:9 HD',
      mediaType: 'video',
      resolution: '16:9',
      duration: '02:35',
      creator: 'ศูนย์สื่อสารองค์กร สตง.'
    },
    {
      id: 'work-cinema-1',
      title: 'สารคดีภาพยนตร์: มหากาพย์พิทักษ์เงินแผ่นดิน ยุทธศาสตร์การตรวจสอบแห่งทศวรรษ',
      category: 'วิดีโอ & สารคดี',
      description: 'สารคดีฉบับภาพยนตร์สัดส่วนจอกว้าง 21:9 ถ่ายทอดประวัติศาสตร์และการปฏิรูปกระบวนการตรวจสอบงบประมาณแผ่นดินไทยสู่ยุคปัญญาประดิษฐ์',
      linkUrl: 'https://youtube.com',
      imageUrl: '/src/assets/images/sai_audit_hero_1791689796943.jpg',
      publishDate: '2026-10-08',
      views: '241,800',
      badge: '🎥 21:9 Ultrawide',
      mediaType: 'video',
      resolution: '21:9',
      duration: '04:12',
      creator: 'ฝ่ายผลิตสื่อสารคดี สตง.'
    },
    {
      id: 'work-info-1',
      title: 'อินโฟกราฟิก: สรุปผลการตรวจสอบงบประมาณแผ่นดินและการรักษาผลประโยชน์ชาติ ปี 2568-2569',
      category: 'อินโฟกราฟิก',
      description: 'แผนภูมิสรุปตัวเลขสถิติ ผลสัมฤทธิ์การตรวจสอบเชิงป้องกัน ข้อสังเกตสำคัญในโครงการจัดซื้อจัดจ้าง และการคืนเงินหลวงกลับสู่แผ่นดิน เข้าใจง่ายในหน้าเดียว',
      linkUrl: '/src/assets/images/sai_infographic_stats_1791791809566.jpg',
      imageUrl: '/src/assets/images/sai_infographic_stats_1791791809566.jpg',
      publishDate: '2026-10-11',
      views: '218,900',
      badge: '📊 1:1 Square',
      mediaType: 'infographic',
      resolution: '1:1',
      duration: '10s Preview',
      creator: 'สำนักพัฒนานวัตกรรม สตง.'
    },
    {
      id: 'work-photo-1',
      title: 'ภาพชุดข่าวพิเศษ: คณะผู้ตรวจการ สตง. ลงพื้นที่ตรวจสอบโครงสร้างอาคารและรับฟังสรุปวิศวกรรม',
      category: 'ข่าวภาพนิ่ง',
      description: 'ประมวลภาพการลงพื้นที่ตรวจสอบเชิงลึกของทีมวิศวกรผู้เชี่ยวชาญ วสท. ร่วมกับผู้ว่าการตรวจเงินแผ่นดิน ในการตรวจวัดความมั่นคงของโครงสร้างอาคาร สตง.',
      linkUrl: '/src/assets/images/sai_press_photo_1791791796122.jpg',
      imageUrl: '/src/assets/images/sai_press_photo_1791791796122.jpg',
      publishDate: '2026-10-12',
      views: '142,500',
      badge: '📷 4:3 Studio',
      mediaType: 'photo',
      resolution: '4:3',
      duration: '10s Preview',
      creator: 'ช่างภาพประจำศูนย์สื่อสาร'
    },
    {
      id: 'work-v-reel2',
      title: 'เทคนิคดูป้ายโครงการก่อสร้างรัฐ รู้ทันทุจริตใน 3 ขั้นตอน (Reel)',
      category: 'วิดีโอ & สารคดี',
      description: 'วิดีโอสั้นแนวตั้งสอนวิธีอ่านป้ายโครงการก่อสร้างภาครัฐ สัญญา ราคากลาง ผู้รับเหมา และช่องทางร้องเรียนตรงถึง สตง. ผ่าน QR Code',
      linkUrl: 'https://youtube.com',
      imageUrl: '/src/assets/images/sai_public_campaign_1791689820118.jpg',
      publishDate: '2026-10-09',
      views: '410,200',
      badge: '📱 9:16 Reel',
      mediaType: 'video',
      resolution: '9:16',
      duration: '01:15',
      creator: 'PR - SAI Thailand Network'
    },
    {
      id: 'work-video-2',
      title: 'สารคดีเจาะลึก: เงินแผ่นดินทุกบาท เพื่อประโยชน์ชาติและประชาชน',
      category: 'วิดีโอ & สารคดี',
      description: 'สารคดีชุดพิเศษพาชมเบื้องหลังการทำงานของผู้ว่าการตรวจเงินแผ่นดินและทีมผู้ตรวจการมืออาชีพในการลงพื้นที่ทั่วประเทศ',
      linkUrl: 'https://youtube.com',
      imageUrl: '/src/assets/images/sai_digital_innovation_1791689830942.jpg',
      publishDate: '2026-10-05',
      views: '128,400',
      badge: '🎬 16:9 HD',
      mediaType: 'video',
      resolution: '16:9',
      duration: '03:40',
      creator: 'สำนักประชาสัมพันธ์ สตง.'
    },
    {
      id: 'work-cinema-2',
      title: 'AI Data Analytics: ยกระดับการตรวจสอบเส้นทางงบประมาณแบบเรียลไทม์',
      category: 'วิดีโอ & สารคดี',
      description: 'นวัตกรรมสัดส่วน 21:9 กว้างพิเศษ สาธิตการทำงานของซูเปอร์คอมพิวเตอร์และอัลกอริทึม AI ที่คอยตรวจจับเส้นทางการเงินที่ผิดปกติในโครงการรัฐทั่วไทย',
      linkUrl: 'https://youtube.com',
      imageUrl: '/src/assets/images/sai_digital_network_1791693065277.jpg',
      publishDate: '2026-10-06',
      views: '194,500',
      badge: '🎥 21:9 Ultrawide',
      mediaType: 'video',
      resolution: '21:9',
      duration: '02:50',
      creator: 'ศูนย์นวัตกรรมดิจิทัล สตง.'
    },
    {
      id: 'work-info-2',
      title: 'อินโฟกราฟิก: 5 กฎเหล็กโครงการจัดซื้อจัดจ้างภาครัฐที่ประชาชนและหน่วยรับตรวจควรรู้',
      category: 'อินโฟกราฟิก',
      description: 'คู่มือภาพอินโฟกราฟิกแสดงขั้นตอนการตรวจสอบความถูกต้องของสัญญา ความโปร่งใสของราคากลาง และเกณฑ์การประเมินความคุ้มค่าตามระเบียบ สตง.',
      linkUrl: 'https://pr-request-system.vercel.app',
      imageUrl: '/src/assets/images/sai_infographic_stats_1791791809566.jpg',
      publishDate: '2026-10-09',
      views: '96,400',
      badge: '📊 4:3 Classic',
      mediaType: 'infographic',
      resolution: '4:3',
      duration: '10s Preview',
      creator: 'กลุ่มงานวิชาการ สตง.'
    },
    {
      id: 'work-photo-2',
      title: 'ข่าวภาพนิ่ง: ภาพชุดกิจกรรมแคมเปญพลังพลเมือง เฝ้าระวังงบประมาณท้องถิ่นทั่วไทย',
      category: 'ข่าวภาพนิ่ง',
      description: 'ภาพบรรยากาศการจัดอบรมและสร้างความร่วมมือระหว่าง สตง. มหาวิทยาลัย และองค์กรภาคประชาสังคมในการมีส่วนร่วมติดตามงบประมาณแผ่นดิน',
      linkUrl: 'https://pr-request-system.vercel.app',
      imageUrl: '/src/assets/images/sai_public_campaign_1791689820118.jpg',
      publishDate: '2026-10-07',
      views: '73,200',
      badge: '📷 1:1 Square',
      mediaType: 'photo',
      resolution: '1:1',
      duration: '10s Preview',
      creator: 'เครือข่ายสื่อมวลชนภาคพลเมือง'
    },
    {
      id: 'work-photo-3',
      title: 'ข่าวภาพนิ่ง: วสท. ติดตั้งเครื่องตรวจวัดระดับมิลลิเมตร 3D Sensor ตรวจสอบอาคาร สตง.',
      category: 'ข่าวภาพนิ่ง',
      description: 'ภาพถ่ายเจ้าหน้าที่วิศวกรขณะติดตั้งเซนเซอร์วัดการเอียงและการเคลื่อนตัวของโครงสร้างหลัก พร้อมตรวจสอบค่าแบบเรียลไทม์ 24 ชม.',
      linkUrl: 'https://pr-request-system.vercel.app',
      imageUrl: '/src/assets/images/sai_building_inspection_1791689807795.jpg',
      publishDate: '2026-10-04',
      views: '112,800',
      badge: '📷 16:9 HD',
      mediaType: 'photo',
      resolution: '16:9',
      duration: '10s Preview',
      creator: 'ฝ่ายอาคารสถานที่ สตง.'
    },
    {
      id: 'work-info-3',
      title: 'อินโฟกราฟิก: แผนที่เชื่อมโยงเครือข่ายความโปร่งใสสู่มาตรฐานสากล (Global Data Node)',
      category: 'อินโฟกราฟิก',
      description: 'แผนผังแสดงเครือข่ายความร่วมมือของ สตง. ไทยกับองค์กรตรวจเงินแผ่นดินสากล ในการแลกเปลี่ยนข้อมูลป้องกันการฟอกเงินและการตรวจสอบข้ามพรมแดน',
      linkUrl: 'https://pr-request-system.vercel.app',
      imageUrl: '/src/assets/images/sai_earth_hologram_1791693076088.jpg',
      publishDate: '2026-10-02',
      views: '88,600',
      badge: '📊 21:9 Ultrawide',
      mediaType: 'infographic',
      resolution: '21:9',
      duration: '10s Preview',
      creator: 'สำนักการต่างประเทศ สตง.'
    },
    {
      id: 'work-v-reel3',
      title: 'สายด่วน สตง. 1730 ปรึกษาและแจ้งเบาะแสเงินแผ่นดิน 24 ชม. (Shorts)',
      category: 'วิดีโอ & สารคดี',
      description: 'คลิปสั้นแนวตั้งแนะนำช่องทางด่วนและวิธีการแจ้งเบาะแสการใช้จ่ายงบประมาณที่ผิดปกติ พร้อมระบบคุ้มครองพยานและความลับข้อมูล 100%',
      linkUrl: 'https://youtube.com',
      imageUrl: '/src/assets/images/sai_video_broadcast_1791791820641.jpg',
      publishDate: '2026-10-14',
      views: '289,300',
      badge: '📱 9:16 Short',
      mediaType: 'video',
      resolution: '9:16',
      duration: '00:52',
      creator: 'สายด่วน สตง. 1730'
    },
    {
      id: 'work-v-reel4',
      title: 'เบื้องหลังทีมวิศวกร วสท. ติดตั้ง 3D Laser Sensor ตรวจอาคาร สตง. (Reels)',
      category: 'วิดีโอ & สารคดี',
      description: 'คลิปสั้นแนวตั้งพาทัวร์จุดติดตั้งเซนเซอร์โครงสร้างความละเอียดระดับมิลลิเมตร แสดงผลสดบนหน้าจอ EOC Command Center แบบเรียลไทม์',
      linkUrl: 'https://youtube.com',
      imageUrl: '/src/assets/images/sai_building_inspection_1791689807795.jpg',
      publishDate: '2026-10-13',
      views: '356,800',
      badge: '📱 9:16 Reel',
      mediaType: 'video',
      resolution: '9:16',
      duration: '01:08',
      creator: 'ศูนย์ความปลอดภัยทางวิศวกรรม สตง.'
    },
    {
      id: 'work-v-reel5',
      title: 'AI Data Audit: ตรวจจับเส้นทางงบประมาณ 1 ล้านล้านบาท ใน 3 วินาที (Shorts)',
      category: 'วิดีโอ & สารคดี',
      description: 'คลิปสั้นแนวตั้งไฮไลต์ระบบ Supercomputer และ AI ที่ช่วยให้การตรวจสอบเงินแผ่นดินไทยก้าวสู่มาตรฐานผู้นำภูมิภาคอาเซียน',
      linkUrl: 'https://youtube.com',
      imageUrl: '/src/assets/images/sai_digital_network_1791693065277.jpg',
      publishDate: '2026-10-11',
      views: '420,100',
      badge: '📱 9:16 Short',
      mediaType: 'video',
      resolution: '9:16',
      duration: '00:45',
      creator: 'ฝ่ายพัฒนาระบบเทคโนโลยี สตง.'
    },
    {
      id: 'work-v-reel6',
      title: 'คุ้มครองพยาน 100% แจ้งทุจริตผ่านแอปพลิเคชัน สตง. ปลอดภัยไร้กังวล (Shorts)',
      category: 'วิดีโอ & สารคดี',
      description: 'คลิปสั้นแนวตั้งเผยขั้นตอนการเข้ารหัสข้อมูลลับขั้นสูงสุดสำหรับประชาชนผู้แจ้งเบาะแสการทุจริตเงินแผ่นดิน',
      linkUrl: 'https://youtube.com',
      imageUrl: '/src/assets/images/sai_audit_hero_1791689796943.jpg',
      publishDate: '2026-10-10',
      views: '335,000',
      badge: '📱 9:16 Short',
      mediaType: 'video',
      resolution: '9:16',
      duration: '00:50',
      creator: 'กลุ่มคุ้มครองพยาน สตง.'
    },
    {
      id: 'work-v-reel7',
      title: '3 ขั้นตอนตรวจเช็กงบประมาณ อบต./เทศบาล ใกล้บ้านคุณ (Reels)',
      category: 'วิดีโอ & สารคดี',
      description: 'วิธีตรวจสอบการใช้จ่ายงบประมาณขององค์กรปกครองส่วนท้องถิ่นง่ายๆ ผ่านระบบ Open Data สตง. เพื่อความโปร่งใสในชุมชน',
      linkUrl: 'https://youtube.com',
      imageUrl: '/src/assets/images/sai_public_campaign_1791689820118.jpg',
      publishDate: '2026-10-09',
      views: '298,400',
      badge: '📱 9:16 Reel',
      mediaType: 'video',
      resolution: '9:16',
      duration: '01:02',
      creator: 'สำนักตรวจเงินแผ่นดินภูมิภาค'
    },
    {
      id: 'work-v-reel8',
      title: 'ภารกิจผู้ตรวจการ สตง. ลุยพื้นที่ตรวจความช่วยเหลือเยียวยาน้ำท่วม (Shorts)',
      category: 'วิดีโอ & สารคดี',
      description: 'ติดตามเจ้าหน้าที่ สตง. ลงพื้นที่ตรวจสอบการแจกจ่ายเงินช่วยเหลือภัยพิบัติ เพื่อให้ถึงมือประชาชนผู้เดือดร้อนอย่างรวดเร็วและถูกต้อง',
      linkUrl: 'https://youtube.com',
      imageUrl: '/src/assets/images/sai_press_photo_1791791796122.jpg',
      publishDate: '2026-10-08',
      views: '412,600',
      badge: '📱 9:16 Short',
      mediaType: 'video',
      resolution: '9:16',
      duration: '00:55',
      creator: 'ศูนย์สื่อสารเฉพาะกิจ สตง.'
    },
    {
      id: 'work-v-reel9',
      title: 'ทำไมการจัดซื้อจัดจ้างภาครัฐต้องโปร่งใส? เข้าใจใน 45 วิ (Reels)',
      category: 'วิดีโอ & สารคดี',
      description: 'อธิบายหลักการ e-Bidding และการเปิดเผยราคากลาง เพื่อป้องกันการฮั้วประมูลและรักษาผลประโยชน์สูงสุดของประเทศ',
      linkUrl: 'https://youtube.com',
      imageUrl: '/src/assets/images/sai_infographic_stats_1791791809566.jpg',
      publishDate: '2026-10-07',
      views: '189,500',
      badge: '📱 9:16 Reel',
      mediaType: 'video',
      resolution: '9:16',
      duration: '00:45',
      creator: 'สำนักประชาสัมพันธ์และสื่อสารองค์กร'
    },
    {
      id: 'work-v-reel10',
      title: 'สตง. ผนึกกำลัง ป.ป.ช. และ ดีเอสไอ ปราบปรามเงินทอนโครงการรัฐ (Shorts)',
      category: 'วิดีโอ & สารคดี',
      description: 'แถลงร่วมมือระหว่างหน่วยงานตรวจสอบระดับชาติ บูรณาการฐานข้อมูลดิจิทัลตรวจจับเส้นทางการเงินที่ผิดปกติทันที',
      linkUrl: 'https://youtube.com',
      imageUrl: '/src/assets/images/sai_video_broadcast_1791791820641.jpg',
      publishDate: '2026-10-06',
      views: '520,300',
      badge: '📱 9:16 Short',
      mediaType: 'video',
      resolution: '9:16',
      duration: '01:10',
      creator: 'คณะทำงานปราบปรามการทุจริต สตง.'
    },
    {
      id: 'work-v-reel11',
      title: 'Smart Audit: นวัตกรรมโดรนสำรวจ 3D ตรวจสอบหน้างานจริง (Reels)',
      category: 'วิดีโอ & สารคดี',
      description: 'ภาพการใช้โดรนบินสำรวจโครงการก่อสร้างสะพานและถนนหลวง เปรียบเทียบความคืบหน้าจริงกับแผนงานในสัญญาอัตโนมัติ',
      linkUrl: 'https://youtube.com',
      imageUrl: '/src/assets/images/sai_digital_innovation_1791689830942.jpg',
      publishDate: '2026-10-05',
      views: '264,700',
      badge: '📱 9:16 Reel',
      mediaType: 'video',
      resolution: '9:16',
      duration: '00:58',
      creator: 'ศูนย์เทคโนโลยีสารสนเทศ สตง.'
    },
    {
      id: 'work-v-reel12',
      title: 'พลังพลเมืองตื่นรู้: ร่วมเป็นหูเป็นตา ปกป้องภาษีของพวกเรา (Shorts)',
      category: 'วิดีโอ & สารคดี',
      description: 'แคมเปญรณรงค์ระดับชาติส่งเสริมเยาวชนและประชาชนให้เห็นคุณค่าของเงินภาษี และร่วมตรวจสอบความคุ้มค่าของการใช้จ่ายภาครัฐ',
      linkUrl: 'https://youtube.com',
      imageUrl: '/src/assets/images/sai_public_campaign_1791689820118.jpg',
      publishDate: '2026-10-03',
      views: '378,900',
      badge: '📱 9:16 Short',
      mediaType: 'video',
      resolution: '9:16',
      duration: '01:05',
      creator: 'สำนักประชาสัมพันธ์และสื่อสารองค์กร'
    }
  ],
  viralClips: [
    {
      id: 'clip-v1',
      title: 'แถลงข่าวอย่างเป็นทางการ: ข้อเท็จจริงและมาตรการวิศวกรรมอาคาร สตง. (Live Studio)',
      creator: 'ศูนย์สื่อสารภาวะวิกฤต สตง. (Crisis PR Center)',
      views: '620K',
      duration: '02:35',
      thumbnail: '/src/assets/images/sai_video_broadcast_1791791820641.jpg',
      linkUrl: 'https://youtube.com',
      highlight: 'ถ่ายทอดสดจากห้องส่งสตูดิโอ สตง. ชี้แจงทุกประเด็นข้อสงสัย',
      mediaType: 'video'
    },
    {
      id: 'clip-v2',
      title: '1 นาทีเข้าใจ! เงินภาษีของเรา สตง. ตรวจสอบอย่างไร? (Motion Infographic)',
      creator: 'PR - SAI Thailand Media Team',
      views: '580K',
      duration: '01:14',
      thumbnail: '/src/assets/images/sai_infographic_stats_1791791809566.jpg',
      linkUrl: 'https://youtube.com',
      highlight: 'สรุปแบบอินโฟกราฟิกแอนิเมชันเข้าใจง่าย ยอดวิวทะลุ 5 แสนครั้งบน TikTok',
      mediaType: 'motion_graphic'
    },
    {
      id: 'clip-v3',
      title: 'เบื้องหลังทีมผู้ตรวจการ สตง. ลงพื้นที่ตรวจสอบงานวิศวกรรมจริง',
      creator: 'ทีมข่าวประชาสัมพันธ์ สตง.',
      views: '445K',
      duration: '01:50',
      thumbnail: '/src/assets/images/sai_press_photo_1791791796122.jpg',
      linkUrl: 'https://youtube.com',
      highlight: 'ภาพชุดข่าวจริงและฟุตเทจการตรวจรับงานสร้างสะพานและถนนสายหลัก',
      mediaType: 'video'
    },
    {
      id: 'clip-1',
      title: 'เจาะลึกมาตรการความปลอดภัย อาคาร สตง. ทรุดตัว ล่าสุด!',
      creator: 'ศูนย์สื่อสารภาวะวิกฤต สตง.',
      views: '389K',
      duration: '02:05',
      thumbnail: '/src/assets/images/sai_building_inspection_1791689807795.jpg',
      linkUrl: 'https://youtube.com',
      highlight: 'ชี้แจงข้อเท็จจริงเพื่อความโปร่งใสแก่ประชาชน',
      mediaType: 'video'
    },
    {
      id: 'clip-2',
      title: 'เทคนิคดูป้ายโครงการก่อสร้างรัฐ รู้ทันทุจริตใน 3 ขั้นตอน',
      creator: 'PR - SAI Thailand Network',
      views: '410K',
      duration: '01:45',
      thumbnail: '/src/assets/images/sai_public_campaign_1791689820118.jpg',
      linkUrl: 'https://youtube.com',
      highlight: 'แชร์เป็นไวรัลในกลุ่มชุมชนและเครือข่ายธรรมาภิบาล',
      mediaType: 'short'
    },
    {
      id: 'clip-3',
      title: 'AI ตรวจสอบเส้นทางงบประมาณ สกัดกั้นการทุจริตแบบเรียลไทม์',
      creator: 'ฝ่ายพัฒนานวัตกรรมตรวจสอบดิจิทัล สตง.',
      views: '320K',
      duration: '02:18',
      thumbnail: '/src/assets/images/sai_audit_hero_1791689796943.jpg',
      linkUrl: 'https://youtube.com',
      highlight: 'ระบบ AI Data Analytics วิเคราะห์ความเสี่ยงงบประมาณแผ่นดิน',
      mediaType: 'video'
    }
  ],
  incidentTimeline: [
    {
      id: 'tl-1',
      date: '28 กันยายน 2569',
      time: '09:30 น.',
      phase: 'ตรวจพบความผิดปกติ',
      title: 'สัญญาณการทรุดตัวและสั่งการอพยพทันที',
      shortTitle: '2024 สัญญาณทรุดตัว',
      description: 'ทีมวิศวกรตรวจพบรอยแยกและการเคลื่อนตัวของแผ่นพื้นชั้นใต้ดิน ผู้บริหารสั่งอพยพเจ้าหน้าที่ตามแผนฉุกเฉินระดับ 1 ปลอดภัยครบ 100%',
      fullStatement: 'รายงานสรุปสถานการณ์ฉุกเฉิน ณ อาคารสำนักงานการตรวจเงินแผ่นดิน:\n\n1. ระบบ Sensor ตรวจจับการทรุดตัวของแผ่นพื้นชั้นใต้ดินด้านทิศตะวันออก แจ้งเตือนเมื่อ 09:30 น.\n2. ศูนย์บัญชาการเหตุการณ์สั่งอพยพเจ้าหน้าที่ทั้งหมดตามแผนเผชิญเหตุระดับ 1 สำเร็จภายใน 12 นาที ปลอดภัยครบ 100% ไม่มีผู้ได้รับบาดเจ็บ\n3. ระบบตัดกระแสไฟฟ้าและจ่ายก๊าซอัตโนมัติทำงานสมบูรณ์\n4. ประสานวิศวกรรมสถานแห่งประเทศไทย (วสท.) และกรมโยธาธิการฯ เข้าควบคุมพื้นที่ทันที',
      status: 'ตรวจสอบแล้ว',
      imageUrl: '/src/assets/images/sai_building_inspection_1791689807795.jpg',
      technicalDetails: 'ตรวจพบการทรุดตัวส่วนฐานรากย่อยประมาณ 3.2 ซม. โครงสร้างเสาหลักไม่พบการแตกร้าวฉับพลัน',
      mediaType: 'photo',
      referenceTitle: 'แถลงการณ์ สตง. ฉบับที่ 1/2569 เรื่อง มาตรการความปลอดภัยกรณีอาคารทรุดตัว',
      referenceUrl: 'https://pr-request-system.vercel.app',
      colorAccent: 'orange',
      icon: 'lightbulb'
    },
    {
      id: 'tl-2',
      date: '1 ตุลาคม 2569',
      time: '14:00 น.',
      phase: 'วิศวกรรม วสท.',
      title: 'วสท. และกรมโยธาธิการฯ เข้าตรวจวัด 3D Laser Scanning',
      shortTitle: '2025 วสท. ตรวจวัด 3D',
      description: 'วิศวกรผู้เชี่ยวชาญ วสท. ติดตั้ง Tiltmeter 24 จุด และทำ 3D Laser Scan ยืนยันโครงสร้างแกนกลางหลักมั่นคงแข็งแรง',
      fullStatement: 'ผลการตรวจวัดทางวิศวกรรมเชิงลึกโดยคณะผู้เชี่ยวชาญ วสท. ร่วมกับกรมโยธาธิการและผังเมือง:\n\n1. การติดตั้ง Tiltmeter และเซนเซอร์วัดความเอียง 24 จุดรอบอาคาร บันทึกข้อมูลเรียลไทม์ 24 ชม.\n2. ผลการทำ 3D Laser Scanning เปรียบเทียบกับแบบพิมพ์เขียวเดิม ยืนยันว่าโครงสร้างแกนกลางหลัก (Core Structure) ไม่มีการเอียงตัวเกินค่ามาตรฐานความปลอดภัยวิศวกรรม\n3. การตรวจสอบเสาเข็มเจาะลึก 45 เมตร (Sonic Logging Test) ไม่พบการหักหรือการเคลื่อนตัวรุนแรงในระดับฐานรากลึก',
      status: 'วิเคราะห์ข้อมูล',
      imageUrl: '/src/assets/images/sai_audit_hero_1791689796943.jpg',
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      mediaType: 'video',
      technicalDetails: 'ติดตั้ง Laser Extensometer ตรวจวัดระดับมิลลิเมตร ส่งตรงสู่ห้องควบคุม EOC ทุก 1 นาที',
      referenceTitle: 'รายงานผลการประเมินเบื้องต้น วสท. เลขที่ วสท.04/2569',
      referenceUrl: 'https://pr-request-system.vercel.app',
      colorAccent: 'amber',
      icon: 'building'
    },
    {
      id: 'tl-3',
      date: '5 ตุลาคม 2569',
      time: '11:00 น.',
      phase: 'มาตรการ BCP',
      title: 'เปิดศูนย์ปฏิบัติการสำรอง & Digital Audit 100%',
      shortTitle: '2026 Digital Audit 100%',
      description: 'สตง. ดำเนินแผน BCP ย้ายการปฏิบัติการสู่ระบบคลาวด์ Digital Audit งานตรวจสอบบัญชีแผ่นดินทั่วประเทศดำเนินต่อเนื่อง 100%',
      fullStatement: 'การขับเคลื่อนภารกิจตรวจเงินแผ่นดินภายใต้แผนความต่อเนื่องทางธุรกิจ (Business Continuity Plan - BCP):\n\n1. ระบบการตรวจสอบงบประมาณแผ่นดินดำเนินงานบนโครงสร้างพื้นฐานคลาวด์ความมั่นคงปลอดภัยสูง (Government Secure Cloud)\n2. ผู้ตรวจเงินแผ่นดินทั่วประเทศเข้าถึงระบบ MRV และ e-Audit ได้อย่างต่อเนื่อง ไม่มีเอกสารหรือข้อมูลราชการสูญหาย\n3. จัดตั้งศูนย์บริการประชาชนชั่วคราวและเปิดสายด่วน 1730 ตลอด 24 ชั่วโมง',
      status: 'ดำเนินการแล้ว',
      imageUrl: '/src/assets/images/sai_digital_innovation_1791689830942.jpg',
      mediaType: 'photo',
      technicalDetails: 'ระบบสำรองข้อมูลแบบ Multi-Region Backup อัตราความพร้อมใช้งาน (Uptime) อยู่ที่ 99.98%',
      referenceTitle: 'คำสั่งสำนักงานการตรวจเงินแผ่นดิน เรื่อง แผนปฏิบัติการความต่อเนื่องทางธุรกิจ (BCP)',
      referenceUrl: 'https://pr-request-system.vercel.app',
      colorAccent: 'teal',
      icon: 'handshake'
    },
    {
      id: 'tl-4',
      date: '10 ตุลาคม 2569',
      time: '10:00 น.',
      phase: 'งานเสริมฐานราก',
      title: 'เริ่มงานฉีดซีเมนต์เกราท์และเสาเข็มไมโครไพล์',
      shortTitle: '2027 เสริมฐานราก',
      description: 'เริ่มงานฉีดซีเมนต์เกราท์แรงดันสูงและติดตั้งเสาเข็มไมโครไพล์ค้ำยันเชิงป้องกัน อัตราการขยับตัว 7 วันล่าสุดคงที่ 0.00 มม.',
      fullStatement: 'มาตรการวิศวกรรมฟื้นฟูโครงสร้างระยะที่ 1 (Structural Stabilization Phase):\n\n1. การอัดฉีดสารผสมซีเมนต์เกราท์ความดันสูง (High-Pressure Compaction Grouting) ปรับปรุงสภาพชั้นดินรอบฐานราก\n2. การติดตั้งเสาเข็มไมโครไพล์เหล็กกล้ากำลังสูง (Steel Micro-piles) ถ่ายน้ำหนักลงสู่ชั้นทรายแน่น\n3. ค่าตรวจวัดอัตราการขยับตัวในรอบ 7 วันที่ผ่านมาคงที่ที่ 0.00 มม. (Zero Movement Rate)',
      status: 'กำลังปฏิบัติการ',
      imageUrl: '/src/assets/images/sai_public_campaign_1791689820118.jpg',
      mediaType: 'photo',
      technicalDetails: 'ฉีดซีเมนต์เกราท์ครอบคลุมพื้นที่ 850 ตร.ม. พร้อมติดตั้งหมุดวัดระดับความละเอียดสูง (Precision Benchmark)',
      referenceTitle: 'แผนผังมาตรการวิศวกรรมโครงสร้าง กรมโยธาธิการและผังเมือง',
      referenceUrl: 'https://pr-request-system.vercel.app',
      colorAccent: 'cyan',
      icon: 'target'
    },
    {
      id: 'tl-5',
      date: 'ปัจจุบัน (ตุลาคม 2569)',
      time: 'ล่าสุด',
      phase: 'แผนฟื้นฟูถาวร',
      title: 'แผนพัฒนาสู่อาคาร Smart & Resilient Green Building',
      shortTitle: '2028 สู่ Smart Green',
      description: 'ยกระดับอาคาร สตง. สู่มาตรฐานอาคารปลอดภัยอัจฉริยะ พร้อมระบบเฝ้าระวังด้วย AI และ IoT Sensor ตลอดอายุการใช้งาน',
      fullStatement: 'วิสัยทัศน์การฟื้นฟูและพัฒนาอาคารสำนักงานการตรวจเงินแผ่นดินสู่ความยั่งยืน:\n\n1. แผนการปรับปรุงโครงสร้างตามมาตรฐานอาคารเขียวและอาคารต้านทานภัยพิบัติระดับสากล\n2. ติดตั้งโครงข่าย IoT Structural Health Monitoring (SHM) แบบถาวรเชื่อมโยงกับ AI วิเคราะห์พฤติกรรมโครงสร้างเรียลไทม์\n3. สำนักประชาสัมพันธ์ฯ แถลงความคืบหน้าให้ประชาชนทราบอย่างโปร่งใสต่อเนื่อง',
      status: 'แผนระยะยาว',
      imageUrl: '/src/assets/images/sai_digital_network_1791693065277.jpg',
      mediaType: 'photo',
      technicalDetails: 'ระบบ SHM ผนวก AI อัลกอริทึมเตือนภัยล่วงหน้า รองรับแผ่นดินไหวขนาด 7.0 ริกเตอร์',
      referenceTitle: 'แผนแม่บทการพัฒนาโครงสร้างพื้นฐาน สตง. 2569-2573',
      referenceUrl: 'https://pr-request-system.vercel.app',
      colorAccent: 'emerald',
      icon: 'users'
    }
  ]
};

export default function App() {
  const [data, setData] = useState<AppData>(initialData);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);

  const isChatbotEnabled = data.chatbotSettings?.enabled ?? true;
  // Default: icon button only (closed window) - user requested "เมื่อเปิดเวบขึ้นมาให้ส่วนของ AI Chatbot เป็น Icon ยังไม่ต้องเปิดหน้าต่างchat"
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  // Sync chatbot enabled state: if disabled in settings, ensure chat window is closed
  useEffect(() => {
    if (data.chatbotSettings?.enabled === false) {
      setIsChatbotOpen(false);
    }
  }, [data.chatbotSettings?.enabled]);

  const [externalChatPrompt, setExternalChatPrompt] = useState<string | null>(null);
  const [loginToast, setLoginToast] = useState(false);
  const [isMediaPlaying, setIsMediaPlaying] = useState(false);
  const [isExecutiveDashboardOpen, setIsExecutiveDashboardOpen] = useState(false);

  // Check URL hash for direct links to dashboard (#dashboard, #analytics, #stats) - Restrict strictly to logged-in Admin
  useEffect(() => {
    const checkHash = () => {
      if (typeof window === 'undefined') return;
      const hash = window.location.hash.toLowerCase();
      const search = window.location.search.toLowerCase();
      if (
        hash === '#dashboard' ||
        hash === '#analytics' ||
        hash === '#stats' ||
        search.includes('view=dashboard') ||
        search.includes('view=analytics')
      ) {
        if (isAdminLoggedIn) {
          setIsExecutiveDashboardOpen(true);
        } else {
          // Users who are not admin will NOT see or access this function
          window.history.pushState(null, '', window.location.pathname);
          setIsExecutiveDashboardOpen(false);
        }
      }
    };

    checkHash();
    window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
  }, [isAdminLoggedIn]);

  const handleCloseExecutiveDashboard = () => {
    setIsExecutiveDashboardOpen(false);
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.toLowerCase();
      if (hash === '#dashboard' || hash === '#analytics' || hash === '#stats') {
        window.history.pushState(null, '', window.location.pathname);
      }
    }
  };

  // Initialize and synchronize with Firebase Firestore (24/7 online persistence)
  useEffect(() => {
    // 1. Seed initial data if Firestore collections are empty
    seedFirestoreIfEmpty(initialData);

    // 2. Real-time Firestore subscription
    const unsubscribe = subscribeToAppData((partial) => {
      setData((prev) => ({ ...prev, ...partial }));
    });

    // 3. Fallback server sync
    fetch('/api/data')
      .then((res) => (res.ok ? res.json() : null))
      .then((serverData) => {
        if (serverData && serverData.knowledgeBase) {
          setData((prev) => ({ ...prev, ...serverData }));
        }
      })
      .catch((err) => {
        console.log('Using local/firebase seed data:', err.message);
      });

    // 4. Log anonymous visitor action to Firestore & local analytics
    logVisitorAction('visit_site', 'home');
    recordVisitorVisit();

    return () => {
      unsubscribe();
    };
  }, []);

  const handleUpdateData = async (newData: AppData) => {
    setData(newData);

    // 1. Save directly to Firebase Firestore
    try {
      await syncAllDataToFirestore(newData);
    } catch (err) {
      console.warn('Firestore sync notice:', err);
    }

    // 2. Save to local Express backend API
    try {
      await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newData),
      });
    } catch (err) {
      console.error('Failed to sync data with server', err);
    }
  };

  const handleBiometricSuccess = () => {
    setIsAdminLoggedIn(true);
    setIsAdminPanelOpen(true);
    setLoginToast(true);
    setTimeout(() => {
      setLoginToast(false);
    }, 4000);
  };

  const handleLogout = () => {
    setIsAdminLoggedIn(false);
    setIsAdminPanelOpen(false);
  };

  const handleScrollToTimeline = () => {
    const el = document.getElementById('incident-timeline');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleAskAi = (promptText: string) => {
    if (!isChatbotEnabled) return;
    setExternalChatPrompt(promptText);
    setIsChatbotOpen(true);
  };

  return (
    <div className="relative min-h-screen bg-[#020717] text-slate-100 selection:bg-amber-500/30 selection:text-amber-200 overflow-x-hidden">
      {/* Royal Luxury Ambient Light Orbs (Royal Gold & Imperial Sapphire) */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
        {/* Top Hero Ambient Glow: Radiant Royal Gold & Deep Sapphire */}
        <div
          className="absolute -top-32 left-1/4 w-[650px] h-[550px] bg-amber-500/12 rounded-full blur-[160px]"
        />
        
        {/* Incident Section Ambient Glow: Royal Gold & Imperial Blue */}
        <div className="absolute top-[26%] -left-32 w-[650px] h-[550px] bg-amber-600/10 rounded-full blur-[170px]" />
        <div className="absolute top-[34%] right-0 w-[550px] h-[500px] bg-blue-700/15 rounded-full blur-[160px]" />

        {/* Digital Media Archive (คลังสื่อดิจิทัล) Glow: Royal Indigo & Champagne Gold */}
        <div className="absolute top-[52%] left-1/3 w-[700px] h-[550px] bg-indigo-700/14 rounded-full blur-[160px]" />

        {/* Viral Media Glow: Warm Burnished Gold & Royal Sapphire */}
        <div className="absolute top-[70%] -right-20 w-[600px] h-[500px] bg-amber-500/10 rounded-full blur-[160px]" />

        {/* e-Audit & Footer Glow: Deep Royal Navy & Soft Gold */}
        <div className="absolute bottom-10 left-10 w-[700px] h-[500px] bg-blue-800/14 rounded-full blur-[160px]" />
      </div>

      {/* Royal Luxury Non-3D Background (หรู เรียบ สง่างาม ไม่ต้อง 3D) */}
      <ThreeCanvas />

      {/* Main Content Layer */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar
          isAdminLoggedIn={isAdminLoggedIn}
          onOpenAdminPanel={() => setIsAdminPanelOpen(true)}
          onBiometricSuccess={handleBiometricSuccess}
          searchData={data}
        />

        {/* Successful Biometric Admin Login Toast Notification */}
        {loginToast && (
          <div className="fixed top-20 right-5 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-[#06153d] border border-cyan-500/50 text-cyan-300 text-xs shadow-2xl shadow-cyan-500/20 animate-fadeIn">
            <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
            <div>
              <span className="font-semibold block text-white">ยืนยันตัวตน Biometric สำเร็จ</span>
              <span className="text-[11px] text-cyan-400 font-mono">
                เข้าสู่ระบบ: auditpicture.webapp@gmail.com
              </span>
            </div>
          </div>
        )}

        <main className="flex-1">
          {/* 1. Hero Carousel (Highlight ภาพข่าวหมุน) & 2. วิดีโอคลิปไวรัล (ติดๆ กัน) พร้อมแถบประกาศวิ่ง Marquee Ticker */}
          <HeroSection
            stories={data.heroStories || []}
            clips={data.viralClips || []}
            marqueeTicker={data.marqueeTicker || defaultMarqueeTicker}
            onPlayingChange={setIsMediaPlaying}
          />

          {/* 3. ศูนย์ข้อมูลสถานการณ์ฉุกเฉินและวิศวกรรมโครงสร้าง สตง. (ขึ้นมาต่อจากส่วนคลิปไวรัล) */}
          <BuildingIncidentSection
            timeline={data.incidentTimeline}
            onAskAiAboutIncident={() =>
              handleAskAi('ช่วยสรุปข้อเท็จจริงและมาตรการความปลอดภัยจากเหตุการณ์อาคาร สตง. ทรุดตัว')
            }
          />

          {/* 4. คลังสื่อดิจิทัล & วารสาร */}
          <PublishedWorksSection works={data.publishedWorks} />

          {/* 6. ข้อมูล e-Audit */}
          <PublicInterestSection onAskAi={handleAskAi} />
        </main>

        <Footer />

        {/* Admin Management Dashboard (Directly opened upon 3-second biometric hold) */}
        <AdminPanel
          isOpen={isAdminPanelOpen}
          onClose={() => setIsAdminPanelOpen(false)}
          data={data}
          onUpdateData={handleUpdateData}
          onLogout={handleLogout}
        />

        {/* Floating Compact AI Chatbot Widget (แสดงเฉพาะเมื่อเปิดใช้งานใน Admin และจะขึ้นมาทันทีแม้อยู่หน้าแรกของทุกมุมมอง) */}
        {isChatbotEnabled && (
          <AIChatbotWidget
            isOpen={isChatbotOpen}
            onToggle={() => setIsChatbotOpen(!isChatbotOpen)}
            externalPrompt={externalChatPrompt}
            onClearExternalPrompt={() => setExternalChatPrompt(null)}
            welcomeMessage={data.chatbotSettings?.welcomeMessage}
          />
        )}

        {/* Real-time Executive PR Analytics Dashboard (เฉพาะผู้ดูแลระบบ Admin เท่านั้น) */}
        {isAdminLoggedIn && isExecutiveDashboardOpen && (
          <ExecutiveDashboardModal
            isOpen={isExecutiveDashboardOpen}
            onClose={handleCloseExecutiveDashboard}
          />
        )}
      </div>
    </div>
  );
}
