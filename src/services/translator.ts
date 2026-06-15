import type { TranslatorApi, TranslationDirection } from '@/types';

const API_URLS = {
  google: 'https://translation.googleapis.com/language/translate/v2',
  deepl: 'https://api-free.deepl.com/v2/translate',
  baidu: 'https://fanyi-api.baidu.com/api/trans/vip/translate',
};

export async function translateText(
  texts: string[],
  api: TranslatorApi,
  apiKey: string,
  direction: TranslationDirection
): Promise<string[]> {
  const targetLang = direction === 'zh-en' ? 'en' : 'zh';
  
  if (api === 'google') {
    return translateWithGoogle(texts, apiKey, targetLang);
  } else if (api === 'deepl') {
    return translateWithDeepl(texts, apiKey, targetLang);
  } else {
    return translateWithBaidu(texts, apiKey, direction);
  }
}

async function translateWithGoogle(
  texts: string[],
  apiKey: string,
  targetLang: string
): Promise<string[]> {
  const response = await fetch(`${API_URLS.google}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      q: texts,
      target: targetLang,
      source: targetLang === 'en' ? 'zh' : 'en',
    }),
  });

  if (!response.ok) {
    throw new Error(`Google API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.data.translations.map((t: { translatedText: string }) => t.translatedText);
}

async function translateWithDeepl(
  texts: string[],
  apiKey: string,
  targetLang: string
): Promise<string[]> {
  const results = [];
  
  for (const text of texts) {
    const response = await fetch(API_URLS.deepl, {
      method: 'POST',
      headers: {
        'Authorization': `DeepL-Auth-Key ${apiKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        text,
        target_lang: targetLang.toUpperCase(),
      }),
    });

    if (!response.ok) {
      throw new Error(`DeepL API error: ${response.statusText}`);
    }

    const data = await response.json();
    results.push(data.translations[0].text);
  }

  return results;
}

async function translateWithBaidu(
  texts: string[],
  _apiKey: string,
  direction: TranslationDirection
): Promise<string[]> {
  // 百度翻译需要APP ID和密钥，这里简化处理
  // 实际使用时需要添加签名验证
  throw new Error('百度翻译需要配置APP ID，当前版本仅支持Google和DeepL');
}
