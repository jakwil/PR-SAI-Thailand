import React, { useState, useEffect } from 'react';
import { ThreeCanvas } from './components/ThreeCanvas';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { BuildingIncidentSection } from './components/BuildingIncidentSection';
import { PublishedWorksSection } from './components/PublishedWorksSection';
import { ViralClipsSection } from './components/ViralClipsSection';
import { PublicInterestSection } from './components/PublicInterestSection';
import { AIChatbotWidget } from './components/AIChatbotWidget';
import { AdminPanel } from './components/AdminPanel';
import { Footer } from './components/Footer';
import { BackgroundMusicPlayer } from './components/BackgroundMusicPlayer';
import {
  subscribeToAppData,
  seedFirestoreIfEmpty,
  syncAllDataToFirestore,
  logVisitorAction,
  defaultMusicSettings
} from './firebase';
import { AppData } from './types';
import { ShieldCheck } from 'lucide-react';
import { recordVisitorVisit } from './utils/analytics';

// Default initial state
const initialData: AppData = {
  musicSettings: defaultMusicSettings,
  heroStories: [
    {
      id: 'story-1',
      title: 'นวัตกรรม Digital Audit & MRV พลิกโฉมความโปร่งใสภาครัฐ',
      subtitle: 'ระบบเชื่อมโยงข้อมูล Data Analytics และมาตรวัดอัจฉริยะ ติดตามการใช้จ่ายงบประมาณแผ่นดินแบบเรียลไทม์',
      category: 'นวัตกรรมดิจิทัล สตง.',
      imageUrl: '/src/assets/images/sai_digital_network_1791693065277.jpg',
      linkUrl: 'https://pr-request-system.vercel.app',
      date: '10 ตุลาคม 2569',
      badge: 'ข่าวยอดนิยม',
      order: 1
    },
    {
      id: 'story-2',
      title: 'เชื่อมโยงเครือข่ายความโปร่งใสไทยสู่มาตรฐานสากล (Global Data Node)',
      subtitle: 'การประสานพลังองค์กรตรวจเงินแผ่นดินระดับโลก ขับเคลื่อนธรรมาภิบาลและความรับผิดชอบทางการเงิน',
      category: 'ความร่วมมือสากล',
      imageUrl: '/src/assets/images/sai_earth_hologram_1791693076088.jpg',
      linkUrl: 'https://pr-request-system.vercel.app',
      date: '9 ตุลาคม 2569',
      badge: 'ยุทธศาสตร์ สตง.',
      order: 2
    },
    {
      id: 'story-3',
      title: 'รายงานสถานการณ์และมาตรการวิศวกรรม: อาคาร สตง. ทรุดตัว ล่าสุด',
      subtitle: 'วสท. และกรมโยธาธิการฯ ยืนยันโครงสร้างแกนกลางมั่นคง แผนความปลอดภัยฉุกเฉินและ Digital Audit 100%',
      category: 'แถลงการณ์สำคัญ',
      imageUrl: '/src/assets/images/sai_building_inspection_1791689807795.jpg',
      linkUrl: '#incident-timeline',
      date: '8 ตุลาคม 2569',
      badge: 'ข้อเท็จจริงทางการ',
      order: 3
    },
    {
      id: 'story-4',
      title: 'ศูนย์บัญชาการตรวจเงินแผ่นดิน: เทคโนโลยี AI สกัดกั้นการทุจริต',
      subtitle: 'ทีมผู้ตรวจการมืออาชีพใช้ AI ตรวจสอบเส้นทางงบประมาณและข้อมูลการจัดซื้อจัดจ้างภาครัฐ',
      category: 'ภารกิจตรวจสอบ',
      imageUrl: '/src/assets/images/sai_audit_hero_1791689796943.jpg',
      linkUrl: 'https://youtube.com',
      date: '1 ตุลาคม 2569',
      badge: 'ผลงานเด่น',
      order: 4
    },
    {
      id: 'story-5',
      title: 'แคมเปญพลังพลเมือง: ร่วมตรวจสอบงบประมาณท้องถิ่นทั่วไทย',
      subtitle: 'เปิดช่องทางประชาชนมีส่วนร่วมแจ้งเบาะแสผ่านสายด่วน 1730 และสื่อประชาสัมพันธ์สร้างสรรค์',
      category: 'การมีส่วนร่วมประชาชน',
      imageUrl: '/src/assets/images/sai_public_campaign_1791689820118.jpg',
      linkUrl: 'https://pr-request-system.vercel.app',
      date: '28 กันยายน 2569',
      badge: 'แคมเปญแห่งปี',
      order: 5
    },
    {
      id: 'story-6',
      title: 'เปิดระบบขอรับการสนับสนุนสื่อประชาสัมพันธ์และวิทยากร สตง.',
      subtitle: 'บริการออนไลน์สำหรับสถาบันการศึกษา ชุมชน และหน่วยงานรัฐ ยื่นคำของ่ายใน 3 ขั้นตอน',
      category: 'บริการองค์กร',
      imageUrl: '/src/assets/images/sai_digital_innovation_1791689830942.jpg',
      linkUrl: 'https://pr-request-system.vercel.app',
      date: '25 กันยายน 2569',
      badge: 'บริการใหม่',
      order: 6
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
      id: 'work-1',
      title: 'สารคดีเจาะลึก: เงินแผ่นดินทุกบาท เพื่อประโยชน์ชาติ',
      category: 'สารคดีโทรทัศน์ / วิดีโอ',
      description: 'สารคดีชุดพิเศษพาชมเบื้องหลังการทำงานของผู้ว่าการตรวจเงินแผ่นดินและทีมผู้ตรวจการมืออาชีพในการลงพื้นที่ทั่วประเทศ',
      linkUrl: 'https://youtube.com',
      imageUrl: '/src/assets/images/sai_audit_hero_1791689796943.jpg',
      publishDate: '2026-09-28',
      views: '128,400',
      badge: 'ผลงานเด่น'
    },
    {
      id: 'work-2',
      title: 'รายงานพิเศษ: ความคืบหน้าการตรวจสอบทางวิศวกรรมอาคาร สตง.',
      category: 'แถลงการณ์ & รายงานข้อเท็จจริง',
      description: 'บทสรุปทางวิศวกรรมและแผนฟื้นฟูปรับปรุงโครงสร้างอาคาร สตง. ร่วมกับสถาบันวิชาชีพวิศวกรรมเพื่อความโปร่งใสและปลอดภัย',
      linkUrl: 'https://pr-request-system.vercel.app',
      imageUrl: '/src/assets/images/sai_building_inspection_1791689807795.jpg',
      publishDate: '2026-10-08',
      views: '94,200',
      badge: 'สถานการณ์สำคัญ'
    },
    {
      id: 'work-3',
      title: 'แคมเปญพลังพลเมือง: ร่วมเป็นตาสับปะรดเฝ้าระวังงบประมาณท้องถิ่น',
      category: 'แคมเปญสร้างการมีส่วนร่วม',
      description: 'สื่ออินโฟกราฟิกและคู่มือประชาชนในการตรวจสอบการจัดซื้อจัดจ้างภาครัฐในระดับท้องถิ่น เข้าใจง่ายใน 3 นาที',
      linkUrl: 'https://pr-request-system.vercel.app',
      imageUrl: '/src/assets/images/sai_public_campaign_1791689820118.jpg',
      publishDate: '2026-10-04',
      views: '67,890',
      badge: 'ยอดแชร์สูง'
    },
    {
      id: 'work-4',
      title: 'นวัตกรรม AI Audit & Data Intelligence ขับเคลื่อนความโปร่งใส',
      category: 'นวัตกรรมการตรวจสอบ',
      description: 'การนำเทคโนโลยี AI และ Data Analytics มายกระดับการตรวจเงินแผ่นดินยุคดิจิทัล ตรวจจับความผิดปกติรวดเร็วแม่นยำ',
      linkUrl: 'https://youtube.com',
      imageUrl: '/src/assets/images/sai_digital_innovation_1791689830942.jpg',
      publishDate: '2026-10-01',
      views: '52,100',
      badge: 'นวัตกรรมใหม่'
    }
  ],
  viralClips: [
    {
      id: 'clip-1',
      title: '1 นาทีเข้าใจ! เงินภาษีของเรา สตง. ตรวจสอบอย่างไร?',
      creator: 'PR - SAI Thailand Media Team',
      views: '542K',
      duration: '01:14',
      thumbnail: '/src/assets/images/sai_audit_hero_1791689796943.jpg',
      linkUrl: 'https://youtube.com',
      highlight: 'ยอดวิวทะลุ 5 แสนครั้งบน TikTok & Shorts'
    },
    {
      id: 'clip-2',
      title: 'เจาะมาตรการความปลอดภัย อาคาร สตง. ทรุดตัว ล่าสุด!',
      creator: 'ศูนย์สื่อสารภาวะวิกฤต สตง.',
      views: '389K',
      duration: '02:05',
      thumbnail: '/src/assets/images/sai_building_inspection_1791689807795.jpg',
      linkUrl: 'https://youtube.com',
      highlight: 'ชี้แจงข้อเท็จจริงเพื่อความโปร่งใสแก่ประชาชน'
    },
    {
      id: 'clip-3',
      title: 'เทคนิคดูป้ายโครงการก่อสร้างรัฐ รู้ทันทุจริตใน 3 ขั้นตอน',
      creator: 'PR - SAI Thailand Network',
      views: '410K',
      duration: '01:45',
      thumbnail: '/src/assets/images/sai_public_campaign_1791689820118.jpg',
      linkUrl: 'https://youtube.com',
      highlight: 'แชร์เป็นไวรัลในกลุ่มชุมชนและเครือข่ายธรรมาภิบาล'
    }
  ],
  incidentTimeline: [
    {
      id: 'tl-1',
      date: '28 กันยายน 2569',
      time: '09:30 น.',
      phase: 'ตรวจพบความผิดปกติ',
      title: 'สัญญาณการทรุดตัวและสั่งการอพยพทันที',
      description: 'ทีมวิศวกรประจำอาคารตรวจพบรอยแยกและการเคลื่อนตัวของแผ่นพื้นบริเวณชั้นใต้ดินด้านทิศตะวันออก ผู้บริหารสั่งอพยพเจ้าหน้าที่ทั้งหมดตามแผนฉุกเฉินระดับ 1 ไม่มีผู้ได้รับบาดเจ็บ',
      status: 'เรียบร้อย',
      imageUrl: '/src/assets/images/sai_building_inspection_1791689807795.jpg',
      technicalDetails: 'ตรวจพบการทรุดตัวส่วนฐานรากย่อยประมาณ 3.2 ซม. ระบบตัดไฟและแก๊สทำงานอัตโนมัติ'
    },
    {
      id: 'tl-2',
      date: '1 ตุลาคม 2569',
      time: '14:00 น.',
      phase: 'การตรวจสอบทางวิศวกรรมร่วม',
      title: 'วสท. และกรมโยธาธิการฯ เข้าตรวจวัดโครงสร้าง 3D Laser Scanning',
      description: 'วิศวกรรมสถานแห่งประเทศไทย (วสท.) และผู้เชี่ยวชาญด้านปฐพีกลศาสตร์ติดตั้งเซนเซอร์วัดการขยับตัวแบบเรียลไทม์ และทำ 3D Laser Scan พบว่าโครงสร้างแกนกลางหลัก (Core Structure) ยังคงมีความมั่นคงแข็งแรง',
      status: 'วิเคราะห์ข้อมูล',
      imageUrl: '/src/assets/images/sai_audit_hero_1791689796943.jpg',
      technicalDetails: 'ติดตั้ง Tiltmeter 24 จุด และตรวจสอบเสาเข็มเจาะลึก 45 เมตร ไม่พบการหักขาดของเสาเข็มหลัก'
    },
    {
      id: 'tl-3',
      date: '5 ตุลาคม 2569',
      time: '11:00 น.',
      phase: 'แผนความต่อเนื่องทางธุรกิจ (BCP)',
      title: 'เปิดศูนย์บัญชาการปฏิบัติการชั่วคราว & Digital Audit เต็มรูปแบบ',
      description: 'สำนักงานการตรวจเงินแผ่นดินย้ายการปฏิบัติการหลักไปยังอาคารสำรองและศูนย์ระบบคลาวด์ Digital Audit งานตรวจสอบบัญชีแผ่นดินทั่วประเทศดำเนินไปได้ตามกำหนดการ 100% ประชาชนติดต่อได้ตามปกติ',
      status: 'ดำเนินการแล้ว',
      imageUrl: '/src/assets/images/sai_digital_innovation_1791689830942.jpg',
      technicalDetails: 'ระบบจัดเก็บข้อมูลการตรวจสอบอยู่บน Secure Cloud ภายนอก ข้อมูลเอกสารราชการปลอดภัยครบถ้วน 100%'
    },
    {
      id: 'tl-4',
      date: 'ปัจจุบัน (ตุลาคม 2569)',
      time: 'ล่าสุด',
      phase: 'งานเสริมความมั่นคงและแผนฟื้นฟู',
      title: 'งานเสริมฐานราก (Underpinning & Micro-piles) และแถลงความคืบหน้า',
      description: 'เริ่มงานฉีดซีเมนต์เกราท์และค้ำยันเชิงป้องกัน ควบคู่กับการแถลงข่าวรายสัปดาห์โดยสำนักประชาสัมพันธ์ฯ เพื่อให้ข้อมูลที่ถูกต้องแก่ประชาชนอย่างต่อเนื่อง',
      status: 'กำลังปฏิบัติการ',
      imageUrl: '/src/assets/images/sai_public_campaign_1791689820118.jpg',
      technicalDetails: 'อัตราการขยับตัวคงที่ (Zero Movement Rate) ในรอบ 7 วันที่ผ่านมา อยู่ระหว่างเตรียมการฟื้นฟูอย่างถาวร'
    }
  ]
};

export default function App() {
  const [data, setData] = useState<AppData>(initialData);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [externalChatPrompt, setExternalChatPrompt] = useState<string | null>(null);
  const [loginToast, setLoginToast] = useState(false);
  const [isMediaPlaying, setIsMediaPlaying] = useState(false);

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
    setExternalChatPrompt(promptText);
    setIsChatbotOpen(true);
  };

  return (
    <div className="relative min-h-screen bg-[#020716] text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200 overflow-x-hidden">
      {/* Dynamic Multi-Colored Blurred Ambient Light Orbs (Provides rich background contrast behind cards) */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
        {/* Subtle Tech Cyber Grid Pattern */}
        <div className="absolute inset-0 bg-digital-grid opacity-25" />
        
        {/* Top Hero Ambient Glow: Electric Cyan & Sky Blue */}
        <div
          className="absolute -top-32 left-1/4 w-[650px] h-[550px] bg-cyan-500/20 rounded-full blur-[140px] animate-pulse"
          style={{ animationDuration: '8s' }}
        />
        
        {/* Incident Section Ambient Glow: Radiant Amber Gold & Deep Cobalt */}
        <div className="absolute top-[26%] -left-32 w-[650px] h-[550px] bg-amber-500/18 rounded-full blur-[150px]" />
        <div className="absolute top-[34%] right-0 w-[550px] h-[500px] bg-blue-600/22 rounded-full blur-[140px]" />

        {/* Digital Media Archive (คลังสื่อดิจิทัล) Glow: Royal Indigo & Neon Violet */}
        <div className="absolute top-[52%] left-1/3 w-[700px] h-[550px] bg-indigo-600/20 rounded-full blur-[150px]" />

        {/* Viral Media Glow: Vibrant Rose & Warm Amber */}
        <div className="absolute top-[70%] -right-20 w-[600px] h-[500px] bg-rose-600/15 rounded-full blur-[140px]" />

        {/* e-Audit & Footer Glow: Deep Teal & Electric Cyan */}
        <div className="absolute bottom-10 left-10 w-[700px] h-[500px] bg-teal-500/16 rounded-full blur-[150px]" />
      </div>

      {/* 3D Three.js Interactive Background */}
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
          <HeroSection
            stories={data.heroStories || []}
            onOpenChat={() => setIsChatbotOpen(true)}
            onExploreTimeline={handleScrollToTimeline}
          />

          <BuildingIncidentSection
            timeline={data.incidentTimeline}
            onAskAiAboutIncident={() =>
              handleAskAi('ช่วยสรุปข้อเท็จจริงและมาตรการความปลอดภัยจากเหตุการณ์อาคาร สตง. ทรุดตัว')
            }
          />

          <PublishedWorksSection works={data.publishedWorks} />

          <ViralClipsSection
            clips={data.viralClips}
            onPlayingChange={setIsMediaPlaying}
          />

          <PublicInterestSection onAskAi={handleAskAi} />
        </main>

        <Footer />

        {/* Ambient Background Music Player (Google Drive Audio with Audio Ducking & Gentle Default Volume - Hidden for users as admin controls it) */}
        <BackgroundMusicPlayer
          settings={data.musicSettings}
          isDucked={isMediaPlaying}
          onOpenSettings={() => setIsAdminPanelOpen(true)}
          showWidget={false}
        />

        {/* Admin Management Dashboard (Directly opened upon 3-second biometric hold) */}
        <AdminPanel
          isOpen={isAdminPanelOpen}
          onClose={() => setIsAdminPanelOpen(false)}
          data={data}
          onUpdateData={handleUpdateData}
          onLogout={handleLogout}
        />

        {/* Floating Compact AI Chatbot Widget */}
        <AIChatbotWidget
          isOpen={isChatbotOpen}
          onToggle={() => setIsChatbotOpen(!isChatbotOpen)}
          externalPrompt={externalChatPrompt}
          onClearExternalPrompt={() => setExternalChatPrompt(null)}
        />
      </div>
    </div>
  );
}
