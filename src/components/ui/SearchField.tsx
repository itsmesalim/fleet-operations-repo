import { Search, X } from 'lucide-react';
import { cn } from '../../utils/helpers';

interface SearchFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  resultCount?: number;
  className?: string;
}

export function SearchField({
  value,
  onChange,
  placeholder,
  // resultCount,
  className,
}: SearchFieldProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-3 shadow-sm dark:border-slate-700 dark:from-slate-800 dark:to-slate-900/70',
        'sm:flex-row sm:items-center sm:justify-between',
        className
      )}
    >
      <div className="relative flex-1">
        <Search className="absolute w-5 h-5 -translate-y-1/2 pointer-events-none left-4 top-1/2 text-slate-400" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(
            'min-h-[56px] rounded-xl border border-slate-200 bg-white py-4 pl-12 pr-12 text-base text-slate-900 outline-none transition',
            'placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-blue-500 dark:focus:ring-blue-900/30'
          )}
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute flex items-center justify-center w-8 h-8 transition -translate-y-1/2 rounded-full right-3 top-1/2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-200"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* <div className="inline-flex min-h-[56px] items-center gap-2 rounded-xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-600 dark:bg-slate-700/70 dark:text-slate-200 border border-red-700">
        <Search className="w-4 h-4" />
        <span>
          {typeof resultCount === 'number'
            ? `${resultCount} results`
            : 'Live search'}
        </span>
      </div> */}
    </div>
  );
}
