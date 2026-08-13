import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

// Use a local JSON file in the project root to persist across dev reloads
const LOGS_FILE = path.join(process.cwd(), 'radar_logs.json');

// Helper to get current time string (e.g. "10:24 AM")
function getTimeString() {
  const now = new Date();
  let hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  return `${hours}:${minutes} ${ampm}`;
}

async function readLogs() {
  try {
    const data = await fs.readFile(LOGS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    // If file doesn't exist, return a default seed array
    return [
      { id: "1", time: getTimeString(), timestamp: Date.now(), user: "@system", action: "initialized", badge: "⚙️ BOOT", title: "Radar Systems Online" }
    ];
  }
}

interface RadarLog {
  id: string;
  time: string;
  timestamp: number;
  user: string;
  action: string;
  badge: string;
  title: string;
}

async function writeLogs(logs: RadarLog[]) {
  // Keep only the latest 50 logs to prevent file bloat
  const trimmed = logs.slice(0, 50);
  await fs.writeFile(LOGS_FILE, JSON.stringify(trimmed, null, 2), 'utf-8');
}

export async function GET() {
  const logs = await readLogs();
  return NextResponse.json({ logs });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { user, action, badge, title } = body;

    if (!user || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newLog = {
      id: crypto.randomUUID(),
      time: getTimeString(),
      timestamp: Date.now(),
      user,
      action,
      badge: badge || "⚡ SIGNAL",
      title: title || "Ping"
    };

    const logs = await readLogs();
    logs.unshift(newLog); // Add to beginning
    
    await writeLogs(logs);

    return NextResponse.json({ success: true, log: newLog });
  } catch (error) {
    console.error("Failed to post radar log", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
