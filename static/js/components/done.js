const html = require('choo/html');

module.exports = (state, prev, send) => {
  return html`
    <main role="main" class="layout__main">
    <section class="call">
      <div class="call_complete">
        <h2 class="call__complete__title">Great work!</h2>
        <p class="call__complete__text">Calling your representatives is the most effective way of making your voice heard. <a href="#about">Read more</a> about why calling your representatives is important to our democracy.</p>
        <p class="call__complete__text">Pick another issue to continue. Or spread the word by sharing your accomplishment with your friends:</p>
        <p class="call__complete__share"><a target="_blank" href="https://twitter.com/intent/tweet?text=Make%205%20calls%20today%20to%20change%20your%20government%20http%3A%2F%2Fbit.ly%2F2iJb5nH&source=webclient&via=make5calls"><i class="fa fa-twitter" aria-hidden="true"></i> Share on Twitter</a> - <a  target="_blank" href="https://www.facebook.com/sharer/sharer.php?u=http://bit.ly/2iJb5nH"><i class="fa fa-facebook" aria-hidden="true"></i> Share on Facebook</a></p>
        <p class="call__complete__text">Together we’ve made ${Number(state.totalCalls).toLocaleString()} calls to government offices and officials.</p>
      </div>
    </section>
    </main>
  `;
}
