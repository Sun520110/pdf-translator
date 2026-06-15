import { useState, useCallback, useRef } from 'react';
import { Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PdfFile } from '@/types';

interface DropZoneProps {
  onFileSelect: (file: PdfFile) => void;
  disabled?: boolean;
}

export function DropZone({ onFileSelect, disabled }: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;

    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
      onFileSelect({
        name: file.name,
        path: '',
        pageCount: 0,
        size: file.size,
      });
    }
  }, [disabled, onFileSelect]);

  const handleClick = () => {
    if (!disabled) inputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect({
        name: file.name,
        path: '',
        pageCount: 0,
        size: file.size,
      });
    }
  };

  return (
    <div
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all',
        isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf"
        onChange={handleFileChange}
        className="hidden"
      />
      <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
      <p className="text-gray-600">
        拖拽PDF文件到此处，或 <span className="text-blue-500">点击选择</span>
      </p>
      <p className="text-sm text-gray-400 mt-2">仅支持 .pdf 格式</p>
    </div>
  );
}
