import { useState } from 'react';
import { DropZone } from '@/components/DropZone';
import { FileInfo } from '@/components/FileInfo';
import { DirectionToggle } from '@/components/DirectionToggle';
import { ApiConfig } from '@/components/ApiConfig';
import { TranslateButton } from '@/components/TranslateButton';
import { ProgressBar } from '@/components/ProgressBar';
import { useTranslation } from '@/hooks/useTranslation';
import type { PdfFile, TranslationDirection, ApiConfig as ApiConfigType } from '@/types';

function App() {
  const [selectedFile, setSelectedFile] = useState<PdfFile | null>(null);
  const [direction, setDirection] = useState<TranslationDirection>('zh-en');
  const [apiConfig, setApiConfig] = useState<ApiConfigType>({
    provider: 'google',
    apiKey: '',
  });

  const {
    status,
    progress,
    error,
    startTranslation,
    cancelTranslation,
    reset,
  } = useTranslation();

  const handleFileSelect = (file: PdfFile) => {
    setSelectedFile(file);
  };

  const handleTranslate = () => {
    startTranslation();
  };

  const handleReset = () => {
    setSelectedFile(null);
    reset();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-center mb-6">PDF Translator</h1>
        
        {!selectedFile || status === 'idle' ? (
          <DropZone onFileSelect={handleFileSelect} />
        ) : (
          <div className="space-y-6">
            <FileInfo file={selectedFile} />
            
            <div>
              <p className="text-sm font-medium text-gray-500 mb-2 text-center">翻译方向</p>
              <DirectionToggle 
                value={direction} 
                onChange={setDirection}
                disabled={status === 'translating'}
              />
            </div>

            <ApiConfig 
              value={apiConfig} 
              onChange={setApiConfig}
              disabled={status === 'translating'}
            />

            {status === 'translating' && (
              <ProgressBar
                progress={(progress.current / progress.total) * 100}
                current={progress.current}
                total={progress.total}
              />
            )}

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            {status === 'success' && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm">
                翻译完成！文件已保存。
              </div>
            )}

            <TranslateButton
              status={status}
              onTranslate={handleTranslate}
              onCancel={cancelTranslation}
              onReset={handleReset}
              disabled={!apiConfig.apiKey}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
