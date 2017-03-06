const html = require('choo/html');

module.exports = (state, prev, send, issue) => {
  if (issue) {
    const url = encodeURIComponent('http://5calls.org/issue/' + issue.id + '?utm_campaign=twshare');
    const tweet = encodeURIComponent('I just called my rep to ' + issue.name.substring(0, 72) +
    ' — you should too:');
    return html`
    <div class="promote">
      <p>
        <a target="_blank"
          href="https://twitter.com/share?url=${url}&text=${tweet}"><i class="fa fa-twitter" aria-hidden="true"></i> Tweet this issue</a> <a target="_blank" href="https://www.facebook.com/sharer/sharer.php?u=http://bit.ly/2iJb5nH"><i class="fa fa-facebook" aria-hidden="true"></i> Share this issue</a>
      </p>
    </div>
    `;
  }
}
