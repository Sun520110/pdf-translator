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
