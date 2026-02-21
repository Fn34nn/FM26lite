
export type Position = 'GK' | 'DEF' | 'MID' | 'ATT';

export interface Player {
  id: string;
  name: string;
  position: Position;
  rating: number; // 1-100
  age: number;
  value: number; // in millions
  wage: number; // weekly
  form: number[]; // last 5 matches ratings
  goals: number;
  assists: number;
  stamina: number; // 0-100
  isInjured?: boolean;
}

export interface TacticalInstructions {
  formation: string;
  style: 'Possession' | 'Counter' | 'Wing Play' | 'Park the Bus' | 'Gegenpress' | 'Tiki-Taka' | 'Catenaccio';
  tempo: number; // 0-100 (Slow -> Fast)
  width: number; // 0-100 (Narrow -> Wide)
  depth: number; // 0-100 (Deep -> High Line)
  aggression: number; // 0-100 (Passive -> Aggressive)
  passingDirectness: number; // 0-100 (Short -> Direct)
  pressingIntensity: number; // 0-100 (Low -> High)
  tackling: 'Stay on Feet' | 'Normal' | 'Get Stuck In';
  offsideTrap: boolean;
  timeWasting: number; // 0-100 (Never -> Always)
  creativeFreedom: number; // 0-100 (Disciplined -> Expressive)
}

export interface FinancialStats {
  income: {
    sponsorship: number;
    transfers: number;
    matchDay: number;
    total: number;
  };
  expenses: {
    wages: number;
    transfers: number;
    total: number;
  };
  history: { week: number; balance: number }[];
}

export interface Team {
  id: string;
  name: string;
  shortName: string;
  logoUrl: string;
  colors: [string, string]; // Primary, Secondary hex
  rating: {
    attack: number;
    midfield: number;
    defense: number;
  };
  budget: number;
  financialStats: FinancialStats;
  players: Player[];
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  points: number;
  tactics: TacticalInstructions;
}

export interface MatchEvent {
  minute: number;
  type: 'goal' | 'card_yellow' | 'card_red' | 'sub' | 'miss' | 'save' | 'injury' | 'big_chance' | 'corner' | 'foul';
  teamId: string;
  playerId?: string;
  description: string;
}

export interface MatchStats {
  homeScore: number;
  awayScore: number;
  homePossession: number; // Percentage 0-100
  awayPossession: number;
  homeShots: number;
  awayShots: number;
  homeOnTarget: number;
  awayOnTarget: number;
  homeXG: number;
  awayXG: number;
  homeCorners: number;
  awayCorners: number;
  homeFouls: number;
  awayFouls: number;
  homeYellows: number;
  awayYellows: number;
  homeReds: number;
  awayReds: number;
}

export interface Match {
  id: string;
  homeTeamId: string;
  awayTeamId: string;
  week: number;
  played: boolean;
  result?: {
    homeScore: number;
    awayScore: number;
  };
  events: MatchEvent[];
  stats: MatchStats; // Made mandatory
}

export interface Message {
  id: string;
  sender: string;
  subject: string;
  content: string;
  date: string;
  read: boolean;
  type: 'info' | 'offer';
  data?: {
    playerId: string;
    amount: number; // Offer amount in M
    offeringTeamId?: string; // If from a specific team
  };
}

export type ViewState = 'dashboard' | 'squad' | 'league' | 'match' | 'setup' | 'results' | 'inbox' | 'transfers';

export type Mentality = 'Park the Bus' | 'Defensive' | 'Balanced' | 'Attacking' | 'All Out Attack';