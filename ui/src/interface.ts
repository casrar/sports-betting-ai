export interface Game {
  id: string;
  date: string;
  status: string;
  start_time_unix: number;
  location: Location;
  home_team: Team;
  away_team: Team;
  odds: Odds[];
}

export interface Location {
  name: string;
  city: string;
  state: string;
}

export interface Team {
  id: number;
  city: string;
  name: string;
  score: Score;
  wins: number;
  losses: number;
  abbreviation: string;
  seed: number;
  leader: Leader;
  injuries: Injury[];
}

export interface Score {
  points: number;
  periods: Period[];
}

export interface Period {
  period: number;
  period_type: string;
  score: number;
}

export interface Leader {
  name: string;
  points: number;
  rebounds: number;
  assists: number;
}

export interface Injury {
  player: string;
  team: string;
  position: string;
  injury: string;
  status: string;
}

export interface Odds {
  book_name: string;
  home_money_line: number;
  away_money_line: number;
  over_under: number;
  num_bets: number;
}