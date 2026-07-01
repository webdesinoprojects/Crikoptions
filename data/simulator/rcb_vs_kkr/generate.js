/**
 * Generates realistic RCB vs KKR T20 ball-by-ball CSV datasets (both innings).
 * Run: node generate.js
 */

const fs = require("fs");
const path = require("path");

const MATCH_ID = "0000000000000000000000bb";
const DELAY_SEC = 7;
const TOTAL_LEGAL_BALLS = 120;

const TEAM_A = "RCB";
const TEAM_B = "KKR";

// ── Innings 1: RCB bat, KKR bowl ────────────────────────────────────────────
const RCB_OPENERS = { striker: "Virat Kohli", nonStriker: "Faf du Plessis" };
const RCB_BATSMEN = [
  "Virat Kohli", "Faf du Plessis", "Rajat Patidar", "Glenn Maxwell",
  "Cameron Green", "Dinesh Karthik", "Mahipal Lomror", "Karn Sharma",
  "Mohammed Siraj", "Lockie Ferguson", "Yash Dayal",
];
const KKR_BOWLERS = [
  "Mitchell Starc", "Andre Russell", "Sunil Narine", "Varun Chakravarthy",
  "Harshit Rana", "Venkatesh Iyer", "Nitish Rana", "Rinku Singh",
];

// RCB vs KKR — distinct storyline from CSK vs MI (205/206):
// Innings 1: RCB 177/8 — spin-heavy middle, lower par score
// Innings 2: KKR chase 178/5 — Salt + Russell + Rinku, win ~19 overs

const INNINGS1_PHASES = [
  { outcomes: [
    // Powerplay — cautious 32/1
    [0, null, false], [1, null, false], [2, null, false], [0, null, false], [1, null, false], [4, null, false],
    [0, null, false], [1, null, false], [0, null, false], [2, null, false], [1, null, false], [0, null, false],
    [1, null, false], [0, null, false], [4, null, false], [1, null, false], [0, null, true, "caught"], [1, null, false],
    // Middle — Narine strangles, 2 more wickets
    [2, null, false], [0, null, false], [1, null, false], [0, null, false], [2, null, false], [1, null, false],
    [0, null, false], [0, null, false], [1, null, false], [4, null, false], [0, null, false], [1, null, false],
    [2, null, false], [0, null, true, "bowled"], [1, null, false], [0, null, false], [1, null, false], [2, null, false],
    [0, null, false], [1, null, false], [0, null, false], [1, "wide", false], [0, null, false], [2, null, false],
    [1, null, false], [0, null, false], [4, null, false], [1, null, false], [0, null, true, "caught"], [2, null, false],
    // Overs 8–12 — Maxwell/Green repair (accelerate)
    [0, null, false], [1, null, false], [4, null, false], [1, null, false], [2, null, false], [0, null, false],
    [1, null, false], [4, null, false], [6, null, false], [1, null, false], [0, null, true, "lbw"], [1, null, false],
    [2, null, false], [0, null, false], [1, null, false], [6, null, false], [4, null, false], [1, null, false],
    [2, null, false], [1, null, false], [0, null, false], [4, null, false], [1, null, false], [0, null, true, "caught"],
    // Overs 13–16 — Patidar anchors, one more wicket
    [1, null, false], [2, null, false], [4, null, false], [1, null, false], [0, null, false], [4, null, false],
    [1, null, false], [0, null, false], [2, null, false], [1, null, false], [6, null, false], [1, null, false],
    [0, null, true, "caught"], [1, null, false], [2, null, false], [4, null, false], [1, null, false], [4, null, false],
    [0, null, false], [1, null, false], [2, null, false], [0, null, false], [1, null, false], [0, null, true, "bowled"],
    // Death — Karthik + tail scrape to ~192
    [1, null, false], [4, null, false], [2, null, false], [1, null, false], [6, null, false], [0, null, false],
    [1, null, false], [2, null, false], [4, null, false], [1, null, false], [0, null, false], [2, null, false],
    [1, null, false], [4, null, false], [1, null, false], [4, null, false], [0, null, true, "caught"], [1, null, false],
    [2, null, false], [0, null, false], [1, null, false], [4, null, false], [2, null, false], [1, null, false],
    [0, null, false], [4, null, false], [1, null, false], [2, null, false], [0, null, false], [1, null, false],
  ]},
];

// ── Innings 2: KKR chase, RCB bowl ──────────────────────────────────────────
const KKR_OPENERS = { striker: "Phil Salt", nonStriker: "Sunil Narine" };
const KKR_BATSMEN = [
  "Phil Salt", "Sunil Narine", "Venkatesh Iyer", "Nitish Rana",
  "Andre Russell", "Rinku Singh", "Mitchell Starc", "Varun Chakravarthy",
  "Harshit Rana", "Ramandeep Singh", "Anukul Roy",
];
const RCB_BOWLERS = [
  "Mohammed Siraj", "Yash Dayal", "Lockie Ferguson", "Glenn Maxwell",
  "Karn Sharma", "Cameron Green", "Mahipal Lomror", "Rajat Patidar",
];

// KKR chase 179 — Salt blitz, Russell/Rinku close it out (4 wickets, ~19 overs)

const INNINGS2_PHASES = [
  { outcomes: [
    // PP — Salt 42 off 18
    [2, null, false], [1, null, false], [0, null, false], [4, null, false], [1, null, false], [0, null, false],
    [1, null, false], [2, null, false], [0, null, false], [1, null, false], [4, null, false], [1, null, false],
    [6, null, false], [0, null, false], [1, null, false], [2, null, false], [0, null, false], [1, null, false],
    // Middle — wicket, rebuild
    [0, null, true, "caught"], [1, null, false], [2, null, false], [0, null, false], [1, null, false], [4, null, false],
    [0, null, false], [1, null, false], [2, null, false], [0, null, false], [1, "wide", false], [0, null, false],
    [1, null, false], [2, null, false], [0, null, false], [1, null, false], [4, null, false], [1, null, false],
    // Overs 7–12 — Iyer/Rana build platform
    [1, null, false], [4, null, false], [2, null, false], [1, null, false], [4, null, false], [6, null, false],
    [1, null, false], [0, null, false], [2, null, false], [1, null, false], [0, null, true, "bowled"], [1, null, false],
    [4, null, false], [6, null, false], [1, null, false], [2, null, false], [1, null, false], [4, null, false],
    [1, null, false], [4, null, false], [2, null, false], [1, null, false], [0, null, false], [1, null, false],
    // Overs 13–16 — Russell blitz, two wickets
    [1, null, false], [6, null, false], [4, null, false], [1, null, false], [6, null, false], [2, null, false],
    [0, null, true, "caught"], [1, null, false], [2, null, false], [4, null, false], [1, null, false], [4, null, false],
    [1, null, false], [0, null, false], [2, null, false], [1, null, false], [0, null, false], [1, null, false],
    [4, null, false], [1, null, false], [0, null, true, "caught"], [2, null, false], [1, null, false], [4, null, false],
    // Death — Rinku finishes chase (38 needed off ~24)
    [4, null, false], [6, null, false], [1, null, false], [2, null, false], [4, null, false], [1, null, false],
    [6, null, false], [4, null, false], [1, null, false], [2, null, false], [4, null, false], [1, null, false],
    [6, null, false], [1, null, false], [4, null, false], [2, null, false], [1, null, false], [4, null, false],
    [6, null, false], [2, null, false], [1, null, false], [4, null, false], [1, null, false], [2, null, false],
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
  const bowlingTeam = chase ? TEAM_A : TEAM_B;
  const chasingTeam = TEAM_B;

  if (extra === "wide") {
    return `Wide from ${bowler}, pressure on the bowler in the chase`;
  }
  if (extra === "noball") return `No-ball from ${bowler}, free hit for ${striker}`;
  if (isWicket) {
    const map = {
      caught: `${striker} holes out — huge moment in the chase`,
      bowled: `${striker} bowled by ${bowler}! ${bowlingTeam} strike back`,
      lbw: `${striker} trapped lbw by ${bowler}`,
      run_out: `Run out! ${striker} short of the crease`,
      stumped: `${striker} stumped off ${bowler}`,
    };
    return map[wicketType] || `${striker} is out`;
  }
  if (isSix) {
    return chase
      ? `${striker} SIX! ${chasingTeam} need ${chase.runsNeeded} off ${chase.ballsLeft} now`
      : `${striker} launches ${bowler} over long-on for SIX!`;
  }
  if (isFour) {
    return chase
      ? `${striker} crunching cover drive — ${chasingTeam} closing in on ${chase.target}`
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
      events[events.length - 1].commentary =
        `${TEAM_B} WIN! ${striker} finishes the chase — ${score}/${wickets} with ${ballsLeft} balls to spare`;
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
    openers: RCB_OPENERS,
    batsmen: RCB_BATSMEN,
    bowlers: KKR_BOWLERS,
    phases: INNINGS1_PHASES,
  });

  const target = inn1.score + 1;

  const inn2 = generateInnings({
    innings: 2,
    openers: KKR_OPENERS,
    batsmen: KKR_BATSMEN,
    bowlers: RCB_BOWLERS,
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
      match_id: MATCH_ID, team_a: TEAM_A, team_b: TEAM_B, format: "T20", innings: 1,
      replay_interval_sec: DELAY_SEC,
      start_striker: RCB_OPENERS.striker, start_non_striker: RCB_OPENERS.nonStriker,
      start_bowler: KKR_BOWLERS[0], batting_team: TEAM_A, bowling_team: TEAM_B,
      status_on_start: "live", target_score: 0, script_name: "rcb_vs_kkr_innings1_v1",
    },
    {
      match_id: MATCH_ID, team_a: TEAM_A, team_b: TEAM_B, format: "T20", innings: 2,
      replay_interval_sec: DELAY_SEC,
      start_striker: KKR_OPENERS.striker, start_non_striker: KKR_OPENERS.nonStriker,
      start_bowler: RCB_BOWLERS[0], batting_team: TEAM_B, bowling_team: TEAM_A,
      status_on_start: "live", target_score: target, script_name: "rcb_vs_kkr_innings2_v1",
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

  console.log(`Innings 1 (${TEAM_A}): ${inn1.score}/${inn1.wickets} in ${oversText(inn1.legalBowled)} overs (${inn1.events.length} events)`);
  console.log(`Innings 2 (${TEAM_B} chase): ${inn2.score}/${inn2.wickets} — target ${target} (${inn2.events.length} events)`);
  console.log(`Match result: ${inn2.score >= target ? `${TEAM_B} won` : `${TEAM_A} defended`}`);
  console.log("Written: matches_config.csv, ball_events_innings1.csv, ball_events_innings2.csv, ball_events_full_match.csv");
}

main();
