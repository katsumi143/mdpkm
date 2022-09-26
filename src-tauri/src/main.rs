#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

#[path = "../../voxura/rust/main.rs"] mod voxura;
fn main() {
    tauri::Builder::default()
        .on_page_load(| window: tauri::window::Window, _ | {
            let _window = window.clone();
            let __window = window.clone();
            window.listen("msAuth", move |_| {
                let url = redirect_uri().unwrap();
                _window.emit("msCode", url).unwrap();
            });
            window.listen("text", move | event | {
                __window.emit("text", event.payload().unwrap()).unwrap();
            });
        })
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
            launch_package,
            fs_write_binary,
            get_total_memory,
            fs_read_text_file,
            fs_create_dir_all,
            reregister_package,
            unregister_package,
            fs_write_binary_zip,
            fs_read_file_in_zip,
            get_microsoft_account,
            fs_read_dir_recursive,
            fs_read_binary_in_zip,
            send_window_event,
            voxura::voxura_launch
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

use std::net::{ TcpListener, TcpStream };
fn redirect_uri() -> Result<String, ()> {
    let listener = TcpListener::bind(format!("127.0.0.1:3432"));

    match listener {
        Ok(listener) => {
            for stream in listener.incoming() {
                match stream {
                    Ok(stream) => {
                        if let Some(url) = handle_connection(stream) {
                            return Ok(url);
                        }
                    }
                    Err(e) => {
                        println!("Error: {}", e);
                    }
                };
            }
        }
        Err(e) => {
            println!("Error: {}", e);
        }
    }

    Err(())
}

fn handle_connection(mut stream: TcpStream) -> Option<String> {
    let mut buffer = [0; 1000];
    let _ = stream.read(&mut buffer).unwrap();

    match String::from_utf8(buffer.to_vec()) {
        Ok(request) => {
            let split: Vec<&str> = request.split_whitespace().collect();
            if split.len() > 1 {
                respond_with_success(stream);
                return Some(split[1].to_string());
            }

            respond_with_error("Malformed request".to_string(), stream);
        }
        Err(e) => {
            respond_with_error(format!("Invalid UTF-8 sequence: {}", e), stream);
        }
    };

    None
}

fn respond_with_success(mut stream: TcpStream) {
    let response = format!("HTTP/1.1 200 OK\r\n\r\n{}", include_str!("redirect.html"));

    stream.write_all(response.as_bytes()).unwrap();
    stream.flush().unwrap();
}

fn respond_with_error(error_message: String, mut stream: TcpStream) {
    println!("Error: {}", error_message);
    let response = format!(
        "HTTP/1.1 400 Bad Request\r\n\r\n400 - Bad Request - {}",
        error_message
    );

    stream.write_all(response.as_bytes()).unwrap();
    stream.flush().unwrap();
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

use windows::core::HSTRING;
use windows::Security::Authentication::Web::Core::{
    WebTokenRequest,
    WebAuthenticationCoreManager
};

#[tauri::command]
async fn get_microsoft_account() -> String {
    let account_provider = WebAuthenticationCoreManager::FindAccountProviderAsync(
        HSTRING::from("https://login.microsoft.com")
    ).unwrap().await.unwrap();
    let request = WebTokenRequest::Create(
        account_provider,
        HSTRING::from("service::dcat.update.microsoft.com::MBI_SSL"),
        HSTRING::from("be7dfb6a-789c-4622-8c97-dcd963ae0f89")
    ).unwrap();
    let result = WebAuthenticationCoreManager::GetTokenSilentlyAsync(request).unwrap().await.unwrap();

    let token = result.ResponseData().unwrap().GetAt(0).unwrap().Token().unwrap();
    return token.to_string();
}

use windows::System::{ AppDiagnosticInfo };
use windows::Foundation::{ Uri };
use windows::Management::Deployment::{ PackageManager, RegisterPackageOptions };

#[tauri::command]
async fn launch_package(family: String, game_dir: String) {
    let game_path = std::path::Path::new(&game_dir);
    let pkg = AppDiagnosticInfo::RequestInfoForPackageAsync(
        HSTRING::from(family)
    ).unwrap().await.unwrap();
    if pkg.Size().unwrap() > 0 {
        for pk in pkg {
            if std::path::Path::new(&pk.AppInfo().unwrap().Package().unwrap().InstalledLocation().unwrap().Path().unwrap().to_string()).eq(game_path) {
                pk.LaunchAsync().unwrap();
                break;
            }
        }
    }
}

#[tauri::command]
async fn unregister_package(family: String, game_dir: String) {
    let game_path = std::path::Path::new(&game_dir);
    let pkg = AppDiagnosticInfo::RequestInfoForPackageAsync(
        HSTRING::from(family)
    ).unwrap().await.unwrap();
    if pkg.Size().unwrap() > 0 {
        for pk in pkg {
            /*if std::path::Path::new(&pk.AppInfo().unwrap().Package().unwrap().InstalledLocation().unwrap().Path().unwrap().to_string()).eq(game_path) {
                continue;
            }*/
            PackageManager::new().unwrap().RemovePackageAsync(pk.AppInfo().unwrap().Package().unwrap().Id().unwrap().FullName().unwrap()).unwrap();
        }
    }
}

#[tauri::command]
async fn reregister_package(game_dir: String) {
    let game_path = std::path::Path::new(&game_dir);
    let manifest_path = game_path.join("AppxManifest.xml");
    let options = RegisterPackageOptions::new().unwrap();
    options.SetDeveloperMode(true).unwrap();
    let res = PackageManager::new().unwrap().RegisterPackageByUriAsync(
        Uri::CreateUri(HSTRING::from(manifest_path.to_str().unwrap())).unwrap(),
        options
    ).unwrap().await.unwrap();
    println!("{}", res.ErrorText().unwrap());
    println!("registered package");
}

use tauri::Manager;

#[tauri::command]
fn send_window_event(window: tauri::window::Window, label: String, event: String, payload: String) {
    let window2 = window.get_window(&label);
    match window2 {
        Some(x) => x.emit(&event, payload).unwrap(),
        None => println!("{} is closed, tried to send {}", label, event)
    }
}

use sysinfo::{ System, SystemExt };
#[tauri::command]
fn get_total_memory() -> u64 {
    let mut sys = System::new_all();
    sys.refresh_all();
    return sys.total_memory();
}