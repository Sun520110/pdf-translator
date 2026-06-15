import { useState, useCallback } from 'react';
import type { TranslationStatus, PdfFile, TranslationDirection, ApiConfig } from '@/types';
import { getPdfInfo, extractPdfText } from '@/services/pdf';
import { translateText } from '@/services/translator';

export function useTranslation() {
  const [status, setStatus] = useState<TranslationStatus>('idle');
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [error, setError] = useState<string | null>(null);

  const startTranslation = useCallback(async (
    file: PdfFile,
    direction: TranslationDirection,
    apiConfig: ApiConfig
  ) => {
    if (!apiConfig.apiKey) {
      setError('请先配置API密钥');
      return;
    }

    setStatus('translating');
    setError(null);

    try {
      // 获取PDF信息
      setProgress({ current: 5, total: 100 });
      await getPdfInfo(file.path);
      
      // 提取PDF文本
      setProgress({ current: 10, total: 100 });
      const textBlocks = await extractPdfText(file.path);
      
      if (textBlocks.length === 0) {
        throw new Error('未能从PDF中提取文本内容');
      }

      // 分批翻译
      const translatedTexts: string[] = [];
      const batchSize = 5;
      
      for (let i = 0; i < textBlocks.length; i += batchSize) {
        if (status !== 'translating') return; // 检查是否被取消
        
        const batch = textBlocks.slice(i, i + batchSize);
        const textsToTranslate = batch.map(b => b.text);
        
        const translated = await translateText(
          textsToTranslate,
          apiConfig.provider,
          apiConfig.apiKey,
          direction
        );
        
        translatedTexts.push(...translated);
        
        // 更新进度
        const progressPercent = 10 + Math.round((i / textBlocks.length) * 80);
        setProgress({ current: progressPercent, total: 100 });
      }

      // 模拟保存文件
      setProgress({ current: 95, total: 100 });
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setProgress({ current: 100, total: 100 });
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : '翻译失败');
    }
  }, [status]);

  const cancelTranslation = useCallback(() => {
    setStatus('idle');
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
