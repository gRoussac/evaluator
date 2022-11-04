extern crate csv;
use std::env;
use std::process::Command;

#[derive(Debug)]
struct Evaluator {
    pub inputs: Vec<String>,
}

impl Evaluator {
    fn new() -> Self {
        Self { inputs: Vec::new() }
    }

    fn set_inputs(&mut self, file: &String) {
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
                    self.inputs.push(site.to_string());
                }
                Err(e) => println!("Error {:?}", e),
            }
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
    evaluator.set_inputs(file);
    //dbg!(evaluator.inputs);
    for site in evaluator.inputs.iter() {
        let site = &format!("http://{}", site);
        dbg!(site);
        let output = Command::new("node")
            .arg("pupet.js")
            .arg(site)
            .arg(func)
            .output()
            .expect("failed to execute process");
        let stdout = &output.stdout;
        if !stdout.is_empty() {
            println!("{}", String::from_utf8_lossy(stdout));
        }
    }
}
