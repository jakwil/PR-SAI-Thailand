import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Plus,
  Trash2,
  Edit2,
  Save,
  BookOpen,
  Film,
  Layers,
  Clock,
  ExternalLink,
  Upload,
  CheckCircle,
  FileText,
  Link as LinkIcon,
  Image as ImageIcon,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Radio,
  Music,
  Volume2,
  Database,
  BarChart3,
  TrendingUp,
  Users,
  Share2,
  Globe,
  Smartphone,
  Laptop,
  Calendar,
  Download,
  RefreshCw,
  Play,
  Pause,
  Activity,
  Eye,
  Check,
  PieChart,
  MessageSquare,
  HelpCircle
} from 'lucide-react';
import { AppData, KnowledgeItem, PublishedWork, ViralClip, IncidentMilestone, HeroStory, MusicSettings } from '../types';
import { defaultMusicSettings, parseGoogleDriveAudioUrl } from '../firebase';
import { getAnalyticsSummary, AnalyticsSummary } from '../utils/analytics';
import { ShareModal } from './ShareModal';
import { playDigitalSound } from '../utils/audioEffects';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  data: AppData;
  onUpdateData: (newData: AppData) => Promise<void>;
  onLogout: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  isOpen,
  onClose,
  data,
  onUpdateData,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<'summaries' | 'stories' | 'kb' | 'works' | 'clips' | 'timeline' | 'music'>('summaries');
  const [timeframe, setTimeframe] = useState<'today' | '7days' | '30days' | 'all'>('7days');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsSummary>(getAnalyticsSummary());
  const [isRefreshingStats, setIsRefreshingStats] = useState(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);
  const [testShareItem, setTestShareItem] = useState<{ id: string; title: string; category?: string; linkUrl?: string } | null>(null);

  // Direct Audio Quick Controller inside Admin
  const [isAdminAudioPlaying, setIsAdminAudioPlaying] = useState(false);
  const adminAudioRef = useRef<HTMLAudioElement | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Background Music state
  const [musicSettings, setMusicSettings] = useState<MusicSettings>(
    data.musicSettings || defaultMusicSettings
  );

  // Modals for editing / adding
  const [editingStory, setEditingStory] = useState<Partial<HeroStory> | null>(null);
  const [editingKb, setEditingKb] = useState<Partial<KnowledgeItem> | null>(null);
  const [editingWork, setEditingWork] = useState<Partial<PublishedWork> | null>(null);
  const [editingClip, setEditingClip] = useState<Partial<ViralClip> | null>(null);
  const [editingMilestone, setEditingMilestone] = useState<Partial<IncidentMilestone> | null>(null);

  // Multimodal file upload simulation status
  const [multimodalNotice, setMultimodalNotice] = useState('');

  if (!isOpen) return null;

  const triggerSave = async (updatedData: AppData) => {
    setIsSaving(true);
    try {
      await onUpdateData(updatedData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      console.error('Save error', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Summaries Handlers
  const handleRefreshAnalytics = () => {
    playDigitalSound('blip');
    setIsRefreshingStats(true);
    setTimeout(() => {
      setAnalyticsData(getAnalyticsSummary());
      setIsRefreshingStats(false);
    }, 500);
  };

  const handleExportReport = () => {
    playDigitalSound('select');
    const rows = [
      ['รายงานสรุปภาพรวมระบบและการแชร์ข่าว สำนักงานการตรวจเงินแผ่นดิน (สตง.)'],
      ['วันที่จัดทำรายงาน', new Date().toLocaleDateString('th-TH'), new Date().toLocaleTimeString('th-TH')],
      [],
      ['=== 1. สถิติผู้เข้าชมและภาพรวม (Traffic & Engagement Overview) ==='],
      ['ผู้เข้าชมรวม (Total Visitors)', analyticsData.totalVisitors],
      ['ผู้เข้าชมวันนี้ (Today Visitors)', analyticsData.todayVisitors],
      ['อัตราการเติบโตของผู้เข้าชม (Growth Rate)', `${analyticsData.visitorGrowthPct}%`],
      ['การแชร์ข่าวสารรวม (Total Shares)', analyticsData.totalShares],
      ['การแชร์วันนี้ (Today Shares)', analyticsData.todayShares],
      ['อัตราการเติบโตของการแชร์', `${analyticsData.shareGrowthPct}%`],
      ['เวลาเฉลี่ยในเว็บไซต์ (Avg Engagement Duration)', analyticsData.avgEngagementTime],
      ['Bounce Rate', `${analyticsData.bounceRatePct}%`],
      [],
      ['=== 2. สัดส่วนช่องทางการแชร์ข่าว (Share Platform Breakdown) ==='],
      ['แชร์ผ่าน LINE', analyticsData.platformShares.line],
      ['แชร์ผ่าน Facebook', analyticsData.platformShares.facebook],
      ['แชร์ผ่าน X (Twitter)', analyticsData.platformShares.twitter],
      ['คัดลอกลิงก์ตรง (Direct Link Copy)', analyticsData.platformShares.copy_link],
      ['แชร์ผ่านระบบปฏิบัติการมือถือ (Native Share)', analyticsData.platformShares.native],
      [],
      ['=== 3. อันดับข่าวและสื่อที่ถูกแชร์มากที่สุด (Top Shared News & Media Ranking) ==='],
      ['อันดับ', 'ชื่อข่าว/หัวข้อ', 'หมวดหมู่', 'ยอดแชร์รวม', 'ยอดเข้าชม', 'กิจกรรมล่าสุด'],
      ...analyticsData.topSharedItems.map((item, idx) => [
        idx + 1,
        `"${item.title.replace(/"/g, '""')}"`,
        item.category,
        item.shares,
        item.views,
        item.lastShared,
      ]),
      [],
      ['=== 4. ฐานข้อมูลและสื่อในระบบ (Total Repositories Summary) ==='],
      ['ภาพข่าวม้าหมุน Hero Stories', `${(data.heroStories || []).length} / 10 เรื่อง`],
      ['คลังความรู้ AI Grounding', `${data.knowledgeBase.length} หัวข้อ`],
      ['คลังสื่อดิจิทัล Published Works', `${data.publishedWorks.length} ชิ้นงาน`],
      ['คลิปและข่าวไวรัล Viral Clips', `${data.viralClips.length} คลิป`],
      ['จุดไทม์ไลน์อาคาร สตง.', `${data.incidentTimeline.length} บันทึก`],
      ['สถานะเพลง Background Music', musicSettings.enabled ? 'เปิดใช้งาน' : 'ปิดใช้งาน'],
    ];

    const csvContent = '\uFEFF' + rows.map((e) => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `SAI_Summary_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setExportNotice('ดาวน์โหลดรายงานสรุป CSV เรียบร้อยแล้ว');
    setTimeout(() => setExportNotice(null), 3500);
  };

  const handleToggleAdminAudio = () => {
    playDigitalSound('blip');
    if (!adminAudioRef.current) {
      const stream = parseGoogleDriveAudioUrl(musicSettings.driveUrl || musicSettings.streamUrl || '');
      const audio = new Audio(stream);
      audio.volume = Math.max(0.05, musicSettings.defaultVolume);
      adminAudioRef.current = audio;
    }

    if (isAdminAudioPlaying) {
      adminAudioRef.current?.pause();
      setIsAdminAudioPlaying(false);
    } else {
      adminAudioRef.current?.play().then(() => {
        setIsAdminAudioPlaying(true);
      }).catch((e) => {
        console.warn('Audio play notice:', e);
      });
    }
  };

  const storiesList = data.heroStories || [];

  // Hero Story Handlers
  const handleSaveStory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStory || !editingStory.title) return;

    let updated = [...storiesList];
    if (editingStory.id) {
      updated = updated.map((s) =>
        s.id === editingStory.id ? ({ ...s, ...editingStory } as HeroStory) : s
      );
    } else {
      if (updated.length >= 10) {
        alert('ภาพข่าวม้าหมุน Hero รองรับได้สูงสุด 10 เรื่อง กรุณาลบเรื่องเดิมออกก่อนเพิ่มใหม่');
        return;
      }
      const newStory: HeroStory = {
        id: `story-${Date.now()}`,
        title: editingStory.title || '',
        subtitle: editingStory.subtitle || '',
        category: editingStory.category || 'ข่าวเด่น สตง.',
        imageUrl: editingStory.imageUrl || '/src/assets/images/sai_digital_network_1791693065277.jpg',
        linkUrl: editingStory.linkUrl || 'https://pr-request-system.vercel.app',
        date: editingStory.date || 'ตุลาคม 2569',
        badge: editingStory.badge || 'ข่าวใหม่',
        order: updated.length + 1,
      };
      updated.push(newStory);
    }

    triggerSave({ ...data, heroStories: updated });
    setEditingStory(null);
  };

  const handleDeleteStory = (id: string) => {
    const updated = storiesList.filter((s) => s.id !== id);
    triggerSave({ ...data, heroStories: updated });
  };

  const handleMoveStory = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= storiesList.length) return;
    const updated = [...storiesList];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    triggerSave({ ...data, heroStories: updated });
  };

  // KB Handlers
  const handleSaveKb = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingKb || !editingKb.title || !editingKb.content) return;

    let updatedList = [...data.knowledgeBase];
    if (editingKb.id) {
      updatedList = updatedList.map((item) =>
        item.id === editingKb.id ? ({ ...item, ...editingKb } as KnowledgeItem) : item
      );
    } else {
      const newItem: KnowledgeItem = {
        id: `kb-${Date.now()}`,
        title: editingKb.title || '',
        category: editingKb.category || 'ทั่วไป',
        content: editingKb.content || '',
        sourceType: editingKb.sourceType || 'raw_text',
        sourceUrl: editingKb.sourceUrl || '',
        dateAdded: new Date().toISOString().split('T')[0],
      };
      updatedList.push(newItem);
    }

    triggerSave({ ...data, knowledgeBase: updatedList });
    setEditingKb(null);
  };

  const handleDeleteKb = (id: string) => {
    const updated = data.knowledgeBase.filter((k) => k.id !== id);
    triggerSave({ ...data, knowledgeBase: updated });
  };

  // Published Works Handlers
  const handleSaveWork = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWork || !editingWork.title) return;

    let updatedList = [...data.publishedWorks];
    if (editingWork.id) {
      updatedList = updatedList.map((w) =>
        w.id === editingWork.id ? ({ ...w, ...editingWork } as PublishedWork) : w
      );
    } else {
      const newWork: PublishedWork = {
        id: `work-${Date.now()}`,
        title: editingWork.title || '',
        category: editingWork.category || 'สื่อเผยแพร่',
        description: editingWork.description || '',
        linkUrl: editingWork.linkUrl || 'https://pr-request-system.vercel.app',
        imageUrl: editingWork.imageUrl || '/src/assets/images/sai_audit_hero_1791689796943.jpg',
        publishDate: new Date().toISOString().split('T')[0],
        views: editingWork.views || '1,200',
        badge: editingWork.badge || 'ผลงานใหม่',
      };
      updatedList.push(newWork);
    }

    triggerSave({ ...data, publishedWorks: updatedList });
    setEditingWork(null);
  };

  const handleDeleteWork = (id: string) => {
    const updated = data.publishedWorks.filter((w) => w.id !== id);
    triggerSave({ ...data, publishedWorks: updated });
  };

  // Viral Clips Handlers
  const handleSaveClip = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClip || !editingClip.title) return;

    let updatedList = [...data.viralClips];
    if (editingClip.id) {
      updatedList = updatedList.map((c) =>
        c.id === editingClip.id ? ({ ...c, ...editingClip } as ViralClip) : c
      );
    } else {
      const newClip: ViralClip = {
        id: `clip-${Date.now()}`,
        title: editingClip.title || '',
        creator: editingClip.creator || 'PR - SAI Thailand',
        views: editingClip.views || '10K',
        duration: editingClip.duration || '01:00',
        thumbnail: editingClip.thumbnail || '/src/assets/images/sai_public_campaign_1791689820118.jpg',
        linkUrl: editingClip.linkUrl || 'https://youtube.com',
        highlight: editingClip.highlight || 'คลิปประชาสัมพันธ์น่าสนใจ',
      };
      updatedList.push(newClip);
    }

    triggerSave({ ...data, viralClips: updatedList });
    setEditingClip(null);
  };

  const handleDeleteClip = (id: string) => {
    const updated = data.viralClips.filter((c) => c.id !== id);
    triggerSave({ ...data, viralClips: updated });
  };

  // Incident Timeline Handlers
  const handleMoveMilestone = (idx: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= data.incidentTimeline.length) return;
    const updated = [...data.incidentTimeline];
    const [moved] = updated.splice(idx, 1);
    updated.splice(targetIdx, 0, moved);
    triggerSave({ ...data, incidentTimeline: updated });
  };

  const handleSaveMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMilestone || !editingMilestone.title) return;

    let updatedList = [...data.incidentTimeline];
    if (editingMilestone.id) {
      updatedList = updatedList.map((m) =>
        m.id === editingMilestone.id ? ({ ...m, ...editingMilestone } as IncidentMilestone) : m
      );
    } else {
      const newMilestone: IncidentMilestone = {
        id: `tl-${Date.now()}`,
        date: editingMilestone.date || 'ปัจจุบัน',
        time: editingMilestone.time || 'ล่าสุด',
        phase: editingMilestone.phase || 'รายงานสถานการณ์',
        title: editingMilestone.title || '',
        description: editingMilestone.description || '',
        status: editingMilestone.status || 'ดำเนินการ',
        imageUrl: editingMilestone.imageUrl || '/src/assets/images/sai_building_inspection_1791689807795.jpg',
        technicalDetails: editingMilestone.technicalDetails || 'ตรวจสอบมาตรฐานความปลอดภัย',
      };
      updatedList.push(newMilestone);
    }

    triggerSave({ ...data, incidentTimeline: updatedList });
    setEditingMilestone(null);
  };

  const handleDeleteMilestone = (id: string) => {
    const updated = data.incidentTimeline.filter((m) => m.id !== id);
    triggerSave({ ...data, incidentTimeline: updated });
  };

  // File Upload simulation for Multimodal Parsing
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMultimodalNotice(`กำลังประมวลผลไฟล์มัลติโมดอล: ${file.name}...`);
    setTimeout(() => {
      setMultimodalNotice(`สกัดข้อมูลจาก ${file.name} เรียบร้อยแล้ว! นำเข้าสู่แบบฟอร์มคลังความรู้`);
      setEditingKb({
        title: `สรุปเอกสาร: ${file.name.replace(/\.[^/.]+$/, '')}`,
        category: 'เอกสาร/อินโฟกราฟิกนำเข้า',
        content: `เนื้อหาและข้อเท็จจริงที่สกัดจากไฟล์ ${file.name} โดยระบบ Multimodal AI: ข้อมูลได้รับการตรวจสอบและจัดเข้าหมวดหมู่สำหรับใช้ตอบคำถามผู้ใช้ผ่าน AI Chatbot อัตโนมัติ`,
        sourceType: file.type.includes('image') ? 'infographic' : 'pdf_summary',
      });
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl">
      <div className="relative w-full max-w-5xl h-[90vh] bg-[#05112f] border border-cyan-500/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header - Compact & Clean without wasting vertical space */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-2.5 sm:py-3 border-b border-cyan-500/20 bg-[#06163d]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <span>ระบบบริหารจัดการข้อมูล PR - SAI Thailand</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono border border-cyan-400/30">
                  ADMIN
                </span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {saveSuccess && (
              <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium animate-fadeIn">
                <CheckCircle className="w-3.5 h-3.5" />
                บันทึกแล้ว
              </span>
            )}
            <button
              onClick={onLogout}
              className="px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs text-rose-300 hover:text-white bg-rose-500/15 hover:bg-rose-500/25 rounded-lg border border-rose-500/30 transition-colors"
            >
              ออกจากระบบ
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation - Compact & Streamlined */}
        <div className="flex items-center gap-1.5 px-4 sm:px-6 py-2 border-b border-cyan-500/20 bg-[#040e28] overflow-x-auto select-none">
          <button
            onClick={() => {
              playDigitalSound('select');
              setActiveTab('summaries');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors shrink-0 ${
              activeTab === 'summaries'
                ? 'bg-gradient-to-r from-cyan-500/30 to-blue-600/30 text-cyan-200 border border-cyan-400 font-bold shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Overview</span>
          </button>
          <button
            onClick={() => {
              playDigitalSound('select');
              setActiveTab('stories');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors shrink-0 ${
              activeTab === 'stories'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>Highlight ({storiesList.length}/10)</span>
          </button>
          <button
            onClick={() => setActiveTab('kb')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors shrink-0 ${
              activeTab === 'kb'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>AI Training Data ({data.knowledgeBase.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('works')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors shrink-0 ${
              activeTab === 'works'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            <span>Media Library ({data.publishedWorks.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('clips')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors shrink-0 ${
              activeTab === 'clips'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            <span>คลิปวิดีโอ ({data.viralClips.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors shrink-0 ${
              activeTab === 'timeline'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>ไทม์ไลน์อาคาร สตง. ({data.incidentTimeline.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('music')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors shrink-0 ${
              activeTab === 'music'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Music className="w-3.5 h-3.5 text-cyan-400" />
            <span>เพลง</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB: EXECUTIVE SUMMARIES & ANALYTICS DASHBOARD */}
          {activeTab === 'summaries' && (
            <div className="space-y-6 text-left animate-fadeIn">
              {/* Export Toast Notice */}
              {exportNotice && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 text-xs shadow-lg animate-fadeIn">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="font-semibold">{exportNotice}</span>
                </div>
              )}

              {/* Dashboard Header Bar */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-[#071946] via-[#05143b] to-[#040e28] border border-cyan-500/40 shadow-[0_8px_30px_rgba(2,10,31,0.8)]">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.4)]">
                      <BarChart3 className="w-4 h-4" />
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                      <span>แดชบอร์ดสรุปภาพรวมและสถิติ (Executive Summaries)</span>
                    </h3>
                  </div>
                  <p className="text-xs text-slate-300">
                    รายงานความเคลื่อนไหวผู้เข้าชม (Visitors Traffic), สถิติการแชร์ข่าวสาร (News Shares), คลังสื่อดิจิทัล และสถานะระบบ 24 ชม.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  {/* Period Filter Buttons */}
                  <div className="flex items-center bg-[#03091e] border border-cyan-500/30 p-1 rounded-xl">
                    <button
                      onClick={() => {
                        playDigitalSound('blip');
                        setTimeframe('today');
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                        timeframe === 'today'
                          ? 'bg-cyan-500 text-slate-950 font-bold'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      วันนี้
                    </button>
                    <button
                      onClick={() => {
                        playDigitalSound('blip');
                        setTimeframe('7days');
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                        timeframe === '7days'
                          ? 'bg-cyan-500 text-slate-950 font-bold'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      7 วันล่าสุด
                    </button>
                    <button
                      onClick={() => {
                        playDigitalSound('blip');
                        setTimeframe('30days');
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                        timeframe === '30days'
                          ? 'bg-cyan-500 text-slate-950 font-bold'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      30 วัน
                    </button>
                    <button
                      onClick={() => {
                        playDigitalSound('blip');
                        setTimeframe('all');
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                        timeframe === 'all'
                          ? 'bg-cyan-500 text-slate-950 font-bold'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      ทั้งหมด
                    </button>
                  </div>

                  {/* Refresh Button */}
                  <button
                    onClick={handleRefreshAnalytics}
                    disabled={isRefreshingStats}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-medium transition-colors"
                    title="รีเฟรชข้อมูลสถิติ"
                  >
                    <RefreshCw
                      className={`w-3.5 h-3.5 ${isRefreshingStats ? 'animate-spin text-cyan-400' : ''}`}
                    />
                    <span>รีเฟรช</span>
                  </button>

                  {/* Export CSV Button */}
                  <button
                    onClick={handleExportReport}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all active:scale-95"
                    title="ส่งออกรายงานเป็นไฟล์ CSV"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>ส่งออกรายงาน CSV</span>
                  </button>
                </div>
              </div>

              {/* 4 Core KPI Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Total Visitors */}
                <div className="p-4 rounded-2xl bg-gradient-to-b from-[#091b48]/90 to-[#040e28]/95 border border-cyan-400/40 shadow-lg space-y-2 relative overflow-hidden group">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-300">
                      ผู้เข้าชมเว็บไซต์รวม
                    </span>
                    <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center">
                      <Users className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-extrabold text-white font-mono tracking-tight">
                      {analyticsData.totalVisitors.toLocaleString()}
                    </span>
                    <span className="text-xs text-emerald-400 font-semibold flex items-center gap-0.5">
                      <TrendingUp className="w-3 h-3" />
                      +{analyticsData.visitorGrowthPct}%
                    </span>
                  </div>
                  <div className="pt-2 border-t border-cyan-500/20 flex items-center justify-between text-[11px] text-slate-400">
                    <span>วันนี้: +{analyticsData.todayVisitors.toLocaleString()} ครั้ง</span>
                    <span className="text-cyan-400/80 font-mono">
                      เฉลี่ย {analyticsData.avgEngagementTime}
                    </span>
                  </div>
                </div>

                {/* 2. Total Shares */}
                <div className="p-4 rounded-2xl bg-gradient-to-b from-[#082242]/90 to-[#040e28]/95 border border-emerald-400/40 shadow-lg space-y-2 relative overflow-hidden group">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-300">
                      ยอดการแชร์ข่าวสารรวม
                    </span>
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
                      <Share2 className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-extrabold text-white font-mono tracking-tight">
                      {analyticsData.totalShares.toLocaleString()}
                    </span>
                    <span className="text-xs text-emerald-400 font-semibold flex items-center gap-0.5">
                      <TrendingUp className="w-3 h-3" />
                      +{analyticsData.shareGrowthPct}%
                    </span>
                  </div>
                  <div className="pt-2 border-t border-emerald-500/20 flex items-center justify-between text-[11px] text-slate-400">
                    <span>วันนี้: +{analyticsData.todayShares.toLocaleString()} ครั้ง</span>
                    <span className="text-emerald-400/80 font-mono">LINE สูงสุด 45%</span>
                  </div>
                </div>

                {/* 3. Total Content Items in System */}
                <div className="p-4 rounded-2xl bg-gradient-to-b from-[#091b48]/90 to-[#040e28]/95 border border-amber-400/40 shadow-lg space-y-2 relative overflow-hidden group">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-300">
                      คลังข้อมูลและสื่อทั้งหมด
                    </span>
                    <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center">
                      <Layers className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-extrabold text-white font-mono tracking-tight">
                      {storiesList.length +
                        data.knowledgeBase.length +
                        data.publishedWorks.length +
                        data.viralClips.length +
                        data.incidentTimeline.length}
                    </span>
                    <span className="text-[11px] text-amber-300 font-medium">รายการในระบบ</span>
                  </div>
                  <div className="pt-2 border-t border-amber-500/20 flex items-center justify-between text-[11px] text-slate-400">
                    <span>
                      Hero: {storiesList.length} · สื่อ: {data.publishedWorks.length}
                    </span>
                    <span className="text-amber-400/80">คลิป: {data.viralClips.length}</span>
                  </div>
                </div>

                {/* 4. Audio Control & Cloud Status */}
                <div className="p-4 rounded-2xl bg-gradient-to-b from-[#091b48]/90 to-[#040e28]/95 border border-indigo-400/40 shadow-lg space-y-2 relative overflow-hidden group">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-300">
                      เพลง & คลาวด์ สตง. 24 ชม.
                    </span>
                    <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center">
                      <Music className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                        <span className="text-xs font-bold text-white">
                          {musicSettings.enabled ? 'เปิดสตรีมสด 24 ชม.' : 'ปิดเพลงชั่วคราว'}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                        เสียงเริ่มต้น {Math.round(musicSettings.defaultVolume * 100)}%
                      </span>
                    </div>

                    {/* Admin Audio Preview Button */}
                    <button
                      type="button"
                      onClick={handleToggleAdminAudio}
                      className="px-2.5 py-1 rounded-lg bg-indigo-500/30 hover:bg-indigo-500/50 text-indigo-200 border border-indigo-400/50 text-xs font-semibold flex items-center gap-1 transition-all"
                      title="ทดสอบฟังเสียงเพลงในแดชบอร์ด"
                    >
                      {isAdminAudioPlaying ? (
                        <>
                          <Pause className="w-3 h-3" />
                          <span>หยุดฟัง</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3 h-3 fill-current" />
                          <span>ฟังทดสอบ</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="pt-2 border-t border-indigo-500/20 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="text-emerald-400 flex items-center gap-1">
                      <Database className="w-3 h-3" />
                      Firestore เชื่อมต่อแล้ว
                    </span>
                    <button
                      onClick={() => setActiveTab('music')}
                      className="text-cyan-400 hover:underline text-[11px]"
                    >
                      ตั้งค่าเพลง →
                    </button>
                  </div>
                </div>
              </div>

              {/* Two Column Section: Traffic Chart & Share Distribution */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left 7 Cols: 7-Day Traffic & Share Interactive Chart */}
                <div className="lg:col-span-7 p-5 rounded-2xl bg-[#061539] border border-cyan-500/30 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-cyan-500/20 pb-3">
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <Activity className="w-4 h-4 text-cyan-400" />
                        <span>แนวโน้มผู้เข้าชมและการแชร์ 7 วันล่าสุด (Traffic & Shares)</span>
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        เปรียบเทียบสถิติผู้เข้าชมรายวัน (สีฟ้า) กับยอดการแชร์ข่าวสาร (สีเขียว)
                      </p>
                    </div>

                    {/* Legend */}
                    <div className="flex items-center gap-3 text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded bg-cyan-400" />
                        <span className="text-slate-300">ผู้เข้าชม (Visitors)</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded bg-emerald-400" />
                        <span className="text-slate-300">การแชร์ (Shares)</span>
                      </div>
                    </div>
                  </div>

                  {/* SVG Multi-Bar Visualization */}
                  <div className="space-y-3 pt-2">
                    <div className="grid grid-cols-7 gap-2 items-end h-44 px-2 pt-6 pb-2 bg-[#030c26]/80 rounded-xl border border-cyan-500/20">
                      {analyticsData.dailyTrends.map((d, i) => {
                        const maxVal = 3200;
                        const visHeightPct = Math.min(100, Math.round((d.visitors / maxVal) * 100));
                        const shareHeightPct = Math.min(100, Math.round(((d.shares * 3.5) / maxVal) * 100));

                        return (
                          <div
                            key={i}
                            className="flex flex-col items-center justify-end h-full group relative cursor-pointer"
                          >
                            {/* Hover Tooltip */}
                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center bg-[#040e2b] border border-cyan-400 px-2 py-1 rounded shadow-xl text-[10px] z-30 whitespace-nowrap pointer-events-none">
                              <span className="text-white font-bold">{d.label}</span>
                              <span className="text-cyan-300">ผู้เข้าชม: {d.visitors.toLocaleString()}</span>
                              <span className="text-emerald-300">แชร์: {d.shares.toLocaleString()}</span>
                            </div>

                            {/* Dual Bars Container */}
                            <div className="w-full flex items-end justify-center gap-1 h-32">
                              {/* Visitor Bar */}
                              <div
                                style={{ height: `${visHeightPct}%` }}
                                className="w-2.5 sm:w-3.5 bg-gradient-to-t from-cyan-600 to-cyan-400 rounded-t transition-all group-hover:brightness-125"
                              />
                              {/* Share Bar */}
                              <div
                                style={{ height: `${shareHeightPct}%` }}
                                className="w-2.5 sm:w-3.5 bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t transition-all group-hover:brightness-125"
                              />
                            </div>

                            {/* Date Label */}
                            <span className="text-[10px] text-slate-400 font-mono mt-2 truncate w-full text-center">
                              {d.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs">
                      <div className="p-2 rounded-xl bg-[#030c26] border border-cyan-500/20">
                        <span className="text-[10px] text-slate-400 block">อัตราการมีส่วนร่วม</span>
                        <span className="text-sm font-bold text-white font-mono">78.4%</span>
                      </div>
                      <div className="p-2 rounded-xl bg-[#030c26] border border-cyan-500/20">
                        <span className="text-[10px] text-slate-400 block">ระยะเวลาในเว็บเฉลี่ย</span>
                        <span className="text-sm font-bold text-cyan-300 font-mono">
                          {analyticsData.avgEngagementTime}
                        </span>
                      </div>
                      <div className="p-2 rounded-xl bg-[#030c26] border border-cyan-500/20">
                        <span className="text-[10px] text-slate-400 block">Bounce Rate</span>
                        <span className="text-sm font-bold text-slate-300 font-mono">
                          {analyticsData.bounceRatePct}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right 5 Cols: Share Platform Distribution & Devices */}
                <div className="lg:col-span-5 p-5 rounded-2xl bg-[#061539] border border-cyan-500/30 space-y-4">
                  <div className="border-b border-cyan-500/20 pb-3">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <PieChart className="w-4 h-4 text-emerald-400" />
                      <span>สัดส่วนช่องทางการแชร์ข่าว (Share Distribution)</span>
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      แยกตามแอปพลิเคชันที่ประชาชนส่งต่อข้อมูล
                    </p>
                  </div>

                  {/* Channel Bars */}
                  <div className="space-y-3">
                    {/* LINE */}
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[#06c755]" />
                          LINE Official & Groups
                        </span>
                        <span className="font-mono text-white">
                          {analyticsData.platformShares.line.toLocaleString()} ครั้ง (
                          {Math.round((analyticsData.platformShares.line / analyticsData.totalShares) * 100)}%)
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#06c755] rounded-full"
                          style={{
                            width: `${Math.round((analyticsData.platformShares.line / analyticsData.totalShares) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Facebook */}
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-semibold text-blue-400 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[#1877f2]" />
                          Facebook News Feed
                        </span>
                        <span className="font-mono text-white">
                          {analyticsData.platformShares.facebook.toLocaleString()} ครั้ง (
                          {Math.round((analyticsData.platformShares.facebook / analyticsData.totalShares) * 100)}%)
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#1877f2] rounded-full"
                          style={{
                            width: `${Math.round((analyticsData.platformShares.facebook / analyticsData.totalShares) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* X (Twitter) */}
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-slate-400" />
                          X (Twitter)
                        </span>
                        <span className="font-mono text-white">
                          {analyticsData.platformShares.twitter.toLocaleString()} ครั้ง (
                          {Math.round((analyticsData.platformShares.twitter / analyticsData.totalShares) * 100)}%)
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-slate-400 rounded-full"
                          style={{
                            width: `${Math.round((analyticsData.platformShares.twitter / analyticsData.totalShares) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Copy Link */}
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-semibold text-cyan-300 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-cyan-400" />
                          คัดลอกลิงก์ตรง (Direct Link)
                        </span>
                        <span className="font-mono text-white">
                          {analyticsData.platformShares.copy_link.toLocaleString()} ครั้ง (
                          {Math.round((analyticsData.platformShares.copy_link / analyticsData.totalShares) * 100)}%)
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-cyan-400 rounded-full"
                          style={{
                            width: `${Math.round((analyticsData.platformShares.copy_link / analyticsData.totalShares) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Device breakdown & Peak hours */}
                  <div className="pt-3 border-t border-cyan-500/20 space-y-2">
                    <span className="text-[11px] font-semibold text-slate-300 block">
                      อุปกรณ์ที่ประชาชนเข้าใช้งาน (Device Types):
                    </span>
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="p-2 rounded-xl bg-[#030c26] border border-cyan-500/20">
                        <Smartphone className="w-3.5 h-3.5 text-cyan-400 mx-auto mb-0.5" />
                        <span className="text-[10px] text-slate-400 block">สมาร์ตโฟน</span>
                        <span className="font-bold text-white font-mono">
                          {analyticsData.deviceBreakdown.mobile}%
                        </span>
                      </div>
                      <div className="p-2 rounded-xl bg-[#030c26] border border-cyan-500/20">
                        <Laptop className="w-3.5 h-3.5 text-blue-400 mx-auto mb-0.5" />
                        <span className="text-[10px] text-slate-400 block">คอมพิวเตอร์</span>
                        <span className="font-bold text-white font-mono">
                          {analyticsData.deviceBreakdown.desktop}%
                        </span>
                      </div>
                      <div className="p-2 rounded-xl bg-[#030c26] border border-cyan-500/20">
                        <Globe className="w-3.5 h-3.5 text-amber-400 mx-auto mb-0.5" />
                        <span className="text-[10px] text-slate-400 block">แท็บเล็ต</span>
                        <span className="font-bold text-white font-mono">
                          {analyticsData.deviceBreakdown.tablet}%
                        </span>
                      </div>
                    </div>
                    <div className="text-[10px] text-slate-400 pt-1 flex items-center justify-between">
                      <span>ช่วงเวลาใช้งานสูงสุด:</span>
                      <span className="text-cyan-400 font-mono font-semibold">
                        09:00-11:30 น. & 13:30-15:30 น.
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Top Shared News & Media Content Table */}
              <div className="p-5 rounded-2xl bg-[#061539] border border-cyan-500/30 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-cyan-500/20 pb-3">
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                      <span>อันดับข่าวและสื่อที่ถูกแชร์มากที่สุด (Top Shared News & Media Content)</span>
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      แสดงรายการข่าวที่มีประชาชนส่งต่อและมีปฏิสัมพันธ์สูงสุด พร้อมปุ่มทดสอบแชร์
                    </p>
                  </div>
                  <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 rounded">
                    REALTIME TRACKING
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-cyan-500/20 text-slate-400 text-[11px] font-semibold">
                        <th className="py-2.5 px-3">#</th>
                        <th className="py-2.5 px-3">ชื่อข่าว / สื่อประชาสัมพันธ์</th>
                        <th className="py-2.5 px-3">หมวดหมู่</th>
                        <th className="py-2.5 px-3 text-center">ยอดชม (Views)</th>
                        <th className="py-2.5 px-3 text-center">ยอดแชร์ (Shares)</th>
                        <th className="py-2.5 px-3">กิจกรรมล่าสุด</th>
                        <th className="py-2.5 px-3 text-right">การจัดการ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-cyan-500/10">
                      {analyticsData.topSharedItems.map((item, idx) => (
                        <tr
                          key={item.id}
                          className="hover:bg-cyan-500/5 transition-colors group"
                        >
                          <td className="py-3 px-3 font-mono font-bold text-cyan-400">
                            {idx === 0 ? '🥇 1' : idx === 1 ? '🥈 2' : idx === 2 ? '🥉 3' : `${idx + 1}`}
                          </td>
                          <td className="py-3 px-3 max-w-xs">
                            <span className="font-semibold text-white group-hover:text-cyan-200 transition-colors line-clamp-1">
                              {item.title}
                            </span>
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap">
                            <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                              {item.category}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center font-mono text-slate-300">
                            {item.views}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span className="inline-flex items-center gap-1 font-mono font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded">
                              <Share2 className="w-3 h-3" />
                              {item.shares.toLocaleString()}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-[11px] text-slate-400 whitespace-nowrap">
                            {item.lastShared}
                          </td>
                          <td className="py-3 px-3 text-right whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => {
                                playDigitalSound('blip');
                                setTestShareItem({
                                  id: item.id,
                                  title: item.title,
                                  category: item.category,
                                  linkUrl: typeof window !== 'undefined' ? `${window.location.origin}/#${item.id}` : '',
                                });
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/40 text-[11px] font-medium transition-colors cursor-pointer"
                              title="ทดสอบแชร์ข่าวนี้"
                            >
                              <Share2 className="w-3 h-3 text-cyan-400" />
                              <span>แชร์ต่อ</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Central Quick Jump Hub */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-[#071946] to-[#040e28] border border-cyan-500/30 space-y-3">
                <h4 className="text-xs font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>ทางลัดศูนย์บัญชาการข้อมูล สตง. (Quick Action Hub)</span>
                </h4>
                <p className="text-[11px] text-slate-300">
                  คลิกเพื่อเข้าสู่หน้าจัดการเนื้อหาและตั้งค่าส่วนต่างๆ ได้อย่างรวดเร็ว
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-1">
                  <button
                    onClick={() => {
                      playDigitalSound('select');
                      setActiveTab('stories');
                    }}
                    className="p-3 rounded-xl bg-[#030c26] hover:bg-cyan-500/20 border border-cyan-500/30 text-left transition-all hover:scale-[1.02]"
                  >
                    <Radio className="w-4 h-4 text-cyan-400 mb-1" />
                    <span className="text-xs font-bold text-white block">ภาพข่าว Hero</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {storiesList.length}/10 เรื่อง
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      playDigitalSound('select');
                      setActiveTab('works');
                    }}
                    className="p-3 rounded-xl bg-[#030c26] hover:bg-cyan-500/20 border border-cyan-500/30 text-left transition-all hover:scale-[1.02]"
                  >
                    <Film className="w-4 h-4 text-amber-400 mb-1" />
                    <span className="text-xs font-bold text-white block">คลังสื่อดิจิทัล</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {data.publishedWorks.length} ผลงาน
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      playDigitalSound('select');
                      setActiveTab('clips');
                    }}
                    className="p-3 rounded-xl bg-[#030c26] hover:bg-cyan-500/20 border border-cyan-500/30 text-left transition-all hover:scale-[1.02]"
                  >
                    <Film className="w-4 h-4 text-rose-400 mb-1" />
                    <span className="text-xs font-bold text-white block">คลิปไวรัล</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {data.viralClips.length} รายการ
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      playDigitalSound('select');
                      setActiveTab('timeline');
                    }}
                    className="p-3 rounded-xl bg-[#030c26] hover:bg-cyan-500/20 border border-cyan-500/30 text-left transition-all hover:scale-[1.02]"
                  >
                    <Clock className="w-4 h-4 text-cyan-400 mb-1" />
                    <span className="text-xs font-bold text-white block">ไทม์ไลน์อาคาร</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {data.incidentTimeline.length} จุดบันทึก
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      playDigitalSound('select');
                      setActiveTab('kb');
                    }}
                    className="p-3 rounded-xl bg-[#030c26] hover:bg-cyan-500/20 border border-cyan-500/30 text-left transition-all hover:scale-[1.02]"
                  >
                    <BookOpen className="w-4 h-4 text-indigo-400 mb-1" />
                    <span className="text-xs font-bold text-white block">AI Training Data</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {data.knowledgeBase.length} หัวข้อ
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      playDigitalSound('select');
                      setActiveTab('music');
                    }}
                    className="p-3 rounded-xl bg-[#030c26] hover:bg-cyan-500/20 border border-cyan-500/30 text-left transition-all hover:scale-[1.02]"
                  >
                    <Music className="w-4 h-4 text-emerald-400 mb-1" />
                    <span className="text-xs font-bold text-white block">เพลง</span>
                    <span className="text-[10px] text-emerald-400 font-mono">
                      {musicSettings.enabled ? 'เปิดใช้งาน' : 'ปิด'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 0: HERO STORIES CAROUSEL */}
          {activeTab === 'stories' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-[#061539] border border-cyan-500/20">
                <div>
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <span>Highlight (ภาพข่าวไฮไลต์ Hero สูงสุด 10 เรื่อง)</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-400/20 text-cyan-300">
                      {storiesList.length} / 10 เรื่อง
                    </span>
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    ภาพข่าวไฮไลต์พร้อมข้อความที่แสดงด้านบนสุดของเว็บ สามารถเพิ่ม แก้ไข ลบ และจัดเรียงลำดับได้
                  </p>
                </div>
                <button
                  onClick={() => {
                    if (storiesList.length >= 10) {
                      alert('ภาพข่าวม้าหมุนครบจำนวนสูงสุด 10 เรื่องแล้ว');
                      return;
                    }
                    setEditingStory({
                      title: '',
                      subtitle: '',
                      category: 'ข่าวเด่น สตง.',
                      imageUrl: '/src/assets/images/sai_digital_network_1791693065277.jpg',
                      linkUrl: 'https://pr-request-system.vercel.app',
                      date: 'ตุลาคม 2569',
                      badge: 'ข่าวใหม่',
                      order: storiesList.length + 1,
                    });
                  }}
                  disabled={storiesList.length >= 10}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 text-xs font-bold transition-all shadow-md shadow-cyan-500/20"
                >
                  <Plus className="w-4 h-4" />
                  <span>เพิ่มภาพข่าว ({storiesList.length}/10)</span>
                </button>
              </div>

              {/* Stories List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {storiesList.map((story, idx) => (
                  <div
                    key={story.id}
                    className="p-3.5 rounded-xl bg-[#07173e]/70 border border-cyan-500/20 hover:border-cyan-400/40 transition-colors flex gap-4"
                  >
                    <div className="relative w-28 h-24 rounded-lg overflow-hidden shrink-0 border border-cyan-500/30">
                      <img
                        src={story.imageUrl}
                        alt={story.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            '/src/assets/images/sai_digital_network_1791693065277.jpg';
                        }}
                      />
                      <span className="absolute bottom-1 right-1 px-1 rounded bg-black/80 text-[9px] text-cyan-300 font-mono">
                        #{idx + 1}
                      </span>
                    </div>

                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between text-[11px] text-cyan-300 mb-1">
                          <span className="font-semibold">{story.category}</span>
                          <span className="text-slate-400 text-[10px]">{story.date}</span>
                        </div>
                        <h4 className="text-xs font-bold text-white line-clamp-1">
                          {story.title}
                        </h4>
                        <p className="text-[11px] text-slate-300 line-clamp-2 mt-1">
                          {story.subtitle}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-cyan-500/20">
                        {story.badge && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300">
                            {story.badge}
                          </span>
                        )}
                        <div className="flex items-center gap-1 ml-auto">
                          <button
                            onClick={() => handleMoveStory(idx, 'up')}
                            disabled={idx === 0}
                            className="p-1 text-slate-400 hover:text-white disabled:opacity-30"
                            title="เลื่อนขึ้น"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleMoveStory(idx, 'down')}
                            disabled={idx === storiesList.length - 1}
                            className="p-1 text-slate-400 hover:text-white disabled:opacity-30"
                            title="เลื่อนลง"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingStory(story)}
                            className="p-1 text-slate-400 hover:text-cyan-300"
                            title="แก้ไข"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteStory(story.id)}
                            className="p-1 text-rose-400 hover:text-rose-300"
                            title="ลบ"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 1: KNOWLEDGE BASE */}
          {activeTab === 'kb' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-[#061539] border border-cyan-500/20">
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    AI Training Data (คลังความรู้สำหรับ AI ประชาสัมพันธ์)
                  </h3>
                  <p className="text-xs text-slate-300">
                    ข้อมูลส่วนนี้จะถูกใช้เป็นสมองให้ผู้ช่วย AI นำไปตอบคำถามประชาชนอย่างแม่นยำ
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/40 text-xs font-medium cursor-pointer transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    <span>นำเข้า PDF / ภาพมัลติโมดอล</span>
                    <input
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  <button
                    onClick={() =>
                      setEditingKb({
                        title: '',
                        category: 'ข้อมูลทั่วไป',
                        content: '',
                        sourceType: 'raw_text',
                      })
                    }
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>เพิ่มข้อมูลใหม่</span>
                  </button>
                </div>
              </div>

              {multimodalNotice && (
                <div className="p-3 rounded-lg bg-blue-500/20 border border-blue-500/40 text-cyan-300 text-xs flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>{multimodalNotice}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.knowledgeBase.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl bg-[#07173e]/60 border border-cyan-500/20 hover:border-cyan-400/30 transition-colors flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="text-[11px] font-medium text-cyan-300">
                          {item.category}
                        </span>
                        <div className="flex items-center gap-1 text-[11px] text-slate-400">
                          {item.sourceType === 'url' && <LinkIcon className="w-3 h-3" />}
                          {item.sourceType === 'pdf_summary' && <FileText className="w-3 h-3" />}
                          {item.sourceType === 'infographic' && <ImageIcon className="w-3 h-3" />}
                          <span>{item.dateAdded}</span>
                        </div>
                      </div>
                      <h4 className="text-xs font-semibold text-white mb-1.5 line-clamp-1">
                        {item.title}
                      </h4>
                      <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                        {item.content}
                      </p>
                      {item.sourceUrl && (
                        <a
                          href={item.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-cyan-400 hover:underline mt-2"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>แหล่งอ้างอิง</span>
                        </a>
                      )}
                    </div>
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-cyan-500/20">
                      <button
                        onClick={() => setEditingKb(item)}
                        className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800"
                        title="แก้ไข"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteKb(item.id)}
                        className="p-1.5 text-rose-400 hover:text-rose-300 rounded hover:bg-rose-500/10"
                        title="ลบ"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: PUBLISHED WORKS */}
          {activeTab === 'works' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-[#061539] border border-cyan-500/20">
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    Media Library (คลังสื่อดิจิทัล & ข่าวสาร)
                  </h3>
                  <p className="text-xs text-slate-300">
                    จัดการรายการผลงาน พร้อมรูปภาพ Thumbnail ลิงก์ และคำอธิบาย
                  </p>
                </div>
                <button
                  onClick={() =>
                    setEditingWork({
                      title: '',
                      category: 'สื่อประชาสัมพันธ์',
                      description: '',
                      linkUrl: 'https://pr-request-system.vercel.app',
                      imageUrl: '/src/assets/images/sai_audit_hero_1791689796943.jpg',
                      views: '1,500',
                      badge: 'ผลงานใหม่',
                    })
                  }
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>เพิ่มผลงานเผยแพร่</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.publishedWorks.map((work) => (
                  <div
                    key={work.id}
                    className="p-3 rounded-xl bg-[#07173e]/60 border border-cyan-500/20 hover:border-cyan-400/30 transition-colors flex gap-4"
                  >
                    <img
                      src={work.imageUrl}
                      alt={work.title}
                      className="w-28 h-24 object-cover rounded-lg shrink-0 border border-cyan-500/30"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/src/assets/images/sai_audit_hero_1791689796943.jpg';
                      }}
                    />
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between text-[11px] text-cyan-300 mb-1">
                          <span>{work.category}</span>
                          <span className="text-slate-400">{work.publishDate}</span>
                        </div>
                        <h4 className="text-xs font-semibold text-white line-clamp-1">
                          {work.title}
                        </h4>
                        <p className="text-xs text-slate-300 line-clamp-2 mt-1">
                          {work.description}
                        </p>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-cyan-500/20">
                        <span className="text-[10px] text-slate-400">
                          เข้าชม {work.views} ครั้ง
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setEditingWork(work)}
                            className="p-1 text-slate-400 hover:text-white"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteWork(work.id)}
                            className="p-1 text-rose-400 hover:text-rose-300"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: VIRAL CLIPS */}
          {activeTab === 'clips' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-[#061539] border border-cyan-500/20">
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    คลิปไวรัลและสื่อวิดีโอยอดนิยม
                  </h3>
                  <p className="text-xs text-slate-300">
                    แสดงบนหน้าแรก พร้อมระยะเวลาและยอดผู้เข้าชม
                  </p>
                </div>
                <button
                  onClick={() =>
                    setEditingClip({
                      title: '',
                      creator: 'PR - SAI Thailand',
                      views: '100K',
                      duration: '01:30',
                      thumbnail: '/src/assets/images/sai_public_campaign_1791689820118.jpg',
                      linkUrl: 'https://youtube.com',
                      highlight: 'คลิปใหม่ล่าสุด',
                    })
                  }
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>เพิ่มคลิปไวรัล</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {data.viralClips.map((clip) => (
                  <div
                    key={clip.id}
                    className="p-3 rounded-xl bg-[#07173e]/60 border border-cyan-500/20 flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative aspect-video rounded-lg overflow-hidden mb-2 border border-cyan-500/20">
                        <img
                          src={clip.thumbnail}
                          alt={clip.title}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/80 text-[10px] text-white font-mono">
                          {clip.duration}
                        </span>
                      </div>
                      <h4 className="text-xs font-semibold text-white line-clamp-2">
                        {clip.title}
                      </h4>
                      <p className="text-[11px] text-slate-300 mt-1">{clip.highlight}</p>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-cyan-500/20 mt-2">
                      <span className="text-[10px] text-cyan-300 font-medium">
                        {clip.views} views
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setEditingClip(clip)}
                          className="p-1 text-slate-400 hover:text-white"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteClip(clip.id)}
                          className="p-1 text-rose-400 hover:text-rose-300"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: INCIDENT TIMELINE */}
          {activeTab === 'timeline' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-[#061539] border border-cyan-500/20">
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    ไทม์ไลน์สถานการณ์อาคาร สตง. ทรุดตัว (3D Interactive Timeline)
                  </h3>
                  <p className="text-xs text-slate-300">
                    ข้อมูลช่วงเวลา ผลการตรวจสอบทางวิศวกรรม ภาพถ่าย และมาตรการความปลอดภัย
                  </p>
                </div>
                <button
                  onClick={() =>
                    setEditingMilestone({
                      date: 'ตุลาคม 2569',
                      time: 'ล่าสุด',
                      phase: 'มาตรการตรวจสอบ',
                      title: '',
                      description: '',
                      status: 'กำลังปฏิบัติการ',
                      imageUrl: '/src/assets/images/sai_building_inspection_1791689807795.jpg',
                      technicalDetails: 'วิศวกรผู้เชี่ยวชาญเข้าตรวจสอบต่อเนื่อง',
                    })
                  }
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>เพิ่มจุดไทม์ไลน์</span>
                </button>
              </div>

              <div className="space-y-3">
                {data.incidentTimeline.map((item, idx) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl bg-[#07173e]/60 border border-cyan-500/20 flex flex-col sm:flex-row items-start justify-between gap-4"
                  >
                    <div className="flex items-start gap-4">
                      <span className="w-7 h-7 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 flex items-center justify-center text-xs font-mono shrink-0">
                        0{idx + 1}
                      </span>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[11px] text-cyan-300 font-semibold">
                            {item.phase}
                          </span>
                          <span className="text-slate-500">·</span>
                          <span className="text-[11px] text-slate-300">
                            {item.date} {item.time}
                          </span>
                          <span className="text-slate-500">·</span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            {item.status}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-white mb-1">{item.title}</h4>
                        <p className="text-xs text-slate-300 mb-2">{item.description}</p>
                        <p className="text-[11px] text-slate-300 bg-slate-950/70 p-2 rounded-lg border border-cyan-500/20">
                          <strong className="text-cyan-300">ข้อมูลวิศวกรรม:</strong>{' '}
                          {item.technicalDetails}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <div className="flex flex-col gap-1 mr-1">
                        <button
                          type="button"
                          onClick={() => handleMoveMilestone(idx, 'up')}
                          disabled={idx === 0}
                          title="เลื่อนขึ้น"
                          className="p-1 text-slate-400 hover:text-cyan-300 disabled:opacity-25 hover:bg-cyan-500/10 rounded transition-colors"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveMilestone(idx, 'down')}
                          disabled={idx === data.incidentTimeline.length - 1}
                          title="เลื่อนลง"
                          className="p-1 text-slate-400 hover:text-cyan-300 disabled:opacity-25 hover:bg-cyan-500/10 rounded transition-colors"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <button
                        onClick={() => setEditingMilestone(item)}
                        className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800"
                        title="แก้ไขโหนดไทม์ไลน์"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteMilestone(item.id)}
                        className="p-1.5 text-rose-400 hover:text-rose-300 rounded hover:bg-rose-500/10"
                        title="ลบโหนดไทม์ไลน์"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: BACKGROUND MUSIC & FIREBASE ONLINE SETTINGS */}
          {activeTab === 'music' && (
            <div className="space-y-6 text-left">
              {/* Firebase Online 24/7 Status Header */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#071946] to-[#041233] border border-cyan-500/40 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shrink-0">
                    <Database className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-white">Firebase Firestore Database (ออนไลน์ 24 ชม.)</h3>
                      <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/40">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                        ONLINE 24/7
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-0.5">
                      ฐานข้อมูลคลาวด์เชื่อมต่อสมบูรณ์: ข้อมูลสถิติผู้เข้าใช้, คลังความรู้ AI Grounding ตอบคำถาม 24 ชม., ภาพข่าว Hero ม้าหมุน, คลิป, และการตั้งค่าเพลง
                    </p>
                  </div>
                </div>
              </div>

              {/* Music Configuration Card */}
              <div className="p-5 sm:p-6 rounded-2xl bg-[#061539] border border-cyan-500/30 space-y-5">
                <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
                  <div className="flex items-center gap-2">
                    <Music className="w-4 h-4 text-cyan-400" />
                    <h4 className="text-sm font-bold text-white">ตั้งค่าเพลงประกอบเว็บไซต์ (Background Music)</h4>
                  </div>
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <span>เปิดใช้งานเพลงคลอ:</span>
                    <input
                      type="checkbox"
                      checked={musicSettings.enabled}
                      onChange={(e) => setMusicSettings({ ...musicSettings, enabled: e.target.checked })}
                      className="w-4 h-4 accent-cyan-400 rounded cursor-pointer"
                    />
                  </label>
                </div>

                {/* Google Drive Link Input */}
                {/* Google Drive Link Input & Presets */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-slate-200">
                      ลิงก์เพลงจาก Google Drive หรือ ลิงก์ไฟล์เสียง (Direct Audio Link):
                    </label>
                    <span className="text-[10px] text-cyan-400 font-mono">
                      ระบบแปลงสตรีมผ่าน Audio Proxy อัตโนมัติ
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <input
                      type="text"
                      value={musicSettings.driveUrl}
                      onChange={(e) => {
                        const newUrl = e.target.value;
                        const stream = parseGoogleDriveAudioUrl(newUrl);
                        setMusicSettings({
                          ...musicSettings,
                          driveUrl: newUrl,
                          streamUrl: stream,
                        });
                      }}
                      placeholder="วางลิงก์ เช่น https://drive.google.com/file/d/1.../view หรือ ลิงก์ mp3"
                      className="flex-1 px-3 py-2.5 bg-[#030d26] border border-cyan-500/40 focus:border-cyan-300 rounded-xl text-xs text-white placeholder-slate-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const stream = parseGoogleDriveAudioUrl(musicSettings.driveUrl);
                        const testAudio = new Audio(stream);
                        testAudio.volume = Math.max(0.05, musicSettings.defaultVolume);
                        testAudio
                          .play()
                          .then(() => {
                            setTimeout(() => {
                              testAudio.pause();
                            }, 6000);
                          })
                          .catch((err) => {
                            console.warn('Test playback notice:', err);
                            // Fallback direct preview
                            const fallback = new Audio('https://cdn.freesound.org/previews/612/612095_5674468-lq.mp3');
                            fallback.volume = musicSettings.defaultVolume;
                            fallback.play().then(() => setTimeout(() => fallback.pause(), 5000)).catch(() => {});
                          });
                      }}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500/30 to-blue-500/30 hover:from-cyan-500/40 hover:to-blue-500/40 text-cyan-300 border border-cyan-400/50 text-xs font-semibold whitespace-nowrap active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                      <span>ทดลองฟัง 6 วินาที</span>
                    </button>
                  </div>

                  {/* Quick Preset Selector Buttons */}
                  <div className="flex flex-wrap items-center gap-2 pt-0.5">
                    <span className="text-[10px] text-slate-400">เลือกทำนองแนะนำ:</span>
                    <button
                      type="button"
                      onClick={() => {
                        const link = 'https://drive.google.com/drive/u/0/home';
                        setMusicSettings({
                          ...musicSettings,
                          driveUrl: link,
                          streamUrl: parseGoogleDriveAudioUrl(link),
                          title: 'PR - SAI Thailand Ambient Melody (เพลงบรรเลงประชาสัมพันธ์)',
                        });
                      }}
                      className="text-[10px] px-2.5 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 transition-colors"
                    >
                      🎵 เพลงบรรเลงประชาสัมพันธ์ สตง.
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const link = 'https://cdn.freesound.org/previews/612/612095_5674468-lq.mp3';
                        setMusicSettings({
                          ...musicSettings,
                          driveUrl: link,
                          streamUrl: link,
                          title: 'Digital Tech & Data Ambient (ทำนองดิจิทัลตรวจเงินแผ่นดิน)',
                        });
                      }}
                      className="text-[10px] px-2.5 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 transition-colors"
                    >
                      🌐 ดิจิทัลโมเดิร์น สตง.
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const link = 'https://cdn.freesound.org/previews/415/415804_5121236-lq.mp3';
                        setMusicSettings({
                          ...musicSettings,
                          driveUrl: link,
                          streamUrl: link,
                          title: 'Peaceful Piano Harmony (เปียโนซอฟต์แอมเบียนต์)',
                        });
                      }}
                      className="text-[10px] px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 transition-colors"
                    >
                      🎹 เปียโนแอมเบียนต์ผ่อนคลาย
                    </button>
                  </div>

                  {/* Google Drive Guide Box */}
                  <div className="p-3.5 rounded-xl bg-[#030b20] border border-cyan-500/20 text-[11px] text-slate-300 space-y-1.5">
                    <p className="font-semibold text-cyan-300 flex items-center gap-1">
                      <span>💡 คำแนะนำการใส่ลิงก์เพลงจาก Google Drive:</span>
                    </p>
                    <ol className="list-decimal list-inside space-y-1 text-slate-400 text-[11px]">
                      <li>อัปโหลดไฟล์เพลง (.mp3 / .wav / .m4a) ขึ้น Google Drive ของท่าน</li>
                      <li>คลิกขวาที่ไฟล์ &gt; เลือก <strong>แชร์ (Share)</strong> &gt; ปรับสิทธิ์เป็น <strong>ทุกคนที่มีลิงก์ (Anyone with the link)</strong> เป็นผู้มีสิทธิ์ดู</li>
                      <li>กด <strong>คัดลอกลิงก์ (Copy link)</strong> แล้วนำมาวางในช่องด้านบนนี้</li>
                      <li>ระบบมีเซิร์ฟเวอร์ Audio Proxy จัดการดาวน์โหลดและสตรีมเสียงความคมชัดสูงให้โดยตรง ไม่ติดปัญหา CORS หรือการบล็อกของเบราว์เซอร์</li>
                    </ol>
                  </div>
                </div>

                {/* Track Title */}
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-200">ชื่อเพลงที่แสดงบนเครื่องเล่น:</label>
                  <input
                    type="text"
                    value={musicSettings.title || ''}
                    onChange={(e) => setMusicSettings({ ...musicSettings, title: e.target.value })}
                    className="w-full px-3 py-2 bg-[#030d26] border border-cyan-500/30 rounded-lg text-xs text-white"
                  />
                </div>

                {/* Sliders: Default Volume & Audio Ducking */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  {/* Default Volume (เปิด default เบาๆ) */}
                  <div className="p-4 rounded-xl bg-[#040e28] border border-cyan-500/20 space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-white flex items-center gap-1.5">
                        <Volume2 className="w-4 h-4 text-cyan-400" />
                        <span>ระดับเสียงปกติ (Default เบาๆ):</span>
                      </span>
                      <span className="font-mono text-cyan-300 font-bold text-sm">
                        {Math.round(musicSettings.defaultVolume * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.02"
                      max="0.40"
                      step="0.01"
                      value={musicSettings.defaultVolume}
                      onChange={(e) => setMusicSettings({ ...musicSettings, defaultVolume: parseFloat(e.target.value) })}
                      className="w-full accent-cyan-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
                    />
                    <p className="text-[10px] text-slate-400">
                      เสียงเพลงจะเปิดคลอเบาๆ ไม่ดังจนเกินไป สบายหูขณะเปิดอ่านข้อมูล (แนะนำ 15% - 20%)
                    </p>
                  </div>

                  {/* Ducking Volume (เมื่อเปิดคลิป เสียงลดจนแทบไม่ได้ยิน) */}
                  <div className="p-4 rounded-xl bg-[#040e28] border border-cyan-500/20 space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-white flex items-center gap-1.5">
                        <Film className="w-4 h-4 text-amber-400" />
                        <span>ระดับเสียงเมื่อเปิดคลิป (Audio Ducking):</span>
                      </span>
                      <span className="font-mono text-amber-300 font-bold text-sm">
                        {Math.round(musicSettings.duckingVolume * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.00"
                      max="0.08"
                      step="0.005"
                      value={musicSettings.duckingVolume}
                      onChange={(e) => setMusicSettings({ ...musicSettings, duckingVolume: parseFloat(e.target.value) })}
                      className="w-full accent-amber-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
                    />
                    <p className="text-[10px] text-slate-400">
                      หากผู้ใช้เปิดคลิปวิดีโอหรือคลิปไวรัล เพลงจะลดเสียงลงแทบจะไม่ได้ยินทันที เพื่อไม่ให้รบกวนเสียงคลิป (แนะนำ 2% - 3%)
                    </p>
                  </div>
                </div>

                {/* Save to Firebase Button */}
                <div className="flex justify-end pt-4 border-t border-cyan-500/20">
                  <button
                    type="button"
                    onClick={() => {
                      const stream = parseGoogleDriveAudioUrl(musicSettings.driveUrl);
                      const finalSettings = {
                        ...musicSettings,
                        streamUrl: stream,
                        updatedAt: new Date().toISOString(),
                      };
                      setMusicSettings(finalSettings);
                      triggerSave({ ...data, musicSettings: finalSettings });
                    }}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/25 active:scale-95 disabled:opacity-50 transition-all"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSaving ? 'กำลังบันทึกลง Firebase Firestore...' : 'บันทึกการตั้งค่าเพลงลง Firebase 24 ชม.'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal: Edit Hero Story */}
        {editingStory && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <div className="w-full max-w-lg bg-[#07173e] border border-cyan-400/40 rounded-2xl p-6 shadow-2xl space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
                <span>{editingStory.id ? 'แก้ไขภาพข่าวม้าหมุน' : 'เพิ่มภาพข่าวม้าหมุน (สูงสุด 10 เรื่อง)'}</span>
              </h3>
              <form onSubmit={handleSaveStory} className="space-y-3">
                <div>
                  <label className="block text-[11px] text-slate-300 mb-1">หัวข้อข่าว / ภาพข่าว</label>
                  <input
                    type="text"
                    value={editingStory.title || ''}
                    onChange={(e) => setEditingStory({ ...editingStory, title: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-[#030d26] border border-cyan-500/30 rounded-lg text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-300 mb-1">ข้อความรายละเอียด / สรุปข่าว</label>
                  <textarea
                    rows={3}
                    value={editingStory.subtitle || ''}
                    onChange={(e) => setEditingStory({ ...editingStory, subtitle: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-[#030d26] border border-cyan-500/30 rounded-lg text-xs text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-300 mb-1">หมวดหมู่ / แผนก</label>
                    <input
                      type="text"
                      value={editingStory.category || ''}
                      onChange={(e) => setEditingStory({ ...editingStory, category: e.target.value })}
                      required
                      className="w-full px-3 py-2 bg-[#030d26] border border-cyan-500/30 rounded-lg text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-300 mb-1">ป้ายกำกับ (Badge)</label>
                    <input
                      type="text"
                      value={editingStory.badge || ''}
                      onChange={(e) => setEditingStory({ ...editingStory, badge: e.target.value })}
                      className="w-full px-3 py-2 bg-[#030d26] border border-cyan-500/30 rounded-lg text-xs text-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-300 mb-1">วันที่เผยแพร่</label>
                    <input
                      type="text"
                      value={editingStory.date || ''}
                      onChange={(e) => setEditingStory({ ...editingStory, date: e.target.value })}
                      className="w-full px-3 py-2 bg-[#030d26] border border-cyan-500/30 rounded-lg text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-300 mb-1">ลิงก์ข่าว (URL)</label>
                    <input
                      type="text"
                      value={editingStory.linkUrl || ''}
                      onChange={(e) => setEditingStory({ ...editingStory, linkUrl: e.target.value })}
                      required
                      className="w-full px-3 py-2 bg-[#030d26] border border-cyan-500/30 rounded-lg text-xs text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] text-slate-300 mb-1">รูปภาพข่าว (URL หรือเลือกภาพธีมดิจิทัล)</label>
                  <input
                    type="text"
                    value={editingStory.imageUrl || ''}
                    onChange={(e) => setEditingStory({ ...editingStory, imageUrl: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-[#030d26] border border-cyan-500/30 rounded-lg text-xs text-white"
                  />
                  {/* Preset quick buttons */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    <button
                      type="button"
                      onClick={() =>
                        setEditingStory({
                          ...editingStory,
                          imageUrl: '/src/assets/images/sai_digital_network_1791693065277.jpg',
                        })
                      }
                      className="text-[10px] px-2 py-1 rounded bg-blue-500/20 text-cyan-300 border border-blue-400/30 hover:bg-blue-500/30"
                    >
                      เลือกภาพ: เครือข่ายดิจิทัล เมืองอัจฉริยะ
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setEditingStory({
                          ...editingStory,
                          imageUrl: '/src/assets/images/sai_earth_hologram_1791693076088.jpg',
                        })
                      }
                      className="text-[10px] px-2 py-1 rounded bg-blue-500/20 text-cyan-300 border border-blue-400/30 hover:bg-blue-500/30"
                    >
                      เลือกภาพ: โลกโฮโลกราฟิก เชื่อมต่อไทย
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setEditingStory({
                          ...editingStory,
                          imageUrl: '/src/assets/images/sai_building_inspection_1791689807795.jpg',
                        })
                      }
                      className="text-[10px] px-2 py-1 rounded bg-blue-500/20 text-cyan-300 border border-blue-400/30 hover:bg-blue-500/30"
                    >
                      เลือกภาพ: ตรวจสอบอาคาร สตง.
                    </button>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingStory(null)}
                    className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-bold"
                  >
                    บันทึกภาพข่าว
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Edit Knowledge Item */}
        {editingKb && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <div className="w-full max-w-lg bg-[#07173e] border border-cyan-400/40 rounded-2xl p-6 shadow-2xl space-y-4">
              <h3 className="text-sm font-bold text-white">
                {editingKb.id ? 'แก้ไขข้อมูลคลังความรู้' : 'เพิ่มข้อมูลใหม่เข้าคลังความรู้'}
              </h3>
              <form onSubmit={handleSaveKb} className="space-y-3">
                <div>
                  <label className="block text-[11px] text-slate-300 mb-1">หัวข้อความรู้</label>
                  <input
                    type="text"
                    value={editingKb.title || ''}
                    onChange={(e) => setEditingKb({ ...editingKb, title: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-[#030d26] border border-cyan-500/30 rounded-lg text-xs text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-300 mb-1">หมวดหมู่</label>
                    <input
                      type="text"
                      value={editingKb.category || ''}
                      onChange={(e) => setEditingKb({ ...editingKb, category: e.target.value })}
                      required
                      className="w-full px-3 py-2 bg-[#030d26] border border-cyan-500/30 rounded-lg text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-300 mb-1">ประเภทที่มา</label>
                    <select
                      value={editingKb.sourceType || 'raw_text'}
                      onChange={(e) =>
                        setEditingKb({
                          ...editingKb,
                          sourceType: e.target.value as KnowledgeItem['sourceType'],
                        })
                      }
                      className="w-full px-3 py-2 bg-[#030d26] border border-cyan-500/30 rounded-lg text-xs text-white"
                    >
                      <option value="raw_text">ข้อความดิบ (Raw Text)</option>
                      <option value="url">ลิงก์ URL</option>
                      <option value="pdf_summary">สรุป PDF</option>
                      <option value="infographic">อินโฟกราฟิก</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] text-slate-300 mb-1">เนื้อหาความรู้</label>
                  <textarea
                    rows={4}
                    value={editingKb.content || ''}
                    onChange={(e) => setEditingKb({ ...editingKb, content: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-[#030d26] border border-cyan-500/30 rounded-lg text-xs text-white leading-relaxed"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-300 mb-1">
                    URL อ้างอิง (ถ้ามี)
                  </label>
                  <input
                    type="url"
                    value={editingKb.sourceUrl || ''}
                    onChange={(e) => setEditingKb({ ...editingKb, sourceUrl: e.target.value })}
                    className="w-full px-3 py-2 bg-[#030d26] border border-cyan-500/30 rounded-lg text-xs text-white"
                    placeholder="https://..."
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingKb(null)}
                    className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-bold"
                  >
                    บันทึกข้อมูล
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Edit Published Work */}
        {editingWork && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <div className="w-full max-w-lg bg-[#07173e] border border-cyan-400/40 rounded-2xl p-6 shadow-2xl space-y-4">
              <h3 className="text-sm font-bold text-white">
                {editingWork.id ? 'แก้ไขผลงานเผยแพร่' : 'เพิ่มผลงานเผยแพร่ใหม่'}
              </h3>
              <form onSubmit={handleSaveWork} className="space-y-3">
                <div>
                  <label className="block text-[11px] text-slate-300 mb-1">ชื่อผลงาน / ข่าว</label>
                  <input
                    type="text"
                    value={editingWork.title || ''}
                    onChange={(e) => setEditingWork({ ...editingWork, title: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-[#030d26] border border-cyan-500/30 rounded-lg text-xs text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-300 mb-1">หมวดหมู่</label>
                    <input
                      type="text"
                      value={editingWork.category || ''}
                      onChange={(e) => setEditingWork({ ...editingWork, category: e.target.value })}
                      required
                      className="w-full px-3 py-2 bg-[#030d26] border border-cyan-500/30 rounded-lg text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-300 mb-1">รูปแบบสื่อ (Media Type)</label>
                    <select
                      value={editingWork.mediaType || 'photo'}
                      onChange={(e) =>
                        setEditingWork({
                          ...editingWork,
                          mediaType: e.target.value as PublishedWork['mediaType'],
                        })
                      }
                      className="w-full px-3 py-2 bg-[#030d26] border border-cyan-500/30 rounded-lg text-xs text-white"
                    >
                      <option value="photo">📷 ภาพนิ่ง (Photo)</option>
                      <option value="infographic">📊 อินโฟกราฟิก (Infographic)</option>
                      <option value="video">🎬 วิดีโอ & สารคดี (Video)</option>
                      <option value="report">📄 รายงาน & ข้อเท็จจริง (Report)</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] text-slate-300 mb-1">ป้ายกำกับ (Badge)</label>
                  <input
                    type="text"
                    value={editingWork.badge || ''}
                    onChange={(e) => setEditingWork({ ...editingWork, badge: e.target.value })}
                    className="w-full px-3 py-2 bg-[#030d26] border border-cyan-500/30 rounded-lg text-xs text-white"
                    placeholder="เช่น 📷 ภาพนิ่งล่าสุด, 📊 Infographic"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-300 mb-1">คำอธิบายรายละเอียด</label>
                  <textarea
                    rows={3}
                    value={editingWork.description || ''}
                    onChange={(e) => setEditingWork({ ...editingWork, description: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-[#030d26] border border-cyan-500/30 rounded-lg text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-300 mb-1">ลิงก์ผลงาน (URL)</label>
                  <input
                    type="url"
                    value={editingWork.linkUrl || ''}
                    onChange={(e) => setEditingWork({ ...editingWork, linkUrl: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-[#030d26] border border-cyan-500/30 rounded-lg text-xs text-white"
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-300 mb-1">รูป Thumbnail URL</label>
                  <input
                    type="text"
                    value={editingWork.imageUrl || ''}
                    onChange={(e) => setEditingWork({ ...editingWork, imageUrl: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-[#030d26] border border-cyan-500/30 rounded-lg text-xs text-white"
                  />
                  {/* Preset quick buttons */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    <button
                      type="button"
                      onClick={() =>
                        setEditingWork({
                          ...editingWork,
                          imageUrl: '/src/assets/images/sai_press_photo_1791791796122.jpg',
                          mediaType: 'photo',
                        })
                      }
                      className="text-[10px] px-2 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 hover:bg-emerald-500/30"
                    >
                      📷 เลือกภาพนิ่ง: คณะผู้ตรวจการ สตง.
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setEditingWork({
                          ...editingWork,
                          imageUrl: '/src/assets/images/sai_infographic_stats_1791791809566.jpg',
                          mediaType: 'infographic',
                        })
                      }
                      className="text-[10px] px-2 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-400/30 hover:bg-amber-500/30"
                    >
                      📊 เลือกภาพ: Infographic สรุปงบประมาณ
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setEditingWork({
                          ...editingWork,
                          imageUrl: '/src/assets/images/sai_video_broadcast_1791791820641.jpg',
                          mediaType: 'video',
                        })
                      }
                      className="text-[10px] px-2 py-1 rounded bg-rose-500/20 text-rose-300 border border-rose-400/30 hover:bg-rose-500/30"
                    >
                      🎬 เลือกภาพ: สตูดิโอวิดีโอ สตง.
                    </button>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingWork(null)}
                    className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-bold"
                  >
                    บันทึกผลงาน
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Edit Milestone */}
        {editingMilestone && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <div className="w-full max-w-lg bg-[#07173e] border border-cyan-400/40 rounded-2xl p-6 shadow-2xl space-y-4">
              <h3 className="text-sm font-bold text-white">
                {editingMilestone.id ? 'แก้ไขจุดไทม์ไลน์อาคาร สตง.' : 'เพิ่มจุดไทม์ไลน์อาคาร สตง.'}
              </h3>
              <form onSubmit={handleSaveMilestone} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-300 mb-1">วันที่ (แสดงเด่นชัดเจน)</label>
                    <input
                      type="text"
                      value={editingMilestone.date || ''}
                      onChange={(e) =>
                        setEditingMilestone({ ...editingMilestone, date: e.target.value })
                      }
                      placeholder="เช่น 28 กันยายน 2569"
                      required
                      className="w-full px-3 py-2 bg-[#030d26] border border-cyan-500/30 rounded-lg text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-300 mb-1">เวลา</label>
                    <input
                      type="text"
                      value={editingMilestone.time || ''}
                      onChange={(e) =>
                        setEditingMilestone({ ...editingMilestone, time: e.target.value })
                      }
                      placeholder="เช่น 09:30 น. หรือ ล่าสุด"
                      className="w-full px-3 py-2 bg-[#030d26] border border-cyan-500/30 rounded-lg text-xs text-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-300 mb-1">เฟส / ขั้นตอน</label>
                    <input
                      type="text"
                      value={editingMilestone.phase || ''}
                      onChange={(e) =>
                        setEditingMilestone({ ...editingMilestone, phase: e.target.value })
                      }
                      placeholder="เช่น ตรวจพบความผิดปกติ"
                      required
                      className="w-full px-3 py-2 bg-[#030d26] border border-cyan-500/30 rounded-lg text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-300 mb-1">สถานะโหนด</label>
                    <select
                      value={editingMilestone.status || 'ดำเนินการ'}
                      onChange={(e) =>
                        setEditingMilestone({ ...editingMilestone, status: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-[#030d26] border border-cyan-500/30 rounded-lg text-xs text-white"
                    >
                      <option value="เรียบร้อย">เรียบร้อย (เสร็จสิ้น)</option>
                      <option value="ดำเนินการแล้ว">ดำเนินการแล้ว</option>
                      <option value="วิเคราะห์ข้อมูล">วิเคราะห์ข้อมูล (เฝ้าระวัง)</option>
                      <option value="กำลังปฏิบัติการ">กำลังปฏิบัติการ (ล่าสุด/เรียลไทม์)</option>
                      <option value="วางแผนระยะยาว">วางแผนระยะยาว</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] text-slate-300 mb-1">URL ภาพถ่ายการตรวจสอบ / งานวิศวกรรม</label>
                  <input
                    type="text"
                    value={editingMilestone.imageUrl || ''}
                    onChange={(e) =>
                      setEditingMilestone({ ...editingMilestone, imageUrl: e.target.value })
                    }
                    placeholder="/src/assets/images/... หรือ URL รูปภาพ"
                    className="w-full px-3 py-2 bg-[#030d26] border border-cyan-500/30 rounded-lg text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-300 mb-1">หัวข้อเหตุการณ์</label>
                  <input
                    type="text"
                    value={editingMilestone.title || ''}
                    onChange={(e) =>
                      setEditingMilestone({ ...editingMilestone, title: e.target.value })
                    }
                    required
                    className="w-full px-3 py-2 bg-[#030d26] border border-cyan-500/30 rounded-lg text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-300 mb-1">คำอธิบายเหตุการณ์</label>
                  <textarea
                    rows={3}
                    value={editingMilestone.description || ''}
                    onChange={(e) =>
                      setEditingMilestone({ ...editingMilestone, description: e.target.value })
                    }
                    required
                    className="w-full px-3 py-2 bg-[#030d26] border border-cyan-500/30 rounded-lg text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-300 mb-1">รายละเอียดทางวิศวกรรม</label>
                  <textarea
                    rows={2}
                    value={editingMilestone.technicalDetails || ''}
                    onChange={(e) =>
                      setEditingMilestone({ ...editingMilestone, technicalDetails: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-[#030d26] border border-cyan-500/30 rounded-lg text-xs text-white"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingMilestone(null)}
                    className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-bold"
                  >
                    บันทึกไทม์ไลน์
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Test Share Modal */}
        <ShareModal
          isOpen={!!testShareItem}
          onClose={() => setTestShareItem(null)}
          item={testShareItem}
        />
      </div>
    </div>
  );
};
