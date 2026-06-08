export interface Player {
  id: string;
  name: string;
  teamId: string;
  role: "Batsman" | "Bowler" | "All-Rounder" | "Wicket-Keeper";
  image?: string;
}
