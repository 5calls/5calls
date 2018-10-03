import * as React from 'react';

export const HomeExtras: React.StatelessComponent = () => {
  return (
  <div className="extras">
    <div className="extras__band explainer">
      <div className="layout">
      <ul>
        <li className="explainer__pick">
          <div className="img-contain"><img src="/img/pick-issue.png" alt="Pick your issue" /></div>
          <br/>Pick your issue
        </li>
        <li className="explainer__call">
          <div className="img-contain"><img src="/img/call-rep.png" alt="Call your rep" /></div>
          <br/>Call your Rep
        </li>
        <li className="explainer__result">
          <div className="img-contain"><img src="/img/record-result.png" alt="Record your result" /></div>
          <br/>Record your result
        </li>
      </ul>
      </div>
      <div style={{clear: 'both'}} />
    </div>
    <div className="extras__tweets">
      <div className="layout">
      <ul>
        <li>
          <img src="/img/user-letbeasley.png"/>
          <p>"Thank you! I could not have not spoken up on ACA without your website!"</p>
        </li>
        <li>
          <img src="/img/user-tweet3.png"/>
          {/*tslint:disable-next-line:max-line-length*/}
          <p>"In an age of outrage, keep <a href="https://twitter.com/make5calls">@make5calls</a> bookmarked. They are constantly updating with actual, proactive, SIMPLE ways to be heard. Seriously."</p>
        </li>
        <li>
          <img src="/img/user-suogan.png"/>
          {/*tslint:disable-next-line:max-line-length*/}
          <p>"Made my call to Gov Cuomo. Thank you for making it so easy. Took 5 minutes of my time &amp; I spoke with staff member."</p>
        </li>
      </ul>
      </div>
      <div style={{clear: 'both'}} />
    </div>
    <div className="extras__band articles">
      <div className="layout">
      <ul>
        <li>
          {/*tslint:disable-next-line:max-line-length*/}
          <a href="https://techcrunch.com/2017/01/25/5-calls-debuts-what-may-be-the-easiest-way-to-call-your-reps-yet/" target="_blank">
            <img src="/img/logo-techcrunch.png" alt="TechCrunch" />
          </a>
        </li>
        <li>
          {/*tslint:disable-next-line:max-line-length*/}
          <a href="http://www.vogue.com/article/five-calls-best-political-activist-hack" target="_blank">
            <img src="/img/logo-vogue.png" alt="Vogue" />
          </a>
        </li>
        <li>
          {/*tslint:disable-next-line:max-line-length*/}
          <a href="http://www.huffingtonpost.com/entry/5-calls-congress-phone_us_588ada64e4b0230ce61b26d7" target="_blank">
            <img src="/img/logo-huffpost.png" alt="HuffPost" />
          </a>
        </li>
        <li>
          {/*tslint:disable-next-line:max-line-length*/}
          <a href="https://www.bloomberg.com/news/articles/2017-02-09/silicon-valley-fights-trump-in-its-free-time" target="_blank">
            <img src="/img/logo-businessweek.png" alt="Bloomberg Businessweek" />
          </a>
        </li>
      </ul>
      </div>
      <div style={{clear: 'both'}} />
    </div>
    <div className="extras__media">
      <div className="layout">
      <ul>
        <li>
          {/*tslint:disable-next-line:max-line-length*/}
          <a href="https://www.youtube.com/watch?v=rsazVtf1HP4" target="_blank"><img src="/img/video-mmoore.jpg" alt="Michael Moore talking about 5 Calls on MSNBC" /></a>
        </li>
        <li>
          {/*tslint:disable-next-line:max-line-length*/}
          <a href="https://www.youtube.com/watch?v=N62ViRRn61I" target="_blank"><img src="/img/video-app.jpg" alt="How to use the 5 Calls iPhone App" /></a>
        </li>
        <li>
          {/*tslint:disable-next-line:max-line-length*/}
          <a href="https://www.youtube.com/watch?v=wwoJqYXvh9s" target="_blank"><img src="/img/video-shower.jpg" alt="When do you make your 5 Calls?" /></a>
        </li>
      </ul>
      </div>
      <div style={{clear: 'both'}} />
    </div>
  </div>
  );
};

export default HomeExtras;