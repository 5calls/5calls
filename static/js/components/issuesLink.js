const html = require('choo/html');

const find = require('lodash/find');

module.exports = (state) => {
  const issue = find(state.issues, ['id', state.location.params.issueid]);

  if (issue.link == undefined || issue.link.length == 0) {
    return html``;
  } else {
    var linkTitle = issue.link;
    if (issue.linkTitle != undefined && issue.linkTitle.length > 0) {
      linkTitle = issue.linkTitle;
    }

    return html`
      <h4 class="call__script__link"><a href="${issue.link}">${linkTitle}</a></h4>
    `;
  }
};