#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

#[path = "../../voxura/rust/mod.rs"] mod voxura;
fn main() {
    tauri::Builder::default()
        .plugin(voxura::init())
        .invoke_handler(tauri::generate_handler![
            move_dir,
            fs_copy,
            create_zip,
            extract_zip,
            fs_read_dir,
            fs_read_file,
            extract_file,
            extract_files,
            download_file,
            fs_write_file,
            fs_remove_dir,
            fs_remove_file,
            fs_file_exists,
            fs_write_binary,
            get_total_memory,
            fs_read_text_file,
            fs_create_dir_all,
            fs_write_binary_zip,
            fs_read_file_in_zip,
            fs_read_dir_recursive,
            fs_read_binary_in_zip
        ])
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
fn fs_copy(path: String, target: String) -> Result<u64, String> {
    let result = &std::fs::copy(path, target);
    if let Ok(res) = result {
        return Ok(*res);
    }
    return Err(result.as_ref().unwrap_err().to_string());
}

#[tauri::command]
fn fs_file_exists(path: String) -> bool {
    return std::path::Path::new(&*path).exists();
}

#[tauri::command]
fn extract_file(path: String, file_name: String, output: String) -> Result<u64, String> {
    let fname = std::path::Path::new(&*path);
    let file = std::fs::File::open(&fname);

    if file.is_ok() {
        let archiv = zip::ZipArchive::new(file.as_ref().unwrap());
        if archiv.is_ok() {
            let mut archive = archiv.unwrap();
            for i in 0..archive.len() {
                let mut file = archive.by_index(i).unwrap();
                if file.name().contains(&*file_name) {
                    let outpath = &std::path::Path::new(&*output);
                    std::fs::create_dir_all(outpath.parent().unwrap()).unwrap();
                    let outfile = std::fs::File::create(outpath);
                    if outfile.is_ok() {
                        if let Ok(result) = std::io::copy(&mut file, &mut outfile.unwrap()) {
                            return Ok(result);
                        }
                    } else {
                        return Err(outfile.unwrap_err().to_string());
                    }
                }
            }
            return Err("File does not exist".to_string());
        }
        return Err(archiv.unwrap_err().to_string());
    }
    return Err(file.unwrap_err().to_string());
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

#[tauri::command]
fn fs_read_binary_in_zip(path: String, file_path: String) -> Result<Vec<u8>, String> {
    let file = std::fs::File::open(std::path::Path::new(&*path));

    if file.is_ok() {
        let archiv = zip::ZipArchive::new(file.as_ref().unwrap());
        if archiv.is_ok() {
            let mut archive = archiv.unwrap();
            for i in 0..archive.len() {
                let mut file = archive.by_index(i).unwrap();
                if file.name().contains(&*file_path) {
                    let mut buf = Vec::<u8>::new();
                    file.read_to_end(&mut buf).unwrap();
                    return Ok(buf);
                }
            }
            return Err("File does not exist".to_string());
        }
        return Err(archiv.unwrap_err().to_string());
    }
    return Err(file.unwrap_err().to_string());
}

use std::io::{ Read, Write };
use walkdir::{ WalkDir };

#[tauri::command]
fn create_zip(path: String, prefix: String, files: Vec<String>) {
    let mut zip = zip::ZipWriter::new(std::fs::File::create(&path).unwrap());
    let options = zip::write::FileOptions::default();

    let mut buffer = Vec::new();
    for entry in files {
        let path = std::path::Path::new(&entry);
        let name = path.strip_prefix(std::path::Path::new(&prefix)).unwrap();

        if path.is_file() {
            #[allow(deprecated)]
            zip.start_file_from_path(name, options).unwrap();
            let mut f = std::fs::File::open(path).unwrap();

            f.read_to_end(&mut buffer).unwrap();
            zip.write_all(&*buffer).unwrap();
            buffer.clear();
        } else if !name.as_os_str().is_empty() {
            #[allow(deprecated)]
            zip.add_directory_from_path(name, options).unwrap();
        }
    }
}

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
fn fs_read_file(path: String) -> Result<Vec<u8>, String> {
    let result = std::fs::read(path);
    if result.is_ok() {
        return Ok(result.unwrap());
    }
    return Err(result.unwrap_err().to_string());
}

#[tauri::command]
fn fs_read_text_file(path: String) -> Result<String, String> {
    let result = std::fs::read_to_string(path);
    if result.is_ok() {
        return Ok(result.unwrap());
    }
    return Err(result.unwrap_err().to_string());
}

#[tauri::command]
fn fs_write_file(path: String, contents: String) -> Result<(), String> {
    std::fs::create_dir_all(std::path::Path::new(&path).parent().unwrap()).unwrap();
    let result = std::fs::write(path, contents);
    if result.is_ok() {
        return Ok(result.unwrap());
    }
    return Err(result.unwrap_err().to_string());
}

#[tauri::command]
fn fs_write_binary(path: String, contents: Vec<u8>) {
    std::thread::spawn(move || {
        std::fs::create_dir_all(std::path::Path::new(&path).parent().unwrap()).unwrap();
        let _ = std::fs::write(path, contents);
    });
}

#[tauri::command]
fn fs_write_binary_zip(path: String, name: String, contents: Vec<u8>) {
    let mut zip = zip::ZipWriter::new(std::fs::File::create(&path).unwrap());
    let options = zip::write::FileOptions::default().compression_method(zip::CompressionMethod::Stored);
    zip.start_file(name, options).unwrap();
    zip.write(&contents).unwrap();
    zip.finish().unwrap();
}

#[tauri::command]
fn fs_remove_file(path: String) -> Result<(), String> {
    let result = std::fs::remove_file(path);
    if result.is_ok() {
        return Ok(result.unwrap());
    }
    return Err(result.unwrap_err().to_string());
}

#[tauri::command]
fn fs_remove_dir(path: String) -> Result<(), String> {
    let result = std::fs::remove_dir_all(path);
    if result.is_ok() {
        return Ok(result.unwrap());
    }
    return Err(result.unwrap_err().to_string());
}

#[tauri::command]
fn extract_zip(path: String, output: String) {
    let fname = std::path::Path::new(&*path);
    let file = std::fs::File::open(&fname).unwrap();
    let mut archive = zip::ZipArchive::new(file).unwrap();
    for i in 0..archive.len() {
        let mut file = archive.by_index(i).unwrap();
        let concat = format!(
            "{}/{}",
            output,
            file.enclosed_name()
                .unwrap()
                .to_str()
                .unwrap()
        );
        let outpath = std::path::Path::new(&concat);

        if (&*file.name()).ends_with('/') {
            std::fs::create_dir_all(&*outpath).unwrap();
        } else {
            if let Some(p) = outpath.parent() {
                if !p.exists() {
                    std::fs::create_dir_all(&p).unwrap();
                }
            }
            let mut outfile = std::fs::File::create(&outpath).unwrap();
            std::io::copy(&mut file, &mut outfile).unwrap();
        }
    }
}

#[tauri::command]
fn extract_files(
    zip: String,
    path: String,
    output: String,
    ignore: String,
) -> Result<String, String> {
    let fname = std::path::Path::new(&*zip);
    let file = std::fs::File::open(&fname).unwrap();
    let mut archive = zip::ZipArchive::new(file).unwrap();
    for i in 0..archive.len() {
        let mut file = archive.by_index(i).unwrap();
        if !file.name().starts_with(&*path) && !file.enclosed_name().unwrap().to_str().unwrap().contains(&*ignore) {
            continue;
        }
        let concat = format!(
            "{}/{}",
            output,
            file.enclosed_name()
                .unwrap()
                .to_str()
                .unwrap()
                .replace(&*path, "")
        );
        let outpath = std::path::Path::new(&concat);

        if (&*file.name()).ends_with('/') {
            std::fs::create_dir_all(&*outpath).unwrap();
        } else {
            if let Some(p) = outpath.parent() {
                if !p.exists() {
                    std::fs::create_dir_all(&p).unwrap();
                }
            }
            let mut outfile = std::fs::File::create(&outpath).unwrap();
            std::io::copy(&mut file, &mut outfile).unwrap();
        }
    }
    return Ok("yay".into());
}

extern crate reqwest;

#[tauri::command]
async fn download_file(url: String, path: String) {
    let directory = &mut path.split("/").collect::<Vec<&str>>();
    directory.pop();
    std::fs::create_dir_all(directory.join("/")).ok();

    let response = reqwest::get(url).await.unwrap();
    let mut file = std::fs::File::create(path).expect("failed to create file");
    let mut content = std::io::Cursor::new(response.bytes().await.unwrap());
    std::io::copy(&mut content, &mut file).unwrap();
}

use sysinfo::{ System, SystemExt };
#[tauri::command]
fn get_total_memory() -> u64 {
    let mut sys = System::new_all();
    sys.refresh_all();
    return sys.total_memory();
}