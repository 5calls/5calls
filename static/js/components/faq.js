const html = require('choo/html');

module.exports = (state, prev, send) => {
  return html`
    <main id="content" role="main" class="layout__main" onload=${() => send('startup')}>
    <div class="about">
      <h2 class="about__title">Frequently Asked Questions</h2>
      <h2 class="callout">Your question not listed here? <a href="mailto:make5calls@gmail.com">Get in touch</a></h2>
      <h3>How do I use 5 Calls?</h3>
      <ul>
        <li>Type in your ZIP code (or let your browser or the app find your location for you).</li>
        <li>Choose an issue that’s important to you.</li>
        <li>Make calls!</li>
      </ul>
      <ul>
        <li>You have three members of Congress – two senators and a House rep.</li> 
        <ul>
          <li>Some issues need calls to all three (we’ll tell you when they do). For those, call the first person on the list. When you’re done, enter your call results and then move to the next person on your list. Lather, rinse, repeat until you’re done.</li>
          <li>Some issues only need a call to your House rep; for others, just your senators. Again, we’ll make it clear who you should call.</li>
        </ul>
        <li>You may also see issues that ask you to call a non-Congressional entity, office, etc. Those calls work the same way.</li>
      </ul>
      <ul>
        <li>Don’t forget to congratulate yourself for being an awesome citizen!</li>
      </ul>
      <h3>Why should I call my congressperson?</h3>
      <p>It’s the fastest way to speak your mind. Call tallies are given to your member of Congress (MoC) on the regular, so the earlier you call about an issue, the more likely you are to sway them. If you can, call before your MoC takes a public stance on the issue, because once they do, they don't like to walk it back.</p>
      <h3>Can't I send an email/fax/letter/postcard instead?</h3>
      <p>Nope. Phone calls are tallied right away, so they have by far the most immediate impact. Faxes these days are typically rendered digitally via email. Emails and postal mail must be read, batched by issue and THEN tallied. Physical letters and postcards – yes, postcards too – may also be quarantined for safety inspections. (And if you think all that happens quickly, it …doesn’t.) </p>
      <h3>Do I need to make a separate call for each issue I care about?</h3>
      <p>Yes. Congressional insiders tell us call volume really matters. But because we know it seems weird to hang up and call right back about another issue, we’ve added reps’ district office numbers, too. That way you can at least talk to a different staffer.</p>
      <h3>What if the line is busy or the voicemail is full?</h3>
      <p>Congressional offices have been seeing record call volume since Donald Trump took office, and while it’s amazing that so many people care enough to call, we know it’s frustrating when you can’t get through. Don’t sweat it.</p>
      <p>The default number listed for each member of Congress (MoC) is their DC office, but we have their local office numbers, too. (In the iOS app, they’re under the “line busy?” link; in the Android app, they’re under the “call a local office” link.) If you’re leaving a voicemail, be sure to include your street address so your MoC knows you’re one of their constituents.</p>
      <p>If all else fails (or your MoCs are jerks who’ve shut down their phone lines), try tweeting at them, reaching them through their website, sending an email or sending a postcard. But these are absolute last resorts. Phone calls have the most impact by far.</p>
      <h3>Why call the House on issues only affecting the Senate (and vice versa)?</h3>
      <p>We want to show a clear display of general dissent (or support, depending on the issue). Even if they don’t directly vote on a particular issue, these people talk to each other, and they talk to the media. On top of that, your reps work for you. You can express support or dissent (politely, please) about whatever you want.</p>
      <h3>When I’m calling one of my Senators, do I need to call the office closest to me?</h3>
      <p>You can call any of their offices. They represent your entire state.</p>
      <h3>When I’m calling my House reps, which of their offices should I call first?</h3>
      <p>Call their Washington, DC office before calling their local office(s).</p>
      <h3>Should I leave a voicemail?</h3>
      <p>If you can’t reach a live person or are punted to a voice mailbox, definitely. Voicemail is checked daily and tallied just like a call. Be sure to include your street address so your member of Congress will know you’re one of their constituents. </p>
      <h3>Where are my reps’ district office numbers?</h3>
      <ul>
        <li><strong>On the website:</strong> When you’re on an issue page, click the link that says "Busy line? Click here to see local office numbers" under your rep’s big red DC phone number. Their local numbers will pop up.</li>
        <li><strong>On the iOS app:</strong> Tap the “Line Busy” link under your rep’s photo and you’ll see their local numbers.</li>
        <li><strong>On the Android app:</strong> Tap the “Call a local office” link.</li>
      </ul>
      <h3>I only see one of my members of Congress. How can I call the rest?</h3>
      <ul>
        <li><strong>On the website:</strong> Each issue page has your first rep and their contact info. After you call them and enter the results (“made contact,” “left voicemail,” etc.), the page will reload and you’ll see your next rep.</li>
        <li><strong>On the apps:</strong> Each issue page has all of the reps you should call at the bottom. Tap the first one, call, enter the results (“made contact,” “left voicemail,” etc.) and you’ll see the next person to call.</li>
      </ul>
      <h3>How do I change my location?</h3>
      <p>We use your location to match you with the members of Congress you should be calling, so be sure to keep that info current.</p>
      <ul>
        <li><strong>On the website:</strong> Your current city or ZIP code is under the 5 Calls logo on the top left of the page. Click and you’ll be able to enter new information.</li>
        <li><strong>On the apps:</strong> Your current city or ZIP code is under the 5 Calls logo on the top of the screen. Tap and you’ll be able to enter new information.</li>
      </ul>
      <h3>Do you have Facebook and Twitter pages?</h3>
      <p>Yep. Follow us on <a href="https://www.facebook.com/make5calls">Facebook</a> and <a href="https://twitter.com/make5calls">Twitter</a> to get updates every day for what you should be calling about. It’d be great if you’d share the page on your timeline and invite your friends to like us too, but you know, no pressure. We’re not your mom.</p>
    </div>
    </main>
  `;
};
