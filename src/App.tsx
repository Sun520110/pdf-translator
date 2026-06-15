import { useState } from 'react';
import { DropZone } from '@/components/DropZone';
import type { PdfFile } from '@/types';

function App() {
  const [selectedFile, setSelectedFile] = useState<PdfFile | null>(null);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-center mb-6">PDF Translator</h1>
        <DropZone onFileSelect={setSelectedFile} />
        {selectedFile && (
          <div className="mt-4 p-4 bg-gray-100 rounded-lg">
            <p className="font-medium">{selectedFile.name}</p>
            <p className="text-sm text-gray-500">
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
