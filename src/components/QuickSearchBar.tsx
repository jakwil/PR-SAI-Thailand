import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Search,
  X,
  Radio,
  Building,
  BookOpen,
  Film,
  BookMarked,
  Sparkles,
  ExternalLink,
  Network,
  Cpu,
  Megaphone,
  ArrowRight,
  Zap,
} from 'lucide-react';
import { AppData } from '../types';
import { EAUDIT_FAQS, EAUDIT_DEEP_DIVE } from '../data/eAuditData';
import { BUREAU_GROUPS, defaultGroupWorks } from '../data/bureauStructure';
import { playDigitalSound } from '../utils/audioEffects';

export type SearchDomainKey =
  | 'stories'
  | 'timeline'
  | 'works'
  | 'clips'
  | 'eaudit'
  | 'bureau'
  | 'announcements'
  | 'kb';

interface SearchIndexEntry {
  id: string;
  domain: SearchDomainKey;
  title: string;
  subtitle: string;
  metaLeft: string;
  metaRight?: string;
  targetHash?: string;
  externalUrl?: string;
  openBureau?: boolean;
  titleLower: string;
  metaLower: string;
  searchText: string;
}

interface QuickSearchBarProps {
  data: AppData;
  onClose?: () => void;
  onOpenBureauStructure?: () => void;
  autoFocus?: boolean;
}

const DOMAIN_META: Record<
  SearchDomainKey,
  {
    label: string;
    shortLabel: string;
    colorText: string;
    cardBorder: string;
    cardHover: string;
    badgeBg: string;
  }
> = {
  timeline: {
    label: 'Timeline เหตุการณ์อาคาร สตง.',
    shortLabel: 'Timeline อาคาร',
    colorText: 'text-rose-300',
    cardBorder: 'border-rose-500/30',
    cardHover: 'hover:bg-rose-500/15 hover:border-rose-400/60',
    badgeBg: 'bg-rose-500/20 text-rose-200 border-rose-400/30',
  },
  eaudit: {
    label: 'ประเด็นเด่นที่น่าสนใจ · ข้อมูล e-Audit (ปีงบ 2570)',
    shortLabel: 'e-Audit 2570',
    colorText: 'text-amber-300',
    cardBorder: 'border-amber-500/30',
    cardHover: 'hover:bg-amber-500/15 hover:border-amber-400/60',
    badgeBg: 'bg-amber-500/20 text-amber-200 border-amber-400/30',
  },
  works: {
    label: 'คลังสื่อดิจิทัล & ข่าวสาร (Media Library)',
    shortLabel: 'คลังสื่อดิจิทัล',
    colorText: 'text-blue-300',
    cardBorder: 'border-blue-500/30',
    cardHover: 'hover:bg-blue-500/15 hover:border-blue-400/60',
    badgeBg: 'bg-blue-500/20 text-blue-200 border-blue-400/30',
  },
  stories: {
    label: 'ภาพข่าวไฮไลต์หน้าแรก',
    shortLabel: 'ข่าวไฮไลต์',
    colorText: 'text-cyan-300',
    cardBorder: 'border-cyan-500/30',
    cardHover: 'hover:bg-cyan-500/15 hover:border-cyan-400/60',
    badgeBg: 'bg-cyan-500/20 text-cyan-200 border-cyan-400/30',
  },
  clips: {
    label: 'ข่าว & คลิปไวรัล สตง.',
    shortLabel: 'คลิปไวรัล',
    colorText: 'text-pink-300',
    cardBorder: 'border-pink-500/30',
    cardHover: 'hover:bg-pink-500/15 hover:border-pink-400/60',
    badgeBg: 'bg-pink-500/20 text-pink-200 border-pink-400/30',
  },
  bureau: {
    label: 'โครงสร้าง ภารกิจ และผลงาน 4 กลุ่มงาน',
    shortLabel: 'โครงสร้างกลุ่มงาน',
    colorText: 'text-indigo-300',
    cardBorder: 'border-indigo-500/30',
    cardHover: 'hover:bg-indigo-500/15 hover:border-indigo-400/60',
    badgeBg: 'bg-indigo-500/20 text-indigo-200 border-indigo-400/30',
  },
  announcements: {
    label: 'แถบประกาศข่าวด่วน',
    shortLabel: 'ประกาศด่วน',
    colorText: 'text-yellow-300',
    cardBorder: 'border-yellow-500/30',
    cardHover: 'hover:bg-yellow-500/15 hover:border-yellow-400/60',
    badgeBg: 'bg-yellow-500/20 text-yellow-200 border-yellow-400/30',
  },
  kb: {
    label: 'คลังความรู้ สตง. (Knowledge Base)',
    shortLabel: 'คลังความรู้',
    colorText: 'text-emerald-300',
    cardBorder: 'border-emerald-500/30',
    cardHover: 'hover:bg-emerald-500/15 hover:border-emerald-400/60',
    badgeBg: 'bg-emerald-500/20 text-emerald-200 border-emerald-400/30',
  },
};

const DOMAIN_ORDER: SearchDomainKey[] = [
  'timeline',
  'eaudit',
  'stories',
  'works',
  'clips',
  'bureau',
  'announcements',
  'kb',
];

function renderDomainIcon(domain: SearchDomainKey) {
  switch (domain) {
    case 'timeline':
      return <Building className="w-3.5 h-3.5 text-rose-400" />;
    case 'eaudit':
      return <Cpu className="w-3.5 h-3.5 text-amber-400" />;
    case 'works':
      return <BookOpen className="w-3.5 h-3.5 text-blue-400" />;
    case 'stories':
      return <Radio className="w-3.5 h-3.5 text-cyan-400" />;
    case 'clips':
      return <Film className="w-3.5 h-3.5 text-pink-400" />;
    case 'bureau':
      return <Network className="w-3.5 h-3.5 text-indigo-400" />;
    case 'announcements':
      return <Megaphone className="w-3.5 h-3.5 text-yellow-400" />;
    case 'kb':
      return <BookMarked className="w-3.5 h-3.5 text-emerald-400" />;
  }
}

export const QuickSearchBar: React.FC<QuickSearchBarProps> = ({
  data,
  onClose,
  onOpenBureauStructure,
  autoFocus = true,
}) => {
  const [query, setQuery] = useState('');
  const [activeDomainFilter, setActiveDomainFilter] = useState<'all' | SearchDomainKey>('all');
  const [expandedDomains, setExpandedDomains] = useState<Record<string, boolean>>({});
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!autoFocus) return;
    const raf = window.requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
    return () => window.cancelAnimationFrame(raf);
  }, [autoFocus]);

  // Pre-build a normalized sitewide index once per data change for <1ms instant search
  const searchIndex = useMemo<SearchIndexEntry[]>(() => {
    const entries: SearchIndexEntry[] = [];

    const pushEntry = (
      item: Omit<SearchIndexEntry, 'titleLower' | 'metaLower' | 'searchText'>,
      extraFields: Array<string | undefined> = []
    ) => {
      const titleLower = item.title.toLowerCase();
      const metaLower = `${item.metaLeft} ${item.metaRight || ''}`.toLowerCase();
      const searchText = [item.title, item.subtitle, item.metaLeft, item.metaRight, ...extraFields]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      entries.push({
        ...item,
        titleLower,
        metaLower,
        searchText,
      });
    };

    // 1. Hero Stories
    for (const s of data.heroStories || []) {
      const hasExt = Boolean(s.linkUrl && s.linkUrl.startsWith('http'));
      pushEntry(
        {
          id: `story-${s.id}`,
          domain: 'stories',
          title: s.title,
          subtitle: s.subtitle,
          metaLeft: s.category,
          metaRight: s.date,
          targetHash: '#home',
          externalUrl: hasExt ? s.linkUrl : undefined,
        },
        [s.badge]
      );
    }

    // 2. Incident Timeline
    for (const t of data.incidentTimeline || []) {
      pushEntry(
        {
          id: `tl-${t.id}`,
          domain: 'timeline',
          title: t.title,
          subtitle: t.description,
          metaLeft: t.phase,
          metaRight: t.date,
          targetHash: '#incident-timeline',
        },
        [t.status, t.technicalDetails, t.fullStatement, t.shortTitle, t.referenceTitle]
      );
    }

    // 3. Published Works (Media Library)
    for (const w of data.publishedWorks || []) {
      const validUrl = w.linkUrl && w.linkUrl !== '#' && !w.linkUrl.startsWith('#') ? w.linkUrl : undefined;
      pushEntry(
        {
          id: `work-${w.id}`,
          domain: 'works',
          title: w.title,
          subtitle: w.description,
          metaLeft: w.category,
          metaRight: w.publishDate ? `${w.publishDate} · เข้าชม ${w.views}` : `เข้าชม ${w.views}`,
          targetHash: '#published-works',
          externalUrl: validUrl,
        },
        [w.badge, w.creator, w.mediaType, w.publishDate]
      );
    }

    // 4. Viral Clips
    for (const c of data.viralClips || []) {
      const validUrl = c.linkUrl && c.linkUrl !== '#' && !c.linkUrl.startsWith('#') ? c.linkUrl : undefined;
      pushEntry(
        {
          id: `clip-${c.id}`,
          domain: 'clips',
          title: c.title,
          subtitle: c.highlight,
          metaLeft: c.creator,
          metaRight: c.duration,
          targetHash: '#viral-clips',
          externalUrl: validUrl,
        },
        [c.views, c.mediaType]
      );
    }

    // 5. e-Audit FAQs + Deep Dive Data (Static Official Content)
    for (const faq of EAUDIT_FAQS) {
      pushEntry(
        {
          id: `faq-${faq.id}`,
          domain: 'eaudit',
          title: faq.q,
          subtitle: faq.summary,
          metaLeft: faq.badge || 'ประเด็นเด่น e-Audit',
          metaRight: faq.actionText,
          targetHash: faq.actionAnchor || '#public-interest',
          externalUrl:
            faq.actionLink && faq.actionLink.startsWith('http') ? faq.actionLink : undefined,
        },
        faq.bullets || []
      );
    }

    pushEntry(
      {
        id: 'eaudit-legal',
        domain: 'eaudit',
        title: 'กรอบแนวปฏิบัติ e-Audit พ.ศ. 2569 (ราชกิจจานุเบกษา 25 ก.ย. 2569)',
        subtitle: `${EAUDIT_DEEP_DIVE.legalFramework.effectiveDate} · ${EAUDIT_DEEP_DIVE.legalFramework.targetAgencies}`,
        metaLeft: 'กรอบกฎหมาย e-Audit ปีงบ 2570',
        metaRight: 'เริ่ม 1 ต.ค. 2569',
        targetHash: '#public-interest',
      },
      [
        EAUDIT_DEEP_DIVE.legalFramework.gazetteRef,
        EAUDIT_DEEP_DIVE.legalFramework.gracePeriod,
        EAUDIT_DEEP_DIVE.vision.concept,
        EAUDIT_DEEP_DIVE.vision.description,
      ]
    );

    pushEntry(
      {
        id: 'eaudit-systems',
        domain: 'eaudit',
        title: 'โครงสร้างระบบ e-Audit ครบวงจร (ภารกิจที่ 1 · 11 ระบบงานตรวจสอบ · 10 ระบบสนับสนุน · Smart SAO)',
        subtitle:
          'ครอบคลุม Portal, FFDA, e-Media, e-Tracking, AI วิเคราะห์ข้อมูล, 11 ระบบงานตรวจสอบ, Search Engine และระบบประชุมอิเล็กทรอนิกส์',
        metaLeft: 'ระบบงาน e-Audit & Smart SAO',
        targetHash: '#public-interest',
      },
      [
        ...EAUDIT_DEEP_DIVE.mission1Systems,
        ...EAUDIT_DEEP_DIVE.eAudit11AdminSystems,
        ...EAUDIT_DEEP_DIVE.eAudit10SupportSystems,
        ...EAUDIT_DEEP_DIVE.smartSaoModules,
      ]
    );

    pushEntry(
      {
        id: 'eaudit-bigdata-ai',
        domain: 'eaudit',
        title: 'Big Data 5V (Volume, Velocity, Variety, Veracity, Value) และ AI-Driven Audit',
        subtitle: `${EAUDIT_DEEP_DIVE.aiCapabilities.aiTools} · เชื่อมโยง GFMIS, e-GP, e-LAAS, GIS`,
        metaLeft: 'Big Data & AI ของ สตง.',
        targetHash: '#public-interest',
      },
      [
        ...EAUDIT_DEEP_DIVE.bigData5V.map((v) => `${v.name} ${v.detail}`),
        ...EAUDIT_DEEP_DIVE.bigDataPlatform.reasons,
        EAUDIT_DEEP_DIVE.aiCapabilities.analyticsTools,
      ]
    );

    pushEntry(
      {
        id: 'eaudit-drone-gis',
        domain: 'eaudit',
        title: 'เทคโนโลยีโดรน ภาพถ่ายดาวเทียม และ GIS 3 มิติ (ICS VL260, DJI M350, Mavic 3E/3T)',
        subtitle:
          'ตรวจสอบน้ำท่วม ป่าชายเลน เหมืองแร่ และแบบจำลอง 3 มิติ (DEM/DTM, Orthophoto)',
        metaLeft: 'Drone & GIS Audit',
        targetHash: '#public-interest',
      },
      [
        ...EAUDIT_DEEP_DIVE.droneGis.fourTechnologies.map(
          (t) => `${t.name} ${t.desc} ${t.caseStudy}`
        ),
        ...EAUDIT_DEEP_DIVE.droneGis.droneModels.map((d) => `${d.model} ${d.role}`),
      ]
    );

    pushEntry(
      {
        id: 'eaudit-joint-hr',
        domain: 'eaudit',
        title: 'Joint SAO 6 บริการดิจิทัลภาคประชาชน และ HR Digital (Audit e-Learning, DPIS 6, mySAO)',
        subtitle: EAUDIT_DEEP_DIVE.jointSao.accessChannels,
        metaLeft: 'Joint SAO & HR Digital',
        targetHash: '#public-interest',
      },
      [
        ...EAUDIT_DEEP_DIVE.jointSao.sixServices.map((s) => `${s.title} ${s.detail}`),
        ...EAUDIT_DEEP_DIVE.hrDigital.map((h) => `${h.name} ${h.detail}`),
      ]
    );

    // 6. Bureau Structure (4 Groups) + Group Works
    for (const g of BUREAU_GROUPS) {
      pushEntry(
        {
          id: `bureau-group-${g.id}`,
          domain: 'bureau',
          title: `กลุ่มงานที่ ${g.order}: ${g.name}`,
          subtitle: g.summary,
          metaLeft: g.englishName,
          metaRight: `ภารกิจ ${g.missions.length} ด้าน`,
          openBureau: true,
        },
        [g.shortName, ...g.missions]
      );
    }

    const groupWorksSource =
      data.groupWorks && data.groupWorks.length > 0 ? data.groupWorks : defaultGroupWorks;
    for (const gw of groupWorksSource) {
      pushEntry(
        {
          id: `bureau-work-${gw.id}`,
          domain: 'bureau',
          title: gw.title,
          subtitle: gw.description,
          metaLeft: gw.badge || 'ผลงานกลุ่มงาน',
          metaRight: gw.workDate,
          openBureau: true,
        },
        [gw.groupId, gw.mediaType]
      );
    }

    // 7. Marquee Announcements
    for (const msg of data.marqueeTicker?.messages || []) {
      if (!msg.active) continue;
      const isHash = msg.linkUrl?.startsWith('#');
      const isExt = msg.linkUrl?.startsWith('http');
      pushEntry({
        id: `ticker-${msg.id}`,
        domain: 'announcements',
        title: msg.text,
        subtitle: 'ประกาศข่าวสารประชาสัมพันธ์บนแถบข่าววิ่ง สตง.',
        metaLeft: data.marqueeTicker?.prefixLabel || 'ประกาศด่วน สตง.',
        targetHash: isHash ? msg.linkUrl : '#home',
        externalUrl: isExt ? msg.linkUrl : undefined,
      });
    }

    // 8. Knowledge Base
    for (const k of data.knowledgeBase || []) {
      const validUrl = k.sourceUrl && k.sourceUrl.startsWith('http') ? k.sourceUrl : undefined;
      pushEntry({
        id: `kb-${k.id}`,
        domain: 'kb',
        title: k.title,
        subtitle: k.content,
        metaLeft: k.category,
        metaRight: k.dateAdded,
        externalUrl: validUrl,
      });
    }

    return entries;
  }, [data]);

  const cleanQuery = query.trim().toLowerCase();

  // Instant scored search over the pre-indexed sitewide entries
  const { groupedResults, countsByDomain, totalResults, topResult } = useMemo(() => {
    const emptyCounts: Record<SearchDomainKey, number> = {
      timeline: 0,
      eaudit: 0,
      stories: 0,
      works: 0,
      clips: 0,
      bureau: 0,
      announcements: 0,
      kb: 0,
    };

    if (!cleanQuery) {
      return {
        groupedResults: [] as { domain: SearchDomainKey; items: SearchIndexEntry[] }[],
        countsByDomain: emptyCounts,
        totalResults: 0,
        topResult: null as SearchIndexEntry | null,
      };
    }

    const tokens = cleanQuery.split(/\s+/).filter(Boolean);
    const scoredByDomain: Record<SearchDomainKey, { entry: SearchIndexEntry; score: number }[]> = {
      timeline: [],
      eaudit: [],
      stories: [],
      works: [],
      clips: [],
      bureau: [],
      announcements: [],
      kb: [],
    };

    let grandTotal = 0;

    for (const entry of searchIndex) {
      let matchedAll = true;
      for (let i = 0; i < tokens.length; i++) {
        if (!entry.searchText.includes(tokens[i])) {
          matchedAll = false;
          break;
        }
      }
      if (!matchedAll) continue;

      let score = 0;
      if (entry.titleLower.includes(cleanQuery)) score += 60;
      for (const t of tokens) {
        if (entry.titleLower.includes(t)) score += 25;
        else if (entry.metaLower.includes(t)) score += 10;
        else score += 3;
      }

      scoredByDomain[entry.domain].push({ entry, score });
      emptyCounts[entry.domain] += 1;
      grandTotal += 1;
    }

    const groups: { domain: SearchDomainKey; items: SearchIndexEntry[] }[] = [];
    let bestOverall: { entry: SearchIndexEntry; score: number } | null = null;

    for (const domain of DOMAIN_ORDER) {
      const list = scoredByDomain[domain];
      if (list.length === 0) continue;
      list.sort((a, b) => b.score - a.score);
      if (!bestOverall || list[0].score > bestOverall.score) {
        bestOverall = list[0];
      }
      if (activeDomainFilter === 'all' || activeDomainFilter === domain) {
        groups.push({
          domain,
          items: list.map((x) => x.entry),
        });
      }
    }

    return {
      groupedResults: groups,
      countsByDomain: emptyCounts,
      totalResults: grandTotal,
      topResult: bestOverall?.entry || null,
    };
  }, [cleanQuery, searchIndex, activeDomainFilter]);

  const quickPills = [
    'e-Audit 2570',
    'อาคาร สตง.',
    'ศาลอาญา',
    'เงินเยียวยา',
    'Joint SAO',
    'โดรน GIS',
    'โครงสร้างกลุ่มงาน',
    '02-271-8000',
  ];

  const handleOpenEntry = (entry: SearchIndexEntry) => {
    playDigitalSound('click');
    onClose?.();

    if (entry.openBureau && onOpenBureauStructure) {
      onOpenBureauStructure();
      return;
    }

    if (entry.externalUrl) {
      let url = entry.externalUrl.trim();
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = `https://${url}`;
      }
      window.open(url, '_blank', 'noopener,noreferrer');
      return;
    }

    if (entry.targetHash) {
      const el = document.querySelector(entry.targetHash);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Instant Search Input */}
      <div className="relative flex items-center bg-[#041238] border border-cyan-400/60 ring-2 ring-cyan-400/25 shadow-[0_0_24px_rgba(6,182,212,0.3)] rounded-2xl">
        <div className="pl-3.5 pr-1 flex items-center justify-center shrink-0">
          <Search className="w-4 h-4 text-cyan-300" />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActiveDomainFilter('all');
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && topResult) {
              e.preventDefault();
              handleOpenEntry(topResult);
            }
          }}
          placeholder="ค้นหาด่วนทั่วทั้งเว็บ: ข่าว / Timeline อาคาร / e-Audit / คลิป / กลุ่มงาน..."
          className="w-full bg-transparent px-2.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-400 font-medium focus:outline-none"
        />

        {query ? (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setActiveDomainFilter('all');
              inputRef.current?.focus();
            }}
            className="p-1.5 text-slate-400 hover:text-white mr-2 rounded-lg hover:bg-slate-800/80 transition-colors cursor-pointer"
            title="ล้างคำค้นหา"
          >
            <X className="w-4 h-4" />
          </button>
        ) : (
          <div className="hidden sm:flex items-center gap-1.5 mr-3 shrink-0">
            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-300 font-mono bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-500/40">
              <Zap className="w-2.5 h-2.5" />
              <span>{searchIndex.length} รายการพร้อมค้นหา</span>
            </span>
          </div>
        )}
      </div>

      {/* Quick Pills & Live Result Count */}
      <div className="space-y-2 pb-2 border-b border-cyan-500/20">
        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-cyan-300 font-medium">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span>คำค้นหายอดนิยม (ค้นหาทั่วทั้งเว็บไซต์ทันที)</span>
          </span>
          {cleanQuery && (
            <span className="font-mono text-cyan-300 font-bold">
              พบทั้งหมด {totalResults} รายการ
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {quickPills.map((pill) => (
            <button
              key={pill}
              type="button"
              onClick={() => {
                setQuery(pill);
                setActiveDomainFilter('all');
                inputRef.current?.focus();
              }}
              className={`px-2.5 py-1 rounded-lg text-[11px] transition-all font-medium cursor-pointer ${
                query === pill
                  ? 'bg-cyan-400 text-slate-950 font-bold shadow-md shadow-cyan-500/30'
                  : 'bg-[#061845] hover:bg-cyan-500/20 text-slate-200 border border-cyan-500/30'
              }`}
            >
              {pill}
            </button>
          ))}
        </div>

        {/* Domain Filter Chips when query matches multiple categories */}
        {cleanQuery && totalResults > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-0.5 no-scrollbar">
            <button
              type="button"
              onClick={() => setActiveDomainFilter('all')}
              className={`shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors cursor-pointer ${
                activeDomainFilter === 'all'
                  ? 'bg-cyan-500 text-slate-950 border-cyan-300'
                  : 'bg-[#03102e] border-slate-700 text-slate-300 hover:text-white'
              }`}
            >
              ทั้งหมด ({totalResults})
            </button>
            {DOMAIN_ORDER.filter((d) => countsByDomain[d] > 0).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setActiveDomainFilter(d)}
                className={`shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors cursor-pointer ${
                  activeDomainFilter === d
                    ? 'bg-amber-400 text-slate-950 border-amber-300 font-bold'
                    : 'bg-[#03102e] border-slate-700 text-slate-300 hover:text-white'
                }`}
              >
                {DOMAIN_META[d].shortLabel} ({countsByDomain[d]})
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Results Area (Scrollable inside modal, never clipped) */}
      <div className="max-h-[58vh] overflow-y-auto pr-1 space-y-4">
        {cleanQuery ? (
          totalResults === 0 ? (
            <div className="py-8 text-center text-xs text-slate-300 space-y-2">
              <p>ไม่พบข้อมูลที่ตรงกับ &ldquo;{query}&rdquo; ในเว็บไซต์</p>
              <p className="text-[11px] text-slate-400">
                ลองค้นหาคำว่า &ldquo;e-Audit&rdquo;, &ldquo;อาคาร&rdquo;, &ldquo;ศาลอาญา&rdquo;, &ldquo;โดรน&rdquo;, หรือ &ldquo;กลุ่มงาน&rdquo;
              </p>
            </div>
          ) : (
            groupedResults.map((group) => {
              const meta = DOMAIN_META[group.domain];
              const isExpanded = Boolean(expandedDomains[group.domain]);
              const initialLimit = activeDomainFilter === group.domain ? 24 : 6;
              const visibleItems = isExpanded ? group.items : group.items.slice(0, initialLimit);
              const hiddenCount = group.items.length - visibleItems.length;

              return (
                <div key={group.domain} className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className={`flex items-center gap-1.5 text-xs font-semibold ${meta.colorText}`}>
                      {renderDomainIcon(group.domain)}
                      <span>
                        {meta.label} ({group.items.length})
                      </span>
                    </div>
                    {hiddenCount > 0 && (
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedDomains((prev) => ({ ...prev, [group.domain]: true }))
                        }
                        className="text-[11px] text-cyan-300 hover:text-white font-semibold cursor-pointer"
                      >
                        ดูทั้งหมดอีก {hiddenCount} รายการ ›
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {visibleItems.map((entry) => (
                      <button
                        key={entry.id}
                        type="button"
                        onClick={() => handleOpenEntry(entry)}
                        className={`text-left w-full p-2.5 rounded-xl bg-[#061848]/90 border ${meta.cardBorder} ${meta.cardHover} transition-all cursor-pointer group/res`}
                      >
                        <div className="flex items-center justify-between gap-2 text-[10px] mb-1">
                          <span className={`px-1.5 py-0.5 rounded border font-medium truncate ${meta.badgeBg}`}>
                            {entry.metaLeft}
                          </span>
                          <span className="text-slate-400 shrink-0 flex items-center gap-1">
                            {entry.metaRight && <span>{entry.metaRight}</span>}
                            {entry.externalUrl ? (
                              <ExternalLink className="w-2.5 h-2.5 text-cyan-400" />
                            ) : (
                              <ArrowRight className="w-2.5 h-2.5 text-slate-400 group-hover/res:translate-x-0.5 transition-transform" />
                            )}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-white line-clamp-1 group-hover/res:text-cyan-200 transition-colors">
                          {entry.title}
                        </h4>
                        <p className="text-[11px] text-slate-300 line-clamp-2 mt-0.5">
                          {entry.subtitle}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })
          )
        ) : (
          <div className="py-5 text-center text-xs text-slate-300 space-y-1.5">
            <p className="font-medium">
              พิมพ์คำค้นหาเพื่อค้นหาข้อมูลทุกส่วนในเว็บไซต์ทันที ({searchIndex.length} รายการ)
            </p>
            <p className="text-[11px] text-slate-400">
              ครอบคลุม ข่าวสาร · คลังสื่อดิจิทัล · Timeline อาคาร สตง. · ข้อมูล e-Audit 2570 · โครงสร้าง 4 กลุ่มงาน · คลิปไวรัล
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
