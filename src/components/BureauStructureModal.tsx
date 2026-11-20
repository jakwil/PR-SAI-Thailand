import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  X,
  Network,
  CheckCircle2,
  ExternalLink,
  Calendar,
  ArrowLeft,
  Layers,
  Settings2,
  ChevronRight,
  ChevronLeft,
  Megaphone,
  Compass,
  Clapperboard,
  FolderKanban,
  Camera,
  Film,
  BarChart3,
  FileText,
  Sparkles,
  Filter,
  Images,
  UserCheck,
  Mail,
  Plus,
  Edit2,
  Save,
  Upload,
  AlertTriangle,
  RefreshCw,
  LogOut,
  ArrowRight,
  Eye,
} from 'lucide-react';
import {
  AppData,
  BureauGroupId,
  GroupWorkItem,
  HeroStory,
  PublishedWork,
  ViralClip,
} from '../types';
import {
  BUREAU_EXECUTIVE_TITLE,
  BUREAU_GROUPS,
  BUREAU_GROUPS_WITH_WORKS,
  BUREAU_SUBTITLE,
  BUREAU_TITLE,
  defaultGroupWorks,
  getBureauGroupById,
} from '../data/bureauStructure';
import {
  auth,
  GROUP_CONTRIBUTOR_EMAIL,
  isAuthorizedPortalEmail,
  isGroupContributorEmail,
  onAuthStateChanged,
  saveSingleItemToFirestore,
  signInGroupContributorWithGoogle,
  signOutAdmin,
} from '../firebase';
import { playDigitalSound } from '../utils/audioEffects';

const CONTRIBUTOR_SESSION_KEY = 'sai_group_contributor_email';

interface BureauStructureModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: AppData;
  isAdminLoggedIn?: boolean;
  onOpenAdminGroupWorks?: () => void;
  onGroupWorkSaved?: (savedItem: GroupWorkItem) => void;
}

interface UnifiedGroupWork {
  id: string;
  groupId: BureauGroupId;
  missionIndexes?: number[];
  title: string;
  description: string;
  imageUrl: string;
  galleryImages?: string[];
  date: string;
  linkUrl?: string;
  badge?: string;
  mediaType?: 'photo' | 'infographic' | 'video' | 'report';
  source: 'groupWork' | 'mediaLibrary' | 'heroStory' | 'viralClip';
}

const ACCENT_STYLES: Record<
  'amber' | 'cyan' | 'emerald' | 'indigo',
  {
    activeBorder: string;
    activeBg: string;
    badgeBg: string;
    badgeText: string;
    iconBg: string;
    dot: string;
    ring: string;
  }
> = {
  amber: {
    activeBorder: 'border-amber-400 shadow-[0_0_28px_rgba(245,158,11,0.28)]',
    activeBg: 'bg-gradient-to-br from-amber-500/18 via-[#0a1d48]/95 to-[#061333]',
    badgeBg: 'bg-amber-400/20 border-amber-400/40',
    badgeText: 'text-amber-300',
    iconBg: 'bg-amber-500/20 text-amber-300 border-amber-400/40',
    dot: 'bg-amber-400',
    ring: 'ring-amber-400/40',
  },
  cyan: {
    activeBorder: 'border-cyan-400 shadow-[0_0_28px_rgba(34,211,238,0.28)]',
    activeBg: 'bg-gradient-to-br from-cyan-500/18 via-[#0a1d48]/95 to-[#061333]',
    badgeBg: 'bg-cyan-400/20 border-cyan-400/40',
    badgeText: 'text-cyan-300',
    iconBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40',
    dot: 'bg-cyan-400',
    ring: 'ring-cyan-400/40',
  },
  emerald: {
    activeBorder: 'border-emerald-400 shadow-[0_0_28px_rgba(52,211,153,0.28)]',
    activeBg: 'bg-gradient-to-br from-emerald-500/18 via-[#0a1d48]/95 to-[#061333]',
    badgeBg: 'bg-emerald-400/20 border-emerald-400/40',
    badgeText: 'text-emerald-300',
    iconBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40',
    dot: 'bg-emerald-400',
    ring: 'ring-emerald-400/40',
  },
  indigo: {
    activeBorder: 'border-indigo-400 shadow-[0_0_28px_rgba(129,140,248,0.28)]',
    activeBg: 'bg-gradient-to-br from-indigo-500/20 via-[#0a1d48]/95 to-[#061333]',
    badgeBg: 'bg-indigo-400/20 border-indigo-400/40',
    badgeText: 'text-indigo-300',
    iconBg: 'bg-indigo-500/20 text-indigo-300 border-indigo-400/40',
    dot: 'bg-indigo-400',
    ring: 'ring-indigo-400/40',
  },
};

function renderGroupIcon(groupId: BureauGroupId, className = 'w-5 h-5') {
  switch (groupId) {
    case 'group-media-relations':
      return <Megaphone className={className} />;
    case 'group-corp-strategy':
      return <Compass className={className} />;
    case 'group-media-production':
      return <Clapperboard className={className} />;
    case 'group-general-admin':
      return <FolderKanban className={className} />;
  }
}

function getMediaTypeMeta(mediaType?: string) {
  switch (mediaType) {
    case 'video':
      return { label: 'วิดีโอ / ถ่ายทอดสด', icon: <Film className="w-3 h-3" /> };
    case 'infographic':
      return { label: 'อินโฟกราฟิก', icon: <BarChart3 className="w-3 h-3" /> };
    case 'report':
      return { label: 'รายงาน / เอกสาร', icon: <FileText className="w-3 h-3" /> };
    default:
      return { label: 'ภาพกิจกรรม', icon: <Camera className="w-3 h-3" /> };
  }
}

function getSourceLabel(source: UnifiedGroupWork['source']) {
  switch (source) {
    case 'mediaLibrary':
      return 'Media Library';
    case 'heroStory':
      return 'ข่าวเด่น Highlight';
    case 'viralClip':
      return 'คลิปไวรัล';
    default:
      return null;
  }
}

const createBlankDraft = (groupId: BureauGroupId): Partial<GroupWorkItem> => ({
  groupId: groupId === 'group-general-admin' ? 'group-media-relations' : groupId,
  missionIndexes: [],
  galleryImages: [],
  title: '',
  description: '',
  imageUrl: '/src/assets/images/sai_press_photo_1791791796122.jpg',
  workDate: new Date().toISOString().split('T')[0],
  linkUrl: '',
  badge: '',
  mediaType: 'photo',
});

export const BureauStructureModal: React.FC<BureauStructureModalProps> = ({
  isOpen,
  onClose,
  data,
  isAdminLoggedIn = false,
  onOpenAdminGroupWorks,
  onGroupWorkSaved,
}) => {
  const [selectedGroupId, setSelectedGroupId] = useState<BureauGroupId>('group-media-relations');
  const [selectedMissionIndex, setSelectedMissionIndex] = useState<number | null>(null);
  const [selectedWork, setSelectedWork] = useState<UnifiedGroupWork | null>(null);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  // Right-panel tab state (works view vs standalone contributor submission)
  const [rightTab, setRightTab] = useState<'works' | 'submit'>('works');
  const [contributorEmailInput, setContributorEmailInput] = useState('');
  const [isContributorUnlocked, setIsContributorUnlocked] = useState(false);
  const [contributorEmailActive, setContributorEmailActive] = useState<string | null>(null);
  const [isAuthenticatingContributor, setIsAuthenticatingContributor] = useState(false);
  const [contributorError, setContributorError] = useState<string | null>(null);
  const [contributorNotice, setContributorNotice] = useState<string | null>(null);

  // Draft add/edit state inside 'ส่งผลงานกลุ่มงาน' tab
  const [editingDraft, setEditingDraft] = useState<Partial<GroupWorkItem>>(() =>
    createBlankDraft('group-media-relations')
  );
  const [galleryUrlInput, setGalleryUrlInput] = useState('');
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  const [isSavingWork, setIsSavingWork] = useState(false);

  const detailPanelRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const submitFormRef = useRef<HTMLFormElement | null>(null);
  const coverInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);

  // Sync standalone contributor unlock state with sessionStorage & Firebase Auth
  useEffect(() => {
    const syncContributorState = (email?: string | null) => {
      const savedEmail =
        typeof window !== 'undefined' ? window.sessionStorage.getItem(CONTRIBUTOR_SESSION_KEY) : null;
      if (savedEmail === GROUP_CONTRIBUTOR_EMAIL && isAuthorizedPortalEmail(email)) {
        setIsContributorUnlocked(true);
        setContributorEmailActive(GROUP_CONTRIBUTOR_EMAIL);
      } else {
        setIsContributorUnlocked(false);
        setContributorEmailActive(null);
      }
    };

    syncContributorState(auth.currentUser?.email);
    const unsub = onAuthStateChanged(auth, (user) => {
      syncContributorState(user?.email);
    });
    return () => unsub();
  }, []);

  const lightboxPhotos = useMemo(() => {
    if (!selectedWork) return [];
    const list = [selectedWork.imageUrl, ...(selectedWork.galleryImages || [])].filter(Boolean);
    return Array.from(new Set(list));
  }, [selectedWork]);

  useEffect(() => {
    setActivePhotoIndex(0);
  }, [selectedWork?.id]);

  // Lock body scroll & support Esc / Arrow keys
  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedWork) {
          setSelectedWork(null);
        } else {
          onClose();
        }
      } else if (selectedWork && lightboxPhotos.length > 1) {
        if (e.key === 'ArrowRight') {
          setActivePhotoIndex((prev) => (prev + 1) % lightboxPhotos.length);
        } else if (e.key === 'ArrowLeft') {
          setActivePhotoIndex((prev) => (prev - 1 + lightboxPhotos.length) % lightboxPhotos.length);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, selectedWork, lightboxPhotos.length, onClose]);

  // Reset detail lightbox on close
  useEffect(() => {
    if (!isOpen) {
      setSelectedWork(null);
      setSelectedMissionIndex(null);
      setContributorError(null);
      setContributorNotice(null);
    }
  }, [isOpen]);

  // Combine GroupWorks + PublishedWorks + HeroStories + ViralClips tagged with bureauGroup
  const worksByGroup = useMemo(() => {
    const map: Record<BureauGroupId, UnifiedGroupWork[]> = {
      'group-media-relations': [],
      'group-corp-strategy': [],
      'group-media-production': [],
      'group-general-admin': [],
    };

    const rawGroupWorks: GroupWorkItem[] =
      data.groupWorks !== undefined ? data.groupWorks : defaultGroupWorks;

    const seenIds = new Set<string>();

    for (const gw of rawGroupWorks) {
      if (!map[gw.groupId] || gw.groupId === 'group-general-admin') continue;
      seenIds.add(gw.id);
      map[gw.groupId].push({
        id: gw.id,
        groupId: gw.groupId,
        missionIndexes: gw.missionIndexes,
        title: gw.title,
        description: gw.description,
        imageUrl: gw.imageUrl,
        galleryImages: gw.galleryImages,
        date: gw.workDate,
        linkUrl: gw.linkUrl,
        badge: gw.badge,
        mediaType: gw.mediaType || 'photo',
        source: 'groupWork',
      });
    }

    for (const pw of data.publishedWorks || ([] as PublishedWork[])) {
      if (
        !pw.bureauGroup ||
        pw.bureauGroup === 'group-general-admin' ||
        !map[pw.bureauGroup] ||
        seenIds.has(pw.id)
      ) {
        continue;
      }
      seenIds.add(pw.id);
      map[pw.bureauGroup].push({
        id: pw.id,
        groupId: pw.bureauGroup,
        missionIndexes: pw.missionIndexes,
        title: pw.title,
        description: pw.description,
        imageUrl: pw.imageUrl,
        date: pw.publishDate,
        linkUrl: pw.linkUrl,
        badge: pw.badge || pw.category,
        mediaType: pw.mediaType || 'photo',
        source: 'mediaLibrary',
      });
    }

    for (const hs of data.heroStories || ([] as HeroStory[])) {
      if (
        !hs.bureauGroup ||
        hs.bureauGroup === 'group-general-admin' ||
        !map[hs.bureauGroup] ||
        seenIds.has(hs.id)
      ) {
        continue;
      }
      seenIds.add(hs.id);
      map[hs.bureauGroup].push({
        id: hs.id,
        groupId: hs.bureauGroup,
        missionIndexes: hs.missionIndexes,
        title: hs.title,
        description: hs.subtitle,
        imageUrl: hs.imageUrl,
        date: hs.date,
        linkUrl: hs.linkUrl,
        badge: hs.badge || hs.category,
        mediaType: hs.mediaType || 'photo',
        source: 'heroStory',
      });
    }

    for (const vc of data.viralClips || ([] as ViralClip[])) {
      if (
        !vc.bureauGroup ||
        vc.bureauGroup === 'group-general-admin' ||
        !map[vc.bureauGroup] ||
        seenIds.has(vc.id)
      ) {
        continue;
      }
      seenIds.add(vc.id);
      map[vc.bureauGroup].push({
        id: vc.id,
        groupId: vc.bureauGroup,
        missionIndexes: vc.missionIndexes,
        title: vc.title,
        description: vc.highlight || `จัดทำโดย ${vc.creator} (${vc.duration})`,
        imageUrl: vc.thumbnail,
        date: vc.duration ? `ความยาว ${vc.duration}` : 'คลิปวิดีโอ',
        linkUrl: vc.linkUrl,
        badge: vc.creator,
        mediaType: 'video',
        source: 'viralClip',
      });
    }

    (Object.keys(map) as BureauGroupId[]).forEach((gId) => {
      map[gId].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    });

    return map;
  }, [data.groupWorks, data.publishedWorks, data.heroStories, data.viralClips]);

  const totalLinkedWorks = useMemo(() => {
    return Object.values(worksByGroup).reduce((sum, list) => sum + list.length, 0);
  }, [worksByGroup]);

  if (!isOpen) return null;

  const rawGroupWorks: GroupWorkItem[] =
    data.groupWorks !== undefined ? data.groupWorks : defaultGroupWorks;

  const activeGroup = BUREAU_GROUPS.find((g) => g.id === selectedGroupId) || BUREAU_GROUPS[0];
  const activeAccent = ACCENT_STYLES[activeGroup.accentColor];
  const activeGroupShowsWorks = activeGroup.showWorks !== false;
  const allGroupWorks = activeGroupShowsWorks ? worksByGroup[activeGroup.id] || [] : [];
  const displayedWorks =
    selectedMissionIndex !== null
      ? allGroupWorks.filter((w) => w.missionIndexes?.includes(selectedMissionIndex))
      : allGroupWorks;

  const editableWorksForActiveGroup = activeGroupShowsWorks
    ? rawGroupWorks
        .filter((w) => w.groupId === activeGroup.id)
        .sort((a, b) => (b.workDate || '').localeCompare(a.workDate || ''))
    : [];

  const compressImageToDataUrl = (file: File, maxWidth = 1024, quality = 0.76): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const src = ev.target?.result as string;
        if (!src) return reject(new Error('ไม่สามารถอ่านไฟล์ภาพได้'));
        const img = new Image();
        img.onload = () => {
          let w = img.width;
          let h = img.height;
          if (w > maxWidth) {
            h = Math.round((h * maxWidth) / w);
            w = maxWidth;
          }
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          if (!ctx) return resolve(src);
          ctx.drawImage(img, 0, 0, w, h);
          const compressed = canvas.toDataURL('image/jpeg', quality);
          resolve(compressed.length < src.length ? compressed : src);
        };
        img.onerror = () => resolve(src);
        img.src = src;
      };
      reader.onerror = () => reject(new Error('อ่านไฟล์ไม่สำเร็จ'));
      reader.readAsDataURL(file);
    });
  };

  const handleSelectGroup = (groupId: BureauGroupId) => {
    playDigitalSound('select');
    setSelectedGroupId(groupId);
    setSelectedMissionIndex(null);
    setContributorError(null);
    setContributorNotice(null);
    setGalleryUrlInput('');
    if (groupId === 'group-general-admin') {
      setRightTab('works');
    } else {
      setEditingDraft(createBlankDraft(groupId));
    }
    if (typeof window !== 'undefined' && window.innerWidth < 1024 && detailPanelRef.current) {
      setTimeout(() => {
        detailPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 60);
    }
  };

  const handleToggleMissionFilter = (missionNumber: number) => {
    if (!activeGroupShowsWorks) return;
    playDigitalSound('blip');
    setSelectedMissionIndex((prev) => (prev === missionNumber ? null : missionNumber));
  };

  const handleWorkLinkClick = (url?: string) => {
    if (!url) return;
    if (url.startsWith('#')) {
      setSelectedWork(null);
      onClose();
      setTimeout(() => {
        const target = document.querySelector(url);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      }, 150);
    } else {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleContributorEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContributorError(null);
    setContributorNotice(null);

    const typed = contributorEmailInput.trim().toLowerCase();
    if (!typed) {
      setContributorError(`กรุณาพิมพ์อีเมล ${GROUP_CONTRIBUTOR_EMAIL}`);
      playDigitalSound('blip');
      return;
    }

    if (typed !== GROUP_CONTRIBUTOR_EMAIL) {
      setContributorError(
        `สิทธิ์ส่งผลงานกลุ่มงานใช้ได้เฉพาะอีเมล ${GROUP_CONTRIBUTOR_EMAIL} เท่านั้น (ไม่ต้องใช้ Passcode)`
      );
      playDigitalSound('blip');
      return;
    }

    setIsAuthenticatingContributor(true);
    playDigitalSound('select');

    try {
      const currentEmail = auth.currentUser?.email?.trim().toLowerCase();
      if (!auth.currentUser || !isAuthorizedPortalEmail(currentEmail)) {
        await signInGroupContributorWithGoogle(GROUP_CONTRIBUTOR_EMAIL);
      }

      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem(CONTRIBUTOR_SESSION_KEY, GROUP_CONTRIBUTOR_EMAIL);
      }
      setIsContributorUnlocked(true);
      setContributorEmailActive(GROUP_CONTRIBUTOR_EMAIL);
      setEditingDraft(createBlankDraft(activeGroup.id));
      setContributorNotice(`เข้าสู่โหมดส่งผลงานกลุ่มงานด้วยบัญชี ${GROUP_CONTRIBUTOR_EMAIL} เรียบร้อยแล้ว`);
      playDigitalSound('confirm');
    } catch (err: any) {
      console.error('Group contributor sign-in error:', err);
      const code = err?.code || '';
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
        setContributorError('ยกเลิกหน้าต่างยืนยันบัญชี Google กรุณากดลองใหม่อีกครั้ง');
      } else if (code === 'auth/popup-blocked') {
        setContributorError('เบราว์เซอร์บล็อกหน้าต่างป๊อปอัป กรุณาอนุญาต Pop-up สำหรับเว็บไซต์นี้แล้วลองใหม่');
      } else if (code === 'auth/unauthorized-domain') {
        const host = typeof window !== 'undefined' ? window.location.hostname : '';
        setContributorError(
          `โดเมน "${host}" ยังไม่ได้รับอนุญาตใน Firebase Authentication (Authorized domains)`
        );
      } else {
        setContributorError(err?.message || 'ไม่สามารถเปิดสิทธิ์ส่งผลงานได้ กรุณาลองใหม่อีกครั้ง');
      }
      playDigitalSound('blip');
    } finally {
      setIsAuthenticatingContributor(false);
    }
  };

  const handleContributorLogout = async () => {
    playDigitalSound('blip');
    if (typeof window !== 'undefined') {
      window.sessionStorage.removeItem(CONTRIBUTOR_SESSION_KEY);
    }
    setIsContributorUnlocked(false);
    setContributorEmailActive(null);
    setContributorEmailInput('');
    setContributorError(null);
    setContributorNotice(null);
    setEditingDraft(createBlankDraft(activeGroup.id));
    if (isGroupContributorEmail(auth.currentUser?.email)) {
      await signOutAdmin().catch(() => null);
    }
  };

  const handleUploadDraftCover = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingCover(true);
    setContributorError(null);
    try {
      const dataUrl = await compressImageToDataUrl(file, 1024, 0.76);
      if (dataUrl.length > 680000) {
        setContributorError('ขนาดไฟล์ภาพปกใหญ่เกินขีดจำกัด กรุณาเลือกภาพที่ขนาดเล็กลงหรือวางลิงก์ภาพ URL แทน');
        return;
      }
      setEditingDraft((prev) => ({ ...prev, imageUrl: dataUrl }));
      playDigitalSound('confirm');
    } catch {
      setContributorError('ไม่สามารถอ่านไฟล์ภาพปกได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsUploadingCover(false);
      e.target.value = '';
    }
  };

  const handleUploadDraftGallery = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const currentGallery = editingDraft.galleryImages || [];
    const remainingSlots = Math.max(0, 5 - currentGallery.length);
    if (remainingSlots === 0) {
      setContributorError('ภาพประกอบเพิ่มเติมรองรับสูงสุด 5 ภาพต่อ 1 ผลงาน');
      e.target.value = '';
      return;
    }

    setIsUploadingGallery(true);
    setContributorError(null);
    try {
      const toProcess = files.slice(0, remainingSlots);
      const uploaded: string[] = [];
      for (const file of toProcess) {
        const dataUrl = await compressImageToDataUrl(file, 850, 0.68);
        uploaded.push(dataUrl);
      }
      setEditingDraft((prev) => ({
        ...prev,
        galleryImages: [...(prev.galleryImages || []), ...uploaded].slice(0, 5),
      }));
      playDigitalSound('confirm');
    } catch {
      setContributorError('ไม่สามารถอัปโหลดภาพประกอบได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsUploadingGallery(false);
      e.target.value = '';
    }
  };

  const handleSaveContributorWork = async (e: React.FormEvent) => {
    e.preventDefault();
    setContributorError(null);
    setContributorNotice(null);

    const title = (editingDraft.title || '').trim();
    const description = (editingDraft.description || '').trim();
    const imageUrl = (editingDraft.imageUrl || '').trim();
    const workDate = (editingDraft.workDate || new Date().toISOString().split('T')[0]).trim();
    const groupId = editingDraft.groupId || activeGroup.id;

    if (!title || !description || !imageUrl || groupId === 'group-general-admin') {
      setContributorError('กรุณากรอกชื่อผลงาน รายละเอียด และภาพปกให้ครบถ้วน');
      playDigitalSound('blip');
      return;
    }

    if (imageUrl.length > 700000) {
      setContributorError('ภาพปกมีขนาดใหญ่เกิน 700KB กรุณาเปลี่ยนภาพใหม่หรือวางลิงก์ URL แทน');
      playDigitalSound('blip');
      return;
    }

    const cleanMissions = Array.from(
      new Set((editingDraft.missionIndexes || []).filter((n) => Number.isInteger(n) && n >= 1))
    )
      .sort((a, b) => a - b)
      .slice(0, 10);

    const cleanGallery = (editingDraft.galleryImages || [])
      .map((u) => u.trim())
      .filter(Boolean)
      .slice(0, 5);

    const isEdit = Boolean(editingDraft.id);
    const existing = editingDraft.id
      ? rawGroupWorks.find((w) => w.id === editingDraft.id)
      : undefined;

    const itemToSave: GroupWorkItem = existing
      ? {
          ...existing,
          groupId,
          missionIndexes: cleanMissions.length > 0 ? cleanMissions : undefined,
          title: title.slice(0, 300),
          description: description.slice(0, 2000),
          imageUrl,
          galleryImages: cleanGallery.length > 0 ? cleanGallery : undefined,
          workDate: workDate.slice(0, 50),
          linkUrl: editingDraft.linkUrl?.trim() ? editingDraft.linkUrl.trim().slice(0, 1000) : undefined,
          badge: editingDraft.badge?.trim() ? editingDraft.badge.trim().slice(0, 100) : undefined,
          mediaType: editingDraft.mediaType || 'photo',
          updatedAt: new Date().toISOString(),
        }
      : {
          id: `gw-${Date.now()}`,
          groupId,
          missionIndexes: cleanMissions.length > 0 ? cleanMissions : undefined,
          title: title.slice(0, 300),
          description: description.slice(0, 2000),
          imageUrl,
          galleryImages: cleanGallery.length > 0 ? cleanGallery : undefined,
          workDate: workDate.slice(0, 50),
          linkUrl: editingDraft.linkUrl?.trim() ? editingDraft.linkUrl.trim().slice(0, 1000) : undefined,
          badge: editingDraft.badge?.trim() ? editingDraft.badge.trim().slice(0, 100) : undefined,
          mediaType: editingDraft.mediaType || 'photo',
          updatedAt: new Date().toISOString(),
        };

    const approxSize = JSON.stringify(itemToSave).length;
    if (approxSize > 950000) {
      setContributorError(
        'ขนาดข้อมูลและภาพรวมกันเกินขีดจำกัด 1MB ของฐานข้อมูล กรุณาลดจำนวนภาพที่อัปโหลดจากเครื่องหรือใช้ลิงก์ URL แทน'
      );
      playDigitalSound('blip');
      return;
    }

    setIsSavingWork(true);
    playDigitalSound('select');
    try {
      await saveSingleItemToFirestore('groupWorks', itemToSave);
      onGroupWorkSaved?.(itemToSave);
      setEditingDraft(createBlankDraft(activeGroup.id));
      setGalleryUrlInput('');
      setContributorNotice(
        isEdit
          ? `แก้ไขผลงาน "${itemToSave.title}" เรียบร้อยแล้ว`
          : `เพิ่มผลงาน "${itemToSave.title}" เข้าสู่ระบบเรียบร้อยแล้ว`
      );
      playDigitalSound('confirm');
    } catch (err: any) {
      console.error('Save group work error:', err);
      setContributorError(
        err?.message || 'ไม่สามารถบันทึกผลงานได้ กรุณาตรวจสอบว่าเชื่อมต่อบัญชี auditpicture@gmail.com แล้ว'
      );
      playDigitalSound('blip');
    } finally {
      setIsSavingWork(false);
    }
  };

  const activeLightboxPhoto =
    lightboxPhotos[activePhotoIndex] || selectedWork?.imageUrl || '/assets/images/sai_audit_hero_1791689796943.jpg';

  return (
    <div
      className="fixed inset-0 z-[75] flex flex-col bg-[#020818] text-slate-100 animate-fadeIn overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-label="โครงสร้างและภารกิจสำนักประชาสัมพันธ์และสื่อสารองค์กร"
    >
      {/* Subtle Ambient Background Gradient */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-70"
        style={{
          backgroundImage: [
            'radial-gradient(700px 420px at 50% 0%, rgba(245, 158, 11, 0.14), transparent 70%)',
            'radial-gradient(600px 450px at 10% 70%, rgba(14, 165, 233, 0.12), transparent 70%)',
            'radial-gradient(600px 450px at 90% 80%, rgba(16, 185, 129, 0.10), transparent 70%)',
          ].join(', '),
        }}
        aria-hidden="true"
      />

      {/* Top Sticky Executive Bar */}
      <header className="relative z-20 shrink-0 bg-[#040f2c]/95 backdrop-blur-xl border-b border-amber-400/30 shadow-[0_6px_30px_rgba(0,0,0,0.65)]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400/25 to-amber-600/15 border border-amber-400/50 flex items-center justify-center shrink-0 shadow-[0_0_16px_rgba(245,158,11,0.25)]">
              <Network className="w-5 h-5 text-amber-300" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base lg:text-lg font-bold text-white truncate">
                โครงสร้างและภารกิจภายใน{BUREAU_TITLE}
              </h2>
              <p className="text-[11px] sm:text-xs text-amber-300/90 truncate">
                {BUREAU_SUBTITLE} · 4 กลุ่มงานหลัก · {totalLinkedWorks} ผลงานเชื่อมโยง
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isAdminLoggedIn && onOpenAdminGroupWorks && (
              <button
                type="button"
                onClick={() => {
                  playDigitalSound('select');
                  onClose();
                  onOpenAdminGroupWorks();
                }}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/40 text-cyan-200 text-xs font-semibold transition-all cursor-pointer"
              >
                <Settings2 className="w-3.5 h-3.5" />
                <span>จัดการใน Admin</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                playDigitalSound('blip');
                onClose();
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-rose-500/25 border border-slate-600/60 hover:border-rose-400/60 text-slate-200 hover:text-white text-xs font-semibold transition-all cursor-pointer"
              title="ปิดหน้าต่างเต็มจอ (Esc)"
            >
              <X className="w-4 h-4" />
              <span className="hidden sm:inline">ปิดหน้าต่าง</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Scrollable Full-Screen Canvas */}
      <div
        ref={scrollContainerRef}
        className="relative z-10 flex-1 overflow-y-auto overscroll-contain"
      >
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-7">
          {/* Interactive Org Chart Tree Header */}
          <section aria-label="แผนผังโครงสร้างสำนักประชาสัมพันธ์และสื่อสารองค์กร">
            {/* Root Bureau & Executive Position Node (Position Title Only - No Names) */}
            <div className="flex flex-col items-center">
              <div className="relative px-6 py-4 rounded-2xl bg-gradient-to-r from-[#091c4a] via-[#0d2661] to-[#091c4a] border border-amber-400/60 shadow-[0_8px_32px_rgba(245,158,11,0.2)] text-center max-w-xl w-full sm:w-auto space-y-1.5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/40 text-[11px] font-bold text-amber-200">
                  <UserCheck className="w-3.5 h-3.5 text-amber-300" />
                  <span>{BUREAU_EXECUTIVE_TITLE}</span>
                </div>
                <h3 className="text-base sm:text-xl font-bold bg-gradient-to-r from-white via-amber-100 to-amber-300 bg-clip-text text-transparent">
                  {BUREAU_TITLE}
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-300">
                  คลิกเลือกกลุ่มงานด้านล่างเพื่อดูภารกิจสำคัญ และคลิกที่ข้อภารกิจเพื่อกรองผลงานที่เกี่ยวข้อง
                </p>
              </div>

              {/* Org Chart Branch Connector Lines (Desktop) */}
              <div className="hidden lg:flex flex-col items-center w-full max-w-5xl" aria-hidden="true">
                <div className="w-[2px] h-6 bg-gradient-to-b from-amber-400/70 to-amber-400/40" />
                <div className="w-[76%] h-[2px] bg-gradient-to-r from-amber-400/40 via-cyan-400/50 to-indigo-400/40" />
                <div className="w-full grid grid-cols-4 px-8">
                  <div className="flex justify-center"><div className="w-[2px] h-5 bg-amber-400/45" /></div>
                  <div className="flex justify-center"><div className="w-[2px] h-5 bg-cyan-400/45" /></div>
                  <div className="flex justify-center"><div className="w-[2px] h-5 bg-emerald-400/45" /></div>
                  <div className="flex justify-center"><div className="w-[2px] h-5 bg-indigo-400/45" /></div>
                </div>
              </div>
              <div className="lg:hidden h-4" />
            </div>

            {/* 4 Bureau Group Selector Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
              {BUREAU_GROUPS.map((group) => {
                const isSelected = group.id === selectedGroupId;
                const accent = ACCENT_STYLES[group.accentColor];
                const groupCount = (worksByGroup[group.id] || []).length;

                return (
                  <button
                    key={group.id}
                    type="button"
                    onClick={() => handleSelectGroup(group.id)}
                    className={`group text-left p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between gap-3 ${
                      isSelected
                        ? `${accent.activeBg} ${accent.activeBorder} ring-1 ${accent.ring} -translate-y-0.5`
                        : 'bg-[#061438]/75 border-slate-700/60 hover:border-slate-500/80 hover:bg-[#091c4a]/80'
                    }`}
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${accent.badgeBg} ${accent.badgeText}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${accent.dot}`} />
                          <span>กลุ่มงานที่ {group.order}</span>
                        </span>
                        <div className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 ${accent.iconBg}`}>
                          {renderGroupIcon(group.id, 'w-4 h-4')}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm sm:text-[15px] font-bold text-white leading-snug group-hover:text-amber-200 transition-colors">
                          {group.name}
                        </h4>
                        <p className="text-[11px] text-slate-300/90 line-clamp-2 mt-1 leading-relaxed">
                          {group.summary}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2.5 border-t border-white/10 text-[11px]">
                      <span className="text-slate-300 font-medium">
                        ภารกิจ {group.missions.length} ด้าน
                        {group.showWorks !== false ? (
                          <>
                            {' '}·{' '}
                            <strong className={accent.badgeText}>{groupCount} ผลงาน</strong>
                          </>
                        ) : (
                          <span className="text-slate-400"> · งานอำนวยการ</span>
                        )}
                      </span>
                      <span
                        className={`inline-flex items-center gap-0.5 font-semibold transition-transform ${
                          isSelected ? `${accent.badgeText} translate-x-0.5` : 'text-slate-400 group-hover:text-white'
                        }`}
                      >
                        <span>{isSelected ? 'กำลังแสดง' : 'เปิดดู'}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Active Group Detail Workspace: Missions (Left/Full) + Linked Works (Right when enabled) */}
          <section
            ref={detailPanelRef}
            className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-start pb-6"
            aria-label={`รายละเอียดของ ${activeGroup.name}`}
          >
            {/* Missions of the Selected Group (Interactive Tag Filtering when works enabled) */}
            <div
              className={`${
                activeGroupShowsWorks ? 'lg:col-span-5' : 'lg:col-span-12'
              } rounded-2xl bg-[#061438]/90 border border-white/15 p-5 sm:p-6 shadow-xl space-y-5`}
            >
              <div className="flex items-start gap-3.5 pb-4 border-b border-white/10">
                <div className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 ${activeAccent.iconBg}`}>
                  {renderGroupIcon(activeGroup.id, 'w-5 h-5')}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${activeAccent.badgeBg} ${activeAccent.badgeText}`}
                    >
                      กลุ่มงานที่ {activeGroup.order}
                    </span>
                    <span className="text-[11px] text-slate-400 truncate">{activeGroup.englishName}</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-white leading-snug">
                    {activeGroup.name}
                  </h3>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#040e28]/80 border border-white/10">
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                  {activeGroup.summary}
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-amber-300">
                    <Layers className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>
                      ภารกิจสำคัญของกลุ่มงาน
                      {activeGroupShowsWorks && (
                        <span className="ml-1.5 text-[11px] font-normal text-slate-400">
                          (กดเลือกข้อเพื่อกรองผลงาน)
                        </span>
                      )}
                    </span>
                  </div>

                  {activeGroupShowsWorks && selectedMissionIndex !== null && (
                    <button
                      type="button"
                      onClick={() => setSelectedMissionIndex(null)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-400/15 hover:bg-amber-400/25 border border-amber-400/40 text-amber-200 text-[11px] font-semibold cursor-pointer transition-colors"
                    >
                      <Filter className="w-3 h-3" />
                      <span>แสดงทุกภารกิจ</span>
                    </button>
                  )}
                </div>

                <ol
                  className={
                    activeGroupShowsWorks
                      ? 'space-y-2.5'
                      : 'grid grid-cols-1 md:grid-cols-3 gap-3.5'
                  }
                >
                  {activeGroup.missions.map((mission, idx) => {
                    const missionNumber = idx + 1;
                    const matchCount = activeGroupShowsWorks
                      ? allGroupWorks.filter((w) => w.missionIndexes?.includes(missionNumber)).length
                      : 0;
                    const isMissionSelected =
                      activeGroupShowsWorks && selectedMissionIndex === missionNumber;

                    if (!activeGroupShowsWorks) {
                      return (
                        <li
                          key={idx}
                          className="flex items-start gap-3 p-3.5 rounded-xl bg-[#040e28]/70 border border-white/8"
                        >
                          <span
                            className={`w-6 h-6 rounded-lg border text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5 ${activeAccent.badgeBg} ${activeAccent.badgeText}`}
                          >
                            {missionNumber}
                          </span>
                          <p className="text-xs sm:text-[13px] text-slate-200 leading-relaxed">
                            {mission}
                          </p>
                        </li>
                      );
                    }

                    return (
                      <li key={idx}>
                        <button
                          type="button"
                          onClick={() => handleToggleMissionFilter(missionNumber)}
                          className={`w-full text-left flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer ${
                            isMissionSelected
                              ? `${activeAccent.activeBg} ${activeAccent.activeBorder} ring-1 ${activeAccent.ring}`
                              : 'bg-[#040e28]/70 border-white/10 hover:border-amber-400/45 hover:bg-[#081942]/80'
                          }`}
                        >
                          <span
                            className={`w-6 h-6 rounded-lg border text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5 ${
                              isMissionSelected
                                ? 'bg-amber-400 text-slate-950 border-amber-300'
                                : `${activeAccent.badgeBg} ${activeAccent.badgeText}`
                            }`}
                          >
                            {missionNumber}
                          </span>
                          <div className="flex-1 min-w-0 space-y-1.5">
                            <p className="text-xs sm:text-[13px] text-slate-200 leading-relaxed">
                              {mission}
                            </p>
                            <div className="flex items-center justify-between gap-2 text-[10px]">
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border font-semibold ${
                                  matchCount > 0
                                    ? `${activeAccent.badgeBg} ${activeAccent.badgeText}`
                                    : 'bg-slate-800/70 border-slate-700 text-slate-400'
                                }`}
                              >
                                <Filter className="w-2.5 h-2.5" />
                                <span>
                                  {matchCount > 0
                                    ? `${matchCount} ผลงานเชื่อมโยง`
                                    : 'ยังไม่มีผลงานติดแท็ก'}
                                </span>
                              </span>
                              <span className="text-slate-400">
                                {isMissionSelected ? 'คลิกอีกครั้งเพื่อแสดงทั้งหมด' : 'คลิกกรองผลงาน'}
                              </span>
                            </div>
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ol>
              </div>
            </div>

            {/* Right Column: Linked Works & Standalone Submission Tab (Groups 1, 2, 3 ONLY) */}
            {activeGroupShowsWorks && (
              <div className="lg:col-span-7 rounded-2xl bg-[#061438]/90 border border-white/15 p-5 sm:p-6 shadow-xl space-y-5">
                {/* Right Column Header + Standalone Two-Tab Bar */}
                <div className="flex flex-col gap-3.5 pb-4 border-b border-white/10">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${activeAccent.dot}`} />
                        <h3 className="text-base sm:text-lg font-bold text-white">
                          {rightTab === 'submit'
                            ? `ส่งผลงานกลุ่มงาน · ${activeGroup.shortName}`
                            : `ผลงานและกิจกรรมของ${activeGroup.shortName}`}
                        </h3>
                      </div>
                      <p className="text-xs text-slate-300 mt-0.5">
                        {rightTab === 'submit'
                          ? 'ระบบส่งและแก้ไขผลงานเฉพาะกลุ่มงาน 1–3 (แยกจากระบบ Admin)'
                          : selectedMissionIndex !== null
                          ? `กำลังกรองตามภารกิจข้อที่ ${selectedMissionIndex} (พบ ${displayedWorks.length} จากทั้งหมด ${allGroupWorks.length} รายการ)`
                          : `แสดงภาพและรายละเอียดผลงานที่เชื่อมโยงกับภารกิจของกลุ่ม (${displayedWorks.length} รายการ) — คลิกที่การ์ดเพื่อดูรายละเอียด`}
                      </p>
                    </div>
                  </div>

                  {/* Two-Tab Toggle: ผลงานของกลุ่ม | ส่งผลงานกลุ่มงาน */}
                  <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-[#030d26] border border-white/15 text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => {
                        playDigitalSound('blip');
                        setRightTab('works');
                      }}
                      className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        rightTab === 'works'
                          ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-bold shadow'
                          : 'text-slate-300 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <Eye className="w-3.5 h-3.5 shrink-0" />
                      <span>ผลงานของกลุ่ม ({allGroupWorks.length})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        playDigitalSound('select');
                        setRightTab('submit');
                        setContributorError(null);
                        setContributorNotice(null);
                      }}
                      className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        rightTab === 'submit'
                          ? 'bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-bold shadow'
                          : 'text-amber-200 hover:text-white hover:bg-amber-500/15'
                      }`}
                    >
                      <Plus className="w-3.5 h-3.5 shrink-0" />
                      <span>ส่งผลงานกลุ่มงาน</span>
                    </button>
                  </div>
                </div>

                {rightTab === 'works' ? (
                  <>
                    {/* Active Mission Filter Strip */}
                    {selectedMissionIndex !== null && (
                      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-400/40 flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-2 text-amber-200 font-medium">
                          <Filter className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                          <span>
                            กำลังกรอง: <strong>ภารกิจข้อที่ {selectedMissionIndex}</strong>
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedMissionIndex(null)}
                          className="px-2.5 py-1 rounded-lg bg-slate-900/70 hover:bg-slate-800 border border-amber-400/40 text-amber-200 text-[11px] font-semibold cursor-pointer"
                        >
                          แสดงผลงานทั้งหมด ({allGroupWorks.length})
                        </button>
                      </div>
                    )}

                    {displayedWorks.length === 0 ? (
                      <div className="py-12 px-4 rounded-2xl border border-dashed border-slate-600/60 bg-[#040e28]/50 text-center space-y-2.5">
                        <CheckCircle2 className="w-8 h-8 text-slate-500 mx-auto" />
                        <p className="text-sm font-semibold text-slate-300">
                          {selectedMissionIndex !== null
                            ? `ยังไม่มีผลงานที่ติดแท็กภารกิจข้อที่ ${selectedMissionIndex}`
                            : 'ยังไม่มีรายการผลงานที่เพิ่มในกลุ่มงานนี้'}
                        </p>
                        <p className="text-xs text-slate-400 max-w-md mx-auto">
                          {selectedMissionIndex !== null
                            ? 'สามารถกดดูผลงานทั้งหมดของกลุ่ม หรือส่งผลงานใหม่ได้ในแท็บ "ส่งผลงานกลุ่มงาน"'
                            : `สามารถกดแท็บ "ส่งผลงานกลุ่มงาน" เพื่อเพิ่มภาพและรายละเอียดผลงานของ${activeGroup.name} ได้ทันที`}
                        </p>
                        {selectedMissionIndex !== null ? (
                          <button
                            type="button"
                            onClick={() => setSelectedMissionIndex(null)}
                            className="mt-1 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 border border-amber-400/50 text-amber-200 text-xs font-semibold cursor-pointer"
                          >
                            <span>แสดงผลงานทั้งหมดในกลุ่มนี้</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              playDigitalSound('select');
                              setRightTab('submit');
                            }}
                            className="mt-1 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>ไปที่แท็บส่งผลงานกลุ่มงาน</span>
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {displayedWorks.map((work) => {
                          const mediaMeta = getMediaTypeMeta(work.mediaType);
                          const sourceLabel = getSourceLabel(work.source);
                          const extraPhotosCount = work.galleryImages?.length || 0;

                          return (
                            <article
                              key={work.id}
                              onClick={() => {
                                playDigitalSound('select');
                                setSelectedWork(work);
                              }}
                              className="group rounded-xl overflow-hidden bg-[#040e28]/90 border border-white/12 hover:border-amber-400/60 transition-all duration-200 cursor-pointer flex flex-col shadow-lg hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
                            >
                              <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-900">
                                <img
                                  src={work.imageUrl}
                                  alt={work.title}
                                  loading="lazy"
                                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.onerror = null;
                                    target.src = '/assets/images/sai_audit_hero_1791689796943.jpg';
                                  }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#040e28] via-transparent to-black/25" />

                                {/* Top Badges */}
                                <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-2">
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md border border-white/15 text-[10px] font-medium text-slate-100">
                                    {mediaMeta.icon}
                                    <span>{mediaMeta.label}</span>
                                  </span>
                                  {work.badge && (
                                    <span
                                      className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border backdrop-blur-md bg-[#040e28]/80 ${activeAccent.badgeText} border-white/15 truncate max-w-[140px]`}
                                    >
                                      {work.badge}
                                    </span>
                                  )}
                                </div>

                                {/* Gallery Photo Count Badge */}
                                {extraPhotosCount > 0 && (
                                  <div className="absolute bottom-2 right-2.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-md border border-amber-400/40 text-[10px] font-semibold text-amber-200">
                                    <Images className="w-3 h-3 text-amber-300" />
                                    <span>+{extraPhotosCount} ภาพ</span>
                                  </div>
                                )}
                              </div>

                              <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                                <div>
                                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-1.5">
                                    <Calendar className="w-3 h-3 text-amber-400 shrink-0" />
                                    <span>{work.date || 'อัปเดตล่าสุด'}</span>
                                    {sourceLabel && (
                                      <span className="ml-auto text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                                        {sourceLabel}
                                      </span>
                                    )}
                                  </div>
                                  <h4 className="text-sm font-bold text-white group-hover:text-amber-200 transition-colors line-clamp-2 leading-snug">
                                    {work.title}
                                  </h4>
                                  <p className="text-xs text-slate-300 line-clamp-2 mt-1.5 leading-relaxed">
                                    {work.description}
                                  </p>

                                  {work.missionIndexes && work.missionIndexes.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-2">
                                      {work.missionIndexes.map((mNum) => (
                                        <span
                                          key={mNum}
                                          className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] text-slate-300"
                                        >
                                          ภารกิจ {mNum}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>

                                <div className="pt-2.5 border-t border-white/10 flex items-center justify-between text-[11px] font-semibold text-amber-300">
                                  <span>คลิกดูภาพและรายละเอียด</span>
                                  <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                </div>
                              </div>
                            </article>
                          );
                        })}
                      </div>
                    )}
                  </>
                ) : (
                  /* STANDALONE CONTRIBUTOR TAB: ส่งผลงานกลุ่มงาน (Email-only, No Passcode, Add/Edit Only, No CSV, No Admin) */
                  <div className="space-y-5">
                    {contributorError && (
                      <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/45 text-rose-200 text-xs flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                        <p className="leading-relaxed">{contributorError}</p>
                      </div>
                    )}

                    {contributorNotice && (
                      <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-400/45 text-emerald-200 text-xs flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="font-medium">{contributorNotice}</span>
                      </div>
                    )}

                    {!isContributorUnlocked ? (
                      <form
                        onSubmit={handleContributorEmailSubmit}
                        className="p-5 sm:p-6 rounded-2xl bg-[#040e28]/90 border border-amber-400/40 space-y-4 shadow-lg"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl bg-amber-400/15 border border-amber-400/40 flex items-center justify-center text-amber-300 shrink-0">
                            <Mail className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-white">
                              ยืนยันอีเมลเพื่อส่ง / แก้ไขผลงานกลุ่มงาน
                            </h4>
                            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                              พิมพ์อีเมล{' '}
                              <span className="font-mono text-amber-300 font-semibold">
                                {GROUP_CONTRIBUTOR_EMAIL}
                              </span>{' '}
                              เพื่อเข้าเพิ่มข้อมูลและแก้ไขผลงานของกลุ่มงานได้ทันที (ไม่ต้องกรอก Passcode และไม่เข้าหน้า Admin)
                            </p>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs text-slate-300 font-semibold mb-1.5">
                            อีเมลสำหรับส่งผลงานกลุ่มงาน
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Mail className="w-4 h-4 text-amber-400" />
                            </div>
                            <input
                              type="email"
                              value={contributorEmailInput}
                              onChange={(e) => setContributorEmailInput(e.target.value)}
                              placeholder={GROUP_CONTRIBUTOR_EMAIL}
                              className="w-full pl-9 pr-3 py-2.5 bg-[#020818] border border-amber-400/45 focus:border-amber-300 rounded-xl text-sm text-white outline-none font-mono"
                            />
                          </div>
                        </div>

                        <div className="flex justify-end">
                          <button
                            type="submit"
                            disabled={isAuthenticatingContributor}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/20 cursor-pointer disabled:opacity-60"
                          >
                            {isAuthenticatingContributor ? (
                              <>
                                <RefreshCw className="w-4 h-4 animate-spin" />
                                <span>กำลังตรวจสอบบัญชี...</span>
                              </>
                            ) : (
                              <>
                                <ArrowRight className="w-4 h-4" />
                                <span>เข้าจัดการส่งผลงานกลุ่มงาน</span>
                              </>
                            )}
                          </button>
                        </div>
                      </form>
                    ) : (
                      <>
                        {/* Active Contributor Bar */}
                        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-400/35 flex flex-wrap items-center justify-between gap-2 text-xs">
                          <div className="flex items-center gap-2 text-emerald-200 min-w-0">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span className="truncate">
                              โหมดส่งและแก้ไขผลงาน ·{' '}
                              <strong className="font-mono text-amber-300">
                                {contributorEmailActive || GROUP_CONTRIBUTOR_EMAIL}
                              </strong>
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={handleContributorLogout}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-rose-500/25 border border-slate-700 hover:border-rose-400/50 text-slate-200 text-[11px] font-semibold cursor-pointer transition-colors"
                          >
                            <LogOut className="w-3 h-3" />
                            <span>ออกจากโหมดส่งผลงาน</span>
                          </button>
                        </div>

                        {/* Inline Add / Edit Form (NO CSV, NO Delete) */}
                        <form
                          ref={submitFormRef}
                          onSubmit={handleSaveContributorWork}
                          className="p-4 sm:p-5 rounded-2xl bg-[#040e28]/95 border border-amber-400/35 space-y-3.5 shadow-lg"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-white/10">
                            <h4 className="text-sm font-bold text-white flex items-center gap-2">
                              {editingDraft.id ? (
                                <>
                                  <Edit2 className="w-4 h-4 text-cyan-400" />
                                  <span>กำลังแก้ไขผลงานเดิม</span>
                                </>
                              ) : (
                                <>
                                  <Plus className="w-4 h-4 text-amber-400" />
                                  <span>เพิ่มผลงานใหม่เข้ากลุ่มงานนี้</span>
                                </>
                              )}
                            </h4>
                            {editingDraft.id && (
                              <button
                                type="button"
                                onClick={() => {
                                  playDigitalSound('blip');
                                  setEditingDraft(createBlankDraft(activeGroup.id));
                                  setGalleryUrlInput('');
                                }}
                                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium cursor-pointer"
                              >
                                ยกเลิกแก้ไข / เพิ่มรายการใหม่
                              </button>
                            )}
                          </div>

                          <div>
                            <label className="block text-[11px] text-slate-300 mb-1 font-semibold">
                              กลุ่มงานเจ้าของผลงาน
                            </label>
                            <select
                              value={editingDraft.groupId || activeGroup.id}
                              onChange={(e) =>
                                setEditingDraft({
                                  ...editingDraft,
                                  groupId: e.target.value as BureauGroupId,
                                  missionIndexes: [],
                                })
                              }
                              className="w-full px-3 py-2 bg-[#020818] border border-amber-500/30 rounded-xl text-xs text-white outline-none focus:border-amber-400"
                            >
                              {BUREAU_GROUPS_WITH_WORKS.map((g) => (
                                <option key={g.id} value={g.id}>
                                  กลุ่มงานที่ {g.order}: {g.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Mission Tag Checkboxes */}
                          <div className="p-3 rounded-xl bg-[#020818]/90 border border-amber-400/25 space-y-2">
                            <span className="block text-[11px] text-amber-300 font-semibold">
                              ภารกิจที่เกี่ยวข้องของกลุ่มนี้ (เลือกได้หลายข้อ)
                            </span>
                            <div className="space-y-1.5">
                              {(
                                getBureauGroupById(editingDraft.groupId || activeGroup.id)?.missions || []
                              ).map((mText, idx) => {
                                const mNum = idx + 1;
                                const checked = (editingDraft.missionIndexes || []).includes(mNum);
                                return (
                                  <label
                                    key={mNum}
                                    className="flex items-start gap-2 text-[11px] text-slate-200 cursor-pointer hover:text-white"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={checked}
                                      onChange={() => {
                                        const current = editingDraft.missionIndexes || [];
                                        const next = checked
                                          ? current.filter((n) => n !== mNum)
                                          : [...current, mNum].sort((a, b) => a - b);
                                        setEditingDraft({ ...editingDraft, missionIndexes: next });
                                      }}
                                      className="mt-0.5 accent-amber-400"
                                    />
                                    <span className="leading-relaxed">
                                      <strong className="text-amber-300">ภารกิจ {mNum}:</strong> {mText}
                                    </span>
                                  </label>
                                );
                              })}
                            </div>
                          </div>

                          <div>
                            <label className="block text-[11px] text-slate-300 mb-1 font-semibold">
                              ชื่อผลงาน / กิจกรรม
                            </label>
                            <input
                              type="text"
                              maxLength={300}
                              required
                              value={editingDraft.title || ''}
                              onChange={(e) => setEditingDraft({ ...editingDraft, title: e.target.value })}
                              placeholder="เช่น โครงการสื่อสารเชิงรุกเครือข่ายสื่อมวลชน"
                              className="w-full px-3 py-2 bg-[#020818] border border-cyan-500/30 rounded-xl text-xs text-white outline-none focus:border-cyan-400"
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                              <label className="block text-[11px] text-slate-300 mb-1 font-semibold">
                                รูปแบบสื่อ
                              </label>
                              <select
                                value={editingDraft.mediaType || 'photo'}
                                onChange={(e) =>
                                  setEditingDraft({
                                    ...editingDraft,
                                    mediaType: e.target.value as GroupWorkItem['mediaType'],
                                  })
                                }
                                className="w-full px-3 py-2 bg-[#020818] border border-cyan-500/30 rounded-xl text-xs text-white outline-none focus:border-cyan-400"
                              >
                                <option value="photo">ภาพกิจกรรม (Photo)</option>
                                <option value="infographic">อินโฟกราฟิก (Infographic)</option>
                                <option value="video">วิดีโอ / ถ่ายทอดสด (Video)</option>
                                <option value="report">รายงาน / ข้อเท็จจริง (Report)</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-[11px] text-slate-300 mb-1 font-semibold">
                                วันที่ผลงาน (YYYY-MM-DD)
                              </label>
                              <input
                                type="text"
                                maxLength={50}
                                required
                                value={editingDraft.workDate || ''}
                                onChange={(e) =>
                                  setEditingDraft({ ...editingDraft, workDate: e.target.value })
                                }
                                placeholder="2026-10-15"
                                className="w-full px-3 py-2 bg-[#020818] border border-cyan-500/30 rounded-xl text-xs text-white outline-none focus:border-cyan-400 font-mono"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] text-slate-300 mb-1 font-semibold">
                                ป้ายกำกับย่อย (Badge)
                              </label>
                              <input
                                type="text"
                                maxLength={100}
                                value={editingDraft.badge || ''}
                                onChange={(e) =>
                                  setEditingDraft({ ...editingDraft, badge: e.target.value })
                                }
                                placeholder="เช่น Live Studio"
                                className="w-full px-3 py-2 bg-[#020818] border border-cyan-500/30 rounded-xl text-xs text-white outline-none focus:border-cyan-400"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[11px] text-slate-300 mb-1 font-semibold">
                              รายละเอียดผลงาน (แนะนำ 3–5 บรรทัด)
                            </label>
                            <textarea
                              rows={3}
                              maxLength={2000}
                              required
                              value={editingDraft.description || ''}
                              onChange={(e) =>
                                setEditingDraft({ ...editingDraft, description: e.target.value })
                              }
                              placeholder="อธิบายรายละเอียดกิจกรรมหรือผลงาน..."
                              className="w-full px-3 py-2 bg-[#020818] border border-cyan-500/30 rounded-xl text-xs text-white outline-none focus:border-cyan-400 leading-relaxed"
                            />
                          </div>

                          {/* Cover Image Upload or URL */}
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="block text-[11px] text-slate-300 font-semibold">
                                ภาพปกผลงาน (URL หรืออัปโหลดจากเครื่อง)
                              </label>
                              <input
                                ref={coverInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleUploadDraftCover}
                                className="hidden"
                              />
                              <button
                                type="button"
                                onClick={() => coverInputRef.current?.click()}
                                disabled={isUploadingCover}
                                className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-400/40 cursor-pointer"
                              >
                                <Upload className="w-3 h-3" />
                                <span>{isUploadingCover ? 'กำลังบีบอัด...' : 'อัปโหลดภาพปก'}</span>
                              </button>
                            </div>
                            <input
                              type="text"
                              required
                              value={editingDraft.imageUrl || ''}
                              onChange={(e) =>
                                setEditingDraft({ ...editingDraft, imageUrl: e.target.value })
                              }
                              className="w-full px-3 py-2 bg-[#020818] border border-cyan-500/30 rounded-xl text-xs text-white outline-none focus:border-cyan-400 font-mono"
                            />
                          </div>

                          {/* Multi-Image Gallery Section (up to 5 photos) */}
                          <div className="p-3 rounded-xl bg-[#020818]/90 border border-cyan-500/25 space-y-2.5">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[11px] text-cyan-300 font-semibold">
                                ภาพประกอบเพิ่มเติม ({(editingDraft.galleryImages || []).length}/5 ภาพ)
                              </span>
                              <input
                                ref={galleryInputRef}
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleUploadDraftGallery}
                                className="hidden"
                              />
                              <button
                                type="button"
                                onClick={() => galleryInputRef.current?.click()}
                                disabled={
                                  isUploadingGallery || (editingDraft.galleryImages || []).length >= 5
                                }
                                className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-400/40 cursor-pointer disabled:opacity-50"
                              >
                                <Upload className="w-3 h-3" />
                                <span>{isUploadingGallery ? 'กำลังอัปโหลด...' : '+ อัปโหลดภาพชุด'}</span>
                              </button>
                            </div>

                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={galleryUrlInput}
                                onChange={(e) => setGalleryUrlInput(e.target.value)}
                                placeholder="วางลิงก์ภาพเพิ่มเติม (https://...)"
                                className="flex-1 px-2.5 py-1.5 bg-[#040e28] border border-cyan-500/30 rounded-lg text-[11px] text-white outline-none font-mono"
                              />
                              <button
                                type="button"
                                disabled={
                                  !galleryUrlInput.trim() ||
                                  (editingDraft.galleryImages || []).length >= 5
                                }
                                onClick={() => {
                                  const url = galleryUrlInput.trim();
                                  if (!url) return;
                                  setEditingDraft((prev) => ({
                                    ...prev,
                                    galleryImages: [...(prev.galleryImages || []), url].slice(0, 5),
                                  }));
                                  setGalleryUrlInput('');
                                }}
                                className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-200 text-[11px] font-semibold cursor-pointer disabled:opacity-40"
                              >
                                เพิ่มลิงก์
                              </button>
                            </div>

                            {(editingDraft.galleryImages || []).length > 0 && (
                              <div className="grid grid-cols-5 gap-2 pt-1">
                                {(editingDraft.galleryImages || []).map((imgUrl, idx) => (
                                  <div
                                    key={`${idx}-${imgUrl.slice(0, 20)}`}
                                    className="relative aspect-square rounded-lg overflow-hidden border border-white/15 bg-black/40"
                                  >
                                    <img
                                      src={imgUrl}
                                      alt={`Gallery ${idx + 1}`}
                                      className="w-full h-full object-cover"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditingDraft((prev) => ({
                                          ...prev,
                                          galleryImages: (prev.galleryImages || []).filter(
                                            (_, i) => i !== idx
                                          ),
                                        }));
                                      }}
                                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/80 hover:bg-rose-600 text-white flex items-center justify-center cursor-pointer"
                                      title="นำภาพนี้ออก"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          <div>
                            <label className="block text-[11px] text-slate-300 mb-1 font-semibold">
                              ลิงก์เพิ่มเติม (URL หรือ #section - ไม่บังคับ)
                            </label>
                            <input
                              type="text"
                              maxLength={1000}
                              value={editingDraft.linkUrl || ''}
                              onChange={(e) =>
                                setEditingDraft({ ...editingDraft, linkUrl: e.target.value })
                              }
                              placeholder="https://... หรือ #published-works"
                              className="w-full px-3 py-2 bg-[#020818] border border-cyan-500/30 rounded-xl text-xs text-white outline-none focus:border-cyan-400 font-mono"
                            />
                          </div>

                          <div className="pt-2 flex justify-end gap-2">
                            <button
                              type="submit"
                              disabled={isSavingWork}
                              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/20 cursor-pointer disabled:opacity-60"
                            >
                              {isSavingWork ? (
                                <>
                                  <RefreshCw className="w-4 h-4 animate-spin" />
                                  <span>กำลังบันทึก...</span>
                                </>
                              ) : (
                                <>
                                  <Save className="w-4 h-4" />
                                  <span>
                                    {editingDraft.id ? 'บันทึกการแก้ไขผลงาน' : 'บันทึกเพิ่มผลงานใหม่'}
                                  </span>
                                </>
                              )}
                            </button>
                          </div>
                        </form>

                        {/* Editable Group Works List for Active Group (Edit Only — NO Delete) */}
                        <div className="space-y-2.5">
                          <h4 className="text-xs font-bold text-slate-200 flex items-center justify-between">
                            <span>
                              ผลงานใน{activeGroup.name} ({editableWorksForActiveGroup.length} รายการ)
                            </span>
                            <span className="text-[11px] font-normal text-slate-400">
                              กด &quot;แก้ไข&quot; เพื่ออัปเดตข้อมูล
                            </span>
                          </h4>

                          {editableWorksForActiveGroup.length === 0 ? (
                            <div className="p-4 rounded-xl border border-dashed border-slate-700 text-center text-xs text-slate-400">
                              ยังไม่มีผลงานในกลุ่มนี้ — กรอกแบบฟอร์มด้านบนเพื่อเพิ่มรายการแรกได้เลย
                            </div>
                          ) : (
                            <div className="space-y-2.5">
                              {editableWorksForActiveGroup.map((item) => {
                                const isBeingEdited = editingDraft.id === item.id;
                                return (
                                  <div
                                    key={item.id}
                                    className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${
                                      isBeingEdited
                                        ? 'bg-amber-500/10 border-amber-400/70'
                                        : 'bg-[#040e28]/80 border-white/10 hover:border-cyan-400/40'
                                    }`}
                                  >
                                    <img
                                      src={item.imageUrl}
                                      alt={item.title}
                                      className="w-16 h-12 rounded-lg object-cover border border-white/15 shrink-0"
                                      onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.onerror = null;
                                        target.src = '/assets/images/sai_audit_hero_1791689796943.jpg';
                                      }}
                                    />
                                    <div className="flex-1 min-w-0">
                                      <div className="text-xs font-bold text-white truncate">
                                        {item.title}
                                      </div>
                                      <div className="text-[11px] text-slate-400 flex flex-wrap items-center gap-2 mt-0.5">
                                        <span>{item.workDate}</span>
                                        {item.missionIndexes && item.missionIndexes.length > 0 && (
                                          <span className="text-amber-300">
                                            ภารกิจ {item.missionIndexes.join(',')}
                                          </span>
                                        )}
                                        {item.galleryImages && item.galleryImages.length > 0 && (
                                          <span className="text-cyan-300">
                                            +{item.galleryImages.length} ภาพ
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        playDigitalSound('select');
                                        setContributorError(null);
                                        setContributorNotice(null);
                                        setGalleryUrlInput('');
                                        setEditingDraft({ ...item });
                                        submitFormRef.current?.scrollIntoView({
                                          behavior: 'smooth',
                                          block: 'start',
                                        });
                                      }}
                                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-200 text-[11px] font-semibold shrink-0 cursor-pointer"
                                    >
                                      <Edit2 className="w-3 h-3" />
                                      <span>แก้ไข</span>
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Nested Work Detail Lightbox with Multi-Image Gallery */}
      {selectedWork && (
        <div
          className="fixed inset-0 z-[85] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn"
          onClick={() => setSelectedWork(null)}
        >
          <div
            className="w-full max-w-3xl max-h-[92vh] bg-gradient-to-b from-[#0a1d48] via-[#061538] to-[#030b20] border border-amber-400/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Lightbox Header */}
            <div className="px-4 sm:px-6 py-3.5 border-b border-white/15 bg-[#040e28]/90 flex items-center justify-between gap-3 shrink-0">
              <button
                type="button"
                onClick={() => {
                  playDigitalSound('blip');
                  setSelectedWork(null);
                }}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>กลับหน้ารวม</span>
              </button>
              <span className={`text-xs font-semibold truncate ${activeAccent.badgeText}`}>
                {activeGroup.name}
              </span>
              <button
                type="button"
                onClick={() => setSelectedWork(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
                aria-label="ปิดรายละเอียดผลงาน"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Lightbox Body */}
            <div className="flex-1 overflow-y-auto overscroll-contain">
              <div className="relative w-full bg-black/70 flex items-center justify-center max-h-[50vh] overflow-hidden border-b border-white/10">
                <img
                  src={activeLightboxPhoto}
                  alt={selectedWork.title}
                  className="w-full max-h-[50vh] object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = '/assets/images/sai_audit_hero_1791689796943.jpg';
                  }}
                />

                {lightboxPhotos.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        playDigitalSound('blip');
                        setActivePhotoIndex(
                          (prev) => (prev - 1 + lightboxPhotos.length) % lightboxPhotos.length
                        );
                      }}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/70 hover:bg-amber-400 text-white hover:text-slate-950 border border-white/25 flex items-center justify-center transition-all cursor-pointer shadow-lg"
                      aria-label="ภาพก่อนหน้า"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        playDigitalSound('blip');
                        setActivePhotoIndex((prev) => (prev + 1) % lightboxPhotos.length);
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/70 hover:bg-amber-400 text-white hover:text-slate-950 border border-white/25 flex items-center justify-center transition-all cursor-pointer shadow-lg"
                      aria-label="ภาพถัดไป"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                    <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-black/75 border border-white/20 text-[11px] font-mono text-amber-200">
                      ภาพ {activePhotoIndex + 1} / {lightboxPhotos.length}
                    </div>
                  </>
                )}
              </div>

              {/* Thumbnail Gallery Strip */}
              {lightboxPhotos.length > 1 && (
                <div className="px-4 sm:px-6 py-2.5 bg-[#040e28]/90 border-b border-white/10 flex items-center gap-2 overflow-x-auto">
                  {lightboxPhotos.map((photoUrl, idx) => (
                    <button
                      key={`${photoUrl}-${idx}`}
                      type="button"
                      onClick={() => {
                        playDigitalSound('blip');
                        setActivePhotoIndex(idx);
                      }}
                      className={`relative w-16 h-11 rounded-lg overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                        idx === activePhotoIndex
                          ? 'border-amber-400 scale-105 shadow-md shadow-amber-500/30'
                          : 'border-white/15 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={photoUrl}
                        alt={`ภาพประกอบที่ ${idx + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.onerror = null;
                          target.src = '/assets/images/sai_audit_hero_1791689796943.jpg';
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}

              <div className="p-5 sm:p-6 space-y-4">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 text-slate-200 font-medium">
                    {getMediaTypeMeta(selectedWork.mediaType).icon}
                    <span>{getMediaTypeMeta(selectedWork.mediaType).label}</span>
                  </span>
                  {selectedWork.badge && (
                    <span
                      className={`px-2.5 py-1 rounded-lg border font-semibold ${activeAccent.badgeBg} ${activeAccent.badgeText}`}
                    >
                      {selectedWork.badge}
                    </span>
                  )}
                  {getSourceLabel(selectedWork.source) && (
                    <span className="px-2.5 py-1 rounded-lg bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-medium">
                      {getSourceLabel(selectedWork.source)}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1.5 text-slate-400 ml-auto">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    <span>{selectedWork.date}</span>
                  </span>
                </div>

                <h3 className="text-lg sm:text-xl font-bold text-white leading-snug">
                  {selectedWork.title}
                </h3>

                {selectedWork.missionIndexes && selectedWork.missionIndexes.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {selectedWork.missionIndexes.map((mNum) => (
                      <span
                        key={mNum}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium border ${activeAccent.badgeBg} ${activeAccent.badgeText}`}
                      >
                        <span>ภารกิจข้อที่ {mNum}</span>
                      </span>
                    ))}
                  </div>
                )}

                <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-line">
                  {selectedWork.description}
                </p>

                {selectedWork.linkUrl && (
                  <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
                    <span className="text-xs text-slate-400 truncate max-w-sm">
                      แหล่งอ้างอิง: {selectedWork.linkUrl}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleWorkLinkClick(selectedWork.linkUrl)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 text-xs font-bold shadow-md transition-all cursor-pointer"
                    >
                      <span>เปิดดูข้อมูล / สื่อที่เกี่ยวข้อง</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

