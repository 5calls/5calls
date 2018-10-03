import { Action } from 'redux';
import { CallStateAction } from './index';

export enum CallStateActionType {
  CURRENT_ISSUE_SELECTED = 'CURRENT_ISSUE_SELECTED',
  COMPLETE_ISSUE = 'COMPLETE_ISSUE',
  NEXT_CONTACT = 'NEXT_CONTACT',
  SET_CONTACT_IDS = 'SET_CONTACT_IDS',
  SET_SHOW_FIELD_OFFICE_NUMBERS = 'SET_SHOW_FIELD_OFFICE_NUMBERS',
  CLEAR_CONTACT_INDEXES = 'CLEAR_CONTACT_INDEXES',
}

export interface CallStateAction extends Action {
  type: CallStateActionType;
  payload?: {};
}

/*
  REDUX DATA FLOW 2: Here we define the TypeScript action type that will be returned from the selectIssueActionCreator
  The type string 'CURRENT_ISSUE_SELECTED', must be in the CallStateActionType enum above.
  See /src/redux/callState/actionCreator.ts for next step(3) in Redux Data Flow
*/
export interface CurrentIssueAction extends CallStateAction {
  type: CallStateActionType.CURRENT_ISSUE_SELECTED;
  payload: string;
}

export interface CompleteIssueAction extends CallStateAction {
  type: CallStateActionType.COMPLETE_ISSUE;
  payload?: string;
}

export interface NextContact extends CallStateAction {
  type: CallStateActionType.NEXT_CONTACT;
}

export interface SetContactIdsAction extends CallStateAction {
  type: CallStateActionType.SET_CONTACT_IDS;
  payload: string[];
}

export interface SetShowFieldOfficeNumbers extends CallStateAction {
  type: CallStateActionType.SET_SHOW_FIELD_OFFICE_NUMBERS;
  payload: boolean;
}

export interface ClearContactIndexesAction extends CallStateAction {
  type: CallStateActionType.CLEAR_CONTACT_INDEXES;
}
