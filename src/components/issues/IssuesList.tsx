import * as React from 'react';
import i18n from '../../services/i18n';
import { translate } from 'react-i18next';
import { Link } from 'react-router-dom';
import { find } from 'lodash';
import { Issue } from '../../common/model';
import { IssuesListItem } from './index';

interface Props {
  issues: Issue[];
  currentIssue?: Issue;
  completedIssueIds: string[];
}

export const IssuesList: React.StatelessComponent<Props> = (props: Props) => {
  let currentIssueId: string = props.currentIssue ? props.currentIssue.id : '';

  const listFooter = () => {
    return (
      <li>
        <Link
          to={`/more`}
          className={`issues__footer-link`}
        >
          <span>{i18n.t('issues.viewAllActiveIssues')}</span>
        </Link>
      </li>
    );
  };

  const listItems = () => {
    if (props.issues && props.issues.map) {
      return props.issues.map(issue =>
        (
        <IssuesListItem
          key={issue.id}
          issue={issue}
          isIssueComplete={
            props.completedIssueIds &&
            (find(props.completedIssueIds, (issueId: string) => issue.slug === issueId) !== undefined)
          }
          isIssueActive={currentIssueId === issue.id}
        />
      ));
    } else {
      return <div style={{ textAlign: 'center' }}>{i18n.t('noCalls.title')}</div>;
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
