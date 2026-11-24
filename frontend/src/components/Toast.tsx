import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message?: string;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col space-y-2.5 pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3.5 p-4 rounded-2xl shadow-luxury border backdrop-blur-xl max-w-sm transition-all duration-300 transform translate-y-0 ${
              isSuccess
                ? 'bg-[#17181C]/95 border-[#C8A96B]/60 text-[#F5F1E8] shadow-gold-sm'
                : isError
                ? 'bg-[#17181C]/95 border-rose-800/80 text-rose-100'
                : 'bg-[#17181C]/95 border-[#302D27] text-[#F5F1E8]'
            }`}
          >
            <div className="flex-shrink-0 mt-0.5">
              {isSuccess && <CheckCircle2 className="w-4 h-4 text-[#C8A96B]" />}
              {isError && <AlertCircle className="w-4 h-4 text-rose-400" />}
              {!isSuccess && !isError && <Info className="w-4 h-4 text-[#E4D1A1]" />}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold tracking-wide text-[#F5F1E8]">{toast.title}</p>
              {toast.message && (
                <p className="text-[11px] text-[#A5A29B] mt-0.5 leading-normal font-light">
                  {toast.message}
                </p>
              )}
            </div>

            <button
              onClick={() => onDismiss(toast.id)}
              className="text-[#706E69] hover:text-[#F5F1E8] p-0.5 transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
