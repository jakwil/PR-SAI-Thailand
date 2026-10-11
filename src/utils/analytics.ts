import { db, handleFirestoreError, OperationType } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

export interface ShareEvent {
  id: string;
  itemId: string;
  itemTitle: string;
  category?: string;
  platform: 'line' | 'facebook' | 'twitter' | 'copy_link' | 'native';
  timestamp: string;
  url?: string;
}

export interface SharedItemStat {
  id: string;
  title: string;
  category: string;
  shares: number;
  views: string;
  lastShared: string;
}

export interface DailyTrend {
  date: string;
  label: string;
  visitors: number;
  shares: number;
  pageViews: number;
}

export interface AnalyticsSummary {
  totalVisitors: number;
  todayVisitors: number;
  visitorGrowthPct: number;
  totalShares: number;
  todayShares: number;
  shareGrowthPct: number;
  avgEngagementTime: string;
  bounceRatePct: number;
  platformShares: {
    line: number;
    facebook: number;
    twitter: number;
    copy_link: number;
    native: number;
  };
  deviceBreakdown: {
    mobile: number;
    desktop: number;
    tablet: number;
  };
  topSharedItems: SharedItemStat[];
  dailyTrends: DailyTrend[];
  hourlyActivity: { hour: string; traffic: number }[];
  recentShareEvents: ShareEvent[];
}

const STORAGE_KEY_VISITORS = 'sai_analytics_visitors_count';
const STORAGE_KEY_SHARES = 'sai_analytics_share_events';
const STORAGE_KEY_SESSION = 'sai_analytics_session_id';

// Default baseline data for realistic and comprehensive initial dashboard metrics
const defaultTopItems: SharedItemStat[] = [
  {
    id: 'story-1',
    title: 'นวัตกรรม Digital Audit & MRV พลิกโฉมความโปร่งใสภาครัฐ',
    category: 'นวัตกรรมดิจิทัล สตง.',
    shares: 842,
    views: '24.5K',
    lastShared: 'ไม่กี่นาทีที่ผ่านมา',
  },
  {
    id: 'story-3',
    title: 'รายงานสถานการณ์และมาตรการวิศวกรรม: อาคาร สตง. ทรุดตัว ล่าสุด',
    category: 'แถลงการณ์สำคัญ',
    shares: 765,
    views: '38.2K',
    lastShared: '15 นาทีที่แล้ว',
  },
  {
    id: 'clip-1',
    title: 'สตง. เตือนภัย: กลโกงเบิกจ่ายงบประมาณท้องถิ่น รู้ทันไม่ตกเป็นเหยื่อ',
    category: 'ข่าว & คลิปไวรัล',
    shares: 618,
    views: '185K',
    lastShared: '32 นาทีที่แล้ว',
  },
  {
    id: 'story-2',
    title: 'เชื่อมโยงเครือข่ายความโปร่งใสไทยสู่มาตรฐานสากล (Global Data Node)',
    category: 'ความร่วมมือสากล',
    shares: 495,
    views: '12.8K',
    lastShared: '1 ชั่วโมงที่แล้ว',
  },
  {
    id: 'work-1',
    title: 'รายงานการตรวจสอบการดำเนินงานระบบเทคโนโลยีสารสนเทศภาครัฐ 2568',
    category: 'คลังสื่อดิจิทัล',
    shares: 412,
    views: '18.4K',
    lastShared: '2 ชั่วโมงที่แล้ว',
  },
  {
    id: 'eaudit-1',
    title: 'ระบบ e-Audit คืออะไร และประชาชนสามารถตรวจสอบผลการตรวจเงินแผ่นดินได้อย่างไร',
    category: 'ข้อมูล e-Audit',
    shares: 388,
    views: '15.1K',
    lastShared: '3 ชั่วโมงที่แล้ว',
  },
  {
    id: 'clip-2',
    title: 'เบื้องหลังการตรวจสอบโครงการก่อสร้างขนาดใหญ่: เงินแผ่นดินทุกบาทต้องคุ้มค่า',
    category: 'ข่าว & คลิปไวรัล',
    shares: 326,
    views: '94K',
    lastShared: '5 ชั่วโมงที่แล้ว',
  },
];

// Record visitor visit
export function recordVisitorVisit(): void {
  if (typeof window === 'undefined') return;

  try {
    const sessionRecorded = sessionStorage.getItem(STORAGE_KEY_SESSION);
    const currentCount = parseInt(localStorage.getItem(STORAGE_KEY_VISITORS) || '14820', 10);

    if (!sessionRecorded) {
      sessionStorage.setItem(STORAGE_KEY_SESSION, 'active_' + Date.now());
      localStorage.setItem(STORAGE_KEY_VISITORS, String(currentCount + 1));

      // Attempt non-blocking Firestore log
      const logId = 'vis_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
      setDoc(doc(db, 'visitorLogs', logId), {
        timestamp: new Date().toISOString(),
        action: 'page_view',
        page: 'home',
        userAgent: navigator.userAgent.slice(0, 200),
      }).catch(() => {});
    }
  } catch {
    // Ignore storage restrictions
  }
}

// Record share event across any news / media item
export function recordShareEvent(
  itemId: string,
  itemTitle: string,
  platform: 'line' | 'facebook' | 'twitter' | 'copy_link' | 'native',
  category?: string,
  url?: string
): void {
  if (typeof window === 'undefined') return;

  const event: ShareEvent = {
    id: 'share_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
    itemId,
    itemTitle,
    category: category || 'ข่าวประชาสัมพันธ์',
    platform,
    timestamp: new Date().toISOString(),
    url: url || window.location.href,
  };

  try {
    const existing: ShareEvent[] = JSON.parse(
      localStorage.getItem(STORAGE_KEY_SHARES) || '[]'
    );
    existing.unshift(event);
    // Keep last 150 share events
    localStorage.setItem(STORAGE_KEY_SHARES, JSON.stringify(existing.slice(0, 150)));

    // Non-blocking firestore sync if possible
    setDoc(doc(db, 'visitorLogs', event.id), {
      timestamp: event.timestamp,
      action: `share_${platform}:${itemId}`,
      page: category || 'news',
      userAgent: navigator.userAgent.slice(0, 200),
    }).catch(() => {});
  } catch {
    // Ignore storage quota
  }
}

// Generate analytics summary combining stored events + baseline metrics
export function getAnalyticsSummary(): AnalyticsSummary {
  let storedShares: ShareEvent[] = [];
  let totalStoredVisitors = 14820;

  if (typeof window !== 'undefined') {
    try {
      storedShares = JSON.parse(localStorage.getItem(STORAGE_KEY_SHARES) || '[]');
      const savedVis = localStorage.getItem(STORAGE_KEY_VISITORS);
      if (savedVis) totalStoredVisitors = parseInt(savedVis, 10);
    } catch {
      storedShares = [];
    }
  }

  // Calculate platform share counts
  const platformCounts = {
    line: 1540,
    facebook: 1220,
    twitter: 410,
    copy_link: 275,
    native: 95,
  };

  // Add recorded dynamic shares
  storedShares.forEach((ev) => {
    if (ev.platform === 'line') platformCounts.line++;
    else if (ev.platform === 'facebook') platformCounts.facebook++;
    else if (ev.platform === 'twitter') platformCounts.twitter++;
    else if (ev.platform === 'copy_link') platformCounts.copy_link++;
    else if (ev.platform === 'native') platformCounts.native++;
  });

  const totalShares =
    platformCounts.line +
    platformCounts.facebook +
    platformCounts.twitter +
    platformCounts.copy_link +
    platformCounts.native;

  // Merge top items with dynamic share count increments
  const itemShareIncrements: Record<string, number> = {};
  storedShares.forEach((ev) => {
    itemShareIncrements[ev.itemId] = (itemShareIncrements[ev.itemId] || 0) + 1;
  });

  const topSharedItems = defaultTopItems.map((item) => {
    const extra = itemShareIncrements[item.id] || 0;
    return {
      ...item,
      shares: item.shares + extra,
      lastShared: extra > 0 ? 'เพิ่งแชร์ล่าสุด' : item.lastShared,
    };
  });

  // If there are newly created items shared that weren't in defaultTopItems
  storedShares.forEach((ev) => {
    if (!topSharedItems.find((t) => t.id === ev.itemId)) {
      topSharedItems.push({
        id: ev.itemId,
        title: ev.itemTitle,
        category: ev.category || 'ข่าว สตง.',
        shares: itemShareIncrements[ev.itemId] || 1,
        views: '1.2K',
        lastShared: 'เพิ่งแชร์ล่าสุด',
      });
    }
  });

  topSharedItems.sort((a, b) => b.shares - a.shares);

  // Daily Trends (Last 7 Days)
  const today = new Date();
  const dayNames = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];
  const dailyTrends: DailyTrend[] = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dayLabel = `${dayNames[d.getDay()]} ${d.getDate()}/${d.getMonth() + 1}`;
    const baseVis = 1800 + (d.getDay() === 0 || d.getDay() === 6 ? 400 : 900) + (i === 0 ? storedShares.length * 10 : 0);
    const baseShares = Math.floor(baseVis * 0.22) + (i === 0 ? storedShares.length : 0);
    const baseViews = Math.floor(baseVis * 3.4);

    dailyTrends.push({
      date: d.toISOString().slice(0, 10),
      label: dayLabel,
      visitors: baseVis,
      shares: baseShares,
      pageViews: baseViews,
    });
  }

  // Hourly traffic pattern (24 hours)
  const hourlyActivity = [
    { hour: '00:00', traffic: 12 },
    { hour: '02:00', traffic: 8 },
    { hour: '04:00', traffic: 14 },
    { hour: '06:00', traffic: 45 },
    { hour: '08:00', traffic: 185 },
    { hour: '09:00', traffic: 340 },
    { hour: '10:00', traffic: 420 },
    { hour: '11:00', traffic: 390 },
    { hour: '12:00', traffic: 280 },
    { hour: '13:00', traffic: 375 },
    { hour: '14:00', traffic: 460 },
    { hour: '15:00', traffic: 430 },
    { hour: '16:00', traffic: 320 },
    { hour: '17:00', traffic: 210 },
    { hour: '18:00', traffic: 165 },
    { hour: '20:00', traffic: 190 },
    { hour: '22:00', traffic: 95 },
  ];

  return {
    totalVisitors: totalStoredVisitors,
    todayVisitors: 2840 + storedShares.length * 8,
    visitorGrowthPct: 14.8,
    totalShares,
    todayShares: 432 + storedShares.length,
    shareGrowthPct: 22.4,
    avgEngagementTime: '3 นาที 48 วินาที',
    bounceRatePct: 24.2,
    platformShares: platformCounts,
    deviceBreakdown: {
      mobile: 64,
      desktop: 29,
      tablet: 7,
    },
    topSharedItems: topSharedItems.slice(0, 10),
    dailyTrends,
    hourlyActivity,
    recentShareEvents: storedShares.slice(0, 15),
  };
}
