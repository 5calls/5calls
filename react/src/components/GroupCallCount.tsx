import React from 'react';
import { getGroupCountData, IssueCount } from '../utils/api';

interface Props {
  group: string;
}

interface State {
  issueCounts: IssueCount[];
  total: number;
  isLoading: boolean;
  error?: string;
}

class GroupCallCount extends React.Component<Props, State> {
  state: State = {
    issueCounts: [],
    total: 0,
    isLoading: true
  };

  componentDidMount() {
    getGroupCountData(this.props.group)
      .then((response) => {
        this.setState({
          issueCounts: response.issueCounts,
          total: response.total,
          isLoading: false
        });
      })
      .catch(() => {
        this.setState({
          error: 'Failed to load call counts',
          isLoading: false
        });
      });
  }

  render(): React.ReactNode {
    const { issueCounts, total, isLoading, error } = this.state;

    if (isLoading) {
      return <span>Loading call counts...</span>;
    }

    if (error) {
      return <span>{error}</span>;
    }

    if (issueCounts.length === 0) {
      return <span>No calls recorded yet.</span>;
    }

    return (
      <div>
        <h3>Call Counts by Issue for {this.props.group}:</h3>
        <p>Total calls (all-time): {total.toLocaleString()}</p>
        <p>Issue counts, last 30 days:</p>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {issueCounts.map((issue) => (
            <li key={issue.name}>
              {issue.count.toLocaleString()} calls: {issue.name}
            </li>
          ))}
        </ul>
      </div>
    );
  }
}

export default GroupCallCount;
