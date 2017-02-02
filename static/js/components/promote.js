const html = require('choo/html');

module.exports = (state, prev, send, issue) => {
  if (issue) {
    const tweet = encodeURIComponent('I just called my rep to ' + issue.name.substring(0, 72) +
    ' — you should too. http://bit.ly/2iJb5nH&source=webclient&via=make5calls');
    return html`
    <div class="promote">
      <p>
        <a target="_blank" href="https://twitter.com/intent/tweet?text=${tweet}"><i class="fa fa-twitter" aria-hidden="true"></i> Tweet this issue</a> <a target="_blank" href="https://www.facebook.com/sharer/sharer.php?u=http://bit.ly/2iJb5nH"><i class="fa fa-facebook" aria-hidden="true"></i> Share this issue</a>
      </p>
    </div>
    `;
  }
}
