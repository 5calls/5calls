const html = require('choo/html');

module.exports = (state, prev, send) => {
  return html`
    <main id="content" role="main" class="layout__main" onload=${() => send('startup')}>
    <div class="hypothesis" onload=${() => send('getTotals')}>
      <header class="hypothesis__header">
        <h2 class="hypothesis__title">Frequently Asked Questions</h2>
      </header>
      <h3 class="hypothesis__subtitle">How do I use 5 Calls?</h3>
      <ul>
        <li>Type in your ZIP code (or let your browser or the app find your location for you).</li>
        <li>Choose an issue that’s important to you.</li>
        <li>Make calls!</li> 
        <li>You have three members of Congress –- two senators and a House rep.</li> 
        <li><ul>
          <li>Some issues need calls to all three (we’ll tell you when they do). For those, call the first person on the list. When you’re done, enter your call results and then move to the next person on your list. Lather, rinse, repeat until you’re done.</li>
          <li>Some issues only need a call to your House rep; for others, just your senators. Again, we’ll make it clear who you should call.</li>
        </ul></li>
        <li>You may also see issues that ask you to call a non-Congressional entity, office, etc. Those calls work the same way.</li>
        <li>Don’t forget to congratulate yourself for being an awesome citizen.</li>
      </ul>
      <h3 class="hypothesis__subtitle">Why should I call my congressperson?</h3>
    </div>
    </main>
  `;
}
