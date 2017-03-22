const html = require('choo/html');
const promote = require('./promote.js');
const callcount = require('./callcount.js');


module.exports = (state, prev, send) => {

  return html`
    <main id="content" role="main" class="layout__main" onload=${() => send('startup')}>
    <section class="call">
      <div class="call_complete">
        <h2 class="call__title">Great work!</h2>
        <p class="call__text">
          Pick another issue to keep calling, or spread the word by sharing your work with friends:
        </p>
        ${promote(state, prev, send)}

        <p class="call__text"> <a href="#about">Learn why calling</a> representatives is the most effective way of making your voice heard.</p>

        ${callcount(state, prev, send)}

      </div>


    </section>
    </main>
  `;
}
