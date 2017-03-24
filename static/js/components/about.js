const html = require('choo/html');

module.exports = (state, prev, send) => {
  return html`
    <main role="main" class="layout__main" onload=${() => send('startup')}>
    <section class="about">
      <h2 class="about__title">About 5 Calls</h2>

      <h3 class="about__subtitle">Why Calling Works</h3>

      <p>Calling members of Congress is the most effective way to have your voice heard. Calls are tallied by staffers and the count is given to your representatives, informing them how strongly their constituents feel about a current issue. The sooner you reach out, the more likely it is that <strong>your voice will influence their position.</strong></p>
      <p>Don’t just take it from us:</p>
      <ul>
      <li><a href="https://www.nytimes.com/2016/11/22/us/politics/heres-why-you-should-call-not-email-your-legislators.html">“Here’s Why You Should Call, Not Email, Your Legislators”</a> <span class="about__source">NY Times</span></li>
      <li><a href="http://www.vox.com/policy-and-politics/2016/11/15/13641920/trump-resist-congress">“Don’t just write to your representatives. Call them — and go to town halls.”</a> <span class="about__source">Vox</span></li>
      <li><a href="https://www.washingtonpost.com/powerpost/a-day-of-chaos-at-the-capitol-as-house-republicans-back-down-on-ethics-changes/2017/01/03/50e392ac-d1e6-11e6-9cb0-54ab630851e8_story.html?utm_term=.86c8d3a06832">“I can tell you the calls we’ve gotten in my district office and here in Washington surprised me, meaning the numbers of calls.”</a> <span class="about__source"> Washington Post</span></li>
      <li><a href="https://twitter.com/costareports/status/816373917900161024">“Most members tell me blizzard of angry constituent calls were most impt factor in getting the House to sideline the amdt”</a> <span class="about__source">Robert Costa</span></li>
      </ul>
      <p><i>5 Calls</i> does the research for each issue, determining which representatives are most influential for which topic, collecting phone numbers for those offices and writing scripts that clearly articulate a progressive position. You just have to call.</p>
      <p>Are we not covering an issue we should be?  <a href="mailto:make5calls@gmail.com">Please reach out.</a></p>

      <h3 class="about__subtitle">Calling Tips</h3>
      <p>Calls should take less than a minute. You’ll be speaking to a staffer, so make your point clearly so they can tally your opinion correctly. The provided scripts are useful but you can add your own words.</p>
      <p>Be respectful. The staffers that pick up the phone aren’t looking to challenge you and you should treat them with the same respect you expect from them, regardless of which party they work for.</p>

      <h3 class="about__subtitle">Who made 5 Calls?</h3>
      <p>5 Calls is a volunteer effort. Founded and run by husband & wife team <a href="https://twitter.com/nickoneill">Nick</a> and <a href="https://twitter.com/syntheticmethod">Rebecca</a>, many dedicated volunteers contribute design, code and issues to the site including: <a href="https://twitter.com/monteiro">@monteiro</a>, <a href="https://twitter.com/stewartsc">@stewartsc</a>, <a href="https://twitter.com/liamdanger">@liamdanger</a>, <a href="https://twitter.com/capndesign">@capndesign</a>, <a href="https://twitter.com/jameshome">@jameshome</a>, <a href="https://twitter.com/beau">@beau</a>, <a href="https://twitter.com/cdoremus">@cdoremus</a>, <a href="https://twitter.com/ocderby">@ocderby</a>, <a href="https://twitter.com/mr0grog">@mr0grog</a> and <a href="https://github.com/5calls/5calls/graphs/contributors">more supporters.</a></p>
      <p>Our iOS app is made by <a href="https://twitter.com/subdigital">@subdigital</a>, <a href="https://twitter.com/mccarron">@mccarron</a>, <a href="https://twitter.com/chrisbrandow">@chrisbrandow</a> and <a href="https://github.com/5calls/ios/graphs/contributors">more supporters</a></p>
      <p>Our Android app is made by <a href="https://github.com/dektar">dektar</a>, gregliest and <a href="https://github.com/5calls/android/graphs/contributors">more supporters</a></p>
      <p>Our issues, scripts and social team is <a href="https://twitter.com/charmbtrippin">@charmbtrippin</a>, <a href="https://www.instagram.com/sara.n.g/">sara.n.g</a>, amanda.l, <a href="https://twitter.com/djpiebob">@djpiebob</a>, <a href="https://twitter.com/theRati">@theRati</a>, <a href="https://twitter.com/Lhhargrave">@lhhargrave</a>, amanda.n, <a href="https://twitter.com/sagerke">@sagerke</a>, Eleanor Wertman and more contributors.</p>
      <p>We want to make advocacy accessible. We hope 5 Calls will make it effortless for regular people to have a voice when it’s needed most.</p>

      <h3 class="about__subtitle">Join us</h3>
      <p>This project is <a href="https://github.com/5calls/5calls">open source</a> and volunteer made. If you’d like to join us in developing useful tools for citizens, please get in touch via <a href="https://twitter.com/make5calls">Twitter</a> or <a href="mailto:make5calls@gmail.com">email</a>.</p>
    </section>
    </main>
  `;
}
