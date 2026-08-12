// Builder Title Generator
// Playful mashups of dev slang + beach/Goa culture

const prefixes = [
  "Full-Stack",
  "Backend",
  "Frontend",
  "Chief",
  "Senior",
  "Zero-Downtime",
  "Async",
  "Kernel-Level",
  "Open-Source",
  "Distributed",
  "Cloud-Native",
  "Real-Time",
  "Serverless",
  "Low-Latency",
  "High-Throughput",
  "Event-Driven",
  "Type-Safe",
  "Hot-Reloading",
  "Headless",
  "Self-Hosted",
];

const cores = [
  "Sunset Chaser",
  "Beach Bum",
  "Vibe Debugger",
  "Coconut Hacker",
  "Susegad Engineer",
  "Kingfish Connoisseur",
  "Tide Turner",
  "Wave Rider",
  "Palm Shader",
  "Monsoon Deployer",
  "Spice Route Architect",
  "Feni Sommelier",
  "Azulejo Artisan",
  "Sand Compiler",
  "Reef Explorer",
  "Lagoon Swimmer",
  "Shell Scripter",
  "Lighthouse Keeper",
  "Trawler Captain",
  "Port Scanner",
  "Sunset Renderer",
  "Chai Debugger",
  "Hammock Strategist",
  "Breeze Optimizer",
  "Gecko Whisperer",
  "Cashew Crusher",
  "Saudade Coder",
  "Paddy Field Parser",
  "Church Bell Listener",
  "Dune Crawler",
];

let lastTitle = "";

export function generateBuilderTitle(): string {
  let title: string;
  let attempts = 0;

  do {
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const core = cores[Math.floor(Math.random() * cores.length)];
    title = `${prefix} ${core}`;
    attempts++;
  } while (title === lastTitle && attempts < 10);

  lastTitle = title;
  return title;
}

export const STACK_OPTIONS = [
  "Frontend",
  "Backend",
  "Full-Stack",
  "AI / ML",
  "Design",
  "Web3",
  "DevOps",
  "Mobile",
  "Data",
  "Security",
  "Other",
];
