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
  HelpCircle,
  Bot,
  Bell,
  Send,
  AlertTriangle,
  Mail,
  Filter,
  Search,
  CheckCircle2
} from 'lucide-react';
import {
  AppData,
  KnowledgeItem,
  PublishedWork,
  ViralClip,
  IncidentMilestone,
  HeroStory,
  MusicSettings,
  ChatbotSettings,
  NewsSubscriber,
  NewsBroadcastLog
} from '../types';
import {
  defaultMusicSettings,
  defaultChatbotSettings,
  defaultNewsSubscribers,
  defaultNewsBroadcasts,
  parseGoogleDriveAudioUrl,
  saveNewsSubscriber,
  deleteNewsSubscriber,
  saveNewsBroadcast
} from '../firebase';
import { getAnalyticsSummary, AnalyticsSummary } from '../utils/analytics';
import { ShareModal } from './ShareModal';
import { PublishBroadcastConfirmModal } from './PublishBroadcastConfirmModal';
import { SmtpConfigModal } from './SmtpConfigModal';
import { AICoverStudioModal } from './AICoverStudioModal';
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
  const [activeTab, setActiveTab] = useState<'summaries' | 'chatbot' | 'stories' | 'subscribers' | 'kb' | 'works' | 'clips' | 'timeline' | 'music'>('summaries');
  const [timeframe, setTimeframe] = useState<'today' | '7days' | '30days' | 'all'>('7days');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsSummary>(getAnalyticsSummary());
  const [isRefreshingStats, setIsRefreshingStats] = useState(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);
  const [testShareItem, setTestShareItem] = useState<{ id: string; title: string; category?: string; linkUrl?: string } | null>(null);

  // News Subscribers Management & Pre-Publish Broadcast Confirmation
  const [pendingPublishStory, setPendingPublishStory] = useState<HeroStory | null>(null);
  const [subscriberSearch, setSubscriberSearch] = useState('');
  const [subscriberCategoryFilter, setSubscriberCategoryFilter] = useState('all');
  const [newSubscriberEmail, setNewSubscriberEmail] = useState('');
  const [newSubscriberStoryId, setNewSubscriberStoryId] = useState('');
  const [broadcastSuccessNotice, setBroadcastSuccessNotice] = useState<string | null>(null);
  const [manualAddSuccess, setManualAddSuccess] = useState<string | null>(null);

  // Real SMTP Management & Delivery Receipt State
  const [showSmtpModal, setShowSmtpModal] = useState(false);
  const [smtpStatus, setSmtpStatus] = useState<any>(null);
  const [deliveryReceipt, setDeliveryReceipt] = useState<{
    isOpen: boolean;
    isRealDelivery: boolean;
    deliveredCount: number;
    failedCount: number;
    deliveredEmails: string[];
    failedEmails: { email: string; error: string }[];
    previewUrl?: string;
    warning?: string;
    storyTitle: string;
  } | null>(null);

  const fetchSmtpStatus = async () => {
    try {
      const res = await fetch('/api/email/smtp-status');
      if (res.ok) {
        const d = await res.json();
        setSmtpStatus(d);
      }
    } catch (e) {
      console.warn('Failed to fetch smtp status', e);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchSmtpStatus();
    }
  }, [isOpen]);

  // Direct Audio Quick Controller inside Admin
  const [isAdminAudioPlaying, setIsAdminAudioPlaying] = useState(false);
  const adminAudioRef = useRef<HTMLAudioElement | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Background Music state
  const [musicSettings, setMusicSettings] = useState<MusicSettings>(
    data.musicSettings || defaultMusicSettings
  );

  // Chatbot Settings state (ควบคุมการเปิด/ปิด AI Chatbot)
  const [chatbotSettings, setChatbotSettings] = useState<ChatbotSettings>(
    data.chatbotSettings || defaultChatbotSettings
  );

  useEffect(() => {
    if (data.chatbotSettings) {
      setChatbotSettings(data.chatbotSettings);
    }
  }, [data.chatbotSettings]);

  // Modals for editing / adding
  const [editingStory, setEditingStory] = useState<Partial<HeroStory> | null>(null);
  const [editingKb, setEditingKb] = useState<Partial<KnowledgeItem> | null>(null);
  const [editingWork, setEditingWork] = useState<Partial<PublishedWork> | null>(null);
  const [editingClip, setEditingClip] = useState<Partial<ViralClip> | null>(null);
  const [editingMilestone, setEditingMilestone] = useState<Partial<IncidentMilestone> | null>(null);

  // Hero Story Cover Image Upload & AI Generator State
  const coverFileInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [showAiCoverModal, setShowAiCoverModal] = useState(false);
  const [uploadCoverSuccess, setUploadCoverSuccess] = useState<string | null>(null);

  const handleCoverFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingCover(true);
      playDigitalSound('select');

      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64Data = event.target?.result as string;
        if (!base64Data) return;

        try {
          const res = await fetch('/api/upload-cover', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              imageBase64: base64Data,
              filename: file.name,
            }),
          });

          if (res.ok) {
            const resData = await res.json();
            if (resData.imageUrl) {
              setEditingStory((prev) => (prev ? { ...prev, imageUrl: resData.imageUrl } : prev));
              setUploadCoverSuccess(`อัปโหลด "${file.name}" จากเครื่องสำเร็จ!`);
              playDigitalSound('confirm');
              setTimeout(() => setUploadCoverSuccess(null), 4000);
            }
          } else {
            // Fallback directly to base64 data URL
            setEditingStory((prev) => (prev ? { ...prev, imageUrl: base64Data } : prev));
            setUploadCoverSuccess(`โหลดภาพ "${file.name}" เข้าสู่ระบบเรียบร้อย!`);
            playDigitalSound('confirm');
            setTimeout(() => setUploadCoverSuccess(null), 4000);
          }
        } catch (uploadErr) {
          setEditingStory((prev) => (prev ? { ...prev, imageUrl: base64Data } : prev));
          setUploadCoverSuccess(`โหลดภาพเข้าสู่ระบบเรียบร้อย!`);
          playDigitalSound('confirm');
          setTimeout(() => setUploadCoverSuccess(null), 4000);
        } finally {
          setIsUploadingCover(false);
          if (coverFileInputRef.current) coverFileInputRef.current.value = '';
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('File reading error:', err);
      setIsUploadingCover(false);
    }
  };

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

  // Toggle AI Chatbot On/Off
  const handleToggleChatbot = async (enabledState: boolean) => {
    playDigitalSound(enabledState ? 'select' : 'blip');
    const updated: ChatbotSettings = {
      ...chatbotSettings,
      enabled: enabledState,
      autoOpen: enabledState ? true : chatbotSettings.autoOpen,
      updatedAt: new Date().toISOString(),
    };
    setChatbotSettings(updated);
    const updatedData: AppData = {
      ...data,
      chatbotSettings: updated,
    };
    await triggerSave(updatedData);
  };

  // Save detailed Chatbot Settings
  const handleSaveChatbotSettings = async () => {
    playDigitalSound('select');
    const updated: ChatbotSettings = {
      ...chatbotSettings,
      updatedAt: new Date().toISOString(),
    };
    setChatbotSettings(updated);
    const updatedData: AppData = {
      ...data,
      chatbotSettings: updated,
    };
    await triggerSave(updatedData);
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
  const subscribersList = data.newsSubscribers || defaultNewsSubscribers;
  const broadcastsList = data.newsBroadcasts || defaultNewsBroadcasts;

  // Hero Story Handlers - Pre-Publish Confirmation Workflow
  const handleSaveStory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStory || !editingStory.title) return;

    let storyObj: HeroStory;
    if (editingStory.id) {
      const existing = storiesList.find((s) => s.id === editingStory.id) || {};
      storyObj = { ...existing, ...editingStory } as HeroStory;
    } else {
      if (storiesList.length >= 10) {
        alert('ภาพข่าวม้าหมุน Hero รองรับได้สูงสุด 10 เรื่อง กรุณาลบเรื่องเดิมออกก่อนเพิ่มใหม่');
        return;
      }
      storyObj = {
        id: `story-${Date.now()}`,
        title: editingStory.title || '',
        subtitle: editingStory.subtitle || '',
        category: editingStory.category || 'ข่าวเด่น สตง.',
        imageUrl: editingStory.imageUrl || '/src/assets/images/sai_digital_network_1791693065277.jpg',
        linkUrl: editingStory.linkUrl || 'https://pr-request-system.vercel.app',
        date: editingStory.date || 'ตุลาคม 2569',
        badge: editingStory.badge || 'ข่าวใหม่',
        order: storiesList.length + 1,
      };
    }

    // Close edit modal and open Pre-publish confirmation dialog with AI recommendation
    playDigitalSound('select');
    setEditingStory(null);
    setPendingPublishStory(storyObj);
  };

  const handleConfirmPublishAndBroadcast = async (
    storyToSave: HeroStory,
    broadcastPayload?: {
      recipients: string[];
      subject: string;
      body: string;
      aiGenerated: boolean;
    }
  ) => {
    let updatedStories = [...storiesList];
    const existingIdx = updatedStories.findIndex((s) => s.id === storyToSave.id);
    if (existingIdx >= 0) {
      updatedStories[existingIdx] = storyToSave;
    } else {
      updatedStories.push(storyToSave);
    }

    let updatedSubscribers = [...subscribersList];
    let updatedBroadcasts = [...broadcastsList];

    if (broadcastPayload && broadcastPayload.recipients.length > 0) {
      const newBroadcastLog: NewsBroadcastLog = {
        id: `bcast_${Date.now()}`,
        storyId: storyToSave.id,
        storyTitle: storyToSave.title,
        subject: broadcastPayload.subject,
        summary: broadcastPayload.body.slice(0, 160),
        recipientCount: broadcastPayload.recipients.length,
        recipients: broadcastPayload.recipients,
        aiGenerated: broadcastPayload.aiGenerated,
        sentAt: new Date().toISOString(),
      };
      updatedBroadcasts.unshift(newBroadcastLog);
      await saveNewsBroadcast(newBroadcastLog).catch(() => null);

      // Update subscriber notification counts
      updatedSubscribers = updatedSubscribers.map((sub) => {
        if (broadcastPayload.recipients.includes(sub.email)) {
          const updatedSub: NewsSubscriber = {
            ...sub,
            notifyCount: (sub.notifyCount || 0) + 1,
            lastNotifiedAt: new Date().toISOString(),
          };
          saveNewsSubscriber(updatedSub).catch(() => null);
          return updatedSub;
        }
        return sub;
      });

      // Call express broadcast endpoint with full story details for real email rendering
      let broadcastResultData: any = null;
      try {
        const bRes = await fetch('/api/broadcast', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...newBroadcastLog,
            story: storyToSave,
          }),
        });
        if (bRes.ok) {
          broadcastResultData = await bRes.json();
        }
      } catch (err) {
        console.error('Broadcast dispatch error:', err);
      }

      if (broadcastResultData) {
        const isReal = Boolean(broadcastResultData.isRealDelivery);
        const delivered = broadcastResultData.deliveredCount ?? broadcastPayload.recipients.length;
        const failed = broadcastResultData.failedCount ?? 0;

        setDeliveryReceipt({
          isOpen: true,
          isRealDelivery: isReal,
          deliveredCount: delivered,
          failedCount: failed,
          deliveredEmails: broadcastResultData.broadcast?.deliveredEmails || broadcastPayload.recipients,
          failedEmails: broadcastResultData.broadcast?.failedEmails || [],
          previewUrl: broadcastResultData.previewUrl,
          warning: broadcastResultData.warning,
          storyTitle: storyToSave.title,
        });

        if (isReal && delivered > 0) {
          setBroadcastSuccessNotice(
            `ส่งอีเมลจริงสำเร็จไปยัง ${delivered} ผู้ติดตาม (ผ่าน SMTP) เรียบร้อยแล้ว!`
          );
        } else if (!isReal) {
          setBroadcastSuccessNotice(
            `บันทึกข่าวแล้ว (การส่งอยู่ในโหมดจำลอง Ethereal เนื่องจากยังไม่ได้ตั้งค่า SMTP จริง)`
          );
        }
      } else {
        setBroadcastSuccessNotice(
          `บันทึกข่าวและส่งอีเมลแจ้งเตือนไปยัง ${broadcastPayload.recipients.length} อีเมลเรียบร้อยแล้ว!`
        );
      }
      setTimeout(() => setBroadcastSuccessNotice(null), 8000);
    }

    await triggerSave({
      ...data,
      heroStories: updatedStories,
      newsSubscribers: updatedSubscribers,
      newsBroadcasts: updatedBroadcasts,
    });
    setEditingStory(null);
    setPendingPublishStory(null);
  };

  const handleConfirmPublishOnly = async (storyToSave: HeroStory) => {
    let updatedStories = [...storiesList];
    const existingIdx = updatedStories.findIndex((s) => s.id === storyToSave.id);
    if (existingIdx >= 0) {
      updatedStories[existingIdx] = storyToSave;
    } else {
      updatedStories.push(storyToSave);
    }

    await triggerSave({ ...data, heroStories: updatedStories });
    setEditingStory(null);
    setPendingPublishStory(null);
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

  // Subscriber Management Handlers
  const handleDeleteSubscriber = async (id: string) => {
    playDigitalSound('blip');
    if (!window.confirm('คุณต้องการลบอีเมลผู้ติดตามนี้หรือไม่?')) return;
    try {
      await deleteNewsSubscriber(id).catch(() => null);
      fetch(`/api/subscribers/${id}`, { method: 'DELETE' }).catch(() => null);
      const updated = subscribersList.filter((s) => s.id !== id);
      await triggerSave({ ...data, newsSubscribers: updated });
    } catch (err) {
      console.error('Delete subscriber error:', err);
    }
  };

  const handleAddSubscriberManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubscriberEmail.trim()) return;

    const linkedStory = storiesList.find((s) => s.id === newSubscriberStoryId) || storiesList[0];
    const newSub: NewsSubscriber = {
      id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      email: newSubscriberEmail.trim().toLowerCase(),
      storyId: linkedStory?.id || 'story-photo-1',
      storyTitle: linkedStory?.title || 'ข่าวเด่น สตง.',
      category: linkedStory?.category || 'ข่าวเด่น สตง.',
      subscribedAt: new Date().toISOString(),
      active: true,
      tags: [linkedStory?.category || 'ข่าวเด่น'],
      notifyCount: 0,
      updatedAt: new Date().toISOString(),
    };

    try {
      await saveNewsSubscriber(newSub).catch(() => null);
      fetch('/api/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSub),
      }).catch(() => null);

      const updated = [newSub, ...subscribersList.filter((s) => s.email !== newSub.email || s.storyId !== newSub.storyId)];
      await triggerSave({ ...data, newsSubscribers: updated });

      setNewSubscriberEmail('');
      setManualAddSuccess(`เพิ่มอีเมล ${newSub.email} เรียบร้อยแล้ว`);
      setTimeout(() => setManualAddSuccess(null), 3500);
      playDigitalSound('confirm');
    } catch (err) {
      console.error('Add subscriber error:', err);
    }
  };

  const handleExportSubscribersCSV = () => {
    playDigitalSound('click');
    const headers = ['ลำดับ', 'อีเมล', 'ติดตามจากข่าว (Story Title)', 'หมวดหมู่ (Category)', 'วันที่ติดตาม (Subscribed Date)', 'จำนวนแจ้งเตือนที่ได้รับ (Notified Count)'];
    const rows = subscribersList.map((s, idx) => [
      idx + 1,
      `"${s.email}"`,
      `"${(s.storyTitle || '').replace(/"/g, '""')}"`,
      `"${(s.category || '').replace(/"/g, '""')}"`,
      `"${s.subscribedAt || ''}"`,
      s.notifyCount || 0,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `sai_news_subscribers_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
        shortTitle: editingMilestone.shortTitle || '',
        fullStatement: editingMilestone.fullStatement || '',
        mediaType: editingMilestone.mediaType || 'photo',
        videoUrl: editingMilestone.videoUrl || '',
        referenceTitle: editingMilestone.referenceTitle || '',
        referenceUrl: editingMilestone.referenceUrl || '',
        colorAccent: editingMilestone.colorAccent || 'orange',
        icon: editingMilestone.icon || 'lightbulb',
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
              setActiveTab('chatbot');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors shrink-0 ${
              activeTab === 'chatbot'
                ? 'bg-gradient-to-r from-cyan-500/30 to-blue-600/30 text-cyan-200 border border-cyan-400 font-bold shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Bot className="w-3.5 h-3.5 text-cyan-400" />
            <span>AI Chatbot</span>
            <span
              className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                chatbotSettings.enabled
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
              }`}
            >
              {chatbotSettings.enabled ? 'เปิด' : 'ปิด'}
            </span>
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
            onClick={() => {
              playDigitalSound('select');
              setActiveTab('subscribers');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors shrink-0 ${
              activeTab === 'subscribers'
                ? 'bg-gradient-to-r from-amber-500/30 to-yellow-600/30 text-amber-200 border border-amber-400 font-bold shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Bell className="w-3.5 h-3.5 text-amber-400" />
            <span>ผู้ติดตามข่าว Hero ({subscribersList.length})</span>
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
                      setActiveTab('chatbot');
                    }}
                    className="p-3 rounded-xl bg-[#030c26] hover:bg-cyan-500/20 border border-cyan-500/30 text-left transition-all hover:scale-[1.02]"
                  >
                    <Bot className="w-4 h-4 text-cyan-400 mb-1" />
                    <span className="text-xs font-bold text-white block">AI Chatbot</span>
                    <span
                      className={`text-[10px] font-mono ${
                        chatbotSettings.enabled ? 'text-emerald-400 font-bold' : 'text-rose-400'
                      }`}
                    >
                      {chatbotSettings.enabled ? 'เปิดใช้งาน' : 'ปิด'}
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

          {/* TAB: AI CHATBOT MANAGEMENT (เปิด/ปิด และควบคุมการแสดงผล) */}
          {activeTab === 'chatbot' && (
            <div className="space-y-6 text-left animate-fadeIn">
              {/* Header Banner */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-[#071d49] via-[#05173f] to-[#040e28] border border-cyan-500/40 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-400 via-sky-400 to-blue-600 flex items-center justify-center text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.5)] shrink-0">
                    <Bot className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base sm:text-lg font-bold text-white">
                        จัดการและควบคุม AI Chatbot ประชาสัมพันธ์ (PR - SAI AI Assistant)
                      </h3>
                      <span
                        className={`text-[10px] px-2.5 py-0.5 rounded-full font-mono font-bold border ${
                          chatbotSettings.enabled
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                            : 'bg-rose-500/20 text-rose-300 border-rose-500/50'
                        }`}
                      >
                        {chatbotSettings.enabled ? '● ONLINE' : '○ DISABLED'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1">
                      ตั้งค่าการเปิด/ปิด AI Chatbot บนหน้าเว็บ: หากปิด ผู้ใช้งานทั่วไปจะไม่เห็น Chatbot เลย หากเปิด หน้าต่างจะขึ้นมาทันทีแม้อยู่หน้าแรกของทุกมุมมอง
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleSaveChatbotSettings}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/30 transition-all active:scale-95 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSaving ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า Chatbot'}</span>
                  </button>
                </div>
              </div>

              {/* Master Control: Big Toggle & Status Card */}
              <div
                className={`p-6 rounded-2xl border transition-all duration-300 ${
                  chatbotSettings.enabled
                    ? 'bg-gradient-to-b from-[#061d40]/90 to-[#041233]/95 border-emerald-400/50 shadow-[0_0_30px_rgba(16,185,129,0.15)]'
                    : 'bg-gradient-to-b from-[#1b1525]/90 to-[#0c0d1c]/95 border-rose-500/40 shadow-[0_0_30px_rgba(244,63,94,0.1)]'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        สวิตช์หลักควบคุมการแสดงผล (Master Display Switch)
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div
                        className={`w-4 h-4 rounded-full ${
                          chatbotSettings.enabled
                            ? 'bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)] animate-pulse'
                            : 'bg-rose-500'
                        }`}
                      />
                      <h4 className="text-xl sm:text-2xl font-black text-white">
                        {chatbotSettings.enabled ? 'เปิดใช้งาน AI Chatbot' : 'ปิดการใช้งาน AI Chatbot'}
                      </h4>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
                      {chatbotSettings.enabled ? (
                        <span className="text-emerald-300/90">
                          ✓ <strong>เปิดใช้งานอยู่:</strong> ผู้ใช้งานทุกคนจะเห็น AI Chatbot และหน้าต่างสนทนาจะ{' '}
                          <span className="underline decoration-cyan-400 underline-offset-2 font-bold text-white">
                            เปิดขึ้นมาทันทีต้อนรับผู้ใช้งานตั้งแต่หน้าแรกในทุกมุมมอง
                          </span>{' '}
                          (Desktop, Tablet, Smartphone) ช่วยตอบคำถามเรื่องภารกิจ สตง. และสถานการณ์อาคาร สตง. ทรุดตัว ได้ 24 ชม.
                        </span>
                      ) : (
                        <span className="text-rose-300/90">
                          ✕ <strong>ปิดการใช้งานอยู่:</strong> ผู้ใช้งานทั่วไปจะไม่เห็น AI Chatbot เลย (ระบบจะซ่อนไอคอนปุ่มแชทลอยและหน้าต่างสนทนาทั้งหมด 100%)
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Fast Action Buttons */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleToggleChatbot(true)}
                      className={`flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-md active:scale-95 ${
                        chatbotSettings.enabled
                          ? 'bg-emerald-500 text-slate-950 ring-2 ring-emerald-300 shadow-emerald-500/30'
                          : 'bg-slate-800/80 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      }`}
                    >
                      <Check className="w-4 h-4" />
                      <span>เปิดใช้งาน (Active)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggleChatbot(false)}
                      className={`flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-md active:scale-95 ${
                        !chatbotSettings.enabled
                          ? 'bg-rose-500 text-white ring-2 ring-rose-300 shadow-rose-500/30'
                          : 'bg-slate-800/80 hover:bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      }`}
                    >
                      <X className="w-4 h-4" />
                      <span>ปิดการใช้งาน (Disable)</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Behavior & Customization Options */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* 1. Behavior Options */}
                <div className="p-5 rounded-2xl bg-[#061539] border border-cyan-500/30 space-y-4">
                  <div className="flex items-center gap-2 border-b border-cyan-500/20 pb-3">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <h4 className="text-sm font-bold text-white">
                      พฤติกรรมการแสดงผลเมื่อเปิดใช้งาน (Display Behavior)
                    </h4>
                  </div>

                  <div className="space-y-3">
                    {/* Auto-Open Option */}
                    <label className="flex items-start gap-3 p-3.5 rounded-xl bg-[#040e28] border border-cyan-500/20 hover:border-cyan-400/40 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={chatbotSettings.autoOpen}
                        onChange={(e) =>
                          setChatbotSettings({
                            ...chatbotSettings,
                            autoOpen: e.target.checked,
                          })
                        }
                        className="w-4 h-4 mt-0.5 accent-cyan-400 rounded cursor-pointer shrink-0"
                      />
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-white block">
                          เปิดหน้าต่างแชทขึ้นมาทันทีเมื่อเข้าชมหน้าแรก (Auto-Open on Page Load)
                        </span>
                        <p className="text-[11px] text-slate-300 leading-relaxed">
                          เมื่อเปิดใช้งาน ตัวหน้าต่างแชทจะเปิดอ้าขึ้นมาทันทีในทุกมุมมอง ไม่ต้องรอให้ผู้ใช้คลิกปุ่มแชท
                        </p>
                      </div>
                    </label>

                    {/* Viewport Notice */}
                    <div className="p-3.5 rounded-xl bg-[#040e28]/70 border border-slate-700/60 space-y-2">
                      <span className="text-[11px] font-bold text-slate-200 flex items-center gap-1.5">
                        <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
                        <span>การแสดงผลในทุกมุมมอง (All Viewports)</span>
                      </span>
                      <ul className="text-[11px] text-slate-400 space-y-1 list-disc list-inside">
                        <li><strong className="text-slate-300">Smartphone / มือถือ:</strong> หน้าต่างปรับสัดส่วนพอดี (+20% กะทัดรัด) ชิดขวาล่าง ไม่บังส่วนสำคัญของหน้าเว็บ</li>
                        <li><strong className="text-slate-300">Desktop / แท็บเล็ต:</strong> แสดงผลขนาดกว้างขวาง สบายตา ชิดมุมขวาล่าง</li>
                        <li><strong className="text-slate-300">ผู้ใช้สามารถ:</strong> กดปุ่มย่อ/ปิด (X หรือ Minimize) ได้ตลอดเวลาหากต้องการ</li>
                      </ul>
                    </div>

                    {/* Training Data Link */}
                    <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-500/30 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-cyan-400 shrink-0" />
                        <span className="text-xs text-cyan-200">
                          คลังความรู้ AI Grounding: <strong>{data.knowledgeBase.length} หัวข้อ</strong>
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          playDigitalSound('select');
                          setActiveTab('kb');
                        }}
                        className="text-xs text-cyan-400 hover:text-cyan-200 underline underline-offset-2 font-medium"
                      >
                        แก้ไขข้อมูลความรู้ →
                      </button>
                    </div>
                  </div>
                </div>

                {/* 2. Welcome Greeting Customization */}
                <div className="p-5 rounded-2xl bg-[#061539] border border-cyan-500/30 space-y-4">
                  <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-cyan-400" />
                      <h4 className="text-sm font-bold text-white">ข้อความต้อนรับของ AI Chatbot (Welcome Greeting)</h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setChatbotSettings({
                          ...chatbotSettings,
                          welcomeMessage: defaultChatbotSettings.welcomeMessage,
                        });
                      }}
                      className="text-[10px] text-slate-400 hover:text-cyan-300 underline font-mono"
                    >
                      คืนค่าเริ่มต้น
                    </button>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-slate-300">
                      ข้อความทักทายแรกเมื่อเปิดหน้าต่างแชท:
                    </label>
                    <textarea
                      rows={4}
                      value={chatbotSettings.welcomeMessage || ''}
                      onChange={(e) =>
                        setChatbotSettings({
                          ...chatbotSettings,
                          welcomeMessage: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2.5 rounded-xl bg-[#03091e] border border-cyan-500/30 text-white text-xs leading-relaxed focus:outline-none focus:border-cyan-400 resize-none font-sans"
                      placeholder="ใส่ข้อความต้อนรับของ AI Chatbot..."
                    />
                    <p className="text-[10px] text-slate-400">
                      ข้อความนี้จะแสดงเป็นบอลลูนแรกสุดจากบอทเมื่อผู้ใช้งานเปิดหน้าต่างแชท
                    </p>
                  </div>

                  {/* Live Simulation Preview inside Admin */}
                  <div className="p-3.5 rounded-xl bg-[#040e28] border border-cyan-500/30 space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-cyan-300 font-mono">
                      <span className="flex items-center gap-1.5">
                        <Bot className="w-3.5 h-3.5 text-cyan-400" />
                        ตัวอย่างการแสดงผลข้อความต้อนรับ:
                      </span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        PREVIEW
                      </span>
                    </div>

                    <div className="p-3 rounded-lg bg-[#061438] border border-cyan-500/20 text-slate-200 text-xs leading-relaxed">
                      {chatbotSettings.welcomeMessage || defaultChatbotSettings.welcomeMessage}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Save Bar */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleSaveChatbotSettings}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/30 transition-all active:scale-95 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'กำลังบันทึกข้อมูล...' : 'บันทึกการตั้งค่า AI Chatbot'}</span>
                </button>
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

          {/* TAB: NEWS SUBSCRIBERS MANAGEMENT (ระบบจัดการผู้ติดตามข่าว Hero) */}
          {activeTab === 'subscribers' && (
            <div className="space-y-4">
              {/* Header Card */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-[#061539] border border-amber-500/30 shadow-md">
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Bell className="w-4 h-4 text-amber-400" />
                    <span>ระบบจัดการผู้ติดตามข่าว (Hero News Subscribers)</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40">
                      {subscribersList.length} อีเมลในระบบ
                    </span>
                  </h3>
                  <p className="text-xs text-slate-300">
                    ดูตารางรายชื่อผู้ติดตาม การเชื่อมโยงว่าติดตามจากข่าวเรื่องใด และจัดการส่งอัปเดตข่าวสารด้วย AI
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => {
                      playDigitalSound('select');
                      const targetStory = storiesList[0] || {
                        id: 'story-broadcast',
                        title: 'ข่าวประชาสัมพันธ์ สตง. ล่าสุด',
                        subtitle: 'สำนักประชาสัมพันธ์และสื่อสารองค์กร สำนักงานการตรวจเงินแผ่นดิน',
                        category: 'ข่าวประชาสัมพันธ์',
                        date: new Date().toLocaleDateString('th-TH'),
                        imageUrl: '/src/assets/images/sai_digital_network_1791693065277.jpg',
                        linkUrl: 'https://pr-request-system.vercel.app',
                      };
                      setPendingPublishStory(targetStory as HeroStory);
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 hover:from-amber-300 hover:to-yellow-200 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-amber-500/20 active:scale-95"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>📢 ส่งอีเมลแจ้งเตือนผู้ติดตามทันที</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      playDigitalSound('select');
                      setShowSmtpModal(true);
                    }}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      smtpStatus?.isConfigured
                        ? 'bg-emerald-500/20 hover:bg-emerald-500/30 border-emerald-500/50 text-emerald-300'
                        : 'bg-amber-500/20 hover:bg-amber-500/30 border-amber-500/50 text-amber-300 animate-pulse'
                    }`}
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>⚙️ ตั้งค่าส่งอีเมลจริง (SMTP)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleExportSubscribersCSV}
                    className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-slate-700 text-xs text-slate-200 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-amber-400" />
                    <span>ส่งออก CSV</span>
                  </button>
                </div>
              </div>

              {/* Toast Notices */}
              {broadcastSuccessNotice && (
                <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{broadcastSuccessNotice}</span>
                </div>
              )}
              {manualAddSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{manualAddSuccess}</span>
                </div>
              )}

              {/* Real Email Dispatch Engine Status Bar */}
              <div className={`p-3.5 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs ${
                smtpStatus?.isConfigured
                  ? 'bg-[#021827] border-emerald-500/40 text-emerald-200'
                  : 'bg-[#1a0f02] border-amber-500/40 text-amber-200'
              }`}>
                <div className="flex items-center gap-2.5">
                  <div className={`w-3 h-3 rounded-full shrink-0 ${
                    smtpStatus?.isConfigured ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]' : 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.8)]'
                  }`} />
                  <div>
                    <div className="font-semibold text-white flex items-center gap-2">
                      <span>สถานะระบบส่งอีเมลจริง (Real Email Delivery):</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                        smtpStatus?.isConfigured ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {smtpStatus?.isConfigured ? `🟢 พร้อมส่งจริง (${smtpStatus.user})` : '🟡 โหมดจำลอง (ยังไม่ได้ใส่ SMTP)'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-0.5">
                      {smtpStatus?.isConfigured
                        ? 'ระบบจะส่งอีเมลแจ้งเตือนข่าว Hero เข้ากล่องข้อความจริงของผู้รับทันทีที่แอดมินกดเผยแพร่ข่าว'
                        : 'ผู้ติดตามจะไม่ได้รับอีเมลจริงจนกว่าจะกรอกบัญชีผู้ส่ง (เช่น Gmail + App Password 16 หลัก) กรุณากดปุ่มเพื่อเชื่อมต่อ'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      playDigitalSound('click');
                      setShowSmtpModal(true);
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
                  >
                    <span>{smtpStatus?.isConfigured ? 'แก้ไขการตั้งค่า SMTP' : 'เชื่อมต่อบัญชีส่งเมลจริง'}</span>
                  </button>
                </div>
              </div>

              {/* 4 Metric Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-[#061539] border border-cyan-500/20">
                  <span className="text-[11px] text-slate-400 block">ผู้ติดตามทั้งหมด</span>
                  <div className="text-xl sm:text-2xl font-bold text-white font-mono mt-1">
                    {subscribersList.length}
                  </div>
                  <span className="text-[10px] text-emerald-400 flex items-center gap-1 mt-1 font-sans">
                    <CheckCircle2 className="w-3 h-3" /> กำลังเปิดรับติดตาม
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#061539] border border-cyan-500/20">
                  <span className="text-[11px] text-slate-400 block">ข่าวที่มีผู้ติดตามสูงสุด</span>
                  <div className="text-xs font-bold text-amber-300 truncate mt-1">
                    {storiesList[0]?.title || 'ข่าวเด่น สตง.'}
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-1">
                    หมวด: {storiesList[0]?.category || 'ข่าวเด่น'}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#061539] border border-cyan-500/20">
                  <span className="text-[11px] text-slate-400 block">การกระจายข่าวสารที่ส่งแล้ว</span>
                  <div className="text-xl sm:text-2xl font-bold text-cyan-300 font-mono mt-1">
                    {broadcastsList.length}
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-1">
                    ครั้งที่ส่งแจ้งเตือน
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#061539] border border-cyan-500/20">
                  <span className="text-[11px] text-slate-400 block">ระบบเชื่อมโยง & AI</span>
                  <div className="text-xs font-bold text-emerald-300 mt-1 flex items-center gap-1">
                    <Bot className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Gemini 3.8 Flash</span>
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-1">
                    วิเคราะห์ความสนใจอัตโนมัติ
                  </span>
                </div>
              </div>

              {/* Add Subscriber Manual Form */}
              <div className="p-4 rounded-xl bg-[#040e2b] border border-slate-700/60">
                <form onSubmit={handleAddSubscriberManual} className="flex flex-col sm:flex-row items-end gap-3 text-xs">
                  <div className="flex-1 w-full">
                    <label className="block text-[11px] text-amber-200 mb-1 font-semibold">
                      เพิ่มอีเมลผู้ติดตามด้วยตนเอง (Admin Manual Add)
                    </label>
                    <input
                      type="email"
                      value={newSubscriberEmail}
                      onChange={(e) => setNewSubscriberEmail(e.target.value)}
                      placeholder="ระบุอีเมลผู้ติดตาม เช่น pr.contact@org.th"
                      className="w-full px-3 py-2 bg-[#02071a] border border-amber-500/40 rounded-lg text-xs text-white placeholder-slate-500 outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="w-full sm:w-64">
                    <label className="block text-[11px] text-slate-300 mb-1">
                      เชื่อมโยงกับข่าว Hero ที่ติดตาม
                    </label>
                    <select
                      value={newSubscriberStoryId}
                      onChange={(e) => setNewSubscriberStoryId(e.target.value)}
                      className="w-full px-3 py-2 bg-[#02071a] border border-slate-700 rounded-lg text-xs text-white outline-none"
                    >
                      {storiesList.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.title.slice(0, 35)}...
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full sm:w-auto px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-all whitespace-nowrap cursor-pointer shrink-0"
                  >
                    + เพิ่มผู้ติดตาม
                  </button>
                </form>
              </div>

              {/* Filter & Search Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl bg-[#040e2b] border border-slate-800 text-xs">
                <div className="relative w-full sm:w-72">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={subscriberSearch}
                    onChange={(e) => setSubscriberSearch(e.target.value)}
                    placeholder="ค้นหาอีเมล หรือชื่อข่าวที่ติดตาม..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#02071a] border border-slate-700 text-xs text-white placeholder-slate-500 outline-none focus:border-amber-400"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <span className="text-[11px] text-slate-400">กรองตามหมวด:</span>
                  <select
                    value={subscriberCategoryFilter}
                    onChange={(e) => setSubscriberCategoryFilter(e.target.value)}
                    className="px-2.5 py-1 rounded-lg bg-[#02071a] border border-slate-700 text-xs text-slate-200 outline-none"
                  >
                    <option value="all">ทั้งหมด</option>
                    {Array.from(new Set(subscribersList.map((s) => s.category).filter(Boolean))).map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Subscribers Table */}
              <div className="rounded-xl border border-amber-500/30 overflow-hidden bg-[#030d28]">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#02081a] border-b border-amber-500/20 text-amber-300 font-semibold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="p-3 w-12 text-center">ลำดับ</th>
                        <th className="p-3">ชื่ออีเมลผู้ติดตาม</th>
                        <th className="p-3">การเชื่อมโยง: ติดตามจากข่าวไหน</th>
                        <th className="p-3">วันที่กดติดตาม</th>
                        <th className="p-3 text-center">แจ้งเตือนแล้ว</th>
                        <th className="p-3 text-center">สถานะ</th>
                        <th className="p-3 text-right">จัดการ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-200">
                      {subscribersList
                        .filter((s) => {
                          const matchSearch =
                            !subscriberSearch ||
                            s.email.toLowerCase().includes(subscriberSearch.toLowerCase()) ||
                            (s.storyTitle || '').toLowerCase().includes(subscriberSearch.toLowerCase());
                          const matchCat =
                            subscriberCategoryFilter === 'all' || s.category === subscriberCategoryFilter;
                          return matchSearch && matchCat;
                        })
                        .map((sub, idx) => (
                          <tr key={sub.id} className="hover:bg-white/5 transition-colors">
                            <td className="p-3 text-center font-mono text-slate-400">{idx + 1}</td>
                            <td className="p-3">
                              <span className="font-mono font-semibold text-white block">
                                {sub.email}
                              </span>
                              {sub.tags && sub.tags.length > 0 && (
                                <div className="flex gap-1 mt-0.5">
                                  {sub.tags.map((t) => (
                                    <span key={t} className="text-[9px] px-1 py-0.2 rounded bg-cyan-500/15 text-cyan-300">
                                      {t}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </td>
                            <td className="p-3 max-w-[280px]">
                              <span className="font-medium text-amber-200 line-clamp-2 block leading-snug">
                                {sub.storyTitle}
                              </span>
                              {sub.category && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 inline-block mt-0.5">
                                  {sub.category}
                                </span>
                              )}
                            </td>
                            <td className="p-3 font-mono text-slate-400 text-[11px] whitespace-nowrap">
                              {sub.subscribedAt ? new Date(sub.subscribedAt).toLocaleDateString('th-TH') : '-'}
                            </td>
                            <td className="p-3 text-center font-mono">
                              <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[11px]">
                                {sub.notifyCount || 0} ครั้ง
                              </span>
                            </td>
                            <td className="p-3 text-center">
                              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-semibold">
                                กำลังติดตาม
                              </span>
                            </td>
                            <td className="p-3 text-right">
                              <button
                                type="button"
                                onClick={() => handleDeleteSubscriber(sub.id)}
                                className="p-1.5 rounded-lg text-rose-400 hover:text-white hover:bg-rose-500/20 transition-colors cursor-pointer"
                                title="ลบผู้ติดตามนี้"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Broadcasts History Table */}
              <div className="p-4 rounded-xl bg-[#040e2b] border border-slate-700/60 space-y-3">
                <h4 className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <Send className="w-3.5 h-3.5 text-amber-400" />
                  <span>ประวัติการส่งกระจายข่าวสาร (Broadcast History)</span>
                </h4>

                <div className="rounded-lg border border-slate-800 overflow-hidden bg-[#02071a]">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#030a1e] text-[10px] text-slate-400 border-b border-slate-800 uppercase">
                      <tr>
                        <th className="p-2.5">หัวข้อการแจ้งเตือน (Subject)</th>
                        <th className="p-2.5">ข่าว Hero ต้นเรื่อง</th>
                        <th className="p-2.5 text-center">ช่องทางส่ง</th>
                        <th className="p-2.5 text-center">จำนวนผู้รับ</th>
                        <th className="p-2.5 text-center">AI ร่าง</th>
                        <th className="p-2.5 text-right">เวลาที่ส่ง</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-300">
                      {broadcastsList.map((b) => (
                        <tr key={b.id} className="hover:bg-white/5">
                          <td className="p-2.5 font-medium text-white max-w-[240px] truncate">
                            {b.subject}
                          </td>
                          <td className="p-2.5 text-amber-300/90 max-w-[200px] truncate text-[11px]">
                            {b.storyTitle}
                          </td>
                          <td className="p-2.5 text-center">
                            {b.deliveryStatus === 'success' || (b as any).isRealDelivery ? (
                              <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-mono border border-emerald-500/30">
                                🟢 Real SMTP
                              </span>
                            ) : (
                              <div className="flex flex-col items-center gap-0.5">
                                <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[9px] font-mono border border-amber-500/30">
                                  🟡 โหมดจำลอง
                                </span>
                                {b.previewUrl && (
                                  <a
                                    href={b.previewUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-[9px] text-amber-400 hover:underline inline-flex items-center gap-0.5"
                                  >
                                    <span>ดูตัวอย่าง</span>
                                    <ExternalLink className="w-2.5 h-2.5" />
                                  </a>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="p-2.5 text-center font-mono text-cyan-300">
                            {b.recipientCount} อีเมล
                          </td>
                          <td className="p-2.5 text-center">
                            {b.aiGenerated ? (
                              <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 text-[9px] font-mono border border-cyan-500/30">
                                AI Assisted
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400">Manual</span>
                            )}
                          </td>
                          <td className="p-2.5 text-right font-mono text-[10px] text-slate-400">
                            {b.sentAt ? new Date(b.sentAt).toLocaleString('th-TH') : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
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
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-[#0e162d] border border-rose-500/40">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                    <h3 className="text-sm font-bold text-white">
                      ไทม์ไลน์สถานการณ์ฉุกเฉินและวิศวกรรมโครงสร้าง (3D Interactive Timeline)
                    </h3>
                  </div>
                  <p className="text-xs text-slate-300">
                    จัดการบล็อกช่วงเวลาแบบ 3D (เหมือนภาพแนบ Visme) ข้อความกระชับบนไทม์ไลน์ และเปิดการ์ดรายงานสมบูรณ์พร้อมภาพ/คลิป/แชร์
                  </p>
                </div>
                <button
                  onClick={() =>
                    setEditingMilestone({
                      shortTitle: `${new Date().getFullYear() + 543}`,
                      date: 'ตุลาคม 2569',
                      time: 'ล่าสุด',
                      phase: 'มาตรการตรวจสอบ',
                      title: '',
                      description: '',
                      fullStatement: '',
                      status: 'กำลังปฏิบัติการ',
                      imageUrl: '/src/assets/images/sai_building_inspection_1791689807795.jpg',
                      videoUrl: '',
                      mediaType: 'photo',
                      technicalDetails: 'วิศวกรผู้เชี่ยวชาญเข้าตรวจสอบต่อเนื่อง',
                      referenceTitle: '',
                      referenceUrl: '',
                      colorAccent: 'orange',
                      icon: 'lightbulb',
                    })
                  }
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-400 hover:to-orange-400 text-slate-950 text-xs font-bold transition-all shadow-[0_0_15px_rgba(244,63,94,0.4)] cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>เพิ่มช่วงไทม์ไลน์ 3D</span>
                </button>
              </div>

              <div className="space-y-3">
                {data.incidentTimeline.map((item, idx) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl bg-[#091024]/90 border border-slate-700/80 hover:border-rose-500/40 flex flex-col sm:flex-row items-start justify-between gap-4 transition-all"
                  >
                    <div className="flex items-start gap-3.5">
                      {/* Milestone Block Tag with Color */}
                      <div className="flex flex-col items-center gap-1 shrink-0">
                        <span className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-rose-500 to-orange-500 text-slate-950 font-mono font-bold text-xs shadow-md">
                          {item.shortTitle || `0${idx + 1}`}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          ลำดับ {idx + 1}
                        </span>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-[11px] text-rose-300 font-bold px-2 py-0.5 rounded bg-rose-950/60 border border-rose-500/30">
                            {item.phase}
                          </span>
                          <span className="text-slate-500">·</span>
                          <span className="text-[11px] text-slate-200 font-semibold">
                            {item.date} {item.time}
                          </span>
                          <span className="text-slate-500">·</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                            {item.status}
                          </span>
                          {item.mediaType === 'video' ? (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-400/40">
                              🎬 มีคลิปวิดีโอ
                            </span>
                          ) : (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-400/40">
                              📷 ภาพนิ่ง
                            </span>
                          )}
                          {item.colorAccent && (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                              โทนสี: {item.colorAccent}
                            </span>
                          )}
                        </div>

                        <h4 className="text-xs font-bold text-white mb-1">{item.title}</h4>
                        <p className="text-xs text-slate-300 mb-2 line-clamp-2">{item.description}</p>
                        
                        {item.fullStatement && (
                          <div className="text-[11px] text-slate-300 bg-black/40 p-2 rounded-lg border border-slate-800 mb-2 line-clamp-2">
                            <strong className="text-rose-300">รายงานสมบูรณ์:</strong> {item.fullStatement}
                          </div>
                        )}

                        <p className="text-[11px] text-slate-400 bg-slate-950/70 p-2 rounded-lg border border-slate-800 font-mono">
                          <strong className="text-amber-300">วิศวกรรม วสท.:</strong> {item.technicalDetails}
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
                          className="p-1 text-slate-400 hover:text-rose-300 disabled:opacity-25 hover:bg-rose-500/10 rounded transition-colors"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveMilestone(idx, 'down')}
                          disabled={idx === data.incidentTimeline.length - 1}
                          title="เลื่อนลง"
                          className="p-1 text-slate-400 hover:text-rose-300 disabled:opacity-25 hover:bg-rose-500/10 rounded transition-colors"
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

        {/* Modal: Edit Hero Story - Scrollable & Sticky Action Buttons */}
        {editingStory && (
          <div
            className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 z-[70] overflow-y-auto animate-fadeIn"
            onClick={(e) => {
              if (e.target === e.currentTarget) setEditingStory(null);
            }}
          >
            <div className="w-full max-w-2xl max-h-[92vh] bg-gradient-to-b from-[#091b48] via-[#07153b] to-[#040e28] border border-cyan-400/40 rounded-2xl shadow-2xl flex flex-col overflow-hidden my-auto ring-1 ring-cyan-500/20">
              {/* Pinned Sticky Header */}
              <div className="px-5 py-3.5 sm:py-4 border-b border-cyan-500/25 bg-[#05112f] flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-300">
                    <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest font-mono">
                      Hero Carousel Story Editor
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                      {editingStory.id ? 'แก้ไขภาพข่าวม้าหมุน (Hero Story)' : 'เพิ่มภาพข่าวม้าหมุน (สูงสุด 10 เรื่อง)'}
                    </h3>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingStory(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  title="ปิดหน้าต่าง (ยกเลิก)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form with Scrollable Content Body & Sticky Footer */}
              <form onSubmit={handleSaveStory} className="flex flex-col flex-1 overflow-hidden">
                {/* Scrollable Content Body */}
                <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1 overscroll-contain">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      หัวข้อข่าว / ภาพข่าว <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={editingStory.title || ''}
                      onChange={(e) => setEditingStory({ ...editingStory, title: e.target.value })}
                      required
                      placeholder="เช่น ข่าวภาพนิ่ง: คณะผู้บริหารและผู้ตรวจเงินแผ่นดินลงพื้นที่..."
                      className="w-full px-3 py-2 bg-[#030d26] border border-cyan-500/30 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      ข้อความรายละเอียด / สรุปข่าว <span className="text-rose-400">*</span>
                    </label>
                    <textarea
                      rows={3}
                      value={editingStory.subtitle || ''}
                      onChange={(e) => setEditingStory({ ...editingStory, subtitle: e.target.value })}
                      required
                      placeholder="สรุปสาระสำคัญของข่าวเพื่อแสดงในภาพม้าหมุนและในอีเมลแจ้งเตือน..."
                      className="w-full px-3 py-2 bg-[#030d26] border border-cyan-500/30 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-400 leading-relaxed"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        หมวดหมู่ / แผนก <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={editingStory.category || ''}
                        onChange={(e) => setEditingStory({ ...editingStory, category: e.target.value })}
                        required
                        placeholder="เช่น ข่าวภาพนิ่ง / ภาพกิจกรรม, นโยบาย สตง."
                        className="w-full px-3 py-2 bg-[#030d26] border border-cyan-500/30 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-400"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        ป้ายกำกับ (Badge)
                      </label>
                      <input
                        type="text"
                        value={editingStory.badge || ''}
                        onChange={(e) => setEditingStory({ ...editingStory, badge: e.target.value })}
                        placeholder="เช่น 📷 ข่าวภาพนิ่ง, 📊 Infographic"
                        className="w-full px-3 py-2 bg-[#030d26] border border-cyan-500/30 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-400"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        วันที่เผยแพร่
                      </label>
                      <input
                        type="text"
                        value={editingStory.date || ''}
                        onChange={(e) => setEditingStory({ ...editingStory, date: e.target.value })}
                        placeholder="เช่น 18 ตุลาคม 2569"
                        className="w-full px-3 py-2 bg-[#030d26] border border-cyan-500/30 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-400"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        ลิงก์ข่าว (URL ปลายทาง) <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={editingStory.linkUrl || ''}
                        onChange={(e) => setEditingStory({ ...editingStory, linkUrl: e.target.value })}
                        required
                        placeholder="#incident-timeline หรือ https://..."
                        className="w-full px-3 py-2 bg-[#030d26] border border-cyan-500/30 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-400 font-mono"
                      />
                    </div>
                  </div>

                  {/* COVER IMAGE SELECTOR WITH LOCAL UPLOAD & AI GENERATOR */}
                  <div className="space-y-3 pt-3 border-t border-cyan-500/25">
                    <div className="flex items-center justify-between">
                      <label className="block text-[11px] font-bold text-cyan-300">
                        รูปภาพ COVER ข่าว (สัดส่วน 16:9 แนวนอน)
                      </label>
                      <span className="text-[10px] text-slate-400">เลือกจากเครื่อง / AI สร้าง / ใส่ URL</span>
                    </div>

                    {/* Hidden file input */}
                    <input
                      type="file"
                      ref={coverFileInputRef}
                      onChange={handleCoverFileUpload}
                      accept="image/*"
                      className="hidden"
                    />

                    {/* Two Main Actions: Upload from Device & AI Cover Generator */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => coverFileInputRef.current?.click()}
                        disabled={isUploadingCover}
                        className="p-2.5 rounded-xl bg-gradient-to-r from-blue-900/60 to-indigo-900/60 hover:from-blue-800/80 hover:to-indigo-800/80 border border-blue-400/50 text-blue-200 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:scale-95 disabled:opacity-50"
                      >
                        <Upload className={`w-4 h-4 text-cyan-400 ${isUploadingCover ? 'animate-bounce' : ''}`} />
                        <span>{isUploadingCover ? 'กำลังโหลดภาพ...' : '📁 เลือกภาพจากเครื่อง (Upload)'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          playDigitalSound('select');
                          setShowAiCoverModal(true);
                        }}
                        className="p-2.5 rounded-xl bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/20 hover:from-amber-500/30 hover:to-yellow-500/30 border border-amber-400/60 text-amber-300 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[0_0_15px_rgba(245,158,11,0.2)] active:scale-95"
                      >
                        <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
                        <span>✨ ให้ AI สร้างภาพ COVER</span>
                      </button>
                    </div>

                    {/* Upload Success Notice */}
                    {uploadCoverSuccess && (
                      <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{uploadCoverSuccess}</span>
                      </div>
                    )}

                    {/* Live Cover Preview */}
                    {editingStory.imageUrl && (
                      <div className="relative aspect-video rounded-xl overflow-hidden border border-cyan-500/40 bg-black/60 shadow-lg group">
                        <img
                          src={editingStory.imageUrl}
                          alt="Story Cover Preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/src/assets/images/sai_digital_network_1791693065277.jpg';
                          }}
                        />
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded text-[9px] font-bold bg-black/75 backdrop-blur-sm text-cyan-300 border border-cyan-400/40 font-mono">
                          16:9 Cover Preview
                        </div>
                        <button
                          type="button"
                          onClick={() => setEditingStory({ ...editingStory, imageUrl: '' })}
                          className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 hover:bg-rose-600 text-slate-300 hover:text-white transition-colors cursor-pointer"
                          title="ลบ/เปลี่ยนรูปภาพ"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    {/* Manual URL Input */}
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1">
                        หรือพิมพ์ / วางลิงก์รูปภาพ (Image URL)
                      </label>
                      <input
                        type="text"
                        value={editingStory.imageUrl || ''}
                        onChange={(e) => setEditingStory({ ...editingStory, imageUrl: e.target.value })}
                        placeholder="https://... หรือ /src/assets/images/..."
                        required
                        className="w-full px-3 py-2 bg-[#030d26] border border-cyan-500/30 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-400 font-mono"
                      />
                    </div>

                    {/* Preset Quick Selection Buttons */}
                    <div>
                      <span className="text-[10px] text-slate-400 block mb-1.5">หรือคลิกเลือกจากภาพแนะนำ สตง. (8K):</span>
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            setEditingStory({
                              ...editingStory,
                              imageUrl: '/src/assets/images/sai_hero_inspection_1792297056517.jpg',
                            })
                          }
                          className="text-[10px] px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-400/30 transition-colors cursor-pointer"
                        >
                          📸 ตรวจงานโครงสร้างและแบบแปลน (8K ภาพจริง)
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setEditingStory({
                              ...editingStory,
                              imageUrl: '/src/assets/images/sai_digital_audit_ai_1792297056483.jpg',
                            })
                          }
                          className="text-[10px] px-2.5 py-1 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-400/30 transition-colors cursor-pointer"
                        >
                          🌐 ศูนย์ข้อมูล Digital Audit & AI (8K)
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setEditingStory({
                              ...editingStory,
                              imageUrl: '/src/assets/images/sai_press_photo_1791791796122.jpg',
                            })
                          }
                          className="text-[10px] px-2.5 py-1 rounded-lg bg-blue-500/15 hover:bg-blue-500/25 text-blue-300 border border-blue-400/30 transition-colors cursor-pointer"
                        >
                          📷 แถลงข่าว คณะผู้บริหาร
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setEditingStory({
                              ...editingStory,
                              imageUrl: '/src/assets/images/sai_infographic_stats_1791791809566.jpg',
                            })
                          }
                          className="text-[10px] px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-400/30 transition-colors cursor-pointer"
                        >
                          📊 Infographic สรุปผลสัมฤทธิ์
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setEditingStory({
                              ...editingStory,
                              imageUrl: '/src/assets/images/sai_earth_hologram_1791693076088.jpg',
                            })
                          }
                          className="text-[10px] px-2.5 py-1 rounded-lg bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-400/30 transition-colors cursor-pointer"
                        >
                          🌐 โลกโฮโลกราฟิก เชื่อมต่อไทย
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pinned Sticky Footer - ALWAYS VISIBLE, NEVER CUT OFF */}
                <div className="px-5 py-3.5 border-t border-cyan-500/25 bg-[#040e28] flex items-center justify-between shrink-0">
                  <div className="text-[11px] text-slate-400">
                    {editingStory.id ? (
                      <span className="text-cyan-300 font-medium">กำลังแก้ไข ID: {editingStory.id}</span>
                    ) : (
                      <span className="text-emerald-400 font-medium">+ เพิ่มข่าวใหม่</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => setEditingStory(null)}
                      className="px-4 py-2 text-xs text-slate-300 hover:text-white hover:bg-white/5 rounded-xl border border-slate-700 transition-colors cursor-pointer"
                    >
                      ยกเลิก
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 text-xs font-bold shadow-lg shadow-cyan-500/25 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Save className="w-4 h-4" />
                      <span>{editingStory.id ? 'บันทึกการแก้ไข' : 'บันทึกภาพข่าว'}</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Edit Knowledge Item */}
        {editingKb && (
          <div
            className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 z-[70] overflow-y-auto animate-fadeIn"
            onClick={(e) => {
              if (e.target === e.currentTarget) setEditingKb(null);
            }}
          >
            <div className="w-full max-w-lg max-h-[92vh] bg-gradient-to-b from-[#091b48] via-[#07153b] to-[#040e28] border border-cyan-400/40 rounded-2xl shadow-2xl flex flex-col overflow-hidden my-auto ring-1 ring-cyan-500/20">
              <div className="px-5 py-3.5 border-b border-cyan-500/25 bg-[#05112f] flex items-center justify-between shrink-0">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-cyan-400" />
                  <span>{editingKb.id ? 'แก้ไขข้อมูลคลังความรู้' : 'เพิ่มข้อมูลใหม่เข้าคลังความรู้'}</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setEditingKb(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <form onSubmit={handleSaveKb} className="flex flex-col flex-1 overflow-hidden">
                <div className="p-4 sm:p-5 overflow-y-auto space-y-3.5 flex-1 overscroll-contain">
                  <div>
                    <label className="block text-[11px] text-slate-300 mb-1 font-semibold">หัวข้อความรู้</label>
                    <input
                      type="text"
                      value={editingKb.title || ''}
                      onChange={(e) => setEditingKb({ ...editingKb, title: e.target.value })}
                      required
                      className="w-full px-3 py-2 bg-[#030d26] border border-cyan-500/30 rounded-xl text-xs text-white outline-none focus:border-cyan-400"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-300 mb-1 font-semibold">หมวดหมู่</label>
                      <input
                        type="text"
                        value={editingKb.category || ''}
                        onChange={(e) => setEditingKb({ ...editingKb, category: e.target.value })}
                        required
                        className="w-full px-3 py-2 bg-[#030d26] border border-cyan-500/30 rounded-xl text-xs text-white outline-none focus:border-cyan-400"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-300 mb-1 font-semibold">ประเภทที่มา</label>
                      <select
                        value={editingKb.sourceType || 'raw_text'}
                        onChange={(e) =>
                          setEditingKb({
                            ...editingKb,
                            sourceType: e.target.value as KnowledgeItem['sourceType'],
                          })
                        }
                        className="w-full px-3 py-2 bg-[#030d26] border border-cyan-500/30 rounded-xl text-xs text-white outline-none focus:border-cyan-400"
                      >
                        <option value="raw_text">ข้อความดิบ (Raw Text)</option>
                        <option value="url">ลิงก์ URL</option>
                        <option value="pdf_summary">สรุป PDF</option>
                        <option value="infographic">อินโฟกราฟิก</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-300 mb-1 font-semibold">เนื้อหาความรู้</label>
                    <textarea
                      rows={4}
                      value={editingKb.content || ''}
                      onChange={(e) => setEditingKb({ ...editingKb, content: e.target.value })}
                      required
                      className="w-full px-3 py-2 bg-[#030d26] border border-cyan-500/30 rounded-xl text-xs text-white leading-relaxed outline-none focus:border-cyan-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-300 mb-1 font-semibold">
                      URL อ้างอิง (ถ้ามี)
                    </label>
                    <input
                      type="url"
                      value={editingKb.sourceUrl || ''}
                      onChange={(e) => setEditingKb({ ...editingKb, sourceUrl: e.target.value })}
                      className="w-full px-3 py-2 bg-[#030d26] border border-cyan-500/30 rounded-xl text-xs text-white outline-none focus:border-cyan-400 font-mono"
                      placeholder="https://..."
                    />
                  </div>
                </div>
                <div className="px-5 py-3 border-t border-cyan-500/25 bg-[#040e28] flex justify-end gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setEditingKb(null)}
                    className="px-4 py-2 text-xs text-slate-400 hover:text-white rounded-xl border border-slate-750"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-bold shadow-md shadow-cyan-500/20"
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
          <div
            className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 z-[70] overflow-y-auto animate-fadeIn"
            onClick={(e) => {
              if (e.target === e.currentTarget) setEditingWork(null);
            }}
          >
            <div className="w-full max-w-lg max-h-[92vh] bg-gradient-to-b from-[#091b48] via-[#07153b] to-[#040e28] border border-cyan-400/40 rounded-2xl shadow-2xl flex flex-col overflow-hidden my-auto ring-1 ring-cyan-500/20">
              <div className="px-5 py-3.5 border-b border-cyan-500/25 bg-[#05112f] flex items-center justify-between shrink-0">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Film className="w-4 h-4 text-cyan-400" />
                  <span>{editingWork.id ? 'แก้ไขผลงานเผยแพร่' : 'เพิ่มผลงานเผยแพร่ใหม่'}</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setEditingWork(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <form onSubmit={handleSaveWork} className="flex flex-col flex-1 overflow-hidden">
                <div className="p-4 sm:p-5 overflow-y-auto space-y-3.5 flex-1 overscroll-contain">
                  <div>
                    <label className="block text-[11px] text-slate-300 mb-1 font-semibold">ชื่อผลงาน / ข่าว</label>
                    <input
                      type="text"
                      value={editingWork.title || ''}
                      onChange={(e) => setEditingWork({ ...editingWork, title: e.target.value })}
                      required
                      className="w-full px-3 py-2 bg-[#030d26] border border-cyan-500/30 rounded-xl text-xs text-white outline-none focus:border-cyan-400"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-300 mb-1 font-semibold">หมวดหมู่</label>
                      <input
                        type="text"
                        value={editingWork.category || ''}
                        onChange={(e) => setEditingWork({ ...editingWork, category: e.target.value })}
                        required
                        className="w-full px-3 py-2 bg-[#030d26] border border-cyan-500/30 rounded-xl text-xs text-white outline-none focus:border-cyan-400"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-300 mb-1 font-semibold">รูปแบบสื่อ (Media Type)</label>
                      <select
                        value={editingWork.mediaType || 'photo'}
                        onChange={(e) =>
                          setEditingWork({
                            ...editingWork,
                            mediaType: e.target.value as PublishedWork['mediaType'],
                          })
                        }
                        className="w-full px-3 py-2 bg-[#030d26] border border-cyan-500/30 rounded-xl text-xs text-white outline-none focus:border-cyan-400"
                      >
                        <option value="photo">📷 ภาพนิ่ง (Photo)</option>
                        <option value="infographic">📊 อินโฟกราฟิก (Infographic)</option>
                        <option value="video">🎬 วิดีโอ & สารคดี (Video)</option>
                        <option value="report">📄 รายงาน & ข้อเท็จจริง (Report)</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-300 mb-1 font-semibold">ป้ายกำกับ (Badge)</label>
                    <input
                      type="text"
                      value={editingWork.badge || ''}
                      onChange={(e) => setEditingWork({ ...editingWork, badge: e.target.value })}
                      className="w-full px-3 py-2 bg-[#030d26] border border-cyan-500/30 rounded-xl text-xs text-white outline-none focus:border-cyan-400"
                      placeholder="เช่น 📷 ภาพนิ่งล่าสุด, 📊 Infographic"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-300 mb-1 font-semibold">คำอธิบายรายละเอียด</label>
                    <textarea
                      rows={3}
                      value={editingWork.description || ''}
                      onChange={(e) => setEditingWork({ ...editingWork, description: e.target.value })}
                      required
                      className="w-full px-3 py-2 bg-[#030d26] border border-cyan-500/30 rounded-xl text-xs text-white outline-none focus:border-cyan-400 leading-relaxed"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-300 mb-1 font-semibold">ลิงก์ผลงาน (URL)</label>
                    <input
                      type="url"
                      value={editingWork.linkUrl || ''}
                      onChange={(e) => setEditingWork({ ...editingWork, linkUrl: e.target.value })}
                      required
                      className="w-full px-3 py-2 bg-[#030d26] border border-cyan-500/30 rounded-xl text-xs text-white outline-none focus:border-cyan-400 font-mono"
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-300 mb-1 font-semibold">รูป Thumbnail URL</label>
                    <input
                      type="text"
                      value={editingWork.imageUrl || ''}
                      onChange={(e) => setEditingWork({ ...editingWork, imageUrl: e.target.value })}
                      required
                      className="w-full px-3 py-2 bg-[#030d26] border border-cyan-500/30 rounded-xl text-xs text-white outline-none focus:border-cyan-400 font-mono"
                    />
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
                        className="text-[10px] px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-400/30 hover:bg-emerald-500/25 cursor-pointer"
                      >
                        📷 ภาพนิ่ง: คณะผู้ตรวจการ สตง.
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
                        className="text-[10px] px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-400/30 hover:bg-amber-500/25 cursor-pointer"
                      >
                        📊 Infographic สรุปงบประมาณ
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
                        className="text-[10px] px-2.5 py-1 rounded-lg bg-rose-500/15 text-rose-300 border border-rose-400/30 hover:bg-rose-500/25 cursor-pointer"
                      >
                        🎬 สตูดิโอวิดีโอ สตง.
                      </button>
                    </div>
                  </div>
                </div>
                <div className="px-5 py-3 border-t border-cyan-500/25 bg-[#040e28] flex justify-end gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setEditingWork(null)}
                    className="px-4 py-2 text-xs text-slate-400 hover:text-white rounded-xl border border-slate-750"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-bold shadow-md shadow-cyan-500/20"
                  >
                    บันทึกผลงาน
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Edit Viral Clip */}
        {editingClip && (
          <div
            className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 z-[70] overflow-y-auto animate-fadeIn"
            onClick={(e) => {
              if (e.target === e.currentTarget) setEditingClip(null);
            }}
          >
            <div className="w-full max-w-lg max-h-[92vh] bg-gradient-to-b from-[#091b48] via-[#07153b] to-[#040e28] border border-cyan-400/40 rounded-2xl shadow-2xl flex flex-col overflow-hidden my-auto ring-1 ring-cyan-500/20">
              <div className="px-5 py-3.5 border-b border-cyan-500/25 bg-[#05112f] flex items-center justify-between shrink-0">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Film className="w-4 h-4 text-cyan-400" />
                  <span>{editingClip.id ? 'แก้ไขคลิปวิดีโอ' : 'เพิ่มคลิปวิดีโอใหม่'}</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setEditingClip(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <form onSubmit={handleSaveClip} className="flex flex-col flex-1 overflow-hidden">
                <div className="p-4 sm:p-5 overflow-y-auto space-y-3.5 flex-1 overscroll-contain">
                  <div>
                    <label className="block text-[11px] text-slate-300 mb-1 font-semibold">ชื่อคลิปวิดีโอ</label>
                    <input
                      type="text"
                      value={editingClip.title || ''}
                      onChange={(e) => setEditingClip({ ...editingClip, title: e.target.value })}
                      required
                      placeholder="เช่น รายงานพิเศษ: เบื้องหลังภารกิจตรวจเงินแผ่นดิน"
                      className="w-full px-3 py-2 bg-[#030d26] border border-cyan-500/30 rounded-xl text-xs text-white outline-none focus:border-cyan-400"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-300 mb-1 font-semibold">ผู้จัดทำ / ช่อง</label>
                      <input
                        type="text"
                        value={editingClip.creator || ''}
                        onChange={(e) => setEditingClip({ ...editingClip, creator: e.target.value })}
                        className="w-full px-3 py-2 bg-[#030d26] border border-cyan-500/30 rounded-xl text-xs text-white outline-none focus:border-cyan-400"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-300 mb-1 font-semibold">ความยาวคลิป</label>
                      <input
                        type="text"
                        value={editingClip.duration || ''}
                        onChange={(e) => setEditingClip({ ...editingClip, duration: e.target.value })}
                        placeholder="เช่น 02:45"
                        className="w-full px-3 py-2 bg-[#030d26] border border-cyan-500/30 rounded-xl text-xs text-white outline-none focus:border-cyan-400 font-mono"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-300 mb-1 font-semibold">ยอดวิวที่แสดง</label>
                      <input
                        type="text"
                        value={editingClip.views || ''}
                        onChange={(e) => setEditingClip({ ...editingClip, views: e.target.value })}
                        placeholder="เช่น 150K"
                        className="w-full px-3 py-2 bg-[#030d26] border border-cyan-500/30 rounded-xl text-xs text-white outline-none focus:border-cyan-400"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-300 mb-1 font-semibold">ไฮไลท์ / คำโปรย</label>
                      <input
                        type="text"
                        value={editingClip.highlight || ''}
                        onChange={(e) => setEditingClip({ ...editingClip, highlight: e.target.value })}
                        placeholder="เช่น คลิปไวรัลยอดนิยม"
                        className="w-full px-3 py-2 bg-[#030d26] border border-cyan-500/30 rounded-xl text-xs text-white outline-none focus:border-cyan-400"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-300 mb-1 font-semibold">ลิงก์วิดีโอ (YouTube URL)</label>
                    <input
                      type="url"
                      value={editingClip.linkUrl || ''}
                      onChange={(e) => setEditingClip({ ...editingClip, linkUrl: e.target.value })}
                      required
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="w-full px-3 py-2 bg-[#030d26] border border-cyan-500/30 rounded-xl text-xs text-white outline-none focus:border-cyan-400 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-300 mb-1 font-semibold">URL ภาพ Thumbnail</label>
                    <input
                      type="text"
                      value={editingClip.thumbnail || ''}
                      onChange={(e) => setEditingClip({ ...editingClip, thumbnail: e.target.value })}
                      required
                      placeholder="/src/assets/images/... หรือ https://..."
                      className="w-full px-3 py-2 bg-[#030d26] border border-cyan-500/30 rounded-xl text-xs text-white outline-none focus:border-cyan-400 font-mono"
                    />
                  </div>
                </div>
                <div className="px-5 py-3 border-t border-cyan-500/25 bg-[#040e28] flex justify-end gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setEditingClip(null)}
                    className="px-4 py-2 text-xs text-slate-400 hover:text-white rounded-xl border border-slate-750"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-bold shadow-md shadow-cyan-500/20"
                  >
                    บันทึกคลิป
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Edit Milestone */}
        {editingMilestone && (
          <div
            className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 z-[70] overflow-y-auto animate-fadeIn"
            onClick={(e) => {
              if (e.target === e.currentTarget) setEditingMilestone(null);
            }}
          >
            <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-b from-[#0f172a] via-[#0b1020] to-[#070b16] border-2 border-rose-500/50 rounded-3xl p-5 sm:p-7 shadow-2xl text-left ring-1 ring-white/10">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-rose-500/30">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                  <h3 className="text-sm font-extrabold text-white">
                    {editingMilestone.id ? 'แก้ไขโหนดไทม์ไลน์ 3D อาคาร สตง.' : 'เพิ่มโหนดไทม์ไลน์ 3D ใหม่'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingMilestone(null)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveMilestone} className="space-y-4 text-xs">
                {/* Row 1: 3D Block Label & Color Accent */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-2xl bg-[#070d1d] border border-slate-700">
                  <div>
                    <label className="block text-[11px] font-bold text-rose-300 mb-1">
                      ข้อความบนบล็อก 3D (ปี/ช่วง)
                    </label>
                    <input
                      type="text"
                      value={editingMilestone.shortTitle || ''}
                      onChange={(e) =>
                        setEditingMilestone({ ...editingMilestone, shortTitle: e.target.value })
                      }
                      placeholder="เช่น 2024, 2025 หรือ ระยะที่ 1"
                      className="w-full px-3 py-2 bg-[#040814] border border-rose-500/40 rounded-xl text-white font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      โทนสีบล็อก 3D (Color)
                    </label>
                    <select
                      value={editingMilestone.colorAccent || 'orange'}
                      onChange={(e) =>
                        setEditingMilestone({ ...editingMilestone, colorAccent: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-[#040814] border border-slate-700 rounded-xl text-white font-medium"
                    >
                      <option value="orange">🟧 ส้ม (Orange - เหมือนแบบ Visme)</option>
                      <option value="amber">🟨 ทอง / อำพัน (Amber)</option>
                      <option value="teal">🟩 เขียวหัวเป็ด (Teal)</option>
                      <option value="cyan">🟦 ฟ้าคราม (Cyan / Sky)</option>
                      <option value="emerald">🟢 เขียวมรกต (Emerald)</option>
                      <option value="rose">🟥 แดงฉุกเฉิน (Rose Alert)</option>
                      <option value="purple">🟪 ม่วงยุทธศาสตร์ (Purple)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      ไอคอนบนโหนด (Icon)
                    </label>
                    <select
                      value={editingMilestone.icon || 'lightbulb'}
                      onChange={(e) =>
                        setEditingMilestone({ ...editingMilestone, icon: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-[#040814] border border-slate-700 rounded-xl text-white font-medium"
                    >
                      <option value="lightbulb">💡 หลอดไฟ (ตรวจพบ / ความคิด)</option>
                      <option value="building">🏢 อาคาร (ตรวจสอบโครงสร้าง)</option>
                      <option value="handshake">🤝 จับมือ (BCP / ความร่วมมือ)</option>
                      <option value="target">🎯 เป้าหมาย (งานเสริมฐานราก)</option>
                      <option value="users">👥 ประชาชน / บุคลากร</option>
                      <option value="shield">🛡️ โล่ความปลอดภัย</option>
                      <option value="alert">⚠️ สัญญาณเตือนภัย</option>
                      <option value="activity">📈 กราฟการตรวจวัด</option>
                    </select>
                  </div>
                </div>

                {/* Row 2: Date, Time, Phase, Status */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-300 mb-1">วันที่แสดง</label>
                    <input
                      type="text"
                      value={editingMilestone.date || ''}
                      onChange={(e) =>
                        setEditingMilestone({ ...editingMilestone, date: e.target.value })
                      }
                      placeholder="เช่น 28 กันยายน 2569"
                      required
                      className="w-full px-3 py-2 bg-[#040814] border border-slate-700 rounded-xl text-white"
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
                      className="w-full px-3 py-2 bg-[#040814] border border-slate-700 rounded-xl text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-300 mb-1">ขั้นตอน / เฟส</label>
                    <input
                      type="text"
                      value={editingMilestone.phase || ''}
                      onChange={(e) =>
                        setEditingMilestone({ ...editingMilestone, phase: e.target.value })
                      }
                      placeholder="เช่น วิศวกรรม วสท."
                      required
                      className="w-full px-3 py-2 bg-[#040814] border border-slate-700 rounded-xl text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-300 mb-1">สถานะ</label>
                    <select
                      value={editingMilestone.status || 'ดำเนินการ'}
                      onChange={(e) =>
                        setEditingMilestone({ ...editingMilestone, status: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-[#040814] border border-slate-700 rounded-xl text-white"
                    >
                      <option value="ตรวจสอบแล้ว">ตรวจสอบแล้ว (ปลอดภัย)</option>
                      <option value="ดำเนินการแล้ว">ดำเนินการแล้ว</option>
                      <option value="วิเคราะห์ข้อมูล">วิเคราะห์ข้อมูล (เฝ้าระวัง)</option>
                      <option value="กำลังปฏิบัติการ">กำลังปฏิบัติการ (เรียลไทม์)</option>
                      <option value="แผนระยะยาว">แผนระยะยาว</option>
                    </select>
                  </div>
                </div>

                {/* Row 3: Title (Concise) */}
                <div>
                  <label className="block text-[11px] font-bold text-white mb-1">
                    หัวข้อเหตุการณ์ (ข้อความกระชับบนไทม์ไลน์)
                  </label>
                  <input
                    type="text"
                    value={editingMilestone.title || ''}
                    onChange={(e) =>
                      setEditingMilestone({ ...editingMilestone, title: e.target.value })
                    }
                    placeholder="หัวข้อกระชับ 1-2 บรรทัด"
                    required
                    className="w-full px-3 py-2 bg-[#040814] border border-slate-700 rounded-xl text-white font-semibold"
                  />
                </div>

                {/* Row 4: Short Description (Concise on Timeline) */}
                <div>
                  <label className="block text-[11px] text-slate-300 mb-1">
                    คำอธิบายย่อ (แสดงบนไทม์ไลน์ กระชับ 1-2 บรรทัด)
                  </label>
                  <textarea
                    rows={2}
                    value={editingMilestone.description || ''}
                    onChange={(e) =>
                      setEditingMilestone({ ...editingMilestone, description: e.target.value })
                    }
                    placeholder="คำอธิบายสรุปสั้นๆ สำหรับแสดงบนโหนดไทม์ไลน์"
                    required
                    className="w-full px-3 py-2 bg-[#040814] border border-slate-700 rounded-xl text-white"
                  />
                </div>

                {/* Row 5: Full Official Statement (Displayed in Card Modal) */}
                <div>
                  <label className="block text-[11px] font-bold text-rose-300 mb-1">
                    แถลงการณ์และรายงานข้อเท็จจริงฉบับสมบูรณ์ (แสดงในการ์ดรายละเอียดเมื่อคลิก)
                  </label>
                  <textarea
                    rows={4}
                    value={editingMilestone.fullStatement || ''}
                    onChange={(e) =>
                      setEditingMilestone({ ...editingMilestone, fullStatement: e.target.value })
                    }
                    placeholder="ใส่เนื้อหารายละเอียดครบถ้วน เช่น ข้อเท็จจริง มาตรการความปลอดภัย แผนเผชิญเหตุ..."
                    className="w-full px-3 py-2 bg-[#040814] border border-rose-500/30 rounded-xl text-white leading-relaxed"
                  />
                </div>

                {/* Row 6: Media Selection (Photo or Video) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-2xl bg-[#070d1d] border border-slate-700">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      ชนิดสื่อมีเดีย (Media)
                    </label>
                    <select
                      value={editingMilestone.mediaType || 'photo'}
                      onChange={(e) =>
                        setEditingMilestone({
                          ...editingMilestone,
                          mediaType: e.target.value as 'photo' | 'video',
                        })
                      }
                      className="w-full px-3 py-2 bg-[#040814] border border-slate-700 rounded-xl text-white"
                    >
                      <option value="photo">📷 ภาพนิ่ง (Photo / Infographic)</option>
                      <option value="video">🎬 วิดีโอคลิป (Video / YouTube)</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] text-slate-300 mb-1">
                      {editingMilestone.mediaType === 'video'
                        ? 'URL วิดีโอ (YouTube เช่น https://www.youtube.com/watch?v=...)'
                        : 'URL ภาพถ่าย (เช่น /src/assets/images/... หรือ URL รูปภาพ)'}
                    </label>
                    {editingMilestone.mediaType === 'video' ? (
                      <input
                        type="text"
                        value={editingMilestone.videoUrl || ''}
                        onChange={(e) =>
                          setEditingMilestone({ ...editingMilestone, videoUrl: e.target.value })
                        }
                        placeholder="https://www.youtube.com/watch?v=..."
                        className="w-full px-3 py-2 bg-[#040814] border border-blue-500/40 rounded-xl text-white font-mono"
                      />
                    ) : (
                      <input
                        type="text"
                        value={editingMilestone.imageUrl || ''}
                        onChange={(e) =>
                          setEditingMilestone({ ...editingMilestone, imageUrl: e.target.value })
                        }
                        placeholder="/src/assets/images/... หรือ https://..."
                        className="w-full px-3 py-2 bg-[#040814] border border-amber-500/40 rounded-xl text-white font-mono"
                      />
                    )}
                  </div>
                </div>

                {/* Row 7: Engineering Verification & Reference Links */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-300 mb-1">
                      รายละเอียดการตรวจวัดทางวิศวกรรม (วสท.)
                    </label>
                    <textarea
                      rows={2}
                      value={editingMilestone.technicalDetails || ''}
                      onChange={(e) =>
                        setEditingMilestone({
                          ...editingMilestone,
                          technicalDetails: e.target.value,
                        })
                      }
                      placeholder="เช่น ตรวจวัด Tiltmeter 24 จุด อัตราขยับตัว 0.00 มม."
                      className="w-full px-3 py-2 bg-[#040814] border border-slate-700 rounded-xl text-white font-mono"
                    />
                  </div>

                  <div className="space-y-2">
                    <div>
                      <label className="block text-[11px] text-slate-300 mb-1">
                        ชื่อเอกสารอ้างอิงทางการ (Reference Title)
                      </label>
                      <input
                        type="text"
                        value={editingMilestone.referenceTitle || ''}
                        onChange={(e) =>
                          setEditingMilestone({
                            ...editingMilestone,
                            referenceTitle: e.target.value,
                          })
                        }
                        placeholder="เช่น แถลงการณ์ สตง. ฉบับที่ 1/2569"
                        className="w-full px-3 py-1.5 bg-[#040814] border border-slate-700 rounded-xl text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-300 mb-1">
                        ลิงก์เอกสารอ้างอิง (Reference URL)
                      </label>
                      <input
                        type="text"
                        value={editingMilestone.referenceUrl || ''}
                        onChange={(e) =>
                          setEditingMilestone({
                            ...editingMilestone,
                            referenceUrl: e.target.value,
                          })
                        }
                        placeholder="https://..."
                        className="w-full px-3 py-1.5 bg-[#040814] border border-slate-700 rounded-xl text-white font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setEditingMilestone(null)}
                    className="px-4 py-2 text-xs text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-400 hover:to-orange-400 text-slate-950 text-xs font-bold transition-all shadow-[0_0_15px_rgba(244,63,94,0.4)] cursor-pointer"
                  >
                    บันทึกช่วงไทม์ไลน์
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

        {/* Pre-Publish News Confirmation & AI Broadcast Modal */}
        {pendingPublishStory && (
          <PublishBroadcastConfirmModal
            isOpen={!!pendingPublishStory}
            onClose={() => setPendingPublishStory(null)}
            story={pendingPublishStory}
            subscribers={subscribersList}
            onConfirmPublishAndBroadcast={handleConfirmPublishAndBroadcast}
            onConfirmPublishOnly={handleConfirmPublishOnly}
          />
        )}

        {/* SMTP Configuration Modal */}
        <SmtpConfigModal
          isOpen={showSmtpModal}
          onClose={() => setShowSmtpModal(false)}
          onConfigSaved={fetchSmtpStatus}
        />

        {/* Real Delivery Receipt / Report Modal */}
        {deliveryReceipt && deliveryReceipt.isOpen && (
          <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
            <div className="relative w-full max-w-lg rounded-2xl bg-gradient-to-b from-[#081b47] via-[#051438] to-[#020b22] border border-amber-400/50 shadow-2xl p-5 text-slate-100 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-amber-500/30">
                <div className="flex items-center gap-2.5">
                  {deliveryReceipt.isRealDelivery ? (
                    <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                  ) : (
                    <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-400/40">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      {deliveryReceipt.isRealDelivery ? 'ส่งอีเมลจริงสำเร็จ (Real Email Sent)' : 'รายงานการกระจายข่าวสาร (โหมดจำลอง)'}
                    </h3>
                    <span className="text-[11px] text-slate-400">
                      เรื่อง: {deliveryReceipt.storyTitle}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setDeliveryReceipt(null)}
                  className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                {deliveryReceipt.isRealDelivery ? (
                  <div className="p-3.5 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-200 space-y-1">
                    <div className="font-bold text-emerald-300 flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>ส่งผ่านเซิร์ฟเวอร์ SMTP ไปยัง {deliveryReceipt.deliveredCount} ผู้ติดตามเรียบร้อยแล้ว</span>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      ข้อความถูกส่งตรงไปยังกล่องจดหมายจริง (Inbox) ของผู้รับทุกคน โดยผู้รับสามารถเปิดอ่านและคลิกลิงก์เข้าสู่เว็บไซต์ สตง. ได้ทันที
                    </p>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl bg-amber-950/50 border border-amber-500/40 text-amber-200 space-y-2">
                    <div className="font-bold text-amber-300 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                      <span>ส่งในโหมดจำลอง (ยังไม่ส่งเข้ากล่องจดหมายจริง)</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      สาเหตุ: ระบบยังไม่พบบัญชีผู้ส่ง SMTP (เช่น Gmail + App Password 16 หลัก) จึงจำลองการส่งผ่าน Ethereal Mail
                    </p>
                    <div className="pt-1 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setDeliveryReceipt(null);
                          setShowSmtpModal(true);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer shadow-sm"
                      >
                        ⚙️ ตั้งค่า SMTP ส่งเมลจริงทันที
                      </button>
                      {deliveryReceipt.previewUrl && (
                        <a
                          href={deliveryReceipt.previewUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs inline-flex items-center gap-1"
                        >
                          <span>ดูหน้าตาอีเมลจำลอง</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Recipients List */}
                <div>
                  <span className="text-[11px] font-semibold text-slate-300 block mb-1">
                    รายชื่ออีเมลผู้รับ ({deliveryReceipt.deliveredEmails.length} บัญชี):
                  </span>
                  <div className="max-h-36 overflow-y-auto p-2 rounded-lg bg-[#02071a] border border-slate-700/80 space-y-1">
                    {deliveryReceipt.deliveredEmails.map((em, idx) => (
                      <div key={idx} className="flex items-center justify-between text-[11px] text-slate-300 px-1 py-0.5">
                        <span className="font-mono">{em}</span>
                        <span className="text-[10px] text-emerald-400">ส่งแล้ว</span>
                      </div>
                    ))}
                  </div>
                </div>

                {deliveryReceipt.failedEmails && deliveryReceipt.failedEmails.length > 0 && (
                  <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-500/30 text-rose-200">
                    <span className="font-semibold block mb-1">อีเมลที่ส่งไม่สำเร็จ ({deliveryReceipt.failedEmails.length}):</span>
                    {deliveryReceipt.failedEmails.map((f, idx) => (
                      <div key={idx} className="text-[10px] text-rose-300">
                        {f.email}: {f.error}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setDeliveryReceipt(null)}
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer"
                >
                  ปิดหน้าต่าง
                </button>
              </div>
            </div>
          </div>
        )}

        {/* AI Cover Studio Modal */}
        <AICoverStudioModal
          isOpen={showAiCoverModal}
          onClose={() => setShowAiCoverModal(false)}
          storyTitle={editingStory?.title}
          subtitle={editingStory?.subtitle}
          category={editingStory?.category}
          onSelectImage={(newUrl) => {
            setEditingStory((prev) => (prev ? { ...prev, imageUrl: newUrl } : prev));
          }}
        />
      </div>
    </div>
  );
};
