#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

fn main() {
    tauri::Builder::default()
        .on_page_load(| window: tauri::window::Window, _ | {
            let _window = window.clone();
            window.listen("msAuth", move |_| {
                let url = redirect_uri().unwrap();
                _window.emit("msCode", url).unwrap();
            });
        })
        .invoke_handler(tauri::generate_handler![
            web_request,
            move_dir,
            fs_copy,
            launch_java,
            fs_read_dir,
            fs_read_file,
            extract_file,
            extract_files,
            fs_write_file,
            fs_remove_dir,
            fs_remove_file,
            fs_file_exists,
            launch_minecraft,
            fs_read_text_file,
            fs_create_dir_all,
            fs_read_file_in_zip
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

use std::collections::HashMap;
use std::os::windows::process::CommandExt;
use tauri::api::http::{ClientBuilder, HttpRequestBuilder, ResponseData, ResponseType};

use std::net::{ TcpListener, TcpStream };
use std::io::{ Write, Read };
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
async fn web_request(
    url: String,
    method: String,
    body: tauri::api::http::Body,
    query: HashMap<String, String>,
    headers: HashMap<String, String>,
    response_type: ResponseType,
) -> Result<ResponseData, String> {
    let method = &method;
    let client = ClientBuilder::new().max_redirections(3).build().unwrap();
    let mut request_builder = HttpRequestBuilder::new(method, url).unwrap().query(query).headers(headers);

    if method.eq("POST") {
        request_builder = request_builder.body(body);
    }

    let request = request_builder.response_type(response_type);
    if let Ok(response) = client.send(request).await {
        if let Ok(result) = response.read().await {
            return Ok(result);
        }
        return Err("response read failed".into());
    }
    return Err("web request failed".into());
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
    return Err("oh no".into());
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
                    let mut outfile = std::fs::File::create(outpath).unwrap();
                    if let Ok(result) = std::io::copy(&mut file, &mut outfile) {
                        return Ok(result);
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
fn fs_read_dir(path: String) -> Result<Vec<String>, String> {
    let read = std::fs::read_dir(path);
    if read.is_ok() {
        return Ok(read.unwrap().filter_map(| entry | {
            entry.ok().and_then(| e |
                Some(e.path().into_os_string().into_string().unwrap())
            )
        }).collect::<Vec<String>>());
    }
    return Err(read.unwrap_err().to_string());
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
fn fs_remove_file(path: String) -> Result<(), String> {
    let result = std::fs::remove_file(path);
    if result.is_ok() {
        return Ok(result.unwrap());
    }
    return Err(result.unwrap_err().to_string());
}

#[tauri::command]
fn fs_remove_dir(path: String) {
    std::fs::remove_dir_all(path).unwrap();
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
    for i in 1..archive.len() {
        let mut file = archive.by_index(i).unwrap();
        if !file.name().starts_with(&*path)
            && !file
                .enclosed_name()
                .unwrap()
                .to_str()
                .unwrap()
                .contains(&*ignore)
        {
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

use std::io::{ BufRead, BufReader };
use std::process::{ Stdio, Command };
#[tauri::command]
fn launch_minecraft(window: tauri::window::Window, cwd: String, java_path: String, args: Vec<String>) {
    std::thread::spawn(move || {
        windows_runner::run(&java_path, &args.join(" "), &cwd);
        //windows_runner::run("cmd", &format!("/d \"{}\" /k start {} {}", &cwd, &java_path, &args.join(" ")), &cwd);
        /*println!("starting minecraft");
        println!("\\");
        println!("\\\\");
        let child = Command::new("cmd")
        //.creation_flags(0x08000000)
        .current_dir(cwd)
        .args(&["/c", "start", "echo", "\"\"test\"\"", &java_path])
        .arg("\"\"yes\"\"")
        //.args(args.iter().map(| x | snailquote::unescape(x).unwrap()).collect::<Vec<String>>())
        .args(args.iter().map(| x | str::replace(x, "\\", "")).collect::<Vec<String>>())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .stdin(Stdio::null())
        .spawn()
        .unwrap();
        println!("started minecraft");

        BufReader::new(child.stdout.unwrap())
            .lines()
            .filter_map(| line | line.ok())
            .for_each(| line | {
                println!("stdout {}", &line);
                window.emit("minecraft_log", ["info", &line]).unwrap();
            });
        BufReader::new(child.stderr.unwrap())
            .lines()
            .filter_map(| line | line.ok())
            .for_each(| line | {
                println!("stderr {}", &line);
                window.emit("minecraft_log", ["info", &line]).unwrap();
            });*/
    });
}

#[tauri::command]
fn launch_java(java_path: String, args: Vec<String>, cwd: String) {
    windows_runner::run(&java_path, &args.join(" "), &cwd);
}

mod windows_runner{
    use std::{thread, time, str};
    use std::process::{Command, Stdio};
    use std::io::Write;
    use std::io::{ BufRead, BufReader };
    pub fn run (program: &str, arguments: &str, cwd: &str) {
        let launcher = "powershell.exe";
        let build_string: String;
        {
            if arguments.trim() == "" { // no arguments (powershell gets confused if you try to execute a program with an empty array as the argument set)
                build_string = format!(r#"& '{}'"#,program);
            }
            else {
                let mut arguments_reformatting: Vec<&str> = Vec::new();
                for argument in arguments.split(" ") {
                    arguments_reformatting.push(argument);
                }
                let arguments_reformatted = arguments_reformatting.join("','");
                build_string = format!(r#"& '{}' @('{}')"#,program,arguments_reformatted); // powershell digests: & 'pro gram' @('argument1','argument2') => "pro gram" argument1 argument2
            }
        }
        let launch_command: &[String] = &[build_string];

        println!("{:?}", launch_command);
        let child = Command::new(launcher)
            .current_dir(cwd)
            .args(launch_command)
            .stdout(Stdio::piped())
            .stderr(Stdio::piped()) // if you want to collect stderr instead of displaying to user
            .spawn()
            .expect("failed to run child program");

        BufReader::new(child.stdout.unwrap())
            .lines()
            .filter_map(| line | line.ok())
            .for_each(| line | {
                println!("stdout {}", &line);
            });
        BufReader::new(child.stderr.unwrap())
            .lines()
            .filter_map(| line | line.ok())
            .for_each(| line | {
                println!("stderr {}", &line);
            });
    }
}