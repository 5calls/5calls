import React from 'react';
import { getIssues } from '../utils/api';

interface State {
  issues: array,
}

class Dashboard extends React.Component<null, State> {
  state = {
    issues: [],
  };

  componentDidMount() {
    getIssues().then((issueData) => {
      this.setState({ issues: issueData })
    });
  }

  render(): React.ReactNode {
    if (this.state.issues.length > 0) {
      // https://observablehq.com/@vega/vega-lite-api
      const options = {
        config: {
          // Vega-Lite default configuration
        },
        init: (view) => {
          // initialize tooltip handler
          // view.tooltip(new vegaTooltip.Handler().call);
        },
        view: {
          // "svg" is slightly accessible while "png" is easier to screenshot.
          renderer: 'svg', // can be "svg" or "canvas". "svg" allows copy/paste of text.
        },
      };

      // register vega and vega-lite with the API
      vl.register(vega, vegaLite, options);

      vl.markBar()
        .data(this.state.issues)
        .transform(
          vl.filter('datum.stats.calls > 100000'),
          vl.calculate('+datum.stats.calls').as('total_calls'),
        )
        .encode(
          vl.x().fieldN('slug').title('Issue').sort(vl.fieldQ('total_calls').order('descending')),
          vl.y().fieldQ('total_calls').title('Total calls'),
          // I can set an aria-label per mark with vl.description
          // I could calculate the description if desired above.
          // vl.description().fieldN('id'),
          // vl.color().fieldT('createdAt')
        )
        .render()
        .then(v => document.getElementById('graph-place').appendChild(v));
      return (
        <span>
          POTATO LYRA.
          Join&nbsp;us.
        </span>
      );
    } else {
      return (
        <span>
          We&rsquo;ve made more than 8 million calls so far. Join&nbsp;us.
        </span>
      );
    }
  }
}

export default Dashboard;
