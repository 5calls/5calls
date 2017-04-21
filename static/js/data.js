// Functions for retrieving data from API

const sampleData = `
  {"issues": [
    {"id": "0",
     "name": "Request investigation into Trump’s conflict of interest in refusing to divest his businesses",
     "script": "Hi, my name is [Your Name], and I support a bipartisan review of Donald Trump’s finances and apparent conflicts of interest.",
     "contacts": [{"Name":"Nancy Pelosi","Phone":"(202) 225-4965","PhotoURL":"http://bioguide.congress.gov/bioguide/photo/P/P000197.jpg","Area":"House"},{"Name":"Dianne Feinstein","Phone":"(202) 224-3841","PhotoURL":"http://feinstein.senate.gov/public/_images/aboutdianne/officiaphoto-thumbl.jpg","Area":"Senate"},{"Name":"Barbara Boxer","Phone":"(202) 224-3553","PhotoURL":"http://bioguide.congress.gov/bioguide/photo/B/B000711.jpg","Area":"Senate"}]
    },
    {"id": "1",
     "name": "Public repudiation of Trump’s selection of Steve Bannon as Senior Counselor",
     "script": "Hi, my name is [Your Name], and I’m a constituent of [Representative’s Name]. I live at [Your Address]. I’m calling to ask [Representative’s Name] to make it a priority to pressure Paul Ryan to pressure Donald Trump to remove Steve Bannon, a known white supremacist, from the position of Chief Strategist. Bannon is a dangerous man.",
     "contacts": [{"Name":"Nancy Pelosi","Phone":"(202) 225-4965","PhotoURL":"http://bioguide.congress.gov/bioguide/photo/P/P000197.jpg","Area":"House"},{"Name":"Dianne Feinstein","Phone":"(202) 224-3841","PhotoURL":"http://feinstein.senate.gov/public/_images/aboutdianne/officiaphoto-thumbl.jpg","Area":"Senate"},{"Name":"Barbara Boxer","Phone":"(202) 224-3553","PhotoURL":"http://bioguide.congress.gov/bioguide/photo/B/B000711.jpg","Area":"Senate"}]
    },
    {"id": "2",
     "name": "Call the Justice department and ask that they audit the vote.",
     "script": "Hi, my name is [Your Name], and I’m calling to ask that the Justice Department audit the results of the 2016 presidential election to validate the vote count and look into charges of voter suppression and possible tampering by foreign powers.",
     "contacts": [{"Name": "U.S. Department of Justice", "Phone": "(202) 353-1555", "PhotoURL": null, "Area": "Other"},{"Name":"Nancy Pelosi","Phone":"(202) 225-4965","PhotoURL":"http://bioguide.congress.gov/bioguide/photo/P/P000197.jpg","Area":"House"},{"Name":"Dianne Feinstein","Phone":"(202) 224-3841","PhotoURL":"http://feinstein.senate.gov/public/_images/aboutdianne/officiaphoto-thumbl.jpg","Area":"Senate"},{"Name":"Barbara Boxer","Phone":"(202) 224-3553","PhotoURL":"http://bioguide.congress.gov/bioguide/photo/B/B000711.jpg","Area":"Senate"}]
    }
  ]}
`;

module.exports = {
  getIssues: () => {
    return JSON.parse(sampleData);
  }
};
