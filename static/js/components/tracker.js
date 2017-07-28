const html = require('choo/html');
const t = require('../utils/translation');

module.exports = (state) => {
  var nameMap = {
    "AK-DanSullivan": { "name": "Dan Sullivan (R-AK)", "party": "R", "state": "AK" },
    "AK-LisaMurkowski": { "name": "Lisa Murkowski (R-AK)", "party": "R", "state": "AK" },
    "AL-LutherStrange": { "name": "Luther Strange (R-AL)", "party": "R", "state": "AL" },
    "AL-RichardCShelby": { "name": "Richard Shelby (R-AL)", "party": "R", "state": "AL" },
    "AR-JohnBoozman": { "name": "John Boozman (R-AR)", "party": "R", "state": "AR" },
    "AR-TomCotton": { "name": "Tom Cotton (R-AR)", "party": "R", "state": "AR" },
    "AZ-JeffFlake": { "name": "Jeff Flake (R-AZ)", "party": "R", "state": "AZ" },
    "AZ-JohnMcCain": { "name": "John McCain (R-AZ)", "party": "R", "state": "AZ" },
    "CA-DianneFeinstein": { "name": "Dianne Feinstein (D-CA)", "party": "D", "state": "CA" },
    "CA-KamalaDHarris": { "name": "Kamala Harris (D-CA)", "party": "D", "state": "CA" },
    "CO-CoryGardner": { "name": "Cory Gardner (R-CO)", "party": "R", "state": "CO" },
    "CO-MichaelFBennet": { "name": "Michael Bennet (D-CO)", "party": "D", "state": "CO" },
    "CT-ChristopherMurphy": { "name": "Chris Murphy (D-CT)", "party": "D", "state": "CT" },
    "CT-RichardBlumenthal": { "name": "Richard Blumenthal (D-CT)", "party": "D", "state": "CT" },
    "DE-ChristopherACoons": { "name": "Chris Coons (D-DE)", "party": "D", "state": "DE" },
    "DE-ThomasRCarper": { "name": "Tom Carper (D-DE)", "party": "D", "state": "DE" },
    "FL-BillNelson": { "name": "Bill Nelson (D-FL)", "party": "D", "state": "FL" },
    "FL-MarcoRubio": { "name": "Marco Rubio (R-FL)", "party": "R", "state": "FL" },
    "GA-DavidPerdue": { "name": "David Perdue (R-GA)", "party": "R", "state": "GA" },
    "GA-JohnnyIsakson": { "name": "Johnny Isakson (R-GA)", "party": "R", "state": "GA" },
    "HI-BrianSchatz": { "name": "Brian Schatz (D-HI)", "party": "D", "state": "HI" },
    "HI-MazieKHirono": { "name": "Mazie Hirono (D-HI)", "party": "D", "state": "HI" },
    "IA-ChuckGrassley": { "name": "Chuck Grassley (R-IA)", "party": "R", "state": "IA" },
    "IA-JoniErnst": { "name": "Joni Ernst (R-IA)", "party": "R", "state": "IA" },
    "ID-JamesERisch": { "name": "James Risch (R-ID)", "party": "R", "state": "ID" },
    "ID-MikeCrapo": { "name": "Mike Crapo (R-ID)", "party": "R", "state": "ID" },
    "IL-RichardJDurbin": { "name": "Dick Durbin (D-IL)", "party": "D", "state": "IL" },
    "IL-TammyDuckworth": { "name": "Tammy Duckworth (D-IL)", "party": "D", "state": "IL" },
    "IN-JoeDonnelly": { "name": "Joe Donnelly (D-IN)", "party": "D", "state": "IN" },
    "IN-ToddYoung": { "name": "Todd Young (R-IN)", "party": "R", "state": "IN" },
    "KS-JerryMoran": { "name": "Jerry Moran (R-KS)", "party": "R", "state": "KS" },
    "KS-PatRoberts": { "name": "Pat Roberts (R-KS)", "party": "R", "state": "KS" },
    "KY-MitchMcConnell": { "name": "Mitch McConnell (R-KY)", "party": "R", "state": "KY" },
    "KY-RandPaul": { "name": "Rand Paul (R-KY)", "party": "R", "state": "KY" },
    "LA-BillCassidy": { "name": "Bill Cassidy (R-LA)", "party": "R", "state": "LA" },
    "LA-JohnKennedy": { "name": "John Kennedy (R-LA)", "party": "R", "state": "LA" },
    "MA-EdwardJMarkey": { "name": "Ed Markey (D-MA)", "party": "D", "state": "MA" },
    "MA-ElizabethWarren": { "name": "Liz Warren (D-MA)", "party": "D", "state": "MA" },
    "MD-BenjaminLCardin": { "name": "Ben Cardin (D-MD)", "party": "D", "state": "MD" },
    "MD-ChrisVanHollen": { "name": "Chris Van Hollen (D-MD)", "party": "D", "state": "MD" },
    "ME-AngusSKingJr": { "name": "Angus King (I-ME)", "party": "I", "state": "ME" },
    "ME-SusanMCollins": { "name": "Susan Collins (R-ME)", "party": "R", "state": "ME" },
    "MI-DebbieStabenow": { "name": "Debbie Stabenow (D-MI)", "party": "D", "state": "MI" },
    "MI-GaryCPeters": { "name": "Gary Peters (D-MI)", "party": "D", "state": "MI" },
    "MN-AlFranken": { "name": "Al Franken (D-MN)", "party": "D", "state": "MN" },
    "MN-AmyKlobuchar": { "name": "Amy Klobuchar (D-MN)", "party": "D", "state": "MN" },
    "MO-ClaireMcCaskill": { "name": "Claire McCaskill (D-MO)", "party": "D", "state": "MO" },
    "MO-RoyBlunt": { "name": "Roy Blunt (R-MO)", "party": "R", "state": "MO" },
    "MS-RogerFWicker": { "name": "Roger Wicker (R-MS)", "party": "R", "state": "MS" },
    "MS-ThadCochran": { "name": "Thad Cochran (R-MS)", "party": "R", "state": "MS" },
    "MT-JonTester": { "name": "Jon Tester (D-MT)", "party": "D", "state": "MT" },
    "MT-SteveDaines": { "name": "Steve Daines (R-MT)", "party": "R", "state": "MT" },
    "NC-RichardBurr": { "name": "Richard Burr (R-NC)", "party": "R", "state": "NC" },
    "NC-ThomTillis": { "name": "Thom Tillis (R-NC)", "party": "R", "state": "NC" },
    "ND-HeidiHeitkamp": { "name": "Heidi Heitkamp (D-ND)", "party": "D", "state": "ND" },
    "ND-JohnHoeven": { "name": "John Hoeven (R-ND)", "party": "R", "state": "ND" },
    "NE-BenSasse": { "name": "Ben Sasse (R-NE)", "party": "R", "state": "NE" },
    "NE-DebFischer": { "name": "Deb Fischer (R-NE)", "party": "R", "state": "NE" },
    "NH-JeanneShaheen": { "name": "Jeanne Shaheen (D-NH)", "party": "D", "state": "NH" },
    "NH-MargaretWoodHassan": { "name": "Maggie Hassan (D-NH)", "party": "D", "state": "NH" },
    "NJ-CoryABooker": { "name": "Cory Booker (D-NJ)", "party": "D", "state": "NJ" },
    "NJ-RobertMenendez": { "name": "Bob Menendez (D-NJ)", "party": "D", "state": "NJ" },
    "NM-MartinHeinrich": { "name": "Martin Heinrich (D-NM)", "party": "D", "state": "NM" },
    "NM-TomUdall": { "name": "Tom Udall (D-NM)", "party": "D", "state": "NM" },
    "NV-CatherineCortezMasto": { "name": "Catherine Cortez Masto (D-NV)", "party": "D", "state": "NV" },
    "NV-DeanHeller": { "name": "Dean Heller (R-NV)", "party": "R", "state": "NV" },
    "NY-CharlesESchumer": { "name": "Chuck Schumer (D-NY)", "party": "D", "state": "NY" },
    "NY-KirstenEGillibrand": { "name": "Kirsten Gillibrand (D-NY)", "party": "D", "state": "NY" },
    "OH-RobPortman": { "name": "Rob Portman (R-OH)", "party": "R", "state": "OH" },
    "OH-SherrodBrown": { "name": "Sherrod Brown (D-OH)", "party": "D", "state": "OH" },
    "OK-JamesLankford": { "name": "James Lankford (R-OK)", "party": "R", "state": "OK" },
    "OK-JamesMInhofe": { "name": "Jim Inhofe (R-OK)", "party": "R", "state": "OK" },
    "OR-JeffMerkley": { "name": "Jeff Merkley (D-OR)", "party": "D", "state": "OR" },
    "OR-RonWyden": { "name": "Ron Wyden (D-OR)", "party": "D", "state": "OR" },
    "PA-PatrickJToomey": { "name": "Pat Toomey (R-PA)", "party": "R", "state": "PA" },
    "PA-RobertPCaseyJr": { "name": "Bob Casey (D-PA)", "party": "D", "state": "PA" },
    "RI-JackReed": { "name": "Jack Reed (D-RI)", "party": "D", "state": "RI" },
    "RI-SheldonWhitehouse": { "name": "Sheldon Whitehouse (D-RI)", "party": "D", "state": "RI" },
    "SC-LindseyGraham": { "name": "Lindsey Graham (R-SC)", "party": "R", "state": "SC" },
    "SC-TimScott": { "name": "Tim Scott (R-SC)", "party": "R", "state": "SC" },
    "SD-JohnThune": { "name": "John Thune (R-SD)", "party": "R", "state": "SD" },
    "SD-MikeRounds": { "name": "Mike Rounds (R-SD)", "party": "R", "state": "SD" },
    "TN-BobCorker": { "name": "Bob Corker (R-TN)", "party": "R", "state": "TN" },
    "TN-LamarAlexander": { "name": "Lamar Alexander (R-TN)", "party": "R", "state": "TN" },
    "TX-JohnCornyn": { "name": "John Cornyn (R-TX)", "party": "R", "state": "TX" },
    "TX-TedCruz": { "name": "Ted Cruz (R-TX)", "party": "R", "state": "TX" },
    "UT-MikeLee": { "name": "Mike Lee (R-UT)", "party": "R", "state": "UT" },
    "UT-OrrinGHatch": { "name": "Orrin Hatch (R-UT)", "party": "R", "state": "UT" },
    "VA-MarkRWarner": { "name": "Mark Warner (D-VA)", "party": "D", "state": "VA" },
    "VA-TimKaine": { "name": "Tim Kaine (D-VA)", "party": "D", "state": "VA" },
    "VT-BernardSanders": { "name": "Bernie Sanders (I-VT)", "party": "I", "state": "VT" },
    "VT-PatrickJLeahy": { "name": "Patrick Leahy (D-VT)", "party": "D", "state": "VT" },
    "WA-MariaCantwell": { "name": "Maria Cantwell (D-WA)", "party": "D", "state": "WA" },
    "WA-PattyMurray": { "name": "Patty Murray (D-WA)", "party": "D", "state": "WA" },
    "WI-RonJohnson": { "name": "Ron Johnson (R-WI)", "party": "R", "state": "WI" },
    "WI-TammyBaldwin": { "name": "Tammy Baldwin (D-WI)", "party": "D", "state": "WI" },
    "WV-JoeManchinIII": { "name": "Joe Manchin (D-WV)", "party": "D", "state": "WV" },
    "WV-ShelleyMooreCapito": { "name": "Shelley Moore Capito (R-WV)", "party": "R", "state": "WV" },
    "WY-JohnBarrasso": { "name": "John Barrasso (R-WY)", "party": "R", "state": "WY" },
    "WY-MichaelBEnzi": { "name": "Mike Enzi (R-WY)", "party": "R", "state": "WY" }
  };

  function normalizeName(name) {
    // should turn something like "TX-TedCruz" into "Ted Cruz (R-TX)"

    return nameMap[name].name;
  }

  function sortByParty(a, b) {
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

  if (!state.ahcaCounts || Object.keys(state.ahcaCounts).length === 0) {
    return html`
    <div class="tracker">
      <h3>Trumpcare Votes</h3>
      <p><strong>We'll be right back with updated vote tally counts.</strong></p>
    </div>
    `;
  } else {
    var noVotes = [];
    if (state.ahcaCounts.no) {
      noVotes = state.ahcaCounts.no.sort(sortByParty);
    }
    var yesVotes = [];
    if (state.ahcaCounts.yes) {
      yesVotes = state.ahcaCounts.yes.sort(sortByParty);
    }
    var unknownVotes = [];
    if (state.ahcaCounts.unknown) {
      unknownVotes = state.ahcaCounts.unknown.sort(sortByParty);
    }
    
    // hack-a-doo overrides
    var definitelyNo = [];
    // some people have been putting democrats in the yes column, fix that
    for (var senatorName in nameMap) {
      if (nameMap[senatorName].party === "D") {
        definitelyNo.push(senatorName);
      }
    }
    definitelyNo.forEach((senator) => {
      // add to hard list
      if (noVotes.indexOf(senator) === -1) {
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

    var definitelyYes = [];
    for (var senatorName in nameMap) {
      if (nameMap[senatorName].party === "R" && senatorName != "AZ-JohnMcCain" && senatorName != "AK-LisaMurkowski" && senatorName != "ME-SusanMCollins") {
        definitelyYes.push(senatorName);
      }
    }
    definitelyYes.forEach((senator) => {
      // add to hard list
      if (yesVotes.indexOf(senator) === -1) {
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

    var definitelyUnknown = [];
    definitelyUnknown.forEach((senator) => {
      // add to hard list
      if (unknownVotes.indexOf(senator) === 0) {
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

    return html`
    <div class="tracker">
      <h2>Help Track Trumpcare</h2>
      <p>Senate Republicans have kept us in the dark on Trumpcare, their new bill to replace the Affordable Care Act. This bill will affect one-sixth of our national economy, and the lives of every American.</p>
      <p>It's crucial that constituents know where their legislators stand on this - help us crowdsource our Senate Vote tally by <a href="/issue/rec2cBigI4Dl9vT4M">calling your Senator and adding their current position on the AHCA/Trumpcare bill</a>.</p>
      <h3>${t("tracker.title")}</h3>
      <p class="tracker__required">${t("tracker.required")}</p>
      <div class="tracker__votes">
        <div class="tracker__votes__no" style="width:${noVotes.length}%">${t("tracker.no")}</div>
        <div class="tracker__votes__yes" style="width:${yesVotes.length}%">${t("tracker.yes")}</div>
        <div class="tracker__votes__pass"></div>
      </div>
      <div class="tracker__lists">
        <ul class="tracker__lists__no">
          <li class="header">${t("tracker.noVotes",{'count': noVotes.length})}</li>
          ${noVotes.map((senator) => {return html`<li class="party_${nameMap[senator].party}">${normalizeName(senator)}</li>`})}
        </ul>
        <ul class="tracker__lists__yes">
          <li class="header">${t("tracker.yesVotes",{'count': yesVotes.length})}</li>
          ${yesVotes.map((senator) => {return html`<li class="party_${nameMap[senator].party}">${normalizeName(senator)}</li>`})}
        </ul>
        <ul class="tracker__lists__undecided">
          <li class="header">${t("tracker.unknownVotes",{'count': unknownVotes.length})}</li>
          ${unknownVotes.map((senator) => {return html`<li class="party_${nameMap[senator].party}">${normalizeName(senator)}</li>`})}
        </ul>
      </div>
    </div>
    `;
  }

};