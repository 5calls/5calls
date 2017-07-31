const html = require('choo/html');
const scriptLine = require('./scriptLine.js');

const find = require('lodash/find');

module.exports = (state) => {
  const issue = find(state.issues, ['id', state.location.params.issueid]);

  const currentIndex = state.contactIndices[issue.id];
  const currentContact = issue.contacts[currentIndex];
  let script = issue.script;

  // Replacement regexes, ideally standardize copy to avoid complex regexs
  // location - [CITY, ZIP], [CITY, STATE]
  // title - [REP/SEN NAME], [SENATOR/REP NAME], [SEN/REP NAME]
  // sen - [SEN NAME], [SENATOR NAME]
  // rep - [REP NAME], [REP'S NAME]
  // attgen - [Attorney General Name]
  // bill1 - [Senate: S. 823; House- HR 1899]
  // bill2 - [House- H.R. 1180, Senate: S 801]
  // committee - [IF COMMITTEE, ADD: Please pass my message along to the Chairman.]

  const reg = {
    location: /\[CITY,\s?ZIP\]|\[CITY,\s?STATE\]/gi,
    title: /\[REP\/SEN NAME\]|\[SENATOR\/REP NAME\]|\[SEN\/REP NAME\]/gi,
    sen: /\[SEN NAME\]|\[SENATOR NAME\]/gi,
    rep: /\[REP NAME\]|\[REP'S NAME\]/gi,
    attgen: /\[ATTORNEY GENERAL NAME\]/gi,
    bill1: /\[SENATE[:|-]\s?(S.?\s?\d+)[;|,]\s?HOUSE[:|-]\s?(H.?R.?\s?\d+)\]/gi,
    bill2: /\[HOUSE[:|-]\s?(H.?R.?\s?\d+)[;|,]\s?SENATE[:|-]\s?(S.?\s?\d+)\]/gi,
    committee: /\[IF (?:CALLING )?COMMITTEE, ADD:\s?(.*?)\]/gi,
  };

  function format() {
    let replace = {
      location: state.cachedCity,
      sen: '',
      rep: '',
      attgen: '',
    };

    if (currentContact.area == 'House') {
      replace.rep = 'Rep. ' + currentContact.name;
    } else if (currentContact.area == 'Senate') {
      replace.sen = 'Senator ' + currentContact.name;
    } else if (currentContact.area == 'AttorneyGeneral') {
      replace.attgen = 'Attorney General ' + currentContact.name;
    }

    if (replace.location) {
      script = script.replace(reg.location, replace.location);
    }
    if (replace.rep) {
      script = script.replace(reg.title, replace.rep);
      script = script.replace(reg.rep, replace.rep);
      script = script.replace(reg.bill1, "$2");
      script = script.replace(reg.bill2, "$1");
      script = script.replace(reg.committee, "");
    } else if (replace.sen) {
      script = script.replace(reg.title, replace.sen);
      script = script.replace(reg.sen, replace.sen);
      script = script.replace(reg.bill1, "$1");
      script = script.replace(reg.bill2, "$2");
      script = script.replace(reg.committee, "");
    } else if (replace.attgen) {
      script = script.replace(reg.attgen, replace.attgen);
      script = script.replace(reg.committee, "");
    } else {
      script = script.replace(reg.committee, "$1");
    }

    return script.split('\n').map((line) => scriptLine(line));
  }

  return html`
    <div class="call__script__body">
      ${format()}
    </div>
  `;
};