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
