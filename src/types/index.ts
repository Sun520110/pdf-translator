export interface PdfFile {
  name: string;
  path: string;
  pageCount: number;
  size: number;
}

export type TranslationDirection = 'zh-en' | 'en-zh';

export type TranslatorApi = 'google' | 'deepl' | 'baidu';

export interface ApiConfig {
  provider: TranslatorApi;
  apiKey: string;
}

export type TranslationStatus = 'idle' | 'ready' | 'translating' | 'success' | 'error';
