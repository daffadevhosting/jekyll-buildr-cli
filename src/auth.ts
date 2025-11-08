import fetch from 'node-fetch';
import open from 'open';
import * as fs from 'fs';
import * as path from 'path';
import { homedir } from 'os';
import { randomBytes } from 'crypto';

// Explicitly type the jwt_decode function from the CommonJS module
const jwt_decode_module = require('jwt-decode');
const jwt_decode: <T = unknown>(token: string, options?: any) => T = jwt_decode_module.default;

// --- Konfigurasi ---
const API_BASE_URL = 'https://jekyll-buildr.vercel.app';
const CONFIG_DIR = path.join(homedir(), '.jekyll-buildr');
const TOKEN_PATH = path.join(CONFIG_DIR, 'token.json');
const POLLING_INTERVAL = 3000; // 3 seconds
const LOGIN_TIMEOUT = 5 * 60 * 1000; // 5 minutes

// --- Manajemen Token ---

interface StoredToken {
  idToken: string;
  displayName: string;
  role: string;
}

interface DecodedToken {
  exp: number; // Expiration time in seconds since epoch
  // other properties...
}

function saveToken(token: StoredToken) {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(token, null, 2));
}

function getToken(): StoredToken | null {
  if (!fs.existsSync(TOKEN_PATH)) {
    return null;
  }
  const data = fs.readFileSync(TOKEN_PATH, 'utf-8');
  return JSON.parse(data);
}

function deleteToken() {
  if (fs.existsSync(TOKEN_PATH)) {
    fs.unlinkSync(TOKEN_PATH);
  }
}

// --- Alur Autentikasi ---

export async function login(): Promise<StoredToken> {
  const sessionId = randomBytes(32).toString('hex');
  const loginUrl = `${API_BASE_URL}/cli-login?sessionId=${sessionId}`;

  console.log('--------------------------------------------------');
  console.log('Please visit this URL to login:');
  console.log(loginUrl);
  console.log('--------------------------------------------------');
  
  await open(loginUrl);

  console.log('Waiting for login confirmation from browser...');

  const startTime = Date.now();
  while (Date.now() - startTime < LOGIN_TIMEOUT) {
    await new Promise(res => setTimeout(res, POLLING_INTERVAL));

    try {
      const response = await fetch(`${API_BASE_URL}/api/cli/check-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });

      if (response.status === 200) {
        const data = await response.json();
        if (data.status === 'completed') {
          const storedToken: StoredToken = {
            idToken: data.token,
            displayName: data.user.displayName,
            role: data.user.role,
          };
          saveToken(storedToken);
          console.log(`✅ Login successful! Welcome, ${storedToken.displayName} (${storedToken.role}).`);
          return storedToken;
        }
      }
      // If status is 202 or any other, we just continue polling
    } catch (error) {
      // Ignore network errors and just keep polling
    }
  }

  throw new Error('Login timed out. Please try again.');
}

export async function logout() {
  deleteToken();
  console.log('You have been logged out.');
}

export async function ensureLoggedIn(): Promise<StoredToken> {
  const token = getToken();
  if (token) {
    try {
      const decodedToken = jwt_decode<DecodedToken>(token.idToken);
      const currentTime = Date.now() / 1000; // Current time in seconds

      if (decodedToken.exp > currentTime) {
        // Token is still valid
        return token;
      }
    } catch (error) {
      console.error('Error decoding token or token invalid:', error);
      deleteToken(); // Clear invalid token
      return await login(); // Get a new token
    }
  }
  
  console.log('You are not logged in. Starting login process...');
  return await login();
}
