use std::fs::File;
use std::io::Read;
use std::string::String;
use zip::{ ZipArchive };
use fs_extra::dir::CopyOptions;

#[tauri::command]
pub fn copy_dir(path: String, target: String) {
	fs_extra::dir::copy(path, target, &CopyOptions::new()).unwrap();
}

#[tauri::command]
pub fn read_text_file_in_zip(path: String, target: String) -> Result<String, String> {
	read_binary_file_in_zip(path, target).map(|x| String::from_utf8(x).unwrap())
}

#[tauri::command]
pub fn read_binary_file_in_zip(path: String, target: String) -> Result<Vec<u8>, String> {
	if let Ok(file) = File::open(path) {
		if let Ok(mut archive) = ZipArchive::new(file) {
			return match archive.by_name(&target) {
				Ok(mut file) => {
					let mut buffer = vec![];
					file.read_to_end(&mut buffer).unwrap();
					Ok(buffer)
				},
				_ => Err("file not found".into())
			};
		}
	}
	Err("could not read archive".into())
}