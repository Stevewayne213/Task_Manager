import fs from 'fs';
import path from 'path';

const isVercel = process.env.VERCEL === '1' || !!process.env.VERCEL;
const DATA_DIR = isVercel ? '/tmp' : path.join(process.cwd(), 'data');

export const USERS_FILE = path.join(DATA_DIR, 'users.json');
export const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');

// Helper to ensure parent directory exists safely
function ensureDirectoryExists(dirPath: string): void {
  try {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  } catch (error) {
    console.error(`Failed to create directory ${dirPath}:`, error);
  }
}

export function readJSON(filePath: string): any[] {
  try {
    if (!fs.existsSync(filePath)) {
      // Ensure the parent directory exists first
      ensureDirectoryExists(path.dirname(filePath));
      
      // Lazy write empty array
      try {
        fs.writeFileSync(filePath, '[]', 'utf8');
      } catch (err) {
        console.error(`Failed to write fallback empty file ${filePath}:`, err);
      }
      return [];
    }
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error reading database file ${filePath}:`, error);
    return [];
  }
}

export function writeJSON(filePath: string, data: any[]): void {
  try {
    // Ensure parent directory exists before writing
    ensureDirectoryExists(path.dirname(filePath));
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error(`Error writing database file ${filePath}:`, error);
  }
}
