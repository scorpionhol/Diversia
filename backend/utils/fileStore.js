import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const dataDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const filePath = (name) => path.join(dataDir, `${name}.json`);

export const readJsonStore = (name, defaultValue) => {
  const pathToFile = filePath(name);
  if (!fs.existsSync(pathToFile)) {
    return defaultValue;
  }

  try {
    const content = fs.readFileSync(pathToFile, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.warn(`Failed to read JSON store ${name}:`, error.message);
    return defaultValue;
  }
};

export const writeJsonStore = (name, data) => {
  const pathToFile = filePath(name);
  try {
    fs.writeFileSync(pathToFile, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.warn(`Failed to write JSON store ${name}:`, error.message);
  }
};
