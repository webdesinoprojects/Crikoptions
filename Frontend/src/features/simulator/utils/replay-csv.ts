import type { ReplayDataset, ReplayEvent, ReplayMatchKey } from "../types";

const REQUIRED_COLUMNS = ["innings", "over", "ball", "event", "runs", "score", "wickets"] as const;
const TOTAL_BALLS = 120;

export function parseReplayCsv(source: string, matchKey: ReplayMatchKey): ReplayDataset {
  const table = parseCsvTable(source);
  if (table.length < 2) {
    throw new Error("CSV data unavailable or empty");
  }

  const headers = table[0].map((header) => normalizeHeader(header));
  const headerIndex = new Map(headers.map((header, index) => [header, index]));
  const missing = REQUIRED_COLUMNS.filter((column) => !headerIndex.has(column));
  if (missing.length > 0) {
    throw new Error(`CSV missing required columns: ${missing.join(", ")}`);
  }

  const events = table
    .slice(1)
    .map((row, index) => normalizeReplayRow(row, headerIndex, matchKey, index + 2))
    .filter((event): event is ReplayEvent => Boolean(event))
    .sort((left, right) => {
      if (left.innings !== right.innings) return left.innings - right.innings;
      return left.legalBallNumber - right.legalBallNumber;
    });

  if (events.length === 0) {
    throw new Error("CSV does not contain valid replay events");
  }

  const firstInningsEvents = events.filter((event) => event.innings === 1);
  const firstInningsFinalScore = firstInningsEvents.at(-1)?.currentScore;
  if (firstInningsFinalScore === undefined) {
    throw new Error("CSV must contain first innings events");
  }

  return {
    matchKey,
    events,
    innings: Array.from(new Set(events.map((event) => event.innings))).sort(),
    firstInningsFinalScore,
  };
}

function normalizeReplayRow(
  row: string[],
  headerIndex: Map<string, number>,
  matchKey: ReplayMatchKey,
  lineNumber: number
): ReplayEvent | null {
  if (row.every((cell) => cell.trim() === "")) return null;

  const innings = readNumber(row, headerIndex, "innings", lineNumber);
  const over = readNumber(row, headerIndex, "over", lineNumber);
  const ball = readNumber(row, headerIndex, "ball", lineNumber);
  const runs = readNumber(row, headerIndex, "runs", lineNumber);
  const currentScore = readNumber(row, headerIndex, "score", lineNumber);
  const wicketsLost = readNumber(row, headerIndex, "wickets", lineNumber);
  const event = readString(row, headerIndex, "event").toUpperCase();

  if (innings !== 1 && innings !== 2) {
    throw new Error(`CSV line ${lineNumber}: innings must be 1 or 2`);
  }
  if (over < 1 || ball < 1 || ball > 6) {
    throw new Error(`CSV line ${lineNumber}: over/ball must describe a legal delivery`);
  }
  if (wicketsLost < 0 || wicketsLost > 10) {
    throw new Error(`CSV line ${lineNumber}: wickets must be between 0 and 10`);
  }

  const legalBallNumber = (over - 1) * 6 + ball;
  if (legalBallNumber < 1 || legalBallNumber > TOTAL_BALLS) {
    throw new Error(`CSV line ${lineNumber}: derived ball number is outside a T20 innings`);
  }

  return {
    id: `${matchKey}-${innings}-${legalBallNumber}`,
    matchKey,
    innings,
    over,
    ball,
    event,
    runs,
    currentScore,
    wicketsLost,
    legalBallNumber,
    ballsLeft: TOTAL_BALLS - legalBallNumber,
    ballsBowled: legalBallNumber,
    battingTeam: readOptionalString(row, headerIndex, "batting_team"),
    bowlingTeam: readOptionalString(row, headerIndex, "bowling_team"),
  };
}

function readNumber(row: string[], headerIndex: Map<string, number>, key: string, lineNumber: number) {
  const raw = readString(row, headerIndex, key);
  const value = Number(raw);
  if (!Number.isFinite(value)) {
    throw new Error(`CSV line ${lineNumber}: ${key} must be numeric`);
  }
  return value;
}

function readString(row: string[], headerIndex: Map<string, number>, key: string) {
  const index = headerIndex.get(key);
  return index === undefined ? "" : (row[index] ?? "").trim();
}

function readOptionalString(row: string[], headerIndex: Map<string, number>, key: string) {
  const value = readString(row, headerIndex, key);
  return value || undefined;
}

function normalizeHeader(value: string) {
  return value.trim().replace(/^\uFEFF/, "").toLowerCase();
}

function parseCsvTable(source: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    const next = source[index + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        cell += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(cell);
      cell = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(cell);
      if (row.some((value) => value.trim() !== "")) rows.push(row);
      row = [];
      cell = "";
      continue;
    }

    cell += char;
  }

  row.push(cell);
  if (row.some((value) => value.trim() !== "")) rows.push(row);

  return rows;
}
