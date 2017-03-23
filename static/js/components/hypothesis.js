const html = require('choo/html');
const callcount = require('./callcount.js');
const promote = require('./promote.js');

module.exports = (state, prev, send) => {
  // TODO: separate this out into straight up content and stats
  return html`
    <div class="hypothesis" onload=${() => send('getTotals')}>
      <header class="hypothesis__header">
        <h2 class="hypothesis__title">Make your voice heard</h2>
        <p>Turn your passive participation into active resistance. Facebook likes and Twitter retweets can’t create the change you want to see. Calling your Government on the phone can.</p>

        <p><strong>Spend 5 minutes, make 5 calls.</strong></p>

        ${promote(state, prev, send)}
      </header>

      <div class="hypothesis__text">
        <p>Calling is the most effective way to influence your representative. Read more about <a href="/about">why calling works.</a>
        </p>

        <h3 class="hypothesis__subtitle">5 Calls:</h3>

        <ul class="hypothesis__list">
        <li>provides phone numbers and scripts so calling is quick and easy</li>
        <li>uses your location to find your local representatives so your calls have more impact</li>
        </ul>

        <h3 class="hypothesis__subtitle">Get the 5 Calls app:</h3>

        <ul class="hypothesis__apps">
        <li><a href="https://itunes.apple.com/us/app/5-calls/id1202558609?mt=8"><img class="ios" src="/img/app-store.svg" alt="5 Calls on the App Store" /></a></li>
        <li><a href="https://play.google.com/store/apps/details?id=org.a5calls.android.a5calls&hl=en"><img class="play" src="/img/google-play-badge.png" alt="5 Calls on Google Play" /></a></li>
        </ul>
      </div>

      ${callcount(state, prev, send)}

    </div>
  `;
}
