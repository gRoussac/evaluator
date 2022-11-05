extern crate csv;
use async_process::Command;
use std::env;

#[derive(Debug)]
struct Evaluator {
    pub inputs: Vec<String>,
}

impl Evaluator {
    fn new() -> Self {
        Self { inputs: Vec::new() }
    }

    fn set_inputs(&mut self, file: &String, func: &String) {
        let file = std::fs::File::open(file).unwrap();
        let mut rdr = csv::ReaderBuilder::new()
            .has_headers(true)
            .flexible(true)
            .from_reader(file);
        for result in rdr.records().skip(1) {
            match result {
                Ok(res) => {
                    // println!("{:?}", res.get(0).unwrap());
                    let site = res.get(0).unwrap();
                    self.fetch(&site.to_string(), func);
                }
                Err(e) => println!("Error {:?}", e),
            }
        }
    }

    fn fetch(&self, site: &String, func: &String) {
        let site = &format!("http://{}", site);
        println!("site : {}", site);
        let output = Command::new("node")
            .arg("pupet.js")
            .arg(site)
            .arg(func)
            .output()
            .expect("failed to execute process");
        let stdout = &output.stdout;
        if !stdout.is_empty() {
            // println!("site : {}", site);
            println!("{}", String::from_utf8_lossy(stdout));
        }
    }
}

fn main() {
    let args: Vec<String> = env::args().collect();
    run(&args);
}

fn run(args: &[String]) {
    let file = args.get(1).unwrap();
    let func = args.get(2).unwrap();
    println!("In file {}", file);
    let mut evaluator = Evaluator::new();
    evaluator.set_inputs(file, func);
}
