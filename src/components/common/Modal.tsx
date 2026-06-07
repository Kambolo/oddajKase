import type { ReactNode, MouseEvent } from "react";

type ModalProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
};

export default function Modal({
  open,
  title,
  onClose,
  children,
  footer,
}: ModalProps) {
  if (!open) return null;

  const handleBackdropClick = () => {
    onClose();
  };

  const handleContentClick = (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={handleBackdropClick}
    >
      <div
        className="w-full max-w-2xl max-h-[calc(100vh-4rem)] overflow-hidden rounded-[32px] bg-white shadow-[0_24px_80px_rgba(0,0,0,0.18)]"
        onClick={handleContentClick}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-2xl leading-none text-slate-500 transition hover:text-slate-900 cursor-pointer"
            aria-label="Close modal"
          >
            ×
          </button>
        </div>
        <div className="max-h-[calc(100vh-13rem)] overflow-y-auto px-6 py-5">
          {children}
        </div>
        {footer && (
          <div className="sticky bottom-0 z-10 border-t border-slate-200 bg-white px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
