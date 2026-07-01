/**
 * Generates realistic CSK vs MI T20 ball-by-ball CSV datasets (both innings).
 * Run: node generate.js
 */

const fs = require("fs");
const path = require("path");

const MATCH_ID = "0000000000000000000000aa";
const DELAY_SEC = 7;
const TOTAL_LEGAL_BALLS = 120;

// ── Innings 1: CSK bat, MI bowl ─────────────────────────────────────────────
const CSK_OPENERS = { striker: "Ruturaj Gaikwad", nonStriker: "Devon Conway" };
const CSK_BATSMEN = [
  "Ruturaj Gaikwad", "Devon Conway", "Ajinkya Rahane", "Shivam Dube",
  "Ravindra Jadeja", "MS Dhoni", "Deepak Chahar", "Maheesh Theekshana",
  "Mitchell Santner", "Tushar Deshpande", "Mustafizur Rahman",
];
const MI_BOWLERS = [
  "Jasprit Bumrah", "Jason Behrendorff", "Hardik Pandya", "Piyush Chawla",
  "Gerald Coetzee", "Tim David", "Rohit Sharma", "Tilak Varma",
];

const INNINGS1_PHASES = [
  { outcomes: [
    [0, null, false], [1, null, false], [4, null, false], [6, null, false],
    [2, null, false], [0, null, false], [1, null, false], [4, null, false],
    [0, null, false], [1, null, false], [6, null, false], [0, null, false],
    [1, null, false], [4, null, false], [2, null, false], [0, null, false],
    [1, "wide", false], [0, null, false], [4, null, false], [1, null, false],
    [6, null, false], [2, null, false], [0, null, false], [1, null, false],
    [0, null, true, "caught"], [1, null, false], [4, null, false], [2, null, false],
    [0, null, false], [6, null, false], [1, null, false], [0, null, false],
    [4, null, false], [1, null, false], [2, null, false], [0, null, false],
    [0, null, false], [1, null, false], [0, null, false], [2, null, false],
    [1, null, false], [4, null, false], [0, null, false], [1, null, false],
    [0, null, true, "bowled"], [1, null, false], [2, null, false], [0, null, false],
    [1, null, false], [4, null, false], [0, null, false], [1, null, false],
    [2, null, false], [0, null, false], [6, null, false], [1, null, false],
    [0, null, false], [1, null, false], [4, null, false], [0, null, false],
    [2, null, false], [1, null, false], [0, null, true, "caught"], [1, null, false],
    [4, null, false], [2, null, false], [0, null, false], [1, null, false],
    [6, null, false], [1, null, false], [0, null, false], [2, null, false],
    [1, null, false], [4, null, false], [1, null, false], [0, null, false],
    [2, null, false], [1, null, false], [4, null, false], [0, null, false],
    [1, null, false], [2, null, false], [0, null, true, "caught"], [1, null, false],
    [4, null, false], [1, null, false], [0, null, false], [2, null, false],
    [1, null, false], [4, null, false], [0, null, false], [1, null, false],
    [2, null, false], [1, null, false], [0, null, false], [1, null, false],
    [4, null, false], [1, null, false], [2, null, false], [1, null, false],
    [0, null, false], [4, null, false], [1, null, false], [2, null, false],
    [0, null, true, "caught"], [1, null, false], [4, null, false], [2, null, false],
    [6, null, false], [1, null, false], [0, null, false], [4, null, false],
    [2, null, false], [1, null, false], [6, null, false], [1, null, false],
    [0, null, false], [2, null, false], [4, null, false], [1, null, false],
    [0, null, false], [2, null, false], [4, null, false], [1, null, false],
    [0, null, false], [1, null, false], [0, null, false], [2, null, false],
    [1, null, false], [4, null, false], [0, null, false], [1, null, false],
  ]},
];

// ── Innings 2: MI chase 206, CSK bowl ───────────────────────────────────────
const MI_OPENERS = { striker: "Rohit Sharma", nonStriker: "Ishan Kishan" };
const MI_BATSMEN = [
  "Rohit Sharma", "Ishan Kishan", "Suryakumar Yadav", "Tilak Varma",
  "Hardik Pandya", "Tim David", "Gerald Coetzee", "Piyush Chawla",
  "Jasprit Bumrah", "Jason Behrendorff", "Akash Madhwal",
];
const CSK_BOWLERS = [
  "Deepak Chahar", "Tushar Deshpande", "Ravindra Jadeja", "Maheesh Theekshana",
  "Mitchell Santner", "Mustafizur Rahman", "Ajinkya Rahane", "Shivam Dube",
];

// Chase script: steady start → acceleration → tight finish, win with 2 balls left
const INNINGS2_PHASES = [
  { outcomes: [
    [1, null, false], [0, null, false], [4, null, false], [1, null, false],
    [0, null, false], [2, null, false], [1, null, false], [4, null, false],
    [0, null, false], [1, null, false], [6, null, false], [0, null, false],
    [1, null, false], [4, null, false], [2, null, false], [0, null, false],
    [1, "wide", false], [0, null, false], [1, null, false], [4, null, false],
    [2, null, false], [0, null, false], [1, null, false], [0, null, true, "caught"],
    [1, null, false], [4, null, false], [2, null, false], [1, null, false],
    [0, null, false], [6, null, false], [1, null, false], [0, null, false],
    [4, null, false], [1, null, false], [2, null, false], [0, null, false],
    [1, null, false], [0, null, false], [4, null, false], [1, null, false],
    [2, null, false], [0, null, false], [1, null, false], [4, null, false],
    [0, null, true, "bowled"], [1, null, false], [2, null, false], [0, null, false],
    [1, null, false], [4, null, false], [0, null, false], [1, null, false],
    [6, null, false], [2, null, false], [0, null, false], [1, null, false],
    [4, null, false], [1, null, false], [0, null, true, "caught"], [2, null, false],
    [1, null, false], [0, null, false], [4, null, false], [1, null, false],
    [2, null, false], [1, null, false], [4, null, false], [0, null, false],
    [1, null, false], [6, null, false], [2, null, false], [0, null, false],
    [1, null, false], [4, null, false], [0, null, true, "caught"], [1, null, false],
    [2, null, false], [1, null, false], [0, null, false], [4, null, false],
    [1, null, false], [2, null, false], [0, null, false], [1, null, false],
    [4, null, false], [1, null, false], [0, null, false], [2, null, false],
    [1, null, false], [0, null, true, "caught"], [4, null, false], [1, null, false],
    [2, null, false], [1, null, false], [0, null, false], [1, null, false],
    [4, null, false], [2, null, false], [6, null, false], [1, null, false],
    [0, null, false], [4, null, false], [2, null, false], [1, null, false],
    [6, null, false], [4, null, false], [1, null, false], [2, null, false],
    [0, null, false], [1, null, false], [4, null, false], [0, null, false],
    [2, null, false], [1, null, false], [4, null, false], [1, null, false],
    [0, null, false], [6, null, false], [1, null, false], [4, null, false],
    [2, null, false], [1, null, false], [0, null, false], [1, null, false],
    [4, null, false], [2, null, false], [1, null, false], [0, null, false],
    [1, null, false], [4, null, false], [2, null, false], [1, null, false],
    [0, null, false], [4, null, false], [1, null, false], [2, null, false],
    [6, null, false], [1, null, false], [0, null, false], [4, null, false],
    [1, null, false], [2, null, false], [0, null, false], [1, null, false],
  ]},
];

function oversText(ballsBowled) {
  const overs = Math.floor(ballsBowled / 6);
  const balls = ballsBowled % 6;
  return `${overs}.${balls}`;
}

function flatOutcomes(phases) {
  return phases.flatMap((p) => p.outcomes);
}

function commentary(striker, bowler, runsOffBat, extra, isWicket, wicketType, isFour, isSix, chase) {
  if (extra === "wide") return `Wide from ${bowler}, pressure on the bowler in the chase`;
  if (extra === "noball") return `No-ball from ${bowler}, free hit for ${striker}`;
  if (isWicket) {
    const map = {
      caught: `${striker} holes out — huge moment in the chase`,
      bowled: `${striker} bowled by ${bowler}! CSK strike back`,
      lbw: `${striker} trapped lbw by ${bowler}`,
      run_out: `Run out! ${striker} short of the crease`,
      stumped: `${striker} stumped off ${bowler}`,
    };
    return map[wicketType] || `${striker} is out`;
  }
  if (isSix) {
    return chase
      ? `${striker} SIX! MI need ${chase.runsNeeded} off ${chase.ballsLeft} now`
      : `${striker} launches ${bowler} over long-on for SIX!`;
  }
  if (isFour) {
    return chase
      ? `${striker} crunching cover drive — MI closing in on ${chase.target}`
      : `${striker} finds the gap, races away for four`;
  }
  if (runsOffBat === 0) return `Dot ball, ${bowler} to ${striker}`;
  if (runsOffBat === 1) return `Quick single, ${striker} keeps strike rotating`;
  if (runsOffBat === 2) return `${striker} pushes for two in the deep`;
  if (runsOffBat === 3) return `Brilliant running — three to ${striker}`;
  return `${striker} takes ${runsOffBat}`;
}

function csvEscape(val) {
  if (val === null || val === undefined) return "";
  const s = String(val);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function generateInnings({
  innings,
  openers,
  batsmen,
  bowlers,
  phases,
  targetScore = 0,
  chaseMode = false,
}) {
  let striker = openers.striker;
  let nonStriker = openers.nonStriker;
  let bowlerIndex = 0;
  let currentBowler = bowlers[bowlerIndex];
  let nextBatsmanIndex = 2;

  let score = 0;
  let wickets = 0;
  let legalBowled = 0;
  let eventSeq = 0;
  let legalInCurrentOver = 0;
  let scriptIndex = 0;

  const outcomes = flatOutcomes(phases);
  const events = [];

  while (legalBowled < TOTAL_LEGAL_BALLS && wickets < 10) {
    if (chaseMode && score >= targetScore) break;

    const [runsOffBat, extra, isWicket, wicketType = ""] = outcomes[scriptIndex % outcomes.length];
    scriptIndex += 1;

    const isLegal = !extra;
    const extraRuns = extra === "wide" || extra === "noball" ? 1 : 0;
    const totalRuns = isWicket ? 0 : runsOffBat + extraRuns;
    const isFour = !isWicket && runsOffBat === 4;
    const isSix = !isWicket && runsOffBat === 6;

    eventSeq += 1;

    let nextBatter = "";
    if (isWicket) {
      nextBatter = batsmen[nextBatsmanIndex] ?? `Batter ${nextBatsmanIndex + 1}`;
      nextBatsmanIndex += 1;
    }

    score += totalRuns;
    if (isWicket) wickets += 1;
    if (isLegal) {
      legalBowled += 1;
      legalInCurrentOver += 1;
      if (legalInCurrentOver > 6) legalInCurrentOver = 1;
    }

    const ballsAfter = legalBowled;
    const oversAfter = oversText(ballsAfter);
    const ballsLeft = TOTAL_LEGAL_BALLS - ballsAfter;
    const runsNeeded = chaseMode ? Math.max(0, targetScore - score) : 0;

    const chaseInfo = chaseMode
      ? { target: targetScore, runsNeeded, ballsLeft }
      : null;

    const chaseWon = chaseMode && score >= targetScore;
    const inningsDone =
      ballsAfter >= TOTAL_LEGAL_BALLS || wickets >= 10 || chaseWon;

    events.push({
      match_id: MATCH_ID,
      event_seq: eventSeq,
      innings,
      runs: totalRuns,
      is_wicket: isWicket,
      extra: extra ?? "",
      striker_name: striker,
      non_striker_name: nonStriker,
      bowler_name: currentBowler,
      next_batter_name: nextBatter,
      wicket_type: isWicket ? wicketType : "",
      delay_sec: DELAY_SEC,
      over: isLegal ? Math.floor((ballsAfter - 1) / 6) + 1 : Math.floor(legalBowled / 6) + 1,
      ball_in_over: isLegal ? ((ballsAfter - 1) % 6) + 1 : legalInCurrentOver || 1,
      is_legal_ball: isLegal,
      runs_off_bat: isWicket ? 0 : runsOffBat,
      extra_runs: extraRuns,
      is_boundary: isFour || isSix,
      is_four: isFour,
      is_six: isSix,
      score_after: score,
      wickets_after: wickets,
      balls_bowled_after: ballsAfter,
      overs_text_after: oversAfter,
      runs_needed_after: runsNeeded,
      target_score: chaseMode ? targetScore : "",
      commentary: commentary(
        striker, currentBowler, runsOffBat, extra, isWicket, wicketType, isFour, isSix, chaseInfo
      ),
      end_innings: inningsDone,
      end_match: chaseMode && chaseWon,
      change_bowler: "",
      swap_strike: false,
    });

    if (chaseWon) {
      events[events.length - 1].commentary = `MI WIN! ${striker} finishes the chase — ${score}/${wickets} with ${ballsLeft} balls to spare`;
      break;
    }

    if (!isWicket && isLegal && runsOffBat % 2 === 1) {
      [striker, nonStriker] = [nonStriker, striker];
    }
    if (isWicket) striker = nextBatter;

    if (isLegal && ballsAfter % 6 === 0 && ballsAfter < TOTAL_LEGAL_BALLS && !chaseWon) {
      [striker, nonStriker] = [nonStriker, striker];
      bowlerIndex = (bowlerIndex + 1) % bowlers.length;
      currentBowler = bowlers[bowlerIndex];
      events[events.length - 1].change_bowler = currentBowler;
      events[events.length - 1].swap_strike = true;
      legalInCurrentOver = 0;
    }
  }

  if (events.length > 0 && !events[events.length - 1].end_innings) {
    events[events.length - 1].end_innings = true;
  }

  return { events, score, wickets, legalBowled };
}

const BALL_HEADERS = [
  "match_id", "event_seq", "innings", "runs", "is_wicket", "extra",
  "striker_name", "non_striker_name", "bowler_name", "next_batter_name", "wicket_type",
  "delay_sec", "over", "ball_in_over", "is_legal_ball", "runs_off_bat", "extra_runs",
  "is_boundary", "is_four", "is_six", "score_after", "wickets_after", "balls_bowled_after",
  "overs_text_after", "runs_needed_after", "target_score", "commentary",
  "end_innings", "end_match", "change_bowler", "swap_strike",
];

function toCsvLines(events) {
  const lines = [BALL_HEADERS.join(",")];
  for (const e of events) {
    lines.push(BALL_HEADERS.map((h) => csvEscape(e[h])).join(","));
  }
  return lines;
}

function main() {
  const inn1 = generateInnings({
    innings: 1,
    openers: CSK_OPENERS,
    batsmen: CSK_BATSMEN,
    bowlers: MI_BOWLERS,
    phases: INNINGS1_PHASES,
  });

  const target = inn1.score + 1;

  const inn2 = generateInnings({
    innings: 2,
    openers: MI_OPENERS,
    batsmen: MI_BATSMEN,
    bowlers: CSK_BOWLERS,
    phases: INNINGS2_PHASES,
    targetScore: target,
    chaseMode: true,
  });

  const fullEvents = [
    ...inn1.events,
    ...inn2.events.map((e, i) => ({ ...e, event_seq: inn1.events.length + i + 1 })),
  ];

  const configHeaders = [
    "match_id", "team_a", "team_b", "format", "innings", "replay_interval_sec",
    "start_striker", "start_non_striker", "start_bowler", "batting_team", "bowling_team",
    "status_on_start", "target_score", "script_name",
  ];

  const configRows = [
    {
      match_id: MATCH_ID, team_a: "CSK", team_b: "MI", format: "T20", innings: 1,
      replay_interval_sec: DELAY_SEC,
      start_striker: CSK_OPENERS.striker, start_non_striker: CSK_OPENERS.nonStriker,
      start_bowler: MI_BOWLERS[0], batting_team: "CSK", bowling_team: "MI",
      status_on_start: "live", target_score: 0, script_name: "csk_vs_mi_innings1_v1",
    },
    {
      match_id: MATCH_ID, team_a: "CSK", team_b: "MI", format: "T20", innings: 2,
      replay_interval_sec: DELAY_SEC,
      start_striker: MI_OPENERS.striker, start_non_striker: MI_OPENERS.nonStriker,
      start_bowler: CSK_BOWLERS[0], batting_team: "MI", bowling_team: "CSK",
      status_on_start: "live", target_score: target, script_name: "csk_vs_mi_innings2_v1",
    },
  ];

  const dir = __dirname;
  fs.writeFileSync(
    path.join(dir, "matches_config.csv"),
    [configHeaders.join(","), ...configRows.map((r) => configHeaders.map((h) => csvEscape(r[h])).join(","))].join("\n") + "\n",
    "utf8"
  );
  fs.writeFileSync(path.join(dir, "ball_events_innings1.csv"), toCsvLines(inn1.events).join("\n") + "\n", "utf8");
  fs.writeFileSync(path.join(dir, "ball_events_innings2.csv"), toCsvLines(inn2.events).join("\n") + "\n", "utf8");
  fs.writeFileSync(path.join(dir, "ball_events.csv"), toCsvLines(inn1.events).join("\n") + "\n", "utf8");
  fs.writeFileSync(path.join(dir, "ball_events_full_match.csv"), toCsvLines(fullEvents).join("\n") + "\n", "utf8");

  console.log(`Innings 1: ${inn1.score}/${inn1.wickets} in ${oversText(inn1.legalBowled)} overs (${inn1.events.length} events)`);
  console.log(`Innings 2: ${inn2.score}/${inn2.wickets} — target ${target} (${inn2.events.length} events)`);
  console.log(`Match result: ${inn2.score >= target ? "MI won" : "CSK defended"}`);
  console.log("Written: matches_config.csv, ball_events_innings1.csv, ball_events_innings2.csv, ball_events_full_match.csv");
}

main();
