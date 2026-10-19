import React, { useState, useEffect } from 'react';
import {
  X,
  Copy,
  Check,
  Share2,
  Users,
  TrendingUp,
  BarChart3,
  RefreshCw,
  Download,
  Smartphone,
  Monitor,
  Tablet,
  Radio,
  Layers,
  Sparkles,
} from 'lucide-react';
import { getAnalyticsSummary, AnalyticsSummary } from '../utils/analytics';
import { playDigitalSound } from '../utils/audioEffects';

interface ExecutiveDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExecutiveDashboardModal: React.FC<ExecutiveDashboardModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsSummary>(getAnalyticsSummary());
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | 'all'>('7d');
  const [isCopied, setIsCopied] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('เมื่อสักครู่');

  // Auto-refresh stats every 10 seconds to deliver true Real-Time monitoring
  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      setAnalyticsData(getAnalyticsSummary());
      const now = new Date();
      setLastUpdated(
        `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')} น.`
      );
    }, 10000);

    return () => clearInterval(interval);
  }, [isOpen]);

  const handleRefresh = () => {
    playDigitalSound('blip');
    setIsRefreshing(true);
    setTimeout(() => {
      setAnalyticsData(getAnalyticsSummary());
      setIsRefreshing(false);
      const now = new Date();
      setLastUpdated(
        `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')} น.`
      );
    }, 400);
  };

  const handleCopyDashboardLink = () => {
    playDigitalSound('select');
    const dashboardUrl = `${window.location.origin}/#dashboard`;
    navigator.clipboard.writeText(dashboardUrl).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 3000);
    });
  };

  const handleExportCSV = () => {
    playDigitalSound('select');
    const csvRows = [
      ['ตัวชี้วัด (KPI)', 'จำนวน (ค่าจริง)'],
      ['ผู้เข้าชมรวม (Total Visitors)', analyticsData.totalVisitors],
      ['ผู้เข้าชมวันนี้ (Today Visitors)', analyticsData.todayVisitors],
      ['อัตราการเติบโตของผู้เข้าชม (Growth Rate)', `${analyticsData.visitorGrowthPct}%`],
      ['การแชร์ข่าวสารรวม (Total Shares)', analyticsData.totalShares],
      ['การแชร์วันนี้ (Today Shares)', analyticsData.todayShares],
      ['อัตราการเติบโตของการแชร์', `${analyticsData.shareGrowthPct}%`],
      ['เวลาเฉลี่ยในเว็บไซต์', analyticsData.avgEngagementTime],
      ['Bounce Rate', `${analyticsData.bounceRatePct}%`],
      ['แชร์ผ่าน LINE', analyticsData.platformShares.line],
      ['แชร์ผ่าน Facebook', analyticsData.platformShares.facebook],
      ['แชร์ผ่าน X (Twitter)', analyticsData.platformShares.twitter],
      ['คัดลอกลิงก์ตรง (Direct Link Copy)', analyticsData.platformShares.copy_link],
      ['แชร์ผ่านมือถือ (Native Share)', analyticsData.platformShares.native],
      ['---', '---'],
      ['อันดับข่าวที่ถูกแชร์มากที่สุด', 'จำนวนครั้งที่แชร์'],
      ...analyticsData.topSharedItems.map((item, idx) => [
        `${idx + 1}. ${item.title} (${item.category})`,
        item.shares,
      ]),
    ];

    const csvContent =
      '\uFEFF' + csvRows.map((e) => e.map((val) => `"${val}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `PR_SAI_Thailand_Analytics_Report_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-xl animate-fadeIn overflow-y-auto"
    >
      <div className="relative w-full max-w-6xl max-h-[94vh] bg-gradient-to-b from-[#071946]/98 via-[#041235]/98 to-[#02091d]/98 border-2 border-amber-400/60 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.9),0_0_40px_rgba(245,158,11,0.25)] flex flex-col overflow-hidden my-auto text-left">
        {/* Top Header Bar */}
        <div className="p-4 sm:p-6 border-b border-amber-500/30 flex flex-wrap items-center justify-between gap-3 bg-[#030d2a]/95">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-amber-500/25 to-yellow-400/20 border border-amber-400/50 flex items-center justify-center shadow-lg shadow-amber-500/10 shrink-0">
              <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-xl font-bold text-white tracking-tight">
                  PR - SAI Thailand · ศูนย์วิเคราะห์สถิติ Real-time
                </h2>
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 text-[10px] font-mono font-bold">
                  <Radio className="w-2.5 h-2.5 animate-pulse text-emerald-400" />
                  <span>LIVE REAL-TIME</span>
                </span>
              </div>
              <p className="text-xs text-amber-300/80 mt-0.5">
                สำนักประชาสัมพันธ์และสื่อสารองค์กร สตง. · ข้อมูลอัปเดตล่าสุด: {lastUpdated}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Copy Shareable Link Button */}
            <button
              onClick={handleCopyDashboardLink}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-lg ${
                isCopied
                  ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/30 ring-2 ring-emerald-300'
                  : 'bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 shadow-amber-500/25'
              }`}
              title="คัดลอกลิงก์หน้านี้เพื่อส่งต่อให้ผู้บริหารหรือทีมงานดูสด"
            >
              {isCopied ? (
                <>
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>คัดลอกลิงก์สำเร็จ!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>คัดลอกลิงก์ส่งให้ผู้อื่นดู</span>
                </>
              )}
            </button>

            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-900/80 hover:bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
              title="รีเฟรชข้อมูลล่าสุด"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-amber-400' : ''}`} />
              <span className="hidden sm:inline">รีเฟรช</span>
            </button>

            {/* Export CSV Button */}
            <button
              onClick={handleExportCSV}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
              title="ส่งออกรายงานเป็นไฟล์ CSV (Excel)"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">รายงาน CSV</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-900/80 hover:bg-rose-500/20 text-slate-400 hover:text-white border border-slate-700/60 transition-colors ml-1"
              title="ปิดหน้าต่าง"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Shareable Link Banner Info */}
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 sm:px-6 flex items-center justify-between text-xs text-amber-200 gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>
              <strong>Real-Time Link:</strong> ลิงก์หน้านี้สามารถส่งต่อให้ผู้บริหารหรือทีมงานเปิดดูบนมือถือและคอมพิวเตอร์ได้ทันทีโดยไม่ต้องเข้าสู่ระบบ
            </span>
          </div>
          <span className="font-mono text-[11px] text-amber-400/90 hidden md:inline truncate max-w-xs">
            {typeof window !== 'undefined' ? `${window.location.origin}/#dashboard` : ''}
          </span>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* 4 Core KPI Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Total Visitors */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-[#091b48]/90 to-[#040e28]/95 border border-cyan-400/40 shadow-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">
                  ผู้เข้าชมเว็บไซต์รวม (Total Visitors)
                </span>
                <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight">
                  {analyticsData.totalVisitors.toLocaleString()}
                </span>
                <span className="text-xs text-emerald-400 font-semibold flex items-center gap-0.5">
                  <TrendingUp className="w-3 h-3" />
                  +{analyticsData.visitorGrowthPct}%
                </span>
              </div>
              <div className="pt-2 border-t border-cyan-500/20 flex items-center justify-between text-[11px] text-slate-400">
                <span>วันนี้: +{analyticsData.todayVisitors.toLocaleString()} ครั้ง</span>
                <span className="text-cyan-400 font-mono">
                  เฉลี่ย {analyticsData.avgEngagementTime}
                </span>
              </div>
            </div>

            {/* 2. Total Shares */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-[#082242]/90 to-[#040e28]/95 border border-emerald-400/40 shadow-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">
                  ยอดการแชร์ข่าวสารรวม (Total Shares)
                </span>
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
                  <Share2 className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight">
                  {analyticsData.totalShares.toLocaleString()}
                </span>
                <span className="text-xs text-emerald-400 font-semibold flex items-center gap-0.5">
                  <TrendingUp className="w-3 h-3" />
                  +{analyticsData.shareGrowthPct}%
                </span>
              </div>
              <div className="pt-2 border-t border-emerald-500/20 flex items-center justify-between text-[11px] text-slate-400">
                <span>วันนี้: +{analyticsData.todayShares.toLocaleString()} ครั้ง</span>
                <span className="text-emerald-400 font-mono">LINE สูงสุด 45%</span>
              </div>
            </div>

            {/* 3. Engagement & Bounce Rate */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-[#091b48]/90 to-[#040e28]/95 border border-amber-400/40 shadow-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">
                  เวลาเฉลี่ยในเว็บไซต์ (Avg Engagement)
                </span>
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center">
                  <Layers className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight">
                  {analyticsData.avgEngagementTime}
                </span>
                <span className="text-xs text-amber-300 font-medium">นาที</span>
              </div>
              <div className="pt-2 border-t border-amber-500/20 flex items-center justify-between text-[11px] text-slate-400">
                <span>Bounce Rate: {analyticsData.bounceRatePct}%</span>
                <span className="text-amber-300 font-mono">ความสนใจสูง</span>
              </div>
            </div>

            {/* 4. Active Real-Time Status */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-[#1b0e3e]/90 to-[#040e28]/95 border border-purple-400/40 shadow-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">
                  สถานะเครือข่ายดิจิทัล สตง.
                </span>
                <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center">
                  <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono tracking-tight">
                  ออนไลน์ 100%
                </span>
              </div>
              <div className="pt-2 border-t border-purple-500/20 flex items-center justify-between text-[11px] text-slate-400">
                <span>Cloud & CDN ทำงานปกติ</span>
                <span className="text-emerald-400 font-mono">พร้อมใช้งาน 24 ชม.</span>
              </div>
            </div>
          </div>

          {/* Charts & Breakdown Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* 7-Day Trend Chart */}
            <div className="lg:col-span-2 p-5 rounded-2xl bg-[#051336]/90 border border-amber-400/30 shadow-lg space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-amber-400" />
                    <span>แนวโน้มผู้เข้าชมและการแชร์ย้อนหลัง 7 วัน (Daily Trends)</span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    เปรียบเทียบจำนวนการเข้าชมเว็บไซต์ (แถบสีฟ้า) และจำนวนการแชร์ข่าว (แถบสีทอง)
                  </p>
                </div>
              </div>

              <div className="h-56 flex items-end justify-between gap-2 sm:gap-4 pt-6 px-2 border-b border-slate-700/60 pb-2">
                {analyticsData.dailyTrends.map((d, i) => {
                  const maxVis = Math.max(...analyticsData.dailyTrends.map((t) => t.visitors));
                  const visHeightPct = Math.round((d.visitors / maxVis) * 100);
                  const maxShare = Math.max(...analyticsData.dailyTrends.map((t) => t.shares));
                  const shareHeightPct = Math.round((d.shares / maxShare) * 60);

                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                      <div className="w-full flex items-end justify-center gap-1 sm:gap-1.5 h-full">
                        {/* Visitors Bar */}
                        <div
                          className="w-full max-w-[18px] bg-gradient-to-t from-cyan-600 to-sky-400 rounded-t-md transition-all group-hover:brightness-125 relative"
                          style={{ height: `${visHeightPct}%` }}
                        >
                          <div className="opacity-0 group-hover:opacity-100 absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 border border-cyan-400 text-cyan-300 text-[10px] px-1.5 py-0.5 rounded shadow pointer-events-none whitespace-nowrap z-20">
                            เข้าชม {d.visitors.toLocaleString()}
                          </div>
                        </div>

                        {/* Shares Bar */}
                        <div
                          className="w-full max-w-[18px] bg-gradient-to-t from-amber-600 to-yellow-400 rounded-t-md transition-all group-hover:brightness-125 relative"
                          style={{ height: `${shareHeightPct}%` }}
                        >
                          <div className="opacity-0 group-hover:opacity-100 absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 border border-amber-400 text-amber-300 text-[10px] px-1.5 py-0.5 rounded shadow pointer-events-none whitespace-nowrap z-20">
                            แชร์ {d.shares.toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] sm:text-[11px] text-slate-400 font-mono">
                        {d.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-center gap-6 text-xs text-slate-300 pt-1">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-cyan-400 inline-block" />
                  <span>ผู้เข้าชม (Visitors)</span>
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-amber-400 inline-block" />
                  <span>การแชร์ (Shares)</span>
                </span>
              </div>
            </div>

            {/* Breakdown Column: Devices & Social Platforms */}
            <div className="p-5 rounded-2xl bg-[#051336]/90 border border-amber-400/30 shadow-lg space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-emerald-400" />
                  <span>สัดส่วนช่องทางการแชร์ (Share Channels)</span>
                </h3>
                <p className="text-[11px] text-slate-400">แยกตามแพลตฟอร์ม Social Media</p>
              </div>

              <div className="space-y-2.5">
                {/* LINE */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-emerald-300 font-medium">LINE</span>
                    <span className="font-mono text-slate-300">
                      {analyticsData.platformShares.line.toLocaleString()} ครั้ง (
                      {Math.round((analyticsData.platformShares.line / analyticsData.totalShares) * 100)}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-400 rounded-full"
                      style={{
                        width: `${Math.round((analyticsData.platformShares.line / analyticsData.totalShares) * 100)}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Facebook */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-blue-400 font-medium">Facebook</span>
                    <span className="font-mono text-slate-300">
                      {analyticsData.platformShares.facebook.toLocaleString()} ครั้ง (
                      {Math.round((analyticsData.platformShares.facebook / analyticsData.totalShares) * 100)}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{
                        width: `${Math.round((analyticsData.platformShares.facebook / analyticsData.totalShares) * 100)}%`,
                      }}
                    />
                  </div>
                </div>

                {/* X */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-medium">X (Twitter)</span>
                    <span className="font-mono text-slate-300">
                      {analyticsData.platformShares.twitter.toLocaleString()} ครั้ง (
                      {Math.round((analyticsData.platformShares.twitter / analyticsData.totalShares) * 100)}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-slate-300 rounded-full"
                      style={{
                        width: `${Math.round((analyticsData.platformShares.twitter / analyticsData.totalShares) * 100)}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Direct Link */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-amber-300 font-medium">คัดลอกลิงก์ตรง</span>
                    <span className="font-mono text-slate-300">
                      {analyticsData.platformShares.copy_link.toLocaleString()} ครั้ง (
                      {Math.round((analyticsData.platformShares.copy_link / analyticsData.totalShares) * 100)}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full"
                      style={{
                        width: `${Math.round((analyticsData.platformShares.copy_link / analyticsData.totalShares) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Devices */}
              <div className="pt-3 border-t border-slate-700/60 space-y-2">
                <span className="text-xs font-semibold text-slate-300 block">
                  อุปกรณ์ของผู้ใช้งาน (Devices)
                </span>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                    <Smartphone className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
                    <span className="block text-[11px] text-slate-400">Mobile</span>
                    <span className="font-bold text-white font-mono">
                      {analyticsData.deviceBreakdown.mobile}%
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                    <Monitor className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                    <span className="block text-[11px] text-slate-400">Desktop</span>
                    <span className="font-bold text-white font-mono">
                      {analyticsData.deviceBreakdown.desktop}%
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                    <Tablet className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                    <span className="block text-[11px] text-slate-400">Tablet</span>
                    <span className="font-bold text-white font-mono">
                      {analyticsData.deviceBreakdown.tablet}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Top Shared Items Table */}
          <div className="p-5 rounded-2xl bg-[#051336]/90 border border-amber-400/30 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>อันดับข่าวและสื่อที่ได้รับการแชร์สูงสุด (Top Shared Content Ranking)</span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  ข่าวและผลงานประชาสัมพันธ์ที่ได้รับความนิยมและการมีส่วนร่วมจากประชาชนสูงสุด
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#030a21] text-amber-300/80 font-mono border-b border-amber-500/20">
                  <tr>
                    <th className="py-2.5 px-3">อันดับ</th>
                    <th className="py-2.5 px-3">หัวข้อข่าว / ผลงานประชาสัมพันธ์</th>
                    <th className="py-2.5 px-3">หมวดหมู่</th>
                    <th className="py-2.5 px-3 text-center">ยอดเข้าดู</th>
                    <th className="py-2.5 px-3 text-center">ยอดแชร์</th>
                    <th className="py-2.5 px-3">แชร์ล่าสุด</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {analyticsData.topSharedItems.slice(0, 8).map((item, idx) => (
                    <tr key={item.id} className="hover:bg-amber-400/5 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-amber-400">
                        {idx === 0 ? '🥇 1' : idx === 1 ? '🥈 2' : idx === 2 ? '🥉 3' : `${idx + 1}`}
                      </td>
                      <td className="py-3 px-3 max-w-sm">
                        <span className="font-semibold text-white line-clamp-1">
                          {item.title}
                        </span>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-400/30">
                          {item.category}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center font-mono text-slate-300">
                        {item.views}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="inline-flex items-center gap-1 font-mono font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 rounded">
                          <Share2 className="w-3 h-3" />
                          {item.shares.toLocaleString()}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-[11px] text-slate-400 whitespace-nowrap">
                        {item.lastShared}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal Bottom Footer */}
        <div className="p-3 sm:p-4 bg-[#020719] border-t border-amber-500/30 flex items-center justify-between text-xs text-slate-400">
          <span className="text-[11px]">
            ระบบสถิติสื่อสารองค์กร สตง. (PR - SAI Thailand Analytics)
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition-colors"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
