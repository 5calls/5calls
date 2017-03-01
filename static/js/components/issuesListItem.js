const html = require('choo/html');

module.exports = (issue, state, prev, send) => {
  function classString(state, baseAddition) {
    const BASE_CLASS = 'issues-list__item' + baseAddition;
    const ACTIVE_CLASS = 'is-active';
    const COMPLETE_CLASS = 'is-complete';

    let classes = [BASE_CLASS];

    state.location.params.issueid === issue.id && classes.push(ACTIVE_CLASS);

    if (issueIsCompleted(state, issue)) {
      classes.push(COMPLETE_CLASS);
    }

    return classes.join(' ');
  }

  function handleClick(e) {
    send("activateIssue", { id: issue.id });
  }

  function issueIsCompleted(state, issue) {
    if (state.completedIssues.indexOf(issue.id) != -1) {
      return true;
    } else {
      return false;
    }
  }

  let statusText = "";
  if(issueIsCompleted(state, issue)) {
    statusText = "Done";
  }

  return html`
    <li onclick=${handleClick}>
      <a aria-controls="content" class="${classString(state, '')}" href="#issue/${issue.id}">
        <span aria-live="polite" class="${classString(state, '__status')}"><span class="visually-hidden">${statusText}</span></span>
        <span class="${classString(state, '__title')}">${issue.name}</span>
        <span class="${classString(state, '__summary')}">${issue.contacts.length} call${ issue.contacts.length > 1 ? "s" : "" } to make</span>
      </a>
    </li>
  `;
}
