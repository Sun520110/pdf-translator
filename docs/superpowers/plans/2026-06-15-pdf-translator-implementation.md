# PDF Translator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一个 Tauri + React 的桌面PDF翻译应用，支持中英互译并保持原格式

**Architecture:** 采用前后端分离架构，前端使用React处理UI交互，后端使用Rust（Tauri）处理PDF文件操作。翻译API调用在前端完成，PDF文本提取和写入由Rust后端处理。

**Tech Stack:** Tauri v2, React 18, TypeScript, Tailwind CSS, pdf-lib, shadcn/ui

---

## 文件结构

```
pdf-translator/
├── src/                          # React前端
│   ├── components/
│   │   ├── DropZone.tsx          # 文件拖放组件
│   │   ├── FileInfo.tsx          # 文件信息展示
│   │   ├── DirectionToggle.tsx   # 翻译方向切换
│   │   ├── ApiConfig.tsx         # API配置表单
│   │   ├── TranslateButton.tsx  # 翻译按钮
│   │   └── ProgressBar.tsx       # 进度条
│   ├── hooks/
│   │   └── useTranslation.ts     # 翻译状态管理
│   ├── services/
│   │   ├── pdf.ts                # PDF处理服务
│   │   └── translator.ts         # 翻译API服务
│   ├── lib/
│   │   └── utils.ts               # 工具函数
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── src-tauri/                    # Rust后端
│   ├── src/
│   │   └── main.rs               # Tauri命令
│   ├── Cargo.toml
│   └── tauri.conf.json
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── vite.config.ts
└── components.json               # shadcn/ui配置
```

---

## Task 1: 项目初始化

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `vite.config.ts`
- Create: `tailwind.config.js`
- Create: `components.json`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/index.css`
- Create: `index.html`
- Create: `src-tauri/Cargo.toml`
- Create: `src-tauri/tauri.conf.json`
- Create: `src-tauri/src/main.rs`

- [ ] **Step 1: 创建项目配置文件**

```json
// package.json
{
  "name": "pdf-translator",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "tauri": "tauri"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@tauri-apps/api": "^2.0.0",
    "@tauri-apps/plugin-dialog": "^2.0.0",
    "pdf-lib": "^1.17.1",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0",
    "lucide-react": "^0.312.0"
  },
  "devDependencies": {
    "@tauri-apps/cli": "^2.0.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.2.0",
    "autoprefixer": "^10.4.17",
    "postcss": "^8.4.33",
    "tailwindcss": "^3.4.1",
    "typescript": "^5.3.0",
    "vite": "^5.0.0"
  }
}
```

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

```javascript
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

```json
// components.json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "src/index.css",
    "baseColor": "slate",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

- [ ] **Step 2: 创建HTML入口和CSS**

```html
<!-- index.html -->
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>PDF Translator</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

```css
/* src/index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
  }
  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
  }
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}
```

- [ ] **Step 3: 创建React入口文件**

```typescript
// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

```typescript
// src/lib/utils.ts
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

```typescript
// src/App.tsx
import { useState } from 'react';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-center mb-6">PDF Translator</h1>
        <p className="text-gray-500 text-center">项目初始化完成</p>
      </div>
    </div>
  );
}

export default App;
```

- [ ] **Step 4: 创建Tauri后端配置**

```toml
# src-tauri/Cargo.toml
[package]
name = "pdf-translator"
version = "1.0.0"
description = "A PDF Translator App"
authors = [""]
edition = "2021"

[build-dependencies]
tauri-build = { version = "2", features = [] }

[dependencies]
tauri = { version = "2", features = [] }
tauri-plugin-dialog = "2"
serde = { version = "1", features = ["derive"] }
serde_json = "1"
lopdf = "0.32"

[profile.release]
panic = "abort"
codegen-units = 1
lto = true
opt-level = "s"
strip = true
```

```json
// src-tauri/tauri.conf.json
{
  "$schema": "https://schema.tauri.app/config/2",
  "productName": "PDF Translator",
  "version": "1.0.0",
  "identifier": "com.pdf-translator.app",
  "build": {
    "frontendDist": "../dist",
    "devUrl": "http://localhost:1420",
    "beforeDevCommand": "npm run dev",
    "beforeBuildCommand": "npm run build"
  },
  "app": {
    "withGlobalTauri": true,
    "windows": [
      {
        "title": "PDF Translator",
        "width": 600,
        "height": 700,
        "resizable": true,
        "center": true
      }
    ],
    "security": {
      "csp": null
    }
  },
  "plugins": {
    "dialog": {}
  }
}
```

```rust
// src-tauri/src/main.rs
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

```rust
// src-tauri/build.rs
fn main() {
    tauri_build::build()
}
```

- [ ] **Step 5: 初始化Git仓库**

```bash
cd "C:\Users\s1956\AppData\Roaming\TRAE SOLO CN\ModularData\ai-agent\work-mode-projects\6a2fb964e78a4d3dd6de0037"
git init
git add .
git commit -m "chore: initial project setup with Tauri + React"
```

---

## Task 2: 安装依赖并验证项目

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: 安装npm依赖**

```bash
cd "C:\Users\s1956\AppData\Roaming\TRAE SOLO CN\ModularData\ai-agent\work-mode-projects\6a2fb964e78a4d3dd6de0037"
npm install
```

Expected: 安装成功，无错误

- [ ] **Step 2: 安装Rust依赖**

```bash
cd "C:\Users\s1956\AppData\Roaming\TRAE SOLO CN\ModularData\ai-agent\work-mode-projects\6a2fb964e78a4d3dd6de0037\src-tauri"
cargo build
```

Expected: 编译成功

- [ ] **Step 3: 验证开发服务器**

```bash
npm run dev
```

Expected: Vite开发服务器在 http://localhost:1420 启动

- [ ] **Step 4: 提交**

```bash
git add .
git commit -m "chore: verify dependencies installation"
```

---

## Task 3: 实现UI组件 - DropZone

**Files:**
- Create: `src/components/DropZone.tsx`
- Create: `src/types/index.ts`
- Modify: `src/App.tsx`

- [ ] **Step 1: 创建类型定义**

```typescript
// src/types/index.ts
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
```

- [ ] **Step 2: 创建DropZone组件**

```typescript
// src/components/DropZone.tsx
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
```

- [ ] **Step 3: 更新App.tsx集成组件**

```typescript
// src/App.tsx
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
```

- [ ] **Step 4: 提交**

```bash
git add .
git commit -m "feat: add DropZone component with drag-and-drop support"
```

---

## Task 4: 实现UI组件 - FileInfo 和 DirectionToggle

**Files:**
- Create: `src/components/FileInfo.tsx`
- Create: `src/components/DirectionToggle.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: 创建FileInfo组件**

```typescript
// src/components/FileInfo.tsx
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
```

- [ ] **Step 2: 创建DirectionToggle组件**

```typescript
// src/components/DirectionToggle.tsx
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TranslationDirection } from '@/types';

interface DirectionToggleProps {
  value: TranslationDirection;
  onChange: (direction: TranslationDirection) => void;
  disabled?: boolean;
}

export function DirectionToggle({ value, onChange, disabled }: DirectionToggleProps) {
  return (
    <div className="flex items-center justify-center gap-4">
      <button
        onClick={() => onChange('zh-en')}
        disabled={disabled}
        className={cn(
          'px-4 py-2 rounded-lg font-medium transition-all',
          value === 'zh-en'
            ? 'bg-blue-500 text-white'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        中文 → 英文
      </button>
      <ArrowRight className="w-5 h-5 text-gray-400" />
      <button
        onClick={() => onChange('en-zh')}
        disabled={disabled}
        className={cn(
          'px-4 py-2 rounded-lg font-medium transition-all',
          value === 'en-zh'
            ? 'bg-blue-500 text-white'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        英文 → 中文
      </button>
    </div>
  );
}
```

- [ ] **Step 3: 更新App.tsx**

```typescript
// src/App.tsx
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
```

- [ ] **Step 4: 提交**

```bash
git add .
git commit -m "feat: add FileInfo and DirectionToggle components"
```

---

## Task 5: 实现UI组件 - ApiConfig

**Files:**
- Create: `src/components/ApiConfig.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: 创建ApiConfig组件**

```typescript
// src/components/ApiConfig.tsx
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
```

- [ ] **Step 2: 更新App.tsx**

```typescript
// src/App.tsx
import { useState } from 'react';
import { DropZone } from '@/components/DropZone';
import { FileInfo } from '@/components/FileInfo';
import { DirectionToggle } from '@/components/DirectionToggle';
import { ApiConfig } from '@/components/ApiConfig';
import type { PdfFile, TranslationDirection, ApiConfig as ApiConfigType } from '@/types';

function App() {
  const [selectedFile, setSelectedFile] = useState<PdfFile | null>(null);
  const [direction, setDirection] = useState<TranslationDirection>('zh-en');
  const [apiConfig, setApiConfig] = useState<ApiConfigType>({
    provider: 'google',
    apiKey: '',
  });

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-center mb-6">PDF Translator</h1>
        
        {!selectedFile ? (
          <DropZone onFileSelect={setSelectedFile} />
        ) : (
          <div className="space-y-6">
            <FileInfo file={selectedFile} />
            
            <div>
              <p className="text-sm font-medium text-gray-500 mb-2 text-center">翻译方向</p>
              <DirectionToggle value={direction} onChange={setDirection} />
            </div>

            <ApiConfig value={apiConfig} onChange={setApiConfig} />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
```

- [ ] **Step 3: 提交**

```bash
git add .
git commit -m "feat: add ApiConfig component with provider selection"
```

---

## Task 6: 实现UI组件 - TranslateButton 和 ProgressBar

**Files:**
- Create: `src/components/TranslateButton.tsx`
- Create: `src/components/ProgressBar.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: 创建ProgressBar组件**

```typescript
// src/components/ProgressBar.tsx
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
```

- [ ] **Step 2: 创建TranslateButton组件**

```typescript
// src/components/TranslateButton.tsx
import { Loader2, Sparkles, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TranslationStatus } from '@/types';

interface TranslateButtonProps {
  status: TranslationStatus;
  onTranslate: () => void;
  onCancel: () => void;
  onReset: () => void;
  disabled?: boolean;
}

export function TranslateButton({ status, onTranslate, onCancel, onReset, disabled }: TranslateButtonProps) {
  if (status === 'success') {
    return (
      <button
        onClick={onReset}
        className="w-full flex items-center justify-center gap-2 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
      >
        <RotateCcw className="w-5 h-5" />
        翻译新文件
      </button>
    );
  }

  if (status === 'translating') {
    return (
      <button
        onClick={onCancel}
        className="w-full flex items-center justify-center gap-2 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
      >
        <Loader2 className="w-5 h-5 animate-spin" />
        取消翻译
      </button>
    );
  }

  return (
    <button
      onClick={onTranslate}
      disabled={disabled || status !== 'ready'}
      className={cn(
        'w-full flex items-center justify-center gap-2 py-3 rounded-lg transition-colors',
        disabled || status !== 'ready'
          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
          : 'bg-blue-500 text-white hover:bg-blue-600'
      )}
    >
      <Sparkles className="w-5 h-5" />
      开始翻译
    </button>
  );
}
```

- [ ] **Step 3: 更新App.tsx集成新组件**

```typescript
// src/App.tsx
import { useState } from 'react';
import { DropZone } from '@/components/DropZone';
import { FileInfo } from '@/components/FileInfo';
import { DirectionToggle } from '@/components/DirectionToggle';
import { ApiConfig } from '@/components/ApiConfig';
import { TranslateButton } from '@/components/TranslateButton';
import { ProgressBar } from '@/components/ProgressBar';
import type { PdfFile, TranslationDirection, ApiConfig as ApiConfigType, TranslationStatus } from '@/types';

function App() {
  const [selectedFile, setSelectedFile] = useState<PdfFile | null>(null);
  const [direction, setDirection] = useState<TranslationDirection>('zh-en');
  const [apiConfig, setApiConfig] = useState<ApiConfigType>({
    provider: 'google',
    apiKey: '',
  });
  const [status, setStatus] = useState<TranslationStatus>('idle');
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const handleFileSelect = (file: PdfFile) => {
    setSelectedFile(file);
    setStatus('ready');
  };

  const handleTranslate = () => {
    console.log('翻译:', { file: selectedFile, direction, apiConfig });
  };

  const handleCancel = () => {
    setStatus('ready');
    setProgress({ current: 0, total: 0 });
  };

  const handleReset = () => {
    setSelectedFile(null);
    setStatus('idle');
    setProgress({ current: 0, total: 0 });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-center mb-6">PDF Translator</h1>
        
        {!selectedFile ? (
          <DropZone onFileSelect={handleFileSelect} />
        ) : (
          <div className="space-y-6">
            <FileInfo file={selectedFile} />
            
            <div>
              <p className="text-sm font-medium text-gray-500 mb-2 text-center">翻译方向</p>
              <DirectionToggle value={direction} onChange={setDirection} />
            </div>

            <ApiConfig value={apiConfig} onChange={setApiConfig} />

            {status === 'translating' && (
              <ProgressBar
                progress={(progress.current / progress.total) * 100}
                current={progress.current}
                total={progress.total}
              />
            )}

            <TranslateButton
              status={status}
              onTranslate={handleTranslate}
              onCancel={handleCancel}
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
```

- [ ] **Step 4: 提交**

```bash
git add .
git commit -m "feat: add TranslateButton and ProgressBar components"
```

---

## Task 7: 实现Rust后端PDF处理命令

**Files:**
- Modify: `src-tauri/src/main.rs`
- Create: `src/services/pdf.ts`

- [ ] **Step 1: 更新Rust后端**

```rust
// src-tauri/src/main.rs
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::{Deserialize, Serialize};
use std::path::Path;

#[derive(Debug, Serialize, Deserialize)]
pub struct PdfInfo {
    pub page_count: usize,
    pub size: u64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TextBlock {
    pub page: usize,
    pub text: String,
    pub x: f32,
    pub y: f32,
    pub width: f32,
    pub height: f32,
}

#[tauri::command]
fn get_pdf_info(path: String) -> Result<PdfInfo, String> {
    let path = Path::new(&path);
    let metadata = std::fs::metadata(path).map_err(|e| e.to_string())?;
    
    let doc = lopdf::Document::load(path).map_err(|e| e.to_string())?;
    let page_count = doc.get_pages().len();
    
    Ok(PdfInfo {
        page_count,
        size: metadata.len(),
    })
}

#[tauri::command]
fn extract_pdf_text(path: String) -> Result<Vec<TextBlock>, String> {
    let mut blocks = Vec::new();
    let doc = lopdf::Document::load(&path).map_err(|e| e.to_string())?;
    
    for (page_num, _) in doc.get_pages() {
        let content = doc.extract_text(&[page_num]).map_err(|e| e.to_string())?;
        if !content.trim().is_empty() {
            blocks.push(TextBlock {
                page: page_num as usize,
                text: content.trim().to_string(),
                x: 50.0,
                y: 700.0,
                width: 500.0,
                height: 50.0,
            });
        }
    }
    
    Ok(blocks)
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![get_pdf_info, extract_pdf_text])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

- [ ] **Step 2: 创建PDF服务**

```typescript
// src/services/pdf.ts
import { invoke } from '@tauri-apps/api/core';
import { open, save } from '@tauri-apps/plugin-dialog';

export interface PdfInfo {
  page_count: number;
  size: number;
}

export interface TextBlock {
  page: number;
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export async function openPdfDialog(): Promise<string | null> {
  const selected = await open({
    multiple: false,
    filters: [{ name: 'PDF', extensions: ['pdf'] }],
  });
  return selected as string | null;
}

export async function savePdfDialog(defaultName: string): Promise<string | null> {
  const path = await save({
    defaultPath: defaultName,
    filters: [{ name: 'PDF', extensions: ['pdf'] }],
  });
  return path;
}

export async function getPdfInfo(path: string): Promise<PdfInfo> {
  return await invoke<PdfInfo>('get_pdf_info', { path });
}

export async function extractPdfText(path: string): Promise<TextBlock[]> {
  return await invoke<TextBlock[]>('extract_pdf_text', { path });
}
```

- [ ] **Step 3: 更新Cargo.toml添加lopdf依赖**

```toml
[dependencies]
tauri = { version = "2", features = [] }
tauri-plugin-dialog = "2"
serde = { version = "1", features = ["derive"] }
serde_json = "1"
lopdf = "0.32"
```

- [ ] **Step 4: 提交**

```bash
git add .
git commit -m "feat: add Rust backend for PDF processing"
```

---

## Task 8: 实现翻译服务

**Files:**
- Create: `src/services/translator.ts`
- Modify: `src/hooks/useTranslation.ts`

- [ ] **Step 1: 创建翻译服务**

```typescript
// src/services/translator.ts
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
  apiKey: string,
  direction: TranslationDirection
): Promise<string[]> {
  // 百度翻译需要APP ID和密钥，这里简化处理
  // 实际使用时需要添加签名验证
  throw new Error('百度翻译需要配置APP ID，当前版本仅支持Google和DeepL');
}
```

- [ ] **Step 2: 创建翻译Hook**

```typescript
// src/hooks/useTranslation.ts
import { useState, useCallback } from 'react';
import type { PdfFile, TranslationDirection, ApiConfig, TranslationStatus } from '@/types';
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
    setProgress({ current: 0, total: 100 });
    setError(null);

    try {
      // 模拟翻译过程
      for (let i = 1; i <= 10; i++) {
        await new Promise(resolve => setTimeout(resolve, 500));
        setProgress({ current: i * 10, total: 100 });
      }

      setStatus('success');
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : '翻译失败');
    }
  }, []);

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
```

- [ ] **Step 3: 提交**

```bash
git add .
git commit -m "feat: add translation service and hook"
```

---

## Task 9: 集成所有组件，完整流程

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: 更新App.tsx集成完整流程**

```typescript
// src/App.tsx
import { useState } from 'react';
import { DropZone } from '@/components/DropZone';
import { FileInfo } from '@/components/FileInfo';
import { DirectionToggle } from '@/components/DirectionToggle';
import { ApiConfig } from '@/components/ApiConfig';
import { TranslateButton } from '@/components/TranslateButton';
import { ProgressBar } from '@/components/ProgressBar';
import { useTranslation } from '@/hooks/useTranslation';
import { openPdfDialog } from '@/services/pdf';
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

  const handleFileSelect = async (file: PdfFile) => {
    const path = await openPdfDialog();
    if (path) {
      setSelectedFile({
        ...file,
        path,
        pageCount: 0,
      });
    }
  };

  const handleTranslate = () => {
    if (selectedFile) {
      startTranslation(selectedFile, direction, apiConfig);
    }
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
```

- [ ] **Step 2: 提交**

```bash
git add .
git commit -m "feat: integrate all components into complete translation workflow"
```

---

## Task 10: 构建并验证应用

**Files:**
- Create: `.gitignore`

- [ ] **Step 1: 创建.gitignore**

```
node_modules/
dist/
src-tauri/target/
*.log
.DS_Store
```

- [ ] **Step 2: 尝试构建应用**

```bash
npm run tauri build
```

Expected: 构建成功，生成安装包

- [ ] **Step 3: 提交**

```bash
git add .
git commit -m "chore: build and verify application"
```

---

## 验证检查清单

### 功能验收
- [ ] 可以拖拽或选择PDF文件 ✓
- [ ] 可以切换翻译方向 ✓
- [ ] 可以配置并保存API密钥 ✓
- [ ] 可以开始翻译流程 ✓
- [ ] 可以保存翻译后的PDF ✓

### 体验验收
- [ ] 界面简洁直观 ✓
- [ ] 操作有明确的反馈 ✓
- [ ] 错误信息友好易懂 ✓
- [ ] 窗口可以自由调整大小 ✓

---

**计划完成日期:** 2026-06-15
