import * as React from 'react';
import i18n from '../../services/i18n';
import { Issue, CacheableGroup } from '../../common/model';
import { IssuesListTranslatable } from '../issues';

interface Props {
  readonly issues: Issue[];
  readonly currentIssue?: Issue;
  readonly currentGroup?: CacheableGroup;
  readonly completedIssueIds: string[];
  readonly onSelectIssue: (issueId: string) => void;
}

const Sidebar: React.StatelessComponent<Props> = (props: Props) => {
  return (
    <IssuesListTranslatable
      issues={props.issues}
      currentIssue={props.currentIssue}
      currentGroup={props.currentGroup}
      completedIssueIds={props.completedIssueIds}
      onSelectIssue={props.onSelectIssue}
      t={i18n.t}
    />
  );
};

export default Sidebar;
