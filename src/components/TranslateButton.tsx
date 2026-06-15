import { Loader2, Sparkles, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TranslationStatus } from '@/types';

interface TranslateButtonProps {
  status: TranslationStatus;
  onTranslate: () => void;
  onCancel: () => void;
  onReset: () => void;
  disabled?: boolean;
}

export function TranslateButton({ status, onTranslate, onCancel, onReset, disabled }: TranslateButtonProps) {
  if (status === 'success') {
    return (
      <button
        onClick={onReset}
        className="w-full flex items-center justify-center gap-2 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
      >
        <RotateCcw className="w-5 h-5" />
        翻译新文件
      </button>
    );
  }

  if (status === 'translating') {
    return (
      <button
        onClick={onCancel}
        className="w-full flex items-center justify-center gap-2 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
      >
        <Loader2 className="w-5 h-5 animate-spin" />
        取消翻译
      </button>
    );
  }

  return (
    <button
      onClick={onTranslate}
      disabled={disabled || status !== 'ready'}
      className={cn(
        'w-full flex items-center justify-center gap-2 py-3 rounded-lg transition-colors',
        disabled || status !== 'ready'
          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
          : 'bg-blue-500 text-white hover:bg-blue-600'
      )}
    >
      <Sparkles className="w-5 h-5" />
      开始翻译
    </button>
  );
}
