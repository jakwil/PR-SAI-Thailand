import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Radio, Building, BookOpen, Film, BookMarked, Sparkles, ArrowRight, CornerDownLeft } from 'lucide-react';
import { AppData } from '../types';

interface QuickSearchBarProps {
  data: AppData;
  onSelectItem?: (type: string, id: string) => void;
}

export const QuickSearchBar: React.FC<QuickSearchBarProps> = ({ data }) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut (Ctrl+K / Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      } else if (e.key === 'Escape') {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const cleanQuery = query.trim().toLowerCase();

  // Search through all data sets
  const matchedStories = cleanQuery
    ? (data.heroStories || []).filter(
        (s) =>
          s.title.toLowerCase().includes(cleanQuery) ||
          s.subtitle.toLowerCase().includes(cleanQuery) ||
          s.category.toLowerCase().includes(cleanQuery)
      )
    : [];

  const matchedTimeline = cleanQuery
    ? (data.incidentTimeline || []).filter(
        (t) =>
          t.title.toLowerCase().includes(cleanQuery) ||
          t.description.toLowerCase().includes(cleanQuery) ||
          t.phase.toLowerCase().includes(cleanQuery) ||
          t.technicalDetails.toLowerCase().includes(cleanQuery)
      )
    : [];

  const matchedWorks = cleanQuery
    ? (data.publishedWorks || []).filter(
        (w) =>
          w.title.toLowerCase().includes(cleanQuery) ||
          w.description.toLowerCase().includes(cleanQuery) ||
          w.category.toLowerCase().includes(cleanQuery)
      )
    : [];

  const matchedClips = cleanQuery
    ? (data.viralClips || []).filter(
        (c) =>
          c.title.toLowerCase().includes(cleanQuery) ||
          c.highlight.toLowerCase().includes(cleanQuery) ||
          c.creator.toLowerCase().includes(cleanQuery)
      )
    : [];

  const matchedKb = cleanQuery
    ? (data.knowledgeBase || []).filter(
        (k) =>
          k.title.toLowerCase().includes(cleanQuery) ||
          k.content.toLowerCase().includes(cleanQuery) ||
          k.category.toLowerCase().includes(cleanQuery)
      )
    : [];

  const totalResults =
    matchedStories.length +
    matchedTimeline.length +
    matchedWorks.length +
    matchedClips.length +
    matchedKb.length;

  const quickPills = [
    'อาคาร สตง. ทรุดตัว',
    'สายด่วน 1730',
    'ขอสนับสนุนสื่อ',
    'Digital Audit',
    'คลิปไวรัล',
    'ภารกิจ สตง.',
  ];

  const handleResultClick = (targetHash?: string) => {
    setIsOpen(false);
    if (targetHash) {
      const el = document.querySelector(targetHash);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative transition-all duration-300 w-full ${
        isOpen ? 'scale-[1.01] z-50' : 'z-20'
      }`}
    >
      {/* Prominent High-Visibility Blurred Search Input for PC and Mobile */}
      <div
        className={`relative flex items-center bg-[#041238]/95 backdrop-blur-2xl border transition-all duration-300 rounded-2xl ${
          isOpen
            ? 'border-cyan-300 ring-2 ring-cyan-400/40 shadow-[0_0_25px_rgba(6,182,212,0.45)]'
            : 'border-cyan-500/50 hover:border-cyan-400 hover:shadow-[0_0_18px_rgba(6,182,212,0.28)] shadow-[0_4px_20px_rgba(2,10,31,0.7)]'
        }`}
      >
        {/* Glowing Search Icon */}
        <div className="pl-3.5 pr-1 flex items-center justify-center">
          <Search className={`w-4 h-4 transition-colors ${isOpen ? 'text-cyan-300 animate-pulse' : 'text-cyan-400'}`} />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="ค้นหาด่วน ข้อมูลข่าว / อาคาร สตง. / คลิป / ภารกิจ..."
          className="w-full bg-transparent px-2.5 py-2 text-xs sm:text-sm text-white placeholder-slate-400 font-medium focus:outline-none"
        />

        {query ? (
          <button
            onClick={() => {
              setQuery('');
              inputRef.current?.focus();
            }}
            className="p-1 text-slate-400 hover:text-white mr-2 rounded-lg hover:bg-slate-800/80 transition-colors"
            title="ล้างข้อความ"
          >
            <X className="w-4 h-4" />
          </button>
        ) : (
          <div className="hidden lg:flex items-center gap-1 mr-3 shrink-0">
            <span className="text-[10px] text-cyan-300 font-mono bg-cyan-950/80 px-2 py-0.5 rounded-md border border-cyan-500/40 shadow-inner">
              Ctrl + K
            </span>
          </div>
        )}
      </div>

      {/* Expanded Instant Search Panel */}
      {isOpen && (
        <div className="absolute top-12 left-0 right-0 sm:-left-6 sm:-right-6 md:-left-12 md:-right-12 lg:-left-20 lg:-right-20 z-50 max-h-[80vh] overflow-y-auto rounded-2xl bg-[#041033]/98 backdrop-blur-2xl border border-cyan-400/50 shadow-[0_15px_45px_rgba(2,10,31,0.98)] p-4 text-left space-y-4 animate-fadeIn">
          {/* Quick Filter Recommendation Pills (Always accessible) */}
          <div className="space-y-1.5 pb-2 border-b border-cyan-500/20">
            <div className="flex items-center justify-between text-[11px] text-cyan-300 font-medium">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                <span>คำค้นหายอดนิยม</span>
              </span>
              {query && (
                <span className="font-mono text-cyan-400 font-bold">
                  ผลการค้นหา: {totalResults} รายการ
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {quickPills.map((pill) => (
                <button
                  key={pill}
                  onClick={() => {
                    setQuery(pill);
                    inputRef.current?.focus();
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] transition-all font-medium ${
                    query === pill
                      ? 'bg-cyan-400 text-slate-950 font-bold shadow-md shadow-cyan-500/30'
                      : 'bg-[#061845] hover:bg-cyan-500/20 text-slate-200 border border-cyan-500/30'
                  }`}
                >
                  {pill}
                </button>
              ))}
            </div>
          </div>

          {/* Search Result Listing */}
          {cleanQuery ? (
            totalResults === 0 ? (
              <div className="py-8 text-center text-xs text-slate-300 space-y-2">
                <p>ไม่พบผลลัพธ์ที่ตรงกับ "{query}"</p>
                <p className="text-[11px] text-slate-400">
                  ลองค้นหาคำว่า "อาคาร", "งบประมาณ", "1730", หรือ "ขอสื่อ"
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* 1. Hero Stories Matches */}
                {matchedStories.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-cyan-300">
                      <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                      <span>ภาพข่าวไฮไลต์ Hero ({matchedStories.length})</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {matchedStories.map((s) => (
                        <a
                          key={s.id}
                          href={s.linkUrl}
                          onClick={() => handleResultClick('#home')}
                          className="block p-2.5 rounded-xl bg-[#061848]/90 hover:bg-cyan-500/20 border border-cyan-500/30 transition-all hover:scale-[1.01]"
                        >
                          <div className="flex items-center justify-between text-[10px] text-cyan-400 mb-1">
                            <span className="font-semibold">{s.category}</span>
                            <span>{s.date}</span>
                          </div>
                          <h4 className="text-xs font-bold text-white line-clamp-1">{s.title}</h4>
                          <p className="text-[11px] text-slate-300 line-clamp-2 mt-0.5">{s.subtitle}</p>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. Building Incident Timeline Matches */}
                {matchedTimeline.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-300">
                      <Building className="w-3.5 h-3.5 text-amber-400" />
                      <span>สถานการณ์อาคาร สตง. ทรุดตัว ({matchedTimeline.length})</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {matchedTimeline.map((t) => (
                        <a
                          key={t.id}
                          href="#incident-timeline"
                          onClick={() => handleResultClick('#incident-timeline')}
                          className="block p-2.5 rounded-xl bg-[#061848]/90 hover:bg-amber-500/20 border border-amber-500/30 transition-all hover:scale-[1.01]"
                        >
                          <div className="flex items-center justify-between text-[10px] text-amber-400 mb-1">
                            <span>เฟส: {t.phase}</span>
                            <span>{t.date}</span>
                          </div>
                          <h4 className="text-xs font-bold text-white line-clamp-1">{t.title}</h4>
                          <p className="text-[11px] text-slate-300 line-clamp-2 mt-0.5">{t.description}</p>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. Published Works Matches */}
                {matchedWorks.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-300">
                      <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                      <span>คลังสื่อดิจิทัล ({matchedWorks.length})</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {matchedWorks.map((w) => (
                        <a
                          key={w.id}
                          href={w.linkUrl}
                          onClick={() => handleResultClick('#published-works')}
                          className="block p-2.5 rounded-xl bg-[#061848]/90 hover:bg-blue-500/20 border border-blue-500/30 transition-all hover:scale-[1.01]"
                        >
                          <div className="flex items-center justify-between text-[10px] text-blue-300 mb-1">
                            <span>{w.category}</span>
                            <span>เข้าชม {w.views}</span>
                          </div>
                          <h4 className="text-xs font-bold text-white line-clamp-1">{w.title}</h4>
                          <p className="text-[11px] text-slate-300 line-clamp-2 mt-0.5">{w.description}</p>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. Viral Clips Matches */}
                {matchedClips.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-300">
                      <Film className="w-3.5 h-3.5 text-rose-400" />
                      <span>ข่าว & คลิปไวรัล ({matchedClips.length})</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {matchedClips.map((c) => (
                        <a
                          key={c.id}
                          href="#viral-clips"
                          onClick={() => handleResultClick('#viral-clips')}
                          className="block p-2.5 rounded-xl bg-[#061848]/90 hover:bg-rose-500/20 border border-rose-500/30 transition-all hover:scale-[1.01]"
                        >
                          <div className="flex items-center justify-between text-[10px] text-rose-300 mb-1">
                            <span>{c.creator}</span>
                            <span>{c.duration}</span>
                          </div>
                          <h4 className="text-xs font-bold text-white line-clamp-1">{c.title}</h4>
                          <p className="text-[11px] text-slate-300 line-clamp-2 mt-0.5">{c.highlight}</p>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* 5. Knowledge Base Matches */}
                {matchedKb.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-300">
                      <BookMarked className="w-3.5 h-3.5 text-emerald-400" />
                      <span>คลังความรู้ สตง. & AI Grounding ({matchedKb.length})</span>
                    </div>
                    <div className="space-y-2">
                      {matchedKb.map((k) => (
                        <div
                          key={k.id}
                          className="p-2.5 rounded-xl bg-[#061848]/90 border border-emerald-500/30 text-left"
                        >
                          <div className="flex items-center justify-between text-[10px] text-emerald-300 mb-0.5">
                            <span>{k.category}</span>
                            <span>{k.dateAdded}</span>
                          </div>
                          <h4 className="text-xs font-bold text-white">{k.title}</h4>
                          <p className="text-[11px] text-slate-300 line-clamp-2 mt-0.5">{k.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          ) : (
            <div className="py-4 text-center text-xs text-slate-400">
              พิมพ์คำค้นหาเพื่อค้นหาข้อมูลฉับไว หรือคลิกเลือกหัวข้อยอดนิยมด้านบน
            </div>
          )}
        </div>
      )}
    </div>
  );
};
