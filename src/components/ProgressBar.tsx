interface ProgressBarProps {
  progress: number;
  current: number;
  total: number;
}

export function ProgressBar({ progress, current, total }: ProgressBarProps) {
  return (
    <div className="space-y-2">
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-sm text-gray-500 text-center">
        正在翻译... {current} / {total} 页 ({Math.round(progress)}%)
      </p>
    </div>
  );
}
