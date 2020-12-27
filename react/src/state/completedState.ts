import React from "react";

export type CompletionMap = { [issueID: number]: number };

export const CompletedContext = React.createContext<WithCompletedProps>({
  completed: undefined,
  setCompleted: () => {},
  setNeedsCompletionFetch: () => {},
});

export interface CompletedState {
  needsCompletionFetch: boolean;
  completed: CompletionMap;
}

export type WithCompletedProps = {
  completed?: CompletedState;
  setCompleted(completed: CompletionMap): void;
  setNeedsCompletionFetch(needsRefresh: boolean): void;
};
