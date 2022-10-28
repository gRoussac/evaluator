import * as Path from 'path';
const filename = "functions.json";
const path = Path.join(__dirname, filename);
const dist = '/dist/';
const functions_path = path.substring(0, path.lastIndexOf(dist)) + dist + filename;
export { functions_path };