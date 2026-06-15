import { useState, useCallback } from 'react';
import type { TranslationStatus } from '@/types';

export function useTranslation() {
  const [status, setStatus] = useState<TranslationStatus>('idle');
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [error, setError] = useState<string | null>(null);

  const startTranslation = useCallback(async () => {
    setStatus('translating');
    setProgress({ current: 0, total: 100 });
    setError(null);

    try {
      // 模拟翻译过程
      for (let i = 1; i <= 10; i++) {
        await new Promise(resolve => setTimeout(resolve, 500));
        setProgress({ current: i * 10, total: 100 });
      }

      setStatus('success');
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : '翻译失败');
    }
  }, []);

  const cancelTranslation = useCallback(() => {
    setStatus('ready');
    setProgress({ current: 0, total: 0 });
  }, []);

  const reset = useCallback(() => {
    setStatus('idle');
    setProgress({ current: 0, total: 0 });
    setError(null);
  }, []);

  return {
    status,
    progress,
    error,
    startTranslation,
    cancelTranslation,
    reset,
  };
}
