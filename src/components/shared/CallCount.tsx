import * as React from 'react';
import { TranslationFunction } from 'i18next';
import { translate } from 'react-i18next';
import { formatNumber } from '../shared/utils';

export interface Props {
  readonly totalCount: number;
  // readonly large: boolean;
  readonly minimal?: boolean;
  readonly t: TranslationFunction;
}

export const CallCount: React.StatelessComponent<Props> = (props: Props) => {
  let callGoal = 100;
  if (props.totalCount >= 100) {
    callGoal = 500;
  }
  if (props.totalCount >= 500) {
    callGoal = 1000;
  }
  if (props.totalCount >= 1000) {
    callGoal = 5000;
  }
  if (props.totalCount >= 5000) {
    callGoal = 10000;
  }
  if (props.totalCount >= 10000) {
    callGoal = 50000;
  }
  if (props.totalCount >= 50000) {
    callGoal = 100000;
  }
  if (props.totalCount >= 100000) {
    callGoal = 500000;
  }
  if (props.totalCount >= 500000) {
    callGoal = 1000000;
  }
  if (props.totalCount >= 1000000) {
    callGoal = 2000000;
  }
  if (props.totalCount >= 2000000) {
    callGoal = 5000000;
  }

  const pctDone = (props.totalCount / callGoal) * 100;
  const pctStyle = {width: `${pctDone}%`};    

  const callText = props.minimal ?
    `${formatNumber(props.totalCount)} Calls`
    :
    `Together we've made ${formatNumber(props.totalCount)} Calls!`;

  return (
    <div>
      <div className="progress progress__large">
        <p className="totaltext">{callText}</p>
        <span className="progress__border">&nbsp;</span>
        <span className="progress__goal">{formatNumber(callGoal)}</span>
        <span style={pctStyle} className="progress__total" />
      </div>
    </div>
  );
};

export default translate()(CallCount);
