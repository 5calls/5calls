import * as React from 'react';
// import * as Constants from '../../common/constants';

export interface Props {
}

export const Postcards: React.StatelessComponent<Props> = (props: Props) => (
  <section className="postcards">
    <h1 className="hypothesis__title">Send 5 Cards to Voters</h1>
    <img className="postcards__example" src="/img/postcards.png" alt="5 Calls Postcards"/>
    {/*tslint:disable-next-line:max-line-length*/}
    <p>Support the upcoming <strong>special election in Alabama on December 12th, 2017</strong> with handwritten postcards to help get out the vote in this critical Senate race!</p>
    {/*tslint:disable-next-line:max-line-length*/}
    <p>We specifically designed our postcards to help voters make a plan to vote, which research has shown to increase voter turnout.</p>
    {/*tslint:disable-next-line:max-line-length*/}
    {/* <p><strong>For $5, you'll get 5 pre-stamped, pre-addressed postcards to critical voters in Alabama</strong>. After receiving your set of 5 cards in the mail, simply add your own personal message and put them right back in the mail. No need to get supplies or even leave your home!</p> */}
    <h2>Postcard Program Ended 11/27</h2>
    {/*tslint:disable-next-line:max-line-length*/}
    <p><strong>Want to throw a postcard party?</strong> Getting a group of friends together to write postcards is a fun and easy way to amplify your efforts.</p>
    <h3>Why is it important to get out the vote for this election?</h3>
    <ul>
      {/*tslint:disable-next-line:max-line-length*/}
      <li>There is no early voting! Mail-in ballots are only available for special cases, therefore voting on election day is the only option for most people.</li>
      {/*tslint:disable-next-line:max-line-length*/}
      <li>Getting out the vote for a special election has always been hard. But GOTV is even tougher during the holidays.</li>
      <li>Recent polling shows this is a very tight election, voter turnout will be pivotal.</li>
    </ul>
    <h3>Talking points you can include in your personal postcard message:</h3>
    <ul>
      <li>Polls will be open from 7am - 7pm.</li>
      {/*tslint:disable-next-line:max-line-length*/}
      <li>Polling locations can be found at <a href="http://www.alabamavotes.gov" target="_blank" rel="noopener">www.alabamavotes.gov</a></li>
      {/*tslint:disable-next-line:max-line-length*/}
      <li>Since 2014, voters in Alabama have been required to bring ID to the polls. They can find information on acceptable ID or how to get a free ID at <a href="http://www.alabamavotes.gov" target="_blank" rel="noopener">www.alabamavotes.gov</a></li>
      {/*tslint:disable-next-line:max-line-length*/}
      <li>Keep messaging positive and encouraging. The best way to connect with other voters is to be sincere and authentic.</li>
    </ul>
    <h3>Postcard message examples:</h3>
    <blockquote>
      <p>Dear Voter,</p>
      {/*tslint:disable-next-line:max-line-length*/}
      <p>Participating in elections is a critical way to make your voice heard in our democracy! Every vote counts! Don’t miss your chance to vote in the special election on Dec. 12. Polls are open from 7am - 7pm, more info can be found at www.alabamavotes.gov</p>
      <p>Thank you for being a voter!</p>
      <p>Eleanor</p>
      <p>Durham, NC</p>
    </blockquote>
    <blockquote>
      <p>Hi Voter!</p>
      {/*tslint:disable-next-line:max-line-length*/}
      <p>I’m writing to you to ask you to vote in the special election on Dec 12th. Voting is the best way to make your voice heard in our democracy, and now more than ever we all need to vote vote VOTE! Just as a reminder, polls are open from 7am-7pm and you can find your polling location at www.alabamavotes.gov. Good luck on Election Day and THANK YOU for being a voter!</p>
      <p>Jennifer</p>
      <p>Phoenix, Arizona</p>
    </blockquote>
    <blockquote>
      <p>Hi Alabama Voter!</p>
      {/*tslint:disable-next-line:max-line-length*/}
      <p>How exciting! You have a special election on December 12th, giving you a chance to have your voice counted in our democracy. Making time to vote can be challenging, specially in the busy holiday season, so making a plan to vote ahead of time is a great way to ensure you don’t miss out. You can use the front of this card to make your plan! Polls are open from 7am-7pm, and information about polling location can be found at www.alabamavotes.gov</p>
      <p>Thanks for being a voter and participating in our democracy!</p>
      <p>Mary</p>
      <p>Youngstown, OH</p>
    </blockquote>
  </section>
);
