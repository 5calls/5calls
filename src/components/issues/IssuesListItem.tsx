import * as React from 'react';
import { Link } from 'react-router-dom';
import { Issue, slugOrID } from '../../common/model';
import { selectIssueActionCreator } from '../../redux/callState';

interface Props {
  readonly issue: Issue;
  readonly isIssueComplete: boolean;
  readonly isIssueActive: boolean;
}

interface State { }

export class IssuesListItem extends React.Component<Props, State> {
  render() {
    const isCompleted = this.props.isIssueComplete ? 'is-complete' : '';
    const isActive = this.props.isIssueActive ? 'is-active' : '';
    const issueLink = `/issue/${slugOrID(this.props.issue)}`;

    return (
      <li>
        <Link
          aria-controls="content"
          className={`issues-list__item ${isCompleted} ${isActive}`}
          to={issueLink}
          onClick={() => selectIssueActionCreator(this.props.issue.id)}
        >
          <span aria-live="polite" className={`issues-list__item__status ${isCompleted} ${isActive}`}>
            <span className="visually-hidden" />
          </span>
          <span className={`issues-list__item__title ${isCompleted} ${isActive}`}>
            {this.props.issue.name}
          </span>
          <span className={`issues-list__item__summary ${isCompleted} ${isActive}`}>
            {/* TODO: Finish this impl */}
            <span>X calls to make</span>
          </span>
        </Link>
      </li>
    );
  }

}

export default IssuesListItem;
