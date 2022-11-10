use async_process::{Child, ChildStdout, Command, Stdio};
use async_std::fs::File;
use async_std::io::prelude::{BufReadExt, SeekExt};
use async_std::io::BufReader;
use async_std::prelude::*;
use async_std::stream::StreamExt;
use clap::Parser;
use csv_async::AsyncReaderBuilder;
use std::collections::HashMap;
use std::io::SeekFrom;

#[derive(Parser, Debug)]
struct Cli {
    /// The path to the file to read
    #[arg(short = 'p', long = "path")]
    path: String,
    /// The function to evaluate
    #[arg(short = 'f', long = "function", default_value_t = String::from(""))]
    function: String,
    /// The number of puppets
    #[arg(short = 'n', long = "nb_threads", default_value_t = 1)]
    nb_threads: u8,
    /// The navigation timeout
    #[arg(short = 't', long = "timeout", default_value_t = 0)]
    timeout: u32,
    /// A pattern to search
    #[arg(short = 's', long = "search_pattern", default_value_t = String::from(""))]
    search_pattern: String,
}

#[derive(Debug)]
struct Evaluator {
    args: Cli,
}

impl Evaluator {
    fn new(args: Cli) -> Self {
        Self { args }
    }
    async fn set_inputs(&mut self) {
        let mut file = File::open(&self.args.path).await.unwrap();
        let pos: u64 = {
            let mut reader = BufReader::new(file.by_ref());
            reader.read_until(b'\n', &mut Vec::new()).await.unwrap() as u64
        };
        let _ = file.seek(SeekFrom::Start(pos)).await;
        let reader = AsyncReaderBuilder::new()
            .delimiter(b',')
            .has_headers(true)
            .create_reader(file);
        let mut records = reader.into_records();
        let mut children: HashMap<String, Child> = HashMap::new();
        let mut i = 0;
        while let Some(result) = records.next().await {
            match result {
                Ok(res) => {
                    let mut site = res.get(0).unwrap().trim().to_string();
                    if !site.contains('.') {
                        continue;
                    }
                    site = format!("http://{}", site);
                    children.insert(site.to_string(), self.send_command(site).await);
                    i += 1;
                }
                Err(e) => println!("Error {:?}", e),
            }
            if i != self.args.nb_threads {
                continue;
            }
            self.print_results(children).await;
            i = 0;
            children = HashMap::new();
        }
    }

    async fn send_command(&mut self, site: String) -> Child {
        dbg!(&site);
        Command::new("node")
            .arg("pupet.js")
            .arg(site)
            .arg(&self.args.function)
            .arg(self.args.timeout.to_string())
            .arg(&self.args.search_pattern)
            .stdout(Stdio::piped())
            .spawn()
            .unwrap()
    }

    async fn print_results(&mut self, mut children: HashMap<String, Child>) {
        for (site, child) in children.iter_mut() {
            if let Some::<&mut ChildStdout>(stdoutin) = child.stdout.as_mut() {
                let mut lines = BufReader::new(stdoutin).lines();
                if let Some(line) = lines.next().await {
                    let line = line.unwrap();
                    if !line.is_empty() {
                        println!("site: {}", site);
                        println!("{:?}", &line);
                    }
                };
                while let Some(line) = lines.next().await {
                    println!("{:?}", line.unwrap());
                }
            };
        }
    }
}

#[async_std::main]
async fn main() {
    // let args = env::args().collect::<Vec<String>>();
    let args = Cli::parse();
    let file = &args.path.to_string();
    dbg!(file);
    run(args).await;
    dbg!("done", file);
}

async fn run(args: Cli) {
    Evaluator::new(args).set_inputs().await;
}
