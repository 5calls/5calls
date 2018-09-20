import * as React from 'react';

interface Props {
  readonly includeList: boolean;
}

const nameMap = {
  'AK-DanSullivan': { 'name': 'Dan Sullivan (R-AK)', 'party': 'R', 'state': 'AK' },
  'AK-LisaMurkowski': { 'name': 'Lisa Murkowski (R-AK)', 'party': 'R', 'state': 'AK' },
  'AL-DougJones': { 'name': 'Doug Jones (D-AL)', 'party': 'D', 'state': 'AL' },
  'AL-RichardCShelby': { 'name': 'Richard Shelby (R-AL)', 'party': 'R', 'state': 'AL' },
  'AR-JohnBoozman': { 'name': 'John Boozman (R-AR)', 'party': 'R', 'state': 'AR' },
  'AR-TomCotton': { 'name': 'Tom Cotton (R-AR)', 'party': 'R', 'state': 'AR' },
  'AZ-JeffFlake': { 'name': 'Jeff Flake (R-AZ)', 'party': 'R', 'state': 'AZ' },
  // 'AZ-JohnMcCain': { 'name': 'John McCain (not voting)', 'party': 'R', 'state': 'AZ' },
  'CA-DianneFeinstein': { 'name': 'Dianne Feinstein (D-CA)', 'party': 'D', 'state': 'CA' },
  'CA-KamalaDHarris': { 'name': 'Kamala Harris (D-CA)', 'party': 'D', 'state': 'CA' },
  'CO-CoryGardner': { 'name': 'Cory Gardner (R-CO)', 'party': 'R', 'state': 'CO' },
  'CO-MichaelFBennet': { 'name': 'Michael Bennet (D-CO)', 'party': 'D', 'state': 'CO' },
  'CT-ChristopherMurphy': { 'name': 'Chris Murphy (D-CT)', 'party': 'D', 'state': 'CT' },
  'CT-RichardBlumenthal': { 'name': 'Richard Blumenthal (D-CT)', 'party': 'D', 'state': 'CT' },
  'DE-ChristopherACoons': { 'name': 'Chris Coons (D-DE)', 'party': 'D', 'state': 'DE' },
  'DE-ThomasRCarper': { 'name': 'Tom Carper (D-DE)', 'party': 'D', 'state': 'DE' },
  'FL-BillNelson': { 'name': 'Bill Nelson (D-FL)', 'party': 'D', 'state': 'FL' },
  'FL-MarcoRubio': { 'name': 'Marco Rubio (R-FL)', 'party': 'R', 'state': 'FL' },
  'GA-DavidPerdue': { 'name': 'David Perdue (R-GA)', 'party': 'R', 'state': 'GA' },
  'GA-JohnnyIsakson': { 'name': 'Johnny Isakson (R-GA)', 'party': 'R', 'state': 'GA' },
  'HI-BrianSchatz': { 'name': 'Brian Schatz (D-HI)', 'party': 'D', 'state': 'HI' },
  'HI-MazieKHirono': { 'name': 'Mazie Hirono (D-HI)', 'party': 'D', 'state': 'HI' },
  'IA-ChuckGrassley': { 'name': 'Chuck Grassley (R-IA)', 'party': 'R', 'state': 'IA' },
  'IA-JoniErnst': { 'name': 'Joni Ernst (R-IA)', 'party': 'R', 'state': 'IA' },
  'ID-JamesERisch': { 'name': 'James Risch (R-ID)', 'party': 'R', 'state': 'ID' },
  'ID-MikeCrapo': { 'name': 'Mike Crapo (R-ID)', 'party': 'R', 'state': 'ID' },
  'IL-RichardJDurbin': { 'name': 'Dick Durbin (D-IL)', 'party': 'D', 'state': 'IL' },
  'IL-TammyDuckworth': { 'name': 'Tammy Duckworth (D-IL)', 'party': 'D', 'state': 'IL' },
  'IN-JoeDonnelly': { 'name': 'Joe Donnelly (D-IN)', 'party': 'D', 'state': 'IN' },
  'IN-ToddYoung': { 'name': 'Todd Young (R-IN)', 'party': 'R', 'state': 'IN' },
  'KS-JerryMoran': { 'name': 'Jerry Moran (R-KS)', 'party': 'R', 'state': 'KS' },
  'KS-PatRoberts': { 'name': 'Pat Roberts (R-KS)', 'party': 'R', 'state': 'KS' },
  'KY-MitchMcConnell': { 'name': 'Mitch McConnell (R-KY)', 'party': 'R', 'state': 'KY' },
  'KY-RandPaul': { 'name': 'Rand Paul (R-KY)', 'party': 'R', 'state': 'KY' },
  'LA-BillCassidy': { 'name': 'Bill Cassidy (R-LA)', 'party': 'R', 'state': 'LA' },
  'LA-JohnKennedy': { 'name': 'John Kennedy (R-LA)', 'party': 'R', 'state': 'LA' },
  'MA-EdwardJMarkey': { 'name': 'Ed Markey (D-MA)', 'party': 'D', 'state': 'MA' },
  'MA-ElizabethWarren': { 'name': 'Liz Warren (D-MA)', 'party': 'D', 'state': 'MA' },
  'MD-BenjaminLCardin': { 'name': 'Ben Cardin (D-MD)', 'party': 'D', 'state': 'MD' },
  'MD-ChrisVanHollen': { 'name': 'Chris Van Hollen (D-MD)', 'party': 'D', 'state': 'MD' },
  'ME-AngusSKingJr': { 'name': 'Angus King (I-ME)', 'party': 'I', 'state': 'ME' },
  'ME-SusanCollins': { 'name': 'Susan Collins (R-ME)', 'party': 'R', 'state': 'ME' },
  'MI-DebbieStabenow': { 'name': 'Debbie Stabenow (D-MI)', 'party': 'D', 'state': 'MI' },
  'MI-GaryCPeters': { 'name': 'Gary Peters (D-MI)', 'party': 'D', 'state': 'MI' },
  'MN-TinaSmith': { 'name': 'Tina Smith (D-MN)', 'party': 'D', 'state': 'MN' },
  'MN-AmyKlobuchar': { 'name': 'Amy Klobuchar (D-MN)', 'party': 'D', 'state': 'MN' },
  'MO-ClaireMcCaskill': { 'name': 'Claire McCaskill (D-MO)', 'party': 'D', 'state': 'MO' },
  'MO-RoyBlunt': { 'name': 'Roy Blunt (R-MO)', 'party': 'R', 'state': 'MO' },
  'MS-RogerFWicker': { 'name': 'Roger Wicker (R-MS)', 'party': 'R', 'state': 'MS' },
  'MS-ThadCochran': { 'name': 'Thad Cochran (R-MS)', 'party': 'R', 'state': 'MS' },
  'MT-JonTester': { 'name': 'Jon Tester (D-MT)', 'party': 'D', 'state': 'MT' },
  'MT-SteveDaines': { 'name': 'Steve Daines (R-MT)', 'party': 'R', 'state': 'MT' },
  'NC-RichardBurr': { 'name': 'Richard Burr (R-NC)', 'party': 'R', 'state': 'NC' },
  'NC-ThomTillis': { 'name': 'Thom Tillis (R-NC)', 'party': 'R', 'state': 'NC' },
  'ND-HeidiHeitkamp': { 'name': 'Heidi Heitkamp (D-ND)', 'party': 'D', 'state': 'ND' },
  'ND-JohnHoeven': { 'name': 'John Hoeven (R-ND)', 'party': 'R', 'state': 'ND' },
  'NE-BenSasse': { 'name': 'Ben Sasse (R-NE)', 'party': 'R', 'state': 'NE' },
  'NE-DebFischer': { 'name': 'Deb Fischer (R-NE)', 'party': 'R', 'state': 'NE' },
  'NH-JeanneShaheen': { 'name': 'Jeanne Shaheen (D-NH)', 'party': 'D', 'state': 'NH' },
  'NH-MargaretWoodHassan': { 'name': 'Maggie Hassan (D-NH)', 'party': 'D', 'state': 'NH' },
  'NJ-CoryABooker': { 'name': 'Cory Booker (D-NJ)', 'party': 'D', 'state': 'NJ' },
  'NJ-RobertMenendez': { 'name': 'Bob Menendez (D-NJ)', 'party': 'D', 'state': 'NJ' },
  'NM-MartinHeinrich': { 'name': 'Martin Heinrich (D-NM)', 'party': 'D', 'state': 'NM' },
  'NM-TomUdall': { 'name': 'Tom Udall (D-NM)', 'party': 'D', 'state': 'NM' },
  'NV-CatherineCortezMasto': { 'name': 'Catherine Cortez Masto (D-NV)', 'party': 'D', 'state': 'NV' },
  'NV-DeanHeller': { 'name': 'Dean Heller (R-NV)', 'party': 'R', 'state': 'NV' },
  'NY-CharlesESchumer': { 'name': 'Chuck Schumer (D-NY)', 'party': 'D', 'state': 'NY' },
  'NY-KirstenEGillibrand': { 'name': 'Kirsten Gillibrand (D-NY)', 'party': 'D', 'state': 'NY' },
  'OH-RobPortman': { 'name': 'Rob Portman (R-OH)', 'party': 'R', 'state': 'OH' },
  'OH-SherrodBrown': { 'name': 'Sherrod Brown (D-OH)', 'party': 'D', 'state': 'OH' },
  'OK-JamesLankford': { 'name': 'James Lankford (R-OK)', 'party': 'R', 'state': 'OK' },
  'OK-JamesMInhofe': { 'name': 'Jim Inhofe (R-OK)', 'party': 'R', 'state': 'OK' },
  'OR-JeffMerkley': { 'name': 'Jeff Merkley (D-OR)', 'party': 'D', 'state': 'OR' },
  'OR-RonWyden': { 'name': 'Ron Wyden (D-OR)', 'party': 'D', 'state': 'OR' },
  'PA-PatrickJToomey': { 'name': 'Pat Toomey (R-PA)', 'party': 'R', 'state': 'PA' },
  'PA-RobertPCaseyJr': { 'name': 'Bob Casey (D-PA)', 'party': 'D', 'state': 'PA' },
  'RI-JackReed': { 'name': 'Jack Reed (D-RI)', 'party': 'D', 'state': 'RI' },
  'RI-SheldonWhitehouse': { 'name': 'Sheldon Whitehouse (D-RI)', 'party': 'D', 'state': 'RI' },
  'SC-LindseyGraham': { 'name': 'Lindsey Graham (R-SC)', 'party': 'R', 'state': 'SC' },
  'SC-TimScott': { 'name': 'Tim Scott (R-SC)', 'party': 'R', 'state': 'SC' },
  'SD-JohnThune': { 'name': 'John Thune (R-SD)', 'party': 'R', 'state': 'SD' },
  'SD-MikeRounds': { 'name': 'Mike Rounds (R-SD)', 'party': 'R', 'state': 'SD' },
  'TN-BobCorker': { 'name': 'Bob Corker (R-TN)', 'party': 'R', 'state': 'TN' },
  'TN-LamarAlexander': { 'name': 'Lamar Alexander (R-TN)', 'party': 'R', 'state': 'TN' },
  'TX-JohnCornyn': { 'name': 'John Cornyn (R-TX)', 'party': 'R', 'state': 'TX' },
  'TX-TedCruz': { 'name': 'Ted Cruz (R-TX)', 'party': 'R', 'state': 'TX' },
  'UT-MikeLee': { 'name': 'Mike Lee (R-UT)', 'party': 'R', 'state': 'UT' },
  'UT-OrrinGHatch': { 'name': 'Orrin Hatch (R-UT)', 'party': 'R', 'state': 'UT' },
  'VA-MarkRWarner': { 'name': 'Mark Warner (D-VA)', 'party': 'D', 'state': 'VA' },
  'VA-TimKaine': { 'name': 'Tim Kaine (D-VA)', 'party': 'D', 'state': 'VA' },
  'VT-BernardSanders': { 'name': 'Bernie Sanders (I-VT)', 'party': 'I', 'state': 'VT' },
  'VT-PatrickJLeahy': { 'name': 'Patrick Leahy (D-VT)', 'party': 'D', 'state': 'VT' },
  'WA-MariaCantwell': { 'name': 'Maria Cantwell (D-WA)', 'party': 'D', 'state': 'WA' },
  'WA-PattyMurray': { 'name': 'Patty Murray (D-WA)', 'party': 'D', 'state': 'WA' },
  'WI-RonJohnson': { 'name': 'Ron Johnson (R-WI)', 'party': 'R', 'state': 'WI' },
  'WI-TammyBaldwin': { 'name': 'Tammy Baldwin (D-WI)', 'party': 'D', 'state': 'WI' },
  'WV-JoeManchin': { 'name': 'Joe Manchin (D-WV)', 'party': 'D', 'state': 'WV' },
  'WV-ShelleyMooreCapito': { 'name': 'Shelley Moore Capito (R-WV)', 'party': 'R', 'state': 'WV' },
  'WY-JohnBarrasso': { 'name': 'John Barrasso (R-WY)', 'party': 'R', 'state': 'WY' },
  'WY-MichaelBEnzi': { 'name': 'Mike Enzi (R-WY)', 'party': 'R', 'state': 'WY' }
};

function sortByParty(a: string, b: string) {
  if (nameMap[a].party > nameMap[b].party) {
    return -1;
  }
  if (nameMap[a].party < nameMap[b].party) {
    return 1;
  }
  if (nameMap[a].state < nameMap[b].state) {
    return -1;
  }
  if (nameMap[a].state > nameMap[b].state) {
    return 1;
  }

  return 0;
}

const noReps: string[] = [];
const noVotes: string[] = noReps.sort(sortByParty);

const yesReps: string[] = [];
for (const senatorName in nameMap) {
  if (nameMap[senatorName].party === 'R') {
    yesReps.push(senatorName);
  }
}
const yesVotes: string[] = yesReps.sort(sortByParty);

const unknownReps: string[] = [];
const unknownVotes: string[] = unknownReps.sort(sortByParty);

const definitelyNo: string[] = [
];
for (const senatorName in nameMap) {
  if (nameMap[senatorName].party !== 'R') {
    definitelyNo.push(senatorName);
  }
}

definitelyNo.forEach((senator) => {
  // add to hard list
  if (!(noVotes.indexOf(senator) > -1)) {
    noVotes.push(senator);
  }

  // remove from other lists
  if (yesVotes.indexOf(senator) > -1) {
    yesVotes.splice(yesVotes.indexOf(senator), 1);
  }
  if (unknownVotes.indexOf(senator) > -1) {
    unknownVotes.splice(unknownVotes.indexOf(senator), 1);
  }
});

const definitelyYes: string[] = [

];
definitelyYes.forEach((senator) => {
  // add to hard list
  if (!(yesVotes.indexOf(senator) > -1)) {
    yesVotes.push(senator);
  }

  // remove from other lists
  if (noVotes.indexOf(senator) > -1) {
    noVotes.splice(noVotes.indexOf(senator), 1);
  }
  if (unknownVotes.indexOf(senator) > -1) {
    unknownVotes.splice(unknownVotes.indexOf(senator), 1);
  }
});

const definitelyUnknown = [
  'AL-DougJones',
  'IN-JoeDonnelly',
  'ND-HeidiHeitkamp',
  'WV-JoeManchin',
  'AK-LisaMurkowski',
  'AZ-JeffFlake',
  'ME-SusanCollins',
];
definitelyUnknown.forEach((senator) => {
  // add to hard list
  if (!(unknownVotes.indexOf(senator) > -1)) {
    unknownVotes.push(senator);
  }

  // remove from other lists
  if (noVotes.indexOf(senator) > -1) {
    noVotes.splice(noVotes.indexOf(senator), 1);
  }
  if (yesVotes.indexOf(senator) > -1) {
    yesVotes.splice(yesVotes.indexOf(senator), 1);
  }
});

export const Tracker: React.StatelessComponent<Props> = (props: Props) => {
  return (
    <div className="tracker">
      <h3>Kavanaugh Confirmation Tracker</h3>
      <p className="tracker__required">50 Yes votes needed to confirm</p>
      <div className="tracker__votes">
        <div className="tracker__votes__no" style={{width: `${noVotes.length}%`}}>Opposes</div>
        <div className="tracker__votes__yes" style={{width: `${yesVotes.length}%`}}>Supports</div>
        <div className="tracker__votes__pass"/>
      </div>
      {/* <h4>Help us track Senator positions by calling and reporting results</h4> */}
      { props.includeList &&
      <div className="tracker__lists">
        <ul className="tracker__lists__no">
          <li className="header">No Votes {noVotes.length}</li>
          {noVotes.map(senator =>
            <li key={nameMap[senator].name} className={`party_${nameMap[senator].party}`}>{nameMap[senator].name}</li>
          )}
        </ul>
        <ul className="tracker__lists__yes">
          <li className="header">Yes Votes {yesVotes.length}</li>
          {yesVotes.map(senator =>
            <li key={nameMap[senator].name} className={`party_${nameMap[senator].party}`}>{nameMap[senator].name}</li>
          )}
        </ul>
        <ul className="tracker__lists__undecided">
          <li className="header">Undecided Votes {unknownVotes.length}</li>
          {unknownVotes.map(senator =>
            <li key={nameMap[senator].name} className={`party_${nameMap[senator].party}`}>{nameMap[senator].name}</li>
          )}
        </ul>
      </div>
      }
    </div>
  );
};
