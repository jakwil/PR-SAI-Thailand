import React from 'react';
import {
  Plus,
  Trash2,
  Edit2,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  CheckCircle,
  X,
  Radio,
  Sliders,
  Sparkles,
  Link as LinkIcon,
  Palette,
  Check
} from 'lucide-react';
import { MarqueeTickerSettings, MarqueeMessageItem } from '../types';
import { BeaconRippleDot } from './BeaconRippleDot';
import { MarqueeTicker } from './MarqueeTicker';
import { playDigitalSound } from '../utils/audioEffects';

interface AdminTickerTabProps {
  settings: MarqueeTickerSettings;
  onToggleEnabled: (enabled: boolean) => Promise<void>;
  onChangeDirection: (dir: 'left-to-right' | 'right-to-left') => Promise<void>;
  onChangeSpeed: (seconds: number) => Promise<void>;
  onTogglePauseOnHover: (pause: boolean) => Promise<void>;
  onUpdatePrefix: (prefix: string) => Promise<void>;
  onToggleMessageActive: (id: string) => Promise<void>;
  onDeleteMessage: (id: string) => Promise<void>;
  onMoveMessage: (index: number, dir: 'up' | 'down') => Promise<void>;
  onSaveMessage: (e: React.FormEvent) => Promise<void>;
  editingMsg: Partial<MarqueeMessageItem> | null;
  setEditingMsg: (msg: Partial<MarqueeMessageItem> | null) => void;
  isAddOpen: boolean;
  setIsAddOpen: (open: boolean) => void;
  saveNotice: string | null;
}

// Preset color palettes for Royal PR theme
const COLOR_PRESETS = [
  { name: 'ทองคำ สตง.', color: '#f59e0b' },
  { name: 'ฟ้าไพลิน Sapphire', color: '#38bdf8' },
  { name: 'แดงทับทิม แถลงการณ์', color: '#f43f5e' },
  { name: 'เขียวมรกต ธรรมาภิบาล', color: '#10b981' },
  { name: 'ม่วงเทคโนโลยี ดิจิทัล', color: '#a855f7' },
  { name: 'ขาวประกาย Platinum', color: '#ffffff' },
];

const SPEED_PRESETS = [
  { label: 'ช้ามาก', seconds: 50 },
  { label: 'ช้า', seconds: 38 },
  { label: 'ปกติ', seconds: 28 },
  { label: 'เร็ว', seconds: 20 },
  { label: 'เร็วมาก', seconds: 14 },
];

export const AdminTickerTab: React.FC<AdminTickerTabProps> = ({
  settings,
  onToggleEnabled,
  onChangeDirection,
  onChangeSpeed,
  onTogglePauseOnHover,
  onUpdatePrefix,
  onToggleMessageActive,
  onDeleteMessage,
  onMoveMessage,
  onSaveMessage,
  editingMsg,
  setEditingMsg,
  isAddOpen,
  setIsAddOpen,
  saveNotice,
}) => {
  const currentMsg = editingMsg || {};

  const handleOpenAdd = () => {
    playDigitalSound('select');
    setEditingMsg({
      text: '',
      textColor: '#f59e0b',
      dotColor: '#f59e0b',
      linkUrl: '',
      active: true,
    });
    setIsAddOpen(true);
  };

  const handleOpenEdit = (msg: MarqueeMessageItem) => {
    playDigitalSound('select');
    setEditingMsg(msg);
    setIsAddOpen(true);
  };

  const handleCloseModal = () => {
    playDigitalSound('blip');
    setEditingMsg(null);
    setIsAddOpen(false);
  };

  return (
    <div className="space-y-6 text-left animate-fadeIn">
      {/* Save Success Notice */}
      {saveNotice && (
        <div className="flex items-center gap-2 p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 text-xs shadow-lg animate-fadeIn">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-semibold">{saveNotice}</span>
        </div>
      )}

      {/* Header Bar & Master Switch */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-[#071946] via-[#05143b] to-[#040e28] border border-amber-500/40 shadow-[0_8px_30px_rgba(2,10,31,0.8)]">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.4)]">
              <BeaconRippleDot color="#f59e0b" size="sm" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <span>จัดการแถบประกาศวิ่งใต้บาร์บน (Marquee Announcement Ticker)</span>
            </h3>
          </div>
          <p className="text-xs text-slate-300">
            ปรับแต่งข้อความ สีตัวอักษร ทิศทางการเลื่อน (ซ้ายไปขวา) ระดับความเร็ว และจุดแผ่คลื่นกระพริบแบบเรียลไทม์
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Master Enable/Disable Button */}
          <button
            type="button"
            onClick={() => onToggleEnabled(!settings.enabled)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer ${
              settings.enabled
                ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-emerald-500/25'
                : 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                settings.enabled ? 'bg-slate-950 animate-pulse' : 'bg-rose-400'
              }`}
            />
            <span>{settings.enabled ? 'เปิดใช้งานแถบประกาศวิ่ง (Active)' : 'ปิดการแสดงผล (Disabled)'}</span>
          </button>

          {/* Add Message Button */}
          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/30 transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>เพิ่มข้อความใหม่</span>
          </button>
        </div>
      </div>

      {/* 🔴 LIVE REAL-TIME PREVIEW CARD (แสดงผลจริงตรงกับบนเว็บ) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#03091e]/90 border border-amber-500/35 shadow-xl backdrop-blur-md space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
            </span>
            <span className="text-xs font-bold text-amber-300">ตัวอย่างการแสดงผลจริงบนหน้าเว็บ (Live Preview)</span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            {settings.direction === 'left-to-right' ? '⬅️ ซ้ายไปขวา' : '➡️ ขวาไปซ้าย'} · {settings.speedSeconds}s · ชี้เมาส์หยุด
          </span>
        </div>

        {/* Live Ticker Component */}
        <div className="py-2">
          <MarqueeTicker settings={settings} />
        </div>
      </div>

      {/* CONTROLS: DIRECTION, SPEED & HOVER BEHAVIOR */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: Scroll Direction & Pause on Hover */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#081738]/90 border border-slate-800 shadow-md space-y-4">
          <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <span>ทิศทางการเลื่อน & การควบคุมเมาส์</span>
          </h4>

          {/* Direction Segmented Control */}
          <div>
            <label className="block text-[11px] text-slate-400 font-medium mb-1.5">
              ทิศทางการวิ่งของข้อความ (Scroll Direction)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onChangeDirection('left-to-right')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  settings.direction === 'left-to-right'
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                    : 'bg-[#040e28] border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                <span>⬅️ ซ้ายไปขวา (แนะนำ)</span>
                {settings.direction === 'left-to-right' && <Check className="w-3.5 h-3.5 text-amber-400" />}
              </button>

              <button
                type="button"
                onClick={() => onChangeDirection('right-to-left')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  settings.direction === 'right-to-left'
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                    : 'bg-[#040e28] border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                <span>ขวาไปซ้าย ➡️</span>
                {settings.direction === 'right-to-left' && <Check className="w-3.5 h-3.5 text-amber-400" />}
              </button>
            </div>
          </div>

          {/* Pause on Hover Toggle */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
            <div>
              <span className="block text-xs font-semibold text-slate-200">หยุดการเลื่อนเมื่อวางเมาส์ชี้ (Pause on Hover)</span>
              <span className="text-[11px] text-slate-400">ช่วยให้อ่านข้อความชัดเจนและกดคลิกลิงก์ได้สะดวก</span>
            </div>
            <button
              type="button"
              onClick={() => onTogglePauseOnHover(!settings.pauseOnHover)}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                settings.pauseOnHover ? 'bg-amber-500' : 'bg-slate-700'
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                  settings.pauseOnHover ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Card 2: Speed Control Slider & Presets */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#081738]/90 border border-slate-800 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-400" />
              <span>ระดับความเร็วในการเลื่อน (Scroll Speed)</span>
            </h4>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-400/40">
              {settings.speedSeconds} วินาที / รอบ
            </span>
          </div>

          {/* Range Slider */}
          <div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
              <span>เร็วมาก (12s)</span>
              <span>ปกติ (28-35s)</span>
              <span>ช้ามาก (60s)</span>
            </div>
            <input
              type="range"
              min={12}
              max={60}
              step={2}
              value={settings.speedSeconds || 32}
              onChange={(e) => onChangeSpeed(Number(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer"
            />
          </div>

          {/* Quick Preset Buttons */}
          <div>
            <label className="block text-[11px] text-slate-400 font-medium mb-1.5">
              ระดับความเร็วแนะนำ (Quick Presets)
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {SPEED_PRESETS.map((p) => (
                <button
                  key={p.seconds}
                  type="button"
                  onClick={() => onChangeSpeed(p.seconds)}
                  className={`py-1 px-1.5 rounded-lg text-[10px] sm:text-xs font-semibold border transition-all text-center cursor-pointer ${
                    settings.speedSeconds === p.seconds
                      ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                      : 'bg-[#040e28] border-slate-700 text-slate-300 hover:text-white'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* MESSAGE LIST & MANAGEMENT TABLE */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#081738]/90 border border-slate-800 shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>รายการข้อความประกาศวิ่ง ({settings.messages.length} ข้อความ)</span>
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              สามารถสลับลำดับ แก้ไขข้อความ เปลี่ยนสีตัวอักษร และกำหนดจุดแผ่คลื่นกระพริบได้อิสระ
            </p>
          </div>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/50 text-xs font-semibold transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>เพิ่มข้อความ</span>
          </button>
        </div>

        {/* Message Items */}
        {settings.messages.length === 0 ? (
          <div className="text-center py-10 px-4 rounded-xl border border-dashed border-slate-700 text-slate-400 text-xs">
            ยังไม่มีข้อความประกาศวิ่ง กรุณากดปุ่ม "เพิ่มข้อความใหม่" เพื่อเริ่มต้น
          </div>
        ) : (
          <div className="space-y-2.5">
            {settings.messages.map((item, idx) => {
              const itemColor = item.textColor || '#f59e0b';
              const dotColor = item.dotColor || itemColor;

              return (
                <div
                  key={item.id}
                  className={`p-3 sm:p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    item.active !== false
                      ? 'bg-[#040e28]/90 border-slate-700/80 hover:border-amber-400/40'
                      : 'bg-slate-900/40 border-slate-800 opacity-60'
                  }`}
                >
                  {/* Left: Reorder Controls & Preview */}
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    {/* Up / Down Move Buttons */}
                    <div className="flex flex-col gap-0.5 shrink-0">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => onMoveMessage(idx, 'up')}
                        className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-white disabled:opacity-20 disabled:pointer-events-none cursor-pointer"
                        title="เลื่อนขึ้น"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === settings.messages.length - 1}
                        onClick={() => onMoveMessage(idx, 'down')}
                        className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-white disabled:opacity-20 disabled:pointer-events-none cursor-pointer"
                        title="เลื่อนลง"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Ripple Beacon Dot Preview */}
                    <div className="shrink-0 p-1">
                      <BeaconRippleDot color={dotColor} size="md" />
                    </div>

                    {/* Message Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className="font-bold text-xs sm:text-sm truncate"
                          style={{ color: itemColor }}
                        >
                          {item.text}
                        </span>
                        {/* Color Tag */}
                        <span
                          className="inline-block w-3 h-3 rounded-full border border-white/20 shrink-0"
                          style={{ backgroundColor: itemColor }}
                          title={`รหัสสี: ${itemColor}`}
                        />
                      </div>

                      {/* Optional Link Display */}
                      {item.linkUrl && (
                        <div className="flex items-center gap-1 mt-0.5 text-[10px] text-cyan-400/90 font-mono truncate">
                          <LinkIcon className="w-2.5 h-2.5 shrink-0" />
                          <span className="truncate">{item.linkUrl}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Action Buttons */}
                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                    {/* Toggle Active Switch */}
                    <button
                      type="button"
                      onClick={() => onToggleMessageActive(item.id)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${
                        item.active !== false
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-slate-800 text-slate-500 border-slate-700'
                      }`}
                      title={item.active !== false ? 'คลิกเพื่อปิดข้อความนี้' : 'คลิกเพื่อเปิดข้อความนี้'}
                    >
                      {item.active !== false ? 'เปิดอยู่' : 'ปิด'}
                    </button>

                    {/* Edit Button */}
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(item)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-300 transition-colors cursor-pointer"
                      title="แก้ไขข้อความ"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete Button */}
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`คุณต้องการลบข้อความ "${item.text}" หรือไม่?`)) {
                          onDeleteMessage(item.id);
                        }
                      }}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 transition-colors cursor-pointer"
                      title="ลบข้อความ"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* =========================================================================
          ADD / EDIT MODAL DIALOG
          ========================================================================= */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg rounded-2xl bg-[#061439] border border-amber-500/50 shadow-2xl p-5 sm:p-6 text-left space-y-4 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
                  <BeaconRippleDot color={currentMsg.dotColor || currentMsg.textColor || '#f59e0b'} size="sm" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-white">
                  {currentMsg.id ? 'แก้ไขข้อความประกาศ' : 'เพิ่มข้อความประกาศใหม่'}
                </h3>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={onSaveMessage} className="space-y-4">
              {/* Message Text Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1">
                  ข้อความประกาศ (Announcement Text) *
                </label>
                <textarea
                  required
                  rows={2}
                  value={currentMsg.text || ''}
                  onChange={(e) => setEditingMsg({ ...currentMsg, text: e.target.value })}
                  placeholder="พิมพ์ข้อความที่ต้องการให้วิ่งใต้บาร์บน..."
                  className="w-full px-3 py-2 rounded-xl bg-[#03091e] border border-slate-700 focus:border-amber-400 focus:outline-none text-xs sm:text-sm text-white placeholder-slate-500 shadow-inner"
                />
              </div>

              {/* Text Color Picker & Presets */}
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-amber-400" />
                    <span>สีข้อความ (Text Color)</span>
                  </span>
                  <span className="font-mono text-[11px] text-amber-300 font-bold">
                    {currentMsg.textColor || '#f59e0b'}
                  </span>
                </label>

                {/* Preset Palette Buttons */}
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {COLOR_PRESETS.map((p) => {
                    const isSelected = (currentMsg.textColor || '#f59e0b') === p.color;
                    return (
                      <button
                        key={p.color}
                        type="button"
                        onClick={() =>
                          setEditingMsg({
                            ...currentMsg,
                            textColor: p.color,
                            dotColor: p.color, // Default dot color follows text color
                          })
                        }
                        className={`p-2 rounded-xl border text-[11px] font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-slate-800 border-amber-400 text-white shadow-md'
                            : 'bg-[#03091e] border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full shrink-0 border border-white/20 shadow-sm"
                          style={{ backgroundColor: p.color }}
                        />
                        <span className="truncate">{p.name}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Custom Color Picker Input */}
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={currentMsg.textColor || '#f59e0b'}
                    onChange={(e) =>
                      setEditingMsg({
                        ...currentMsg,
                        textColor: e.target.value,
                        dotColor: e.target.value,
                      })
                    }
                    className="w-8 h-8 rounded-lg bg-transparent border-0 cursor-pointer p-0"
                    title="เลือกสีแบบอิสระ"
                  />
                  <input
                    type="text"
                    value={currentMsg.textColor || '#f59e0b'}
                    onChange={(e) =>
                      setEditingMsg({
                        ...currentMsg,
                        textColor: e.target.value,
                      })
                    }
                    placeholder="#f59e0b"
                    className="flex-1 px-3 py-1.5 rounded-xl bg-[#03091e] border border-slate-700 font-mono text-xs text-white"
                  />
                </div>
              </div>

              {/* Dot Wave Color Choice */}
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                  สีจุดแผ่คลื่นกระพริบ (Ripple Beacon Dot Color)
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setEditingMsg({
                        ...currentMsg,
                        dotColor: currentMsg.textColor || '#f59e0b',
                      })
                    }
                    className={`flex-1 py-1.5 px-2.5 rounded-xl text-xs font-semibold border flex items-center justify-center gap-2 cursor-pointer ${
                      (currentMsg.dotColor || currentMsg.textColor) === currentMsg.textColor
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                        : 'bg-[#03091e] border-slate-800 text-slate-400'
                    }`}
                  >
                    <span>ตามสีข้อความ</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setEditingMsg({
                        ...currentMsg,
                        dotColor: '#f43f5e', // Red like video recording
                      })
                    }
                    className={`flex-1 py-1.5 px-2.5 rounded-xl text-xs font-semibold border flex items-center justify-center gap-2 cursor-pointer ${
                      currentMsg.dotColor === '#f43f5e'
                        ? 'bg-rose-500/20 border-rose-400 text-rose-300'
                        : 'bg-[#03091e] border-slate-800 text-slate-400'
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <span>สีแดงเหมือนในคลิป</span>
                  </button>
                </div>
              </div>

              {/* Optional Link URL */}
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1 flex items-center gap-1.5">
                  <LinkIcon className="w-3.5 h-3.5 text-cyan-400" />
                  <span>ลิงก์เมื่อคลิกข้อความ (Optional Link)</span>
                </label>
                <input
                  type="text"
                  value={currentMsg.linkUrl || ''}
                  onChange={(e) => setEditingMsg({ ...currentMsg, linkUrl: e.target.value })}
                  placeholder="เช่น #incident-timeline หรือ tel:1730 หรือ https://..."
                  className="w-full px-3 py-2 rounded-xl bg-[#03091e] border border-slate-700 focus:border-cyan-400 focus:outline-none text-xs text-white placeholder-slate-500"
                />

                {/* Quick Shortcuts */}
                <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                  <span className="text-[10px] text-slate-500">ทางลัด:</span>
                  {[
                    { label: 'ไทม์ไลน์อาคาร', url: '#incident-timeline' },
                    { label: 'คลังสื่อดิจิทัล', url: '#published-works' },
                    { label: 'e-Audit', url: '#public-interest' },
                    { label: 'สายด่วน 1730', url: 'tel:1730' },
                    { label: 'ระบบขอรับสื่อ', url: 'https://pr-request-system.vercel.app' },
                  ].map((s) => (
                    <button
                      key={s.url}
                      type="button"
                      onClick={() => setEditingMsg({ ...currentMsg, linkUrl: s.url })}
                      className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-cyan-300 font-mono transition-colors cursor-pointer"
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Preview Box inside Modal */}
              <div className="p-3 rounded-xl bg-[#020717] border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 font-mono">ตัวอย่างข้อความ:</span>
                <div className="flex items-center gap-2.5 py-1">
                  <BeaconRippleDot
                    color={currentMsg.dotColor || currentMsg.textColor || '#f59e0b'}
                    size="md"
                  />
                  <span
                    className="font-bold text-xs sm:text-sm"
                    style={{
                      color: currentMsg.textColor || '#f59e0b',
                      textShadow: `0 0 10px ${currentMsg.textColor || '#f59e0b'}40`,
                    }}
                  >
                    {currentMsg.text || 'พิมพ์ข้อความเพื่อดูตัวอย่าง'}
                  </span>
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/25 transition-all active:scale-95 cursor-pointer"
                >
                  บันทึกข้อความ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
