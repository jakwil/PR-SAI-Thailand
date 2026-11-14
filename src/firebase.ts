import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  getDocFromServer,
  getDocs,
  collection,
  setDoc,
  deleteDoc,
  onSnapshot,
  arrayUnion
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import {
  AppData,
  HeroStory,
  KnowledgeItem,
  PublishedWork,
  ViralClip,
  IncidentMilestone,
  MusicSettings,
  ChatbotSettings,
  NewsSubscriber,
  NewsBroadcastLog,
  MarqueeTickerSettings
} from './types';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

export const ADMIN_EMAILS = [
  'jakwil@jakwil.page',
  'auditpicture.webapp@gmail.com',
] as const;

export function isAuthorizedAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return (ADMIN_EMAILS as readonly string[]).includes(normalized);
}

export async function signInAdminWithGoogle(hintEmail?: string): Promise<User> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({
    prompt: 'select_account',
    ...(hintEmail ? { login_hint: hintEmail } : {}),
  });
  const result = await signInWithPopup(auth, provider);
  const email = result.user?.email?.trim().toLowerCase();
  if (!isAuthorizedAdminEmail(email)) {
    await signOut(auth);
    throw new Error(
      `บัญชี Google (${result.user?.email || 'ไม่ระบุอีเมล'}) ไม่มีสิทธิ์ผู้ดูแลระบบ (อนุญาตเฉพาะ jakwil@jakwil.page และ auditpicture.webapp@gmail.com)`
    );
  }
  return result.user;
}

export async function signOutAdmin(): Promise<void> {
  await signOut(auth);
}

export { onAuthStateChanged };

function stripUndefined<T extends Record<string, any>>(obj: T): T {
  const cleaned: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      cleaned[key] = value;
    }
  }
  return cleaned as T;
}

// Test connection on boot as required by skill
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
testConnection();

// Error handler specification
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
      tenantId: auth.currentUser?.tenantId || null,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.warn('Firestore Operation Info: ', JSON.stringify(errInfo));
  return errInfo;
}

// Convert Google Drive link or web audio link to direct streaming audio link via proxy
export function parseGoogleDriveAudioUrl(url: string): string {
  if (!url) return 'https://cdn.freesound.org/previews/612/612095_5674468-lq.mp3';
  const trimmed = url.trim();

  // If already an audio proxy URL or data URI
  if (trimmed.startsWith('/api/audio-proxy') || trimmed.startsWith('data:audio')) {
    return trimmed;
  }

  // If already a direct audio file link (.mp3, .wav, .ogg, etc.) and NOT a google drive link
  if (/\.(mp3|wav|ogg|aac|m4a)(\?.*)?$/i.test(trimmed) && !trimmed.includes('drive.google.com')) {
    return trimmed;
  }

  // Extract Google Drive file ID from /file/d/FILE_ID or id=FILE_ID or /folders/ or long hash
  const fileIdMatch =
    trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) ||
    trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/) ||
    trimmed.match(/\/folders\/([a-zA-Z0-9_-]+)/) ||
    trimmed.match(/drive\.google\.com\/.*\/([a-zA-Z0-9_-]{25,})/);

  if (fileIdMatch && fileIdMatch[1]) {
    const fileId = fileIdMatch[1];
    return `/api/audio-proxy?id=${fileId}&url=${encodeURIComponent(trimmed)}`;
  }

  // If user pasted general Google Drive URL (like drive.google.com/drive/u/0/home)
  if (trimmed.includes('drive.google.com') || trimmed.includes('docs.google.com')) {
    return `/api/audio-proxy?url=${encodeURIComponent(trimmed)}`;
  }

  // If another external web audio URL
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return `/api/audio-proxy?url=${encodeURIComponent(trimmed)}`;
  }

  return 'https://cdn.freesound.org/previews/612/612095_5674468-lq.mp3';
}

// Default Music Settings
export const defaultMusicSettings: MusicSettings = {
  driveUrl: '',
  streamUrl: '',
  title: 'PR - SAI Thailand Ambient Melody',
  defaultVolume: 0,
  duckingVolume: 0,
  enabled: false,
  updatedAt: new Date().toISOString(),
};

// Default Chatbot Settings (เปิดใช้งานเป็นไอคอนเริ่มต้น ไม่เปิดหน้าต่างอ้าอัตโนมัติ)
export const defaultChatbotSettings: ChatbotSettings = {
  enabled: true,
  autoOpen: false,
  welcomeMessage:
    'สวัสดีครับ/ค่ะ ยินดีต้อนรับสู่ PR - SAI Thailand! ผม/ดิฉันคือผู้ช่วย AI ประชาสัมพันธ์องค์กร พร้อมให้ข้อมูลภารกิจการตรวจเงินแผ่นดิน สื่อประชาสัมพันธ์ และรายงานข้อเท็จจริงสถานการณ์อาคาร สตง. ทรุดตัว สอบถามเรื่องใดได้เลยครับ/ค่ะ',
  updatedAt: new Date().toISOString(),
};

// Default Marquee Ticker Settings (แถบข้อความประกาศวิ่งใต้บาร์บน)
export const defaultMarqueeTicker: MarqueeTickerSettings = {
  enabled: true,
  direction: 'right-to-left', // เปลี่ยนเป็นขวาไปซ้ายตามคำสั่งผู้ใช้
  speedSeconds: 85, // เคลื่อนไหวช้ามากๆ (85 วินาทีต่อรอบ อ่านง่ายนุ่มนวล)
  pauseOnHover: true,
  prefixLabel: '',
  messages: [
    {
      id: 'msg-1',
      text: 'ศูนย์กลางประชาสัมพันธ์และสื่อสารองค์กร สตง. · SAI THAILAND',
      textColor: '#f59e0b',
      dotColor: '#f59e0b',
      active: true,
    },
    {
      id: 'msg-2',
      text: 'ร่วมสร้างความโปร่งใส แจ้งเบาะแสการใช้เงินแผ่นดิน โทรสายด่วน สตง. 1730 ตลอด 24 ชั่วโมง',
      textColor: '#38bdf8',
      dotColor: '#38bdf8',
      linkUrl: 'tel:1730',
      active: true,
    },
    {
      id: 'msg-3',
      text: 'ติดตามความคืบหน้าสถานการณ์อาคาร สตง. และมาตรการความปลอดภัยวิศวกรรมโครงสร้าง',
      textColor: '#f43f5e',
      dotColor: '#f43f5e',
      linkUrl: '#incident-timeline',
      active: true,
    },
    {
      id: 'msg-4',
      text: 'ขอรับการสนับสนุนสื่อประชาสัมพันธ์และวิทยากรได้ที่ระบบออนไลน์ pr-request-system',
      textColor: '#34d399',
      dotColor: '#34d399',
      linkUrl: 'https://pr-request-system.vercel.app',
      active: true,
    },
  ],
  updatedAt: new Date().toISOString(),
};

// Default News Subscribers
export const defaultNewsSubscribers: NewsSubscriber[] = [
  {
    id: 'sub-admin-jakwil',
    email: 'jakwil@jakwil.page',
    storyId: 'story-photo-1',
    storyTitle: 'ข่าวภาพนิ่ง: คณะผู้บริหารและผู้ตรวจเงินแผ่นดินลงพื้นที่ตรวจสอบงานโครงสร้างและข้อเท็จจริง',
    category: 'ข่าวภาพนิ่ง / ภาพกิจกรรม',
    subscribedAt: '2026-10-18T10:00:00.000Z',
    active: true,
    tags: ['ผู้ดูแลระบบ', 'ข่าวเด่น สตง.', 'ทุกหมวดหมู่'],
    notifyCount: 1,
    lastNotifiedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sub-1',
    email: 'somchai.audit@egat.co.th',
    storyId: 'story-info-1',
    storyTitle: 'Infographic: สรุปผลสัมฤทธิ์การตรวจเงินแผ่นดิน คืนเงินหลวงกลับสู่ชาติกว่า 1.8 หมื่นล้านบาท',
    category: 'อินโฟกราฟิกสรุปสาระสำคัญ',
    subscribedAt: '2026-10-12T09:30:00.000Z',
    active: true,
    tags: ['การเงินการคลัง', 'ผลสัมฤทธิ์'],
    notifyCount: 2,
    lastNotifiedAt: '2026-10-14T11:00:00.000Z',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sub-2',
    email: 'karnjana.p@dpt.go.th',
    storyId: 'story-photo-1',
    storyTitle: 'ข่าวภาพนิ่ง: คณะผู้บริหารและผู้ตรวจเงินแผ่นดินลงพื้นที่ตรวจสอบงานโครงสร้างและข้อเท็จจริง',
    category: 'ข่าวภาพนิ่ง / ภาพกิจกรรม',
    subscribedAt: '2026-10-13T10:15:00.000Z',
    active: true,
    tags: ['วิศวกรรม', 'อาคารสตง', 'ความปลอดภัย'],
    notifyCount: 1,
    lastNotifiedAt: '2026-10-14T11:00:00.000Z',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sub-3',
    email: 'prasert.finance@bb.go.th',
    storyId: 'story-1',
    storyTitle: 'นวัตกรรม Digital Audit & MRV พลิกโฉมความโปร่งใสภาครัฐด้วย Data Analytics',
    category: 'นวัตกรรมดิจิทัล สตง.',
    subscribedAt: '2026-10-14T14:20:00.000Z',
    active: true,
    tags: ['Digital Audit', 'เทคโนโลยี', 'Data Analytics'],
    notifyCount: 0,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sub-4',
    email: 'wiparat.mcu@gmail.com',
    storyId: 'story-4',
    storyTitle: 'ศูนย์บัญชาการตรวจเงินแผ่นดิน: เทคโนโลยี AI สกัดกั้นการทุจริตเชิงรุก',
    category: 'ภารกิจตรวจสอบ',
    subscribedAt: '2026-10-15T08:45:00.000Z',
    active: true,
    tags: ['AI', 'ป้องปรามทุจริต'],
    notifyCount: 1,
    lastNotifiedAt: '2026-10-15T16:00:00.000Z',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sub-5',
    email: 'nattapol.news@thaipbs.or.th',
    storyId: 'story-video-1',
    storyTitle: 'ข่าววิดีโอ: เปิดห้องส่งสตูดิโอ สตง. ถ่ายทอดสดเจาะลึกงบประมาณและข้อมูลการตรวจสอบแบบเรียลไทม์',
    category: 'รายการโทรทัศน์ / วิดีโอ',
    subscribedAt: '2026-10-15T11:10:00.000Z',
    active: true,
    tags: ['สื่อมวลชน', 'วิดีโอสตูดิโอ', 'ถ่ายทอดสด'],
    notifyCount: 0,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sub-6',
    email: 'anchalee.civil@eit.or.th',
    storyId: 'story-3',
    storyTitle: 'รายงานสถานการณ์และมาตรการวิศวกรรม: อาคาร สตง. ทรุดตัว ล่าสุด',
    category: 'แถลงการณ์สำคัญ',
    subscribedAt: '2026-10-16T13:00:00.000Z',
    active: true,
    tags: ['วิศวกรรมสถาน', 'แถลงการณ์', 'มาตรการความปลอดภัย'],
    notifyCount: 1,
    lastNotifiedAt: '2026-10-16T17:00:00.000Z',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sub-7',
    email: 'pr.officer@mof.go.th',
    storyId: 'story-5',
    storyTitle: 'แคมเปญพลังพลเมือง: ร่วมตรวจสอบงบประมาณท้องถิ่นทั่วไทย',
    category: 'การมีส่วนร่วมประชาชน',
    subscribedAt: '2026-10-16T15:30:00.000Z',
    active: true,
    tags: ['ภาคประชาชน', 'สายด่วน1730'],
    notifyCount: 0,
    updatedAt: new Date().toISOString(),
  }
];

export const defaultNewsBroadcasts: NewsBroadcastLog[] = [
  {
    id: 'bcast-1',
    storyId: 'story-photo-1',
    storyTitle: 'ข่าวภาพนิ่ง: คณะผู้บริหารและผู้ตรวจเงินแผ่นดินลงพื้นที่ตรวจสอบงานโครงสร้างและข้อเท็จจริง',
    subject: '📢 แจ้งเตือนข่าวสำคัญ สตง.: คณะผู้บริหารลงพื้นที่ตรวจสอบงานโครงสร้างและแถลงความคืบหน้า',
    summary: 'สรุปผลการตรวจสอบร่วมกับ วสท. และกรมโยธาธิการฯ ยืนยันโครงสร้างปลอดภัย บุคลากรและประชาชนมั่นใจได้',
    recipientCount: 3,
    recipients: ['karnjana.p@dpt.go.th', 'anchalee.civil@eit.or.th', 'somchai.audit@egat.co.th'],
    aiGenerated: true,
    sentAt: '2026-10-14T11:00:00.000Z'
  }
];

export type AppCollectionName =
  | 'heroStories'
  | 'knowledgeBase'
  | 'publishedWorks'
  | 'viralClips'
  | 'incidentTimeline';

let seedingInFlight: Promise<void> | null = null;
const LOCAL_DELETED_KEY = 'sai_deleted_mockup_keys_v1';

function getLocalDeletedSet(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = window.localStorage.getItem(LOCAL_DELETED_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? new Set(parsed.map(String)) : new Set();
  } catch {
    return new Set();
  }
}

function addLocalDeletedKey(key: string) {
  if (typeof window === 'undefined') return;
  try {
    const set = getLocalDeletedSet();
    set.add(key);
    window.localStorage.setItem(LOCAL_DELETED_KEY, JSON.stringify(Array.from(set)));
  } catch {
    // Ignore storage quota errors
  }
}

function clearLocalDeletedKeys() {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(LOCAL_DELETED_KEY);
  } catch {
    // Ignore
  }
}

// Sync and Subscribe to Entire App State in Firestore
export function subscribeToAppData(onUpdate: (data: Partial<AppData>) => void) {
  const unsubscribers: (() => void)[] = [];
  let hasSeededInFirestore = false;
  const emptyCollectionsSeen = new Set<AppCollectionName>();

  // Watch mockup_version so we know whether Firestore owns empty collections
  const unsubVersion = onSnapshot(
    doc(db, 'settings', 'mockup_version'),
    (docSnap) => {
      if (docSnap.exists()) {
        hasSeededInFirestore = true;
        emptyCollectionsSeen.forEach((col) => {
          onUpdate({ [col]: [] } as Partial<AppData>);
        });
      }
    },
    (err) => {
      handleFirestoreError(err, OperationType.GET, 'settings/mockup_version');
    }
  );
  unsubscribers.push(unsubVersion);

  // 1. Hero Stories
  const unsubStories = onSnapshot(
    collection(db, 'heroStories'),
    (snapshot) => {
      if (!snapshot.empty) {
        emptyCollectionsSeen.delete('heroStories');
        const stories: HeroStory[] = [];
        snapshot.forEach((docSnap) => {
          stories.push({ ...(docSnap.data() as HeroStory), id: docSnap.id });
        });
        stories.sort((a, b) => (a.order || 0) - (b.order || 0));
        onUpdate({ heroStories: stories.slice(0, 10) });
      } else {
        emptyCollectionsSeen.add('heroStories');
        if (hasSeededInFirestore) {
          onUpdate({ heroStories: [] });
        }
      }
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, 'heroStories');
    }
  );
  unsubscribers.push(unsubStories);

  // 2. Knowledge Base
  const unsubKb = onSnapshot(
    collection(db, 'knowledgeBase'),
    (snapshot) => {
      if (!snapshot.empty) {
        emptyCollectionsSeen.delete('knowledgeBase');
        const kb: KnowledgeItem[] = [];
        snapshot.forEach((docSnap) => {
          kb.push({ ...(docSnap.data() as KnowledgeItem), id: docSnap.id });
        });
        onUpdate({ knowledgeBase: kb });
      } else {
        emptyCollectionsSeen.add('knowledgeBase');
        if (hasSeededInFirestore) {
          onUpdate({ knowledgeBase: [] });
        }
      }
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, 'knowledgeBase');
    }
  );
  unsubscribers.push(unsubKb);

  // 3. Published Works (Media Library)
  const unsubWorks = onSnapshot(
    collection(db, 'publishedWorks'),
    (snapshot) => {
      if (!snapshot.empty) {
        emptyCollectionsSeen.delete('publishedWorks');
        const works: PublishedWork[] = [];
        snapshot.forEach((docSnap) => {
          works.push({ ...(docSnap.data() as PublishedWork), id: docSnap.id });
        });
        onUpdate({ publishedWorks: works });
      } else {
        emptyCollectionsSeen.add('publishedWorks');
        if (hasSeededInFirestore) {
          onUpdate({ publishedWorks: [] });
        }
      }
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, 'publishedWorks');
    }
  );
  unsubscribers.push(unsubWorks);

  // 4. Viral Clips
  const unsubClips = onSnapshot(
    collection(db, 'viralClips'),
    (snapshot) => {
      if (!snapshot.empty) {
        emptyCollectionsSeen.delete('viralClips');
        const clips: ViralClip[] = [];
        snapshot.forEach((docSnap) => {
          clips.push({ ...(docSnap.data() as ViralClip), id: docSnap.id });
        });
        onUpdate({ viralClips: clips });
      } else {
        emptyCollectionsSeen.add('viralClips');
        if (hasSeededInFirestore) {
          onUpdate({ viralClips: [] });
        }
      }
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, 'viralClips');
    }
  );
  unsubscribers.push(unsubClips);

  // 5. Incident Timeline
  const unsubTimeline = onSnapshot(
    collection(db, 'incidentTimeline'),
    (snapshot) => {
      if (!snapshot.empty) {
        emptyCollectionsSeen.delete('incidentTimeline');
        const timeline: IncidentMilestone[] = [];
        snapshot.forEach((docSnap) => {
          timeline.push({ ...(docSnap.data() as IncidentMilestone), id: docSnap.id });
        });
        onUpdate({ incidentTimeline: timeline });
      } else {
        emptyCollectionsSeen.add('incidentTimeline');
        if (hasSeededInFirestore) {
          onUpdate({ incidentTimeline: [] });
        }
      }
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, 'incidentTimeline');
    }
  );
  unsubscribers.push(unsubTimeline);

  // 6. Music Settings
  const unsubMusic = onSnapshot(
    doc(db, 'settings', 'music'),
    (docSnap) => {
      if (docSnap.exists()) {
        onUpdate({ musicSettings: docSnap.data() as MusicSettings });
      }
    },
    (err) => {
      handleFirestoreError(err, OperationType.GET, 'settings/music');
    }
  );
  unsubscribers.push(unsubMusic);

  // 7. Chatbot Settings (เปิด/ปิด และเปิดหน้าต่างทันทีเมื่อเข้าชม)
  const unsubChatbot = onSnapshot(
    doc(db, 'settings', 'chatbot'),
    (docSnap) => {
      if (docSnap.exists()) {
        onUpdate({ chatbotSettings: docSnap.data() as ChatbotSettings });
      }
    },
    (err) => {
      handleFirestoreError(err, OperationType.GET, 'settings/chatbot');
    }
  );
  unsubscribers.push(unsubChatbot);

  // 10. Marquee Ticker Settings (แถบประกาศวิ่งใต้บาร์บน)
  const unsubTicker = onSnapshot(
    doc(db, 'settings', 'marqueeTicker'),
    (docSnap) => {
      if (docSnap.exists()) {
        onUpdate({ marqueeTicker: docSnap.data() as MarqueeTickerSettings });
      } else {
        onUpdate({ marqueeTicker: defaultMarqueeTicker });
      }
    },
    (err) => {
      handleFirestoreError(err, OperationType.GET, 'settings/marqueeTicker');
    }
  );
  unsubscribers.push(unsubTicker);

  return () => {
    unsubscribers.forEach((unsub) => unsub());
  };
}

// Subscribe to Admin-only PII collections (News Subscribers & Broadcast History)
export function subscribeToAdminData(onUpdate: (data: Partial<AppData>) => void) {
  const unsubscribers: (() => void)[] = [];

  // News Subscribers (ระบบผู้ติดตามข่าว Hero)
  const unsubSubscribers = onSnapshot(
    collection(db, 'newsSubscribers'),
    (snapshot) => {
      if (!snapshot.empty) {
        const subs: NewsSubscriber[] = [];
        snapshot.forEach((docSnap) => {
          subs.push({ ...(docSnap.data() as NewsSubscriber), id: docSnap.id });
        });
        subs.sort((a, b) => new Date(b.subscribedAt || 0).getTime() - new Date(a.subscribedAt || 0).getTime());
        onUpdate({ newsSubscribers: subs });
      } else {
        onUpdate({ newsSubscribers: defaultNewsSubscribers });
      }
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, 'newsSubscribers');
    }
  );
  unsubscribers.push(unsubSubscribers);

  // News Broadcast Logs (ประวัติการส่งข่าวสารแจ้งเตือน)
  const unsubBroadcasts = onSnapshot(
    collection(db, 'newsBroadcasts'),
    (snapshot) => {
      if (!snapshot.empty) {
        const logs: NewsBroadcastLog[] = [];
        snapshot.forEach((docSnap) => {
          logs.push({ ...(docSnap.data() as NewsBroadcastLog), id: docSnap.id });
        });
        logs.sort((a, b) => new Date(b.sentAt || 0).getTime() - new Date(a.sentAt || 0).getTime());
        onUpdate({ newsBroadcasts: logs });
      } else {
        onUpdate({ newsBroadcasts: defaultNewsBroadcasts });
      }
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, 'newsBroadcasts');
    }
  );
  unsubscribers.push(unsubBroadcasts);

  return () => {
    unsubscribers.forEach((unsub) => unsub());
  };
}

// Seed initial data into Firestore ONCE ONLY (never re-adds deleted items)
export async function seedFirestoreIfEmpty(initialData: AppData) {
  if (seedingInFlight) return seedingInFlight;

  seedingInFlight = (async () => {
    try {
      if (!isAuthorizedAdminEmail(auth.currentUser?.email)) {
        return;
      }

      const versionRef = doc(db, 'settings', 'mockup_version');
      let versionDoc;
      try {
        versionDoc = await getDocFromServer(versionRef);
      } catch {
        try {
          versionDoc = await getDoc(versionRef);
        } catch (innerErr) {
          // Do NOT assume unseeded when offline/network fails — abort safely!
          console.warn('Skipping Firestore seed check due to network error:', innerErr);
          return;
        }
      }

      // If mockup_version already exists, database was already initialized — NEVER re-seed!
      if (versionDoc && versionDoc.exists()) {
        return;
      }

      const localDeleted = getLocalDeletedSet();
      const seedCollectionIfEmpty = async <T extends { id: string }>(
        colName: AppCollectionName,
        items: T[]
      ) => {
        const existingSnap = await getDocs(collection(db, colName));
        if (!existingSnap.empty) {
          // Collection already has user/admin data; do not re-create deleted mockups
          return;
        }
        const toWrite = items.filter((item) => !localDeleted.has(`${colName}:${item.id}`));
        await Promise.all(
          toWrite.map((item) => setDoc(doc(db, colName, item.id), stripUndefined(item)))
        );
      };

      console.log('Initializing Firestore mockup baseline once...');
      await Promise.all([
        seedCollectionIfEmpty('heroStories', initialData.heroStories),
        seedCollectionIfEmpty('knowledgeBase', initialData.knowledgeBase),
        seedCollectionIfEmpty('publishedWorks', initialData.publishedWorks),
        seedCollectionIfEmpty('viralClips', initialData.viralClips),
        seedCollectionIfEmpty('incidentTimeline', initialData.incidentTimeline),
        setDoc(doc(db, 'settings', 'music'), stripUndefined(defaultMusicSettings), { merge: true }),
        setDoc(doc(db, 'settings', 'chatbot'), stripUndefined(defaultChatbotSettings), { merge: true }),
      ]);

      await setDoc(
        versionRef,
        {
          version: 'v2_multimodal_news',
          seededAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          categories: ['photo', 'infographic', 'video'],
        },
        { merge: true }
      );
      console.log('Initial Firestore baseline created.');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'seed');
    }
  })().finally(() => {
    seedingInFlight = null;
  });

  return seedingInFlight;
}

// Save single item directly to Firestore collection (fast & atomic)
export async function saveSingleItemToFirestore<T extends { id: string }>(
  collectionName: AppCollectionName,
  item: T
): Promise<void> {
  if (!isAuthorizedAdminEmail(auth.currentUser?.email)) {
    throw new Error('กรุณาเข้าสู่ระบบด้วยบัญชี Google Admin ก่อนบันทึกข้อมูล');
  }
  if (!item.id) {
    throw new Error('ไม่พบรหัสเอกสารสำหรับบันทึก');
  }
  try {
    await setDoc(doc(db, collectionName, item.id), stripUndefined(item));
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `${collectionName}/${item.id}`);
    throw err;
  }
}

// Delete single item from Firestore collection & record deletion marker
export async function deleteItemFromFirestore(
  collectionName: AppCollectionName,
  id: string
): Promise<void> {
  if (!id) return;
  if (!isAuthorizedAdminEmail(auth.currentUser?.email)) {
    throw new Error('กรุณาเข้าสู่ระบบด้วยบัญชี Google Admin ก่อนลบข้อมูล');
  }
  try {
    await deleteDoc(doc(db, collectionName, id));
    const key = `${collectionName}:${id}`;
    addLocalDeletedKey(key);
    await setDoc(
      doc(db, 'settings', 'mockup_version'),
      {
        version: 'v2_multimodal_news',
        updatedAt: new Date().toISOString(),
        deletedIds: arrayUnion(key),
      },
      { merge: true }
    ).catch(() => null);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `${collectionName}/${id}`);
    throw err;
  }
}

// Force reload mockup data into Firestore (explicit admin action only)
export async function reloadMockupDataToFirestore(mockData: AppData) {
  try {
    clearLocalDeletedKeys();
    for (const story of mockData.heroStories) {
      await setDoc(doc(db, 'heroStories', story.id), stripUndefined(story), { merge: true });
    }
    for (const work of mockData.publishedWorks) {
      await setDoc(doc(db, 'publishedWorks', work.id), stripUndefined(work), { merge: true });
    }
    for (const clip of mockData.viralClips) {
      await setDoc(doc(db, 'viralClips', clip.id), stripUndefined(clip), { merge: true });
    }
    await setDoc(doc(db, 'settings', 'mockup_version'), {
      version: 'v2_multimodal_news',
      deletedIds: [],
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'reloadMockup');
    throw err;
  }
}

// Save Music Settings to Firestore
export async function saveMusicSettings(settings: MusicSettings) {
  try {
    const streamUrl = parseGoogleDriveAudioUrl(settings.driveUrl);
    const dataToSave: MusicSettings = stripUndefined({
      ...settings,
      streamUrl,
      updatedAt: new Date().toISOString(),
    });
    await setDoc(doc(db, 'settings', 'music'), dataToSave);
    return dataToSave;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'settings/music');
    throw err;
  }
}

// Save Chatbot Settings to Firestore
export async function saveChatbotSettings(settings: ChatbotSettings) {
  try {
    const dataToSave: ChatbotSettings = stripUndefined({
      ...settings,
      updatedAt: new Date().toISOString(),
    });
    await setDoc(doc(db, 'settings', 'chatbot'), dataToSave);
    return dataToSave;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'settings/chatbot');
    throw err;
  }
}

// Save Marquee Ticker Settings to Firestore
export async function saveMarqueeTickerSettings(settings: MarqueeTickerSettings) {
  try {
    const dataToSave: MarqueeTickerSettings = stripUndefined({
      ...settings,
      updatedAt: new Date().toISOString(),
    });
    await setDoc(doc(db, 'settings', 'marqueeTicker'), dataToSave);
    return dataToSave;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'settings/marqueeTicker');
    throw err;
  }
}

// Save Full App Data to Firestore
export async function syncAllDataToFirestore(data: AppData) {
  if (!isAuthorizedAdminEmail(auth.currentUser?.email)) {
    throw new Error('กรุณาเข้าสู่ระบบด้วยบัญชี Google Admin ก่อนบันทึกข้อมูล');
  }

  let firstError: unknown = null;

  const safeSet = async (col: string, id: string, payload: Record<string, any>) => {
    try {
      await setDoc(doc(db, col, id), stripUndefined(payload));
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `${col}/${id}`);
      if (!firstError) firstError = err;
    }
  };

  if (data.heroStories) {
    for (const story of data.heroStories) {
      await safeSet('heroStories', story.id, story);
    }
  }
  if (data.knowledgeBase) {
    for (const kb of data.knowledgeBase) {
      await safeSet('knowledgeBase', kb.id, kb);
    }
  }
  if (data.publishedWorks) {
    for (const work of data.publishedWorks) {
      await safeSet('publishedWorks', work.id, work);
    }
  }
  if (data.viralClips) {
    for (const clip of data.viralClips) {
      await safeSet('viralClips', clip.id, clip);
    }
  }
  if (data.incidentTimeline) {
    for (const tl of data.incidentTimeline) {
      await safeSet('incidentTimeline', tl.id, tl);
    }
  }
  if (data.musicSettings) {
    try {
      await saveMusicSettings(data.musicSettings);
    } catch (err) {
      if (!firstError) firstError = err;
    }
  }
  if (data.chatbotSettings) {
    try {
      await saveChatbotSettings(data.chatbotSettings);
    } catch (err) {
      if (!firstError) firstError = err;
    }
  }
  if (data.marqueeTicker) {
    try {
      await saveMarqueeTickerSettings(data.marqueeTicker);
    } catch (err) {
      if (!firstError) firstError = err;
    }
  }

  if (firstError) {
    throw firstError;
  }
}

// News Subscriber Persistence (บันทึกผู้ติดตามข่าว)
export async function saveNewsSubscriber(subscriber: NewsSubscriber): Promise<void> {
  try {
    const id = subscriber.id || `sub_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const subToSave: NewsSubscriber = {
      ...subscriber,
      id,
      active: subscriber.active !== false,
      notifyCount: subscriber.notifyCount || 0,
      subscribedAt: subscriber.subscribedAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await setDoc(doc(db, 'newsSubscribers', id), subToSave, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'newsSubscribers');
    throw err;
  }
}

// Delete News Subscriber
export async function deleteNewsSubscriber(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'newsSubscribers', id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `newsSubscribers/${id}`);
    throw err;
  }
}

// Save News Broadcast Log (บันทึกประวัติการส่งกระจายข่าวสาร)
export async function saveNewsBroadcast(broadcast: NewsBroadcastLog): Promise<void> {
  try {
    const id = broadcast.id || `bcast_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const bcastToSave: NewsBroadcastLog = {
      ...broadcast,
      id,
      sentAt: broadcast.sentAt || new Date().toISOString(),
    };
    await setDoc(doc(db, 'newsBroadcasts', id), bcastToSave, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'newsBroadcasts');
    throw err;
  }
}

// Anonymous Visitor Action Logging for stats/analytics
export async function logVisitorAction(action: string, page: string = 'home') {
  try {
    const id = 'log_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
    await setDoc(doc(db, 'visitorLogs', id), {
      timestamp: new Date().toISOString(),
      action,
      page,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent.slice(0, 300) : '',
    });
  } catch (err) {
    // Non-blocking log failure
  }
}

