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
			check_for_update,
            get_total_memory,

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
				.min_inner_size(500.0, 600.0)
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
fn get_total_memory() -> u64 {
    let mut sys = System::new_all();
    sys.refresh_all();
    return sys.total_memory();
}