import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TranslationDirection } from '@/types';

interface DirectionToggleProps {
  value: TranslationDirection;
  onChange: (direction: TranslationDirection) => void;
  disabled?: boolean;
}

export function DirectionToggle({ value, onChange, disabled }: DirectionToggleProps) {
  return (
    <div className="flex items-center justify-center gap-4">
      <button
        onClick={() => onChange('zh-en')}
        disabled={disabled}
        className={cn(
          'px-4 py-2 rounded-lg font-medium transition-all',
          value === 'zh-en'
            ? 'bg-blue-500 text-white'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        中文 → 英文
      </button>
      <ArrowRight className="w-5 h-5 text-gray-400" />
      <button
        onClick={() => onChange('en-zh')}
        disabled={disabled}
        className={cn(
          'px-4 py-2 rounded-lg font-medium transition-all',
          value === 'en-zh'
            ? 'bg-blue-500 text-white'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        英文 → 中文
      </button>
    </div>
  );
}
