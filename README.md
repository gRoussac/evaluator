# **_Evaluator_**

This project aims to ease evaluating the parameters of javascript functions on a website.

Typically helps with deobfuscating https://stackoverflow.com/questions/32977908/how-can-i-deobfuscate-this-javascript using `String.fromCharCode` or `window.eval` or other functions like `JSON.stringify`

## Deployed on [Render](https://render.com/) at [evaluator.onlyeum.io](https://evaluator.onlyeum.io/) (beta 🏚️🕸️🕷️)

## References :

- https://www.getastra.com/e/malware/infections/the-presence-of-these-malicious-javascript-are-the-sign-of-hacked-opencart-magento-or-prestashop-store
- https://github.com/gwillem/magento-malware-scanner/blob/master/rules/frontend.txt

![Evaluator (18)](https://user-images.githubusercontent.com/3099551/200139269-a50b8a15-dbcd-4414-9848-7331cb0dd3c5.png)

![Evaluator (17)](https://user-images.githubusercontent.com/3099551/200139284-676f2ac4-042d-4de4-8b06-7f3345232996.png)

# **Quick Start & Documentation**

## API

Use

```
evaluate/?url=[site url]&function=[function to evaluate]
```

Example

```
http://localhost:4200/evaluate/?url=https://www.w3schools.com/jsref/tryit.asp?filename=tryjsref_eval&function=window.eval
```

a screen shot of the website will be provided in the response stream.

# **🐳 Docker**

> Build and run image with [Dockerfile](./docker/Dockerfile) 🏃‍♂️

```shell
cd docker
docker build -t evaluator . --force-rm

docker compose up
```

# 🧙‍♀️ **Development**

## Prerequisites

- npm >= 8.19.2
- nodejs >= 18.7.0 & < 19

# 🛠️ Usage with npm

Run `npm install` to install the application.

```shell
npm install
```

## Development server

Run `npm start` for a dev server. Navigate to http://localhost:4200/. The app will automatically reload if you change any of the source files.

```shell
npm start
```

## Build

Run `npm run build` to launch Jest test the project. The build artifacts will be stored in the `dist/` directory.

```shell
npm run build
```

# 🦀 Usage with Rust

## Install

> 📂 Go to `evaluator` subfolder

```
cd ./evaluator
cargo build
cargo run
```

- Two parameters :
- csv file to load (first column is website domain)
- the function to evaluate
  Example

```
cargo run All-Live-Magento-Sites.csv window.eval
```

# 📝 License

[GNU GENERAL PUBLIC LICENSE](https://github.com/gRoussac/evaluator/blob/master/LICENSE.md)

### 🦺 Security

### 🪦 Errors ?

If you see any typos or errors you can edit the code directly on GitHub and raise a Pull Request on `master` branch, many thanks !
