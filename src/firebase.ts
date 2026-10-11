import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  collection,
  getDocs,
  setDoc,
  deleteDoc,
  onSnapshot
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import {
  AppData,
  HeroStory,
  KnowledgeItem,
  PublishedWork,
  ViralClip,
  IncidentMilestone,
  MusicSettings
} from './types';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

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
  driveUrl: 'https://drive.google.com/drive/u/0/home',
  streamUrl: '/api/audio-proxy?url=https%3A%2F%2Fdrive.google.com%2Fdrive%2Fu%2F0%2Fhome',
  title: 'PR - SAI Thailand Ambient Melody (เพลงบรรเลงประชาสัมพันธ์)',
  defaultVolume: 0.18, // 18% gentle volume by default as requested
  duckingVolume: 0.03, // 3% almost inaudible during video playback
  enabled: true,
  updatedAt: new Date().toISOString(),
};

// Sync and Subscribe to Entire App State in Firestore
export function subscribeToAppData(onUpdate: (data: Partial<AppData>) => void) {
  const unsubscribers: (() => void)[] = [];

  // 1. Hero Stories
  const unsubStories = onSnapshot(
    collection(db, 'heroStories'),
    (snapshot) => {
      if (!snapshot.empty) {
        const stories: HeroStory[] = [];
        snapshot.forEach((docSnap) => {
          stories.push(docSnap.data() as HeroStory);
        });
        stories.sort((a, b) => (a.order || 0) - (b.order || 0));
        onUpdate({ heroStories: stories.slice(0, 10) });
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
        const kb: KnowledgeItem[] = [];
        snapshot.forEach((docSnap) => {
          kb.push(docSnap.data() as KnowledgeItem);
        });
        onUpdate({ knowledgeBase: kb });
      }
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, 'knowledgeBase');
    }
  );
  unsubscribers.push(unsubKb);

  // 3. Published Works
  const unsubWorks = onSnapshot(
    collection(db, 'publishedWorks'),
    (snapshot) => {
      if (!snapshot.empty) {
        const works: PublishedWork[] = [];
        snapshot.forEach((docSnap) => {
          works.push(docSnap.data() as PublishedWork);
        });
        onUpdate({ publishedWorks: works });
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
        const clips: ViralClip[] = [];
        snapshot.forEach((docSnap) => {
          clips.push(docSnap.data() as ViralClip);
        });
        onUpdate({ viralClips: clips });
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
        const timeline: IncidentMilestone[] = [];
        snapshot.forEach((docSnap) => {
          timeline.push(docSnap.data() as IncidentMilestone);
        });
        onUpdate({ incidentTimeline: timeline });
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

  return () => {
    unsubscribers.forEach((unsub) => unsub());
  };
}

// Seed initial data into Firestore if empty
export async function seedFirestoreIfEmpty(initialData: AppData) {
  try {
    const storiesSnap = await getDocs(collection(db, 'heroStories'));
    if (storiesSnap.empty) {
      console.log('Seeding initial data into Firestore...');
      // 1. Stories
      for (const story of initialData.heroStories) {
        await setDoc(doc(db, 'heroStories', story.id), story);
      }
      // 2. Knowledge
      for (const item of initialData.knowledgeBase) {
        await setDoc(doc(db, 'knowledgeBase', item.id), item);
      }
      // 3. Published Works
      for (const work of initialData.publishedWorks) {
        await setDoc(doc(db, 'publishedWorks', work.id), work);
      }
      // 4. Viral Clips
      for (const clip of initialData.viralClips) {
        await setDoc(doc(db, 'viralClips', clip.id), clip);
      }
      // 5. Incident Timeline
      for (const item of initialData.incidentTimeline) {
        await setDoc(doc(db, 'incidentTimeline', item.id), item);
      }
      // 6. Music Settings
      await setDoc(doc(db, 'settings', 'music'), defaultMusicSettings);
      console.log('Firestore seed completed successfully.');
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'seed');
  }
}

// Save Music Settings to Firestore
export async function saveMusicSettings(settings: MusicSettings) {
  try {
    const streamUrl = parseGoogleDriveAudioUrl(settings.driveUrl);
    const dataToSave: MusicSettings = {
      ...settings,
      streamUrl,
      updatedAt: new Date().toISOString(),
    };
    await setDoc(doc(db, 'settings', 'music'), dataToSave);
    return dataToSave;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'settings/music');
    throw err;
  }
}

// Save Full App Data to Firestore
export async function syncAllDataToFirestore(data: AppData) {
  try {
    if (data.heroStories) {
      for (const story of data.heroStories) {
        await setDoc(doc(db, 'heroStories', story.id), story);
      }
    }
    if (data.knowledgeBase) {
      for (const kb of data.knowledgeBase) {
        await setDoc(doc(db, 'knowledgeBase', kb.id), kb);
      }
    }
    if (data.publishedWorks) {
      for (const work of data.publishedWorks) {
        await setDoc(doc(db, 'publishedWorks', work.id), work);
      }
    }
    if (data.viralClips) {
      for (const clip of data.viralClips) {
        await setDoc(doc(db, 'viralClips', clip.id), clip);
      }
    }
    if (data.incidentTimeline) {
      for (const tl of data.incidentTimeline) {
        await setDoc(doc(db, 'incidentTimeline', tl.id), tl);
      }
    }
    if (data.musicSettings) {
      await saveMusicSettings(data.musicSettings);
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'bulkSync');
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
