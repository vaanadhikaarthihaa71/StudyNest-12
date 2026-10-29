import React from 'react';
import { ChevronRight, Home, ArrowLeft } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
  active?: boolean;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  onBack?: () => void;
  backLabel?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, onBack, backLabel }) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 py-2 text-sm text-slate-500">
      <nav className="flex items-center flex-wrap gap-1.5" aria-label="Breadcrumb">
        {items.map((item, idx) => {
          const isFirst = idx === 0;
          const isLast = idx === items.length - 1;

          return (
            <React.Fragment key={idx}>
              {idx > 0 && <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />}
              {isLast || !item.onClick ? (
                <span
                  className={`font-semibold truncate max-w-[200px] sm:max-w-xs ${
                    isLast ? 'text-slate-900' : 'text-slate-600'
                  }`}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {isFirst && <Home className="w-4 h-4 inline mr-1 -mt-0.5" />}
                  {item.label}
                </span>
              ) : (
                <button
                  onClick={item.onClick}
                  className="hover:text-indigo-600 font-medium transition-colors flex items-center cursor-pointer truncate max-w-[160px] sm:max-w-xs"
                >
                  {isFirst && <Home className="w-4 h-4 inline mr-1 -mt-0.5" />}
                  <span>{item.label}</span>
                </button>
              )}
            </React.Fragment>
          );
        })}
      </nav>

      {onBack && (
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-indigo-600 hover:bg-slate-100/80 transition-all cursor-pointer border border-slate-200 shadow-2xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{backLabel || 'Back'}</span>
        </button>
      )}
    </div>
  );
};
