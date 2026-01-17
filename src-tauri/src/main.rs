use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use std::sync::Mutex;

// Store last known tray icon position for keyboard shortcut
static LAST_TRAY_POSITION: Mutex<(f64, f64)> = Mutex::new((0.0, 0.0));
use tauri::{
    ActivationPolicy, AppHandle, ClipboardManager, CustomMenuItem, GlobalShortcutManager, Manager,
    SystemTray, SystemTrayEvent, SystemTrayMenu, WindowEvent,
};

#[derive(Debug, Serialize, Deserialize, Clone)]
struct Gif {
    id: String,
    url: String,
    tags: Vec<String>,
    created_at: u64,
}

#[derive(Debug, Serialize, Deserialize, Default)]
struct AppData {
    gifs: Vec<Gif>,
}

struct AppState {
    data: Mutex<AppData>,
    data_path: PathBuf,
}

fn get_data_path() -> PathBuf {
    let mut path = dirs::data_dir().unwrap_or_else(|| PathBuf::from("."));
    path.push("gifwat");
    fs::create_dir_all(&path).ok();
    path.push("gifs.json");
    path
}

fn load_data(path: &PathBuf) -> AppData {
    if path.exists() {
        let content = fs::read_to_string(path).unwrap_or_default();
        serde_json::from_str(&content).unwrap_or_default()
    } else {
        AppData::default()
    }
}

fn save_data(path: &PathBuf, data: &AppData) {
    if let Ok(content) = serde_json::to_string_pretty(data) {
        fs::write(path, content).ok();
    }
}

#[tauri::command]
fn get_gifs(state: tauri::State<AppState>) -> Vec<Gif> {
    let data = state.data.lock().unwrap();
    data.gifs.clone()
}

#[tauri::command]
fn add_gif(url: String, tags: Vec<String>, state: tauri::State<AppState>) -> Gif {
    let mut data = state.data.lock().unwrap();
    let gif = Gif {
        id: uuid_simple(),
        url,
        tags,
        created_at: std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs(),
    };
    data.gifs.insert(0, gif.clone());
    save_data(&state.data_path, &data);
    gif
}

#[tauri::command]
fn delete_gif(id: String, state: tauri::State<AppState>) -> bool {
    let mut data = state.data.lock().unwrap();
    let initial_len = data.gifs.len();
    data.gifs.retain(|g| g.id != id);
    if data.gifs.len() != initial_len {
        save_data(&state.data_path, &data);
        true
    } else {
        false
    }
}

#[tauri::command]
fn update_gif_tags(id: String, tags: Vec<String>, state: tauri::State<AppState>) -> bool {
    let mut data = state.data.lock().unwrap();
    if let Some(gif) = data.gifs.iter_mut().find(|g| g.id == id) {
        gif.tags = tags;
        save_data(&state.data_path, &data);
        true
    } else {
        false
    }
}

#[tauri::command]
fn copy_to_clipboard(text: String, app: AppHandle) -> Result<(), String> {
    app.clipboard_manager()
        .write_text(text)
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn hide_window(app: AppHandle) {
    if let Some(window) = app.get_window("main") {
        window.hide().ok();
    }
}

fn uuid_simple() -> String {
    use std::time::{SystemTime, UNIX_EPOCH};
    let now = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_nanos();
    format!("{:x}", now)
}

fn create_tray_menu() -> SystemTrayMenu {
    let quit = CustomMenuItem::new("quit".to_string(), "Quit GifWat");
    SystemTrayMenu::new().add_item(quit)
}

fn show_window_at_position(app: &AppHandle, tray_x: f64, tray_y: f64) {
    if let Some(window) = app.get_window("main") {
        let window_width = 320i32;
        // Center the window horizontally under the tray icon
        let x = (tray_x as i32) - (window_width / 2);
        // Position just below the menu bar
        let y = tray_y as i32;

        window.set_position(tauri::Position::Physical(
            tauri::PhysicalPosition { x, y }
        )).ok();
        window.show().ok();
        window.set_focus().ok();
    }
}

fn toggle_window_at_position(app: &AppHandle, tray_x: f64, tray_y: f64) {
    // Remember this position for keyboard shortcut
    if let Ok(mut pos) = LAST_TRAY_POSITION.lock() {
        *pos = (tray_x, tray_y);
    }

    if let Some(window) = app.get_window("main") {
        if window.is_visible().unwrap_or(false) {
            window.hide().ok();
        } else {
            show_window_at_position(app, tray_x, tray_y);
        }
    }
}

// For global shortcut - use last known tray position
fn toggle_window_default(app: &AppHandle) {
    let (tray_x, tray_y) = LAST_TRAY_POSITION.lock()
        .map(|pos| *pos)
        .unwrap_or((0.0, 0.0));

    // If we have a stored position, use it
    if tray_x > 0.0 {
        toggle_window_at_position(app, tray_x, tray_y);
        return;
    }

    // Fallback: position near top-right
    if let Some(window) = app.get_window("main") {
        if window.is_visible().unwrap_or(false) {
            window.hide().ok();
        } else {
            if let Ok(Some(monitor)) = window.primary_monitor() {
                let screen_size = monitor.size();
                let window_width = 320;
                let x = (screen_size.width as i32) - window_width - 10;
                let y = 30;
                window.set_position(tauri::Position::Physical(
                    tauri::PhysicalPosition { x, y }
                )).ok();
            }
            window.show().ok();
            window.set_focus().ok();
        }
    }
}

fn main() {
    let data_path = get_data_path();
    let data = load_data(&data_path);
    let state = AppState {
        data: Mutex::new(data),
        data_path,
    };

    let tray = SystemTray::new()
        .with_menu(create_tray_menu())
        .with_menu_on_left_click(false);

    tauri::Builder::default()
        .manage(state)
        .system_tray(tray)
        .on_system_tray_event(|app, event| match event {
            SystemTrayEvent::LeftClick { position, .. } => {
                toggle_window_at_position(app, position.x, position.y);
            }
            SystemTrayEvent::MenuItemClick { id, .. } => match id.as_str() {
                "quit" => {
                    std::process::exit(0);
                }
                _ => {}
            },
            _ => {}
        })
        .on_window_event(|event| {
            // Hide window when it loses focus
            if let WindowEvent::Focused(focused) = event.event() {
                if !focused {
                    event.window().hide().ok();
                }
            }
        })
        .setup(|app| {
            // Hide from dock
            app.set_activation_policy(ActivationPolicy::Accessory);

            let app_handle = app.handle();

            // Register global shortcut
            let mut shortcut_manager = app.global_shortcut_manager();

            shortcut_manager
                .register("Cmd+Shift+G", move || {
                    toggle_window_default(&app_handle);
                })
                .ok();

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_gifs,
            add_gif,
            delete_gif,
            update_gif_tags,
            copy_to_clipboard,
            hide_window,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
