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
  // numberContactsLeft: number; // removing this... I think we used it for internal communication
  location?: string; // added in submitOutcome()
  contactId: string;
  via?: string; // added in submitOutcome()
  userId?: string; // added in submitOutcome()
}
