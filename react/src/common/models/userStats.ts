export interface UserCallDetails {
  stats: UserStats;
  weeklyStreak: number;
  firstCallTime: number;
  calls: DailyCallReport[];
}

export interface DailyCallReport {
  date: string;
  issues: IssueSummary[];
}

export interface IssueSummary {
  count: number;
  issue_name: string;
}

export interface UserStats {
  voicemail: number;
  unavailable: number;
  contact: number;
}
