#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

pub mod cmd;

use std::fs;
use tauri::{ window::WindowBuilder, WindowUrl };
use sysinfo::{ System, SystemExt };
fn main() {
	let mut context = tauri::generate_context!();
	if let Some(data_dir) = tauri::api::path::app_data_dir(context.config()) {
		if let Ok(channel) = fs::read_to_string(data_dir.join("updater_channel")) {
			println!("[mdpkm]: Setting release channel to \"{}\"", channel);
			let updater = &mut context.config_mut().tauri.updater;
			updater.endpoints.replace(vec![tauri::utils::config::UpdaterEndpoint(
				format!("https://api.voxelified.com/v1/app/mdpkm/release/{}/tauri?version={{{{current_version}}}}", channel).parse().expect("invalid updater URL"),
			)]);
		}
	}
    tauri::Builder::default()
        .plugin(voxura::init())
        .invoke_handler(tauri::generate_handler![
            move_dir,
            fs_read_dir,
			check_for_update,
            get_total_memory,
            fs_create_dir_all,
            fs_read_file_in_zip,
            fs_read_dir_recursive,

			cmd::copy_dir,
			cmd::read_text_file_in_zip,
			cmd::read_binary_file_in_zip
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
        .run(context)
        .expect("error while running tauri application");
}

#[derive(Clone, serde::Serialize)]
struct UpdateManifest {
	body: String,
	date: Option<String>,
	version: String
}

#[tauri::command]
fn check_for_update(app_handle: tauri::AppHandle) {
	tauri::async_runtime::spawn(async move {
		tauri::updater::builder(app_handle.clone()).should_install(|_current, _latest| true).check().await.unwrap();
	});
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