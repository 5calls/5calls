import * as React from 'react';
import { TranslationFunction } from 'i18next';
import { translate } from 'react-i18next';
import { Link } from 'react-router-dom';
import { find } from 'lodash';
import { Issue, Group } from '../../common/model';
import { IssuesListItem } from './index';

interface Props {
  readonly issues: Issue[];
  readonly currentIssue?: Issue;
  readonly currentGroup?: Group;
  readonly completedIssueIds: string[];
  readonly t: TranslationFunction;
  readonly onSelectIssue: (issueId: string) => void;
}

export const IssuesList: React.StatelessComponent<Props> = (props: Props) => {
  let currentIssueId: string = props.currentIssue ? props.currentIssue.id : '';

  const listFooter = () => {
    if (!props.currentGroup) {
      return (
        <li>
          <Link
            to={`/more`}
            className={`issues__footer-link`}
          >
            <span>{props.t('issues.viewAllActiveIssues')}</span>
          </Link>
        </li>
      );
    } else {
      return <span />;
    }
  };

  const listItems = () => {
    if (props.currentGroup && props.issues.length === 0) {
      return <li><a className="issues__footer-link"><span>Getting your team calls...</span></a></li>;
    } else if (props.issues && props.issues.map) {
      return props.issues.map(issue =>
        (
        <IssuesListItem
          key={issue.id}
          issue={issue}
          isIssueComplete={
            props.completedIssueIds &&
            (find(props.completedIssueIds, (issueId: string) => issue.id === issueId) !== undefined)
          }
          isIssueActive={currentIssueId === issue.id}
          currentGroup={props.currentGroup}
          onSelectIssue={props.onSelectIssue}
        />
      ));
    } else {
      return <div style={{ textAlign: 'center' }}>{props.t('noCalls.title')}</div>;
    }
  };

  return (
    <ul className="issues-list" role="navigation">
      {listItems()}
      {listFooter()}
    </ul>
  );
};

export const IssuesListTranslatable = translate()(IssuesList);
