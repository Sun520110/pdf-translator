import { useState, useEffect } from 'react';
import { Key, ChevronDown, Save } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ApiConfig, TranslatorApi } from '@/types';

interface ApiConfigProps {
  value: ApiConfig;
  onChange: (config: ApiConfig) => void;
  disabled?: boolean;
}

const API_OPTIONS: { value: TranslatorApi; label: string }[] = [
  { value: 'google', label: 'Google Translate' },
  { value: 'deepl', label: 'DeepL' },
  { value: 'baidu', label: '百度翻译' },
];

export function ApiConfig({ value, onChange, disabled }: ApiConfigProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localKey, setLocalKey] = useState(value.apiKey);

  useEffect(() => {
    const saved = localStorage.getItem('translator-config');
    if (saved) {
      const parsed = JSON.parse(saved);
      setLocalKey(parsed.apiKey || '');
      onChange(parsed);
    }
  }, []);

  const handleSave = () => {
    const config = { ...value, apiKey: localKey };
    localStorage.setItem('translator-config', JSON.stringify(config));
    onChange(config);
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Key className="w-5 h-5 text-gray-500" />
          <span className="font-medium">API 配置</span>
        </div>
        <ChevronDown className={cn('w-5 h-5 transition-transform', isExpanded && 'rotate-180')} />
      </button>

      {isExpanded && (
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">翻译服务</label>
            <select
              value={value.provider}
              onChange={(e) => onChange({ ...value, provider: e.target.value as TranslatorApi })}
              disabled={disabled}
              className="w-full p-2 border rounded-lg bg-white"
            >
              {API_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">API 密钥</label>
            <input
              type="password"
              value={localKey}
              onChange={(e) => setLocalKey(e.target.value)}
              disabled={disabled}
              placeholder="输入您的API密钥"
              className="w-full p-2 border rounded-lg"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={disabled || !localKey}
            className={cn(
              'w-full flex items-center justify-center gap-2 py-2 rounded-lg transition-colors',
              localKey ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-gray-200 text-gray-500',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            <Save className="w-4 h-4" />
            保存配置
          </button>
        </div>
      )}
    </div>
  );
}
