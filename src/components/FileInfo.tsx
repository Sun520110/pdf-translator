import { FileText } from 'lucide-react';
import type { PdfFile } from '@/types';

interface FileInfoProps {
  file: PdfFile;
}

export function FileInfo({ file }: FileInfoProps) {
  return (
    <div className="flex items-center gap-3 p-4 bg-gray-100 rounded-lg">
      <FileText className="w-8 h-8 text-blue-500" />
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{file.name}</p>
        <p className="text-sm text-gray-500">
          {file.pageCount > 0 && `${file.pageCount} 页 | `}
          {(file.size / 1024 / 1024).toFixed(2)} MB
        </p>
      </div>
    </div>
  );
}
