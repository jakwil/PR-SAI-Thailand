import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  AlertTriangle,
  Trash2,
  CheckCircle2,
  Sparkles,
  Settings,
  RefreshCw,
  ArrowRight
} from 'lucide-react';
import { playDigitalSound } from '../utils/audioEffects';

export type AdminConfirmMode = 'publish' | 'update' | 'delete' | 'settings';

export interface AdminConfirmPreviewField {
  label: string;
  value: string;
  mono?: boolean;
}

export interface PendingAdminAction {
  mode: AdminConfirmMode;
  sectionName: string;
  actionTitle: string;
  itemTitle: string;
  description?: string;
  imageUrl?: string;
  summaryFields?: AdminConfirmPreviewField[];
  confirmLabel?: string;
  onConfirm: () => Promise<void>;
}

interface AdminChangeConfirmModalProps {
  action: PendingAdminAction | null;
  onCancel: () => void;
}

export const AdminChangeConfirmModal: React.FC<AdminChangeConfirmModalProps> = ({
  action,
  onCancel,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    setIsSubmitting(false);
    setErrorMsg(null);
  }, [action]);

  if (!action) return null;

  const isDelete = action.mode === 'delete';
  const isSettings = action.mode === 'settings';

  const handleConfirm = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setErrorMsg(null);
    playDigitalSound('select');

    try {
      await action.onConfirm();
      playDigitalSound('confirm');
      onCancel();
    } catch (err: any) {
      console.error('Admin confirm action failed:', err);
      playDigitalSound('blip');
      setErrorMsg(
        err?.message ||
          'ไม่สามารถบันทึกการเปลี่ยนแปลงลงฐานข้อมูลได้ กรุณาตรวจสอบการเชื่อมต่อและสิทธิ์ผู้ดูแลระบบ'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const defaultConfirmText = isDelete
    ? 'ยืนยันการลบถาวร'
    : action.mode === 'publish'
      ? 'ยืนยันเผยแพร่ขึ้นเว็บไซต์ (Confirm & Publish)'
      : isSettings
        ? 'ยืนยันบันทึกการตั้งค่า'
        : 'ยืนยันการแก้ไข & เผยแพร่';

  return (
    <div
      className="fixed inset-0 z-[95] flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fadeIn overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`relative w-full max-w-lg my-6 rounded-2xl bg-gradient-to-b from-[#081b47] via-[#051438] to-[#020b22] shadow-[0_25px_75px_rgba(0,0,0,0.9)] text-slate-100 overflow-hidden flex flex-col max-h-[90vh] border ${
          isDelete
            ? 'border-rose-500/60 ring-1 ring-rose-500/20'
            : 'border-amber-400/55 ring-1 ring-amber-400/20'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Accent Bar */}
        <div
          className={`h-1.5 shrink-0 ${
            isDelete
              ? 'bg-gradient-to-r from-rose-600 via-red-400 to-orange-500'
              : 'bg-gradient-to-r from-amber-500 via-yellow-300 to-cyan-400'
          }`}
        />

        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 bg-[#03091e]/75 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`p-2.5 rounded-xl border shrink-0 ${
                isDelete
                  ? 'bg-rose-500/20 border-rose-400/50 text-rose-300'
                  : isSettings
                    ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-300'
                    : 'bg-amber-500/20 border-amber-400/50 text-amber-300'
              }`}
            >
              {isDelete ? (
                <Trash2 className="w-5 h-5" />
              ) : isSettings ? (
                <Settings className="w-5 h-5" />
              ) : (
                <ShieldCheck className="w-5 h-5" />
              )}
            </div>
            <div className="min-w-0">
              <span
                className={`text-[10px] font-bold uppercase tracking-widest font-mono block truncate ${
                  isDelete ? 'text-rose-300' : 'text-amber-300'
                }`}
              >
                {action.sectionName} · Pre-Publish Verification
              </span>
              <h3 className="text-sm sm:text-base font-bold text-white truncate">
                {action.actionTitle}
              </h3>
            </div>
          </div>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => {
              playDigitalSound('blip');
              onCancel();
            }}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer disabled:opacity-40"
            title="ยกเลิก"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {/* Warning / Confirmation Banner */}
          <div
            className={`p-3.5 rounded-xl border flex items-start gap-3 text-xs ${
              isDelete
                ? 'bg-rose-950/50 border-rose-500/45 text-rose-100'
                : 'bg-amber-500/10 border-amber-400/35 text-slate-200'
            }`}
          >
            {isDelete ? (
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            ) : (
              <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1">
              <p className={`font-bold ${isDelete ? 'text-rose-300' : 'text-amber-300'}`}>
                {isDelete
                  ? 'คำเตือน: กรุณายืนยันก่อนลบข้อมูลออกจากระบบ'
                  : 'กรุณาตรวจสอบรายละเอียดก่อนเผยแพร่การเปลี่ยนแปลง'}
              </p>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                {action.description ||
                  (isDelete
                    ? 'เมื่อยืนยันแล้ว รายการนี้จะถูกลบออกจากฐานข้อมูล Firestore และหน้าเว็บไซต์สาธารณะทันทีโดยไม่กลับมาอีก'
                    : 'เมื่อกดยืนยัน ข้อมูลจะถูกบันทึกเข้าสู่ฐานข้อมูล Cloud Firestore และแสดงผลบนหน้าเว็บไซต์ PR - SAI Thailand ทันที')}
              </p>
            </div>
          </div>

          {/* Item Preview Card */}
          <div className="p-3.5 rounded-xl bg-[#03091e]/90 border border-slate-700/80 space-y-3">
            <div className="flex items-start gap-3">
              {action.imageUrl && (
                <img
                  src={action.imageUrl}
                  alt={action.itemTitle}
                  className="w-20 h-16 object-cover rounded-lg border border-cyan-500/30 shrink-0 bg-slate-900"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              )}
              <div className="min-w-0 flex-1">
                <span className="text-[10px] text-slate-400 font-mono block mb-0.5">
                  รายการที่ดำเนินการ:
                </span>
                <h4 className="text-sm font-bold text-white leading-snug break-words">
                  {action.itemTitle}
                </h4>
              </div>
            </div>

            {action.summaryFields && action.summaryFields.length > 0 && (
              <div className="pt-2.5 border-t border-slate-800 space-y-1.5">
                {action.summaryFields.map((field, idx) => (
                  <div
                    key={`${field.label}-${idx}`}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs"
                  >
                    <span className="text-slate-400 shrink-0">{field.label}:</span>
                    <span
                      className={`text-slate-100 sm:text-right break-all line-clamp-2 ${
                        field.mono ? 'font-mono text-[11px] text-cyan-300' : 'font-medium'
                      }`}
                    >
                      {field.value || '-'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Inline Error Alert */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/50 text-rose-200 text-xs flex items-start gap-2 animate-fadeIn">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-rose-300">เกิดข้อผิดพลาดในการบันทึกข้อมูล</p>
                <p className="mt-0.5 leading-relaxed">{errorMsg}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-white/10 bg-[#03091e]/90 flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 shrink-0">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => {
              playDigitalSound('blip');
              onCancel();
            }}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-700 hover:bg-white/5 text-slate-300 hover:text-white text-xs font-medium transition-colors cursor-pointer disabled:opacity-40"
          >
            ยกเลิก / กลับไปแก้ไข
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleConfirm}
            className={`w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 ${
              isDelete
                ? 'bg-gradient-to-r from-rose-600 to-red-500 hover:from-rose-500 hover:to-red-400 text-white shadow-rose-500/30'
                : 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 hover:from-amber-300 hover:to-yellow-200 text-slate-950 shadow-amber-500/30'
            }`}
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>กำลังบันทึกสู่ระบบ...</span>
              </>
            ) : isDelete ? (
              <>
                <Trash2 className="w-4 h-4" />
                <span>{action.confirmLabel || defaultConfirmText}</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>{action.confirmLabel || defaultConfirmText}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
