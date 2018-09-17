import * as React from 'react';
import { Link } from 'react-router-dom';

import { TranslationFunction } from 'i18next';
import { translate } from 'react-i18next';
import { Tracker } from '../stance/Tracker';

interface Props {
  totalCount: number;
  t: TranslationFunction;
}

export const Why5calls: React.StatelessComponent<Props> = (props: Props) => (
  <div className="hypothesis" >
    <header className="hypothesis__header">
      <h1 className="hypothesis__title">{props.t('hypothesis.title')}</h1>
      <h2 className="hypothesis__subtitle">
        {/*tslint:disable-next-line:max-line-length*/}
        {/* <strong>5 Calls</strong> is the easiest and most effective way for citizens to make an impact in national and local politics */}
        {/*tslint:disable-next-line:max-line-length*/}
        Ready to save our democracy? Join the <Link to="/midterms">5 Calls 2018 Midterm Challenge</Link> and make an impact every week.
      </h2>
    </header>
    <div className="hypothesis__text">
      <div className="midterms-join">
        <a href="https://www.youtube.com/watch?v=LhAij3X1vQo" target="_blank">
          <img
            src="/img/midterm-video-play.jpg"
            alt="Join the 5 Calls Midterm Challenge Today"
          />
        </a>
      </div>
      {/* <CallCount
        totalCount={props.totalCount}
        t={i18n.t}
      /> */}
      <Tracker
        includeList={true}
      />
    </div>
  </div>
);

export const Why5callsTranslatable = translate()(Why5calls);
