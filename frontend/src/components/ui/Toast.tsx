import React from 'react';
import useUIStore from '../../store/uiStore';

const Toasts: React.FC = () => {
  const toasts = useUIStore((s) => s.toasts);
  const remove = useUIStore((s) => s.removeToast);

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed right-4 top-4 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          className={`max-w-xs px-3 py-2 rounded-md shadow-sm text-sm text-slate-800 bg-white border border-slate-100 transition-opacity`}
          onClick={() => remove(t.id)}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
};

export default Toasts;
