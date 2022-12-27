#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use tauri::{ window::WindowBuilder, WindowUrl };
use sysinfo::{ System, SystemExt };
fn main() {
    tauri::Builder::default()
        .plugin(voxura::init())
        .invoke_handler(tauri::generate_handler![
            move_dir,
            fs_read_dir,
            get_total_memory,
            fs_create_dir_all,
            fs_read_file_in_zip,
            fs_read_dir_recursive
        ])
		.setup(|app| {
			let mut sys = System::new_all();
    		sys.refresh_all();

			WindowBuilder::new(app, "main".to_string(), WindowUrl::default())
				.title("mdpkm")
				.center()
				.focused(true)
				.resizable(true)
				.inner_size(1200.0, 650.0)
				.fullscreen(sys.long_os_version().unwrap().to_lowercase().contains("steam"))
				.decorations(false)
				.build()?;
			Ok(())
		})
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
fn move_dir(path: String, target: String) {
    std::fs::rename(path, target).ok();
}

#[tauri::command]
fn fs_create_dir_all(path: String) {
    std::fs::create_dir_all(path).ok();
}

#[tauri::command]
fn fs_read_file_in_zip(path: String, file_path: String) -> Result<String, String> {
    let file = std::fs::File::open(std::path::Path::new(&*path));

    if file.is_ok() {
        let archiv = zip::ZipArchive::new(file.as_ref().unwrap());
        if archiv.is_ok() {
            let mut archive = archiv.unwrap();
            for i in 0..archive.len() {
                let mut file = archive.by_index(i).unwrap();
                if file.name().contains(&*file_path) {
                    let mut buf = String::new();
                    file.read_to_string(&mut buf).unwrap();
                    return Ok(buf);
                }
            }
            return Err("File does not exist".to_string());
        }
        return Err(archiv.unwrap_err().to_string());
    }
    return Err(file.unwrap_err().to_string());
}

use std::io::{ Read };
use walkdir::{ WalkDir };

#[tauri::command]
fn fs_read_dir(path: String) -> Result<Vec<Vec<String>>, String> {
    let read = std::fs::read_dir(path);
    if read.is_ok() {
        return Ok(read.unwrap().filter_map(| entry | {
            entry.ok().and_then(| e |
                Some(vec![e.path().into_os_string().into_string().unwrap(), e.file_type().unwrap().is_dir().to_string()])
            )
        }).collect::<Vec<Vec<String>>>());
    }
    return Err(read.unwrap_err().to_string());
}

#[tauri::command]
fn fs_read_dir_recursive(path: String) -> Result<Vec<Vec<String>>, String> {
    let walkdir = WalkDir::new(path);
    return Ok(walkdir.into_iter().filter_map(| entry | {
        entry.ok().and_then(| e |
            Some(vec![e.path().to_str().unwrap().to_owned().to_string(), e.file_type().is_dir().to_string()])
        )
    }).collect::<Vec<Vec<String>>>());
}

#[tauri::command]
fn get_total_memory() -> u64 {
    let mut sys = System::new_all();
    sys.refresh_all();
    return sys.total_memory();
}