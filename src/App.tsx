import { useState } from 'react';
import { DropZone } from '@/components/DropZone';
import { FileInfo } from '@/components/FileInfo';
import { DirectionToggle } from '@/components/DirectionToggle';
import type { PdfFile, TranslationDirection } from '@/types';

function App() {
  const [selectedFile, setSelectedFile] = useState<PdfFile | null>(null);
  const [direction, setDirection] = useState<TranslationDirection>('zh-en');

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-center mb-6">PDF Translator</h1>
        
        {!selectedFile ? (
          <DropZone onFileSelect={setSelectedFile} />
        ) : (
          <>
            <FileInfo file={selectedFile} />
            
            <div className="mt-6">
              <p className="text-sm font-medium text-gray-500 mb-2 text-center">翻译方向</p>
              <DirectionToggle value={direction} onChange={setDirection} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
