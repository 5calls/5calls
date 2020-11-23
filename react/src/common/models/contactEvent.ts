export interface UserContactEvent {
  contactid: string;
  issueid: string;
  result: UserOutcomeResult;
  time: number;
  uploaded: boolean;
}

export type UserOutcomeResult = UserContactEventType | string;

export enum UserContactEventType {
  UNAVAILABLE = "unavailable",
  VOICEMAIL = "voicemail",
  CONTACT = "contact",
  SKIP = "skip",
}

export interface Outcome {
  label: string;
  status: string;
}

export interface Outcome {
  label: string;
  status: string;
}

export interface OutcomeData {
  outcome: UserOutcomeResult;
  issueId: string;
  numberContactsLeft: number;
  location?: string; // added in submitOutcome()
  contactId: string;
  via?: string; // added in submitOutcome()
  userId?: string; // added in submitOutcome()
}
