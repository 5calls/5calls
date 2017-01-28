const html = require('choo/html');

module.exports = (state, prev, send) => {
  // TODO: separate this out into straight up content and stats
  return html`
    <div class="hypothesis" onload=${(e) => send('getTotals')}>
      <header class="hypothesis__header">
        <h2 class="hypothesis__title">Make your voice heard</h2>
        <p>Turn your passive participation into active resistance. Facebook likes and Twitter retweets don’t create the change you want to see.</p>
        <p><strong>Spend 5 minutes, make 5 calls.</strong></p>
      </header>
      <div class="hypothesis__text">
        <p>There’s one simple and straightforward way to influence the Government that is supposed to represent you: <strong>Call them on the phone</strong>.</p>
        <p>Calling is the most effective way to influence your representative. 5 Calls gives you <strong>contacts and scripts</strong> so calling is quick and easy. We use your location to give you your local representatives so <strong>your calls are more impactful</strong>.</p>
        <p>Want to know more? Read about <a href="#about">why calling works</a> or <a href="#about">more about us</a></p>
      </div>
      <p class="hypothesis__stats">
        ${Number(state.totalCalls).toLocaleString()} calls to date
      </p>
    </div>
  `;
}
