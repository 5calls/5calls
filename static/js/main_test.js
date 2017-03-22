const appModel = require('./main.js').model;
const chai = require('chai');
const expect = chai.expect;

describe('startup function', () => {

  function doExpects (cases, expected) {
    
    expected = expected || [];
    
    cases.forEach((state) => {
    
      const sendCalled = []; 
      
      function spyForSend(reducer) {
        sendCalled.push(reducer);
      }

      appModel.effects.startup(state, {}, spyForSend);
      
      expect(sendCalled).to.eql(expected);  

    });
  
  }


  describe('geolocation has been set, or there are no active issues', () => {

    const testCases = [
      { activeIssues: ["issue1"], allowBrowserGeo: true, locationFetchType: "browserGeolocation", address: '', geolocation:'foo'  },
      { activeIssues: ["issue1"], allowBrowserGeo: true, locationFetchType: "browserGeolocation", address: 'foo', geolocation:'foo'  },
      { activeIssues: ["issue1"], allowBrowserGeo: true, locationFetchType: "ipAddress", address: '', geolocation:'foo'  },
      { activeIssues: ["issue1"], allowBrowserGeo: true, locationFetchType: "ipAddress", address: 'foo', geolocation:'foo'  },
      { activeIssues: ["issue1"], allowBrowserGeo: false, locationFetchType: "browserGeolocation", address: '', geolocation:''  },
      { activeIssues: ["issue1"], allowBrowserGeo: false, locationFetchType: "browserGeolocation", address: '', geolocation:'foo'  },
      { activeIssues: ["issue1"], allowBrowserGeo: false, locationFetchType: "browserGeolocation", address: 'foo', geolocation:'foo'  },
      { activeIssues: ["issue1"], allowBrowserGeo: false, locationFetchType: "ipAddress", address: '', geolocation:'foo'  },
      { activeIssues: ["issue1"], allowBrowserGeo: false, locationFetchType: "ipAddress", address: 'foo', geolocation:'foo'  },
      { activeIssues: [], allowBrowserGeo: false, locationFetchType: "browserGeolocation", address: '', geolocation:''  }
    ];

    it('should not invoke send', () => {
      doExpects(testCases);
    });

  }); 


  describe('allowBrowserGeo is true, locationFetchType is browserGeoLocation and geolocation is not set', () => {

    const testCases = [
      { activeIssues: ["issue1"], allowBrowserGeo: true, locationFetchType: "browserGeolocation", address: '', geolocation:''  },
      { activeIssues: ["issue1"], allowBrowserGeo: true, locationFetchType: "browserGeolocation", address: 'foo', geolocation:''  },
      { activeIssues: [], allowBrowserGeo: true, locationFetchType: "browserGeolocation", address: '', geolocation:''  },
      { activeIssues: [], allowBrowserGeo: true, locationFetchType: "browserGeolocation", address: 'foo', geolocation:''  }
    ];

    it('should invoke send with fetchLocationByBrowswer', () => {
      doExpects(testCases, ["fetchLocationByBrowswer"]);
    });

  });  


  describe('no active issues, and geolocation is set', () => {

    const testCases = [
      { activeIssues: [], allowBrowserGeo: true, locationFetchType: "browserGeolocation", address: '', geolocation:'foo'  },
      { activeIssues: [], allowBrowserGeo: true, locationFetchType: "ipAddress", address: '', geolocation:'foo'  },
      { activeIssues: [], allowBrowserGeo: true, locationFetchType: "ipAddress", address: 'foo', geolocation:'foo'  },
      { activeIssues: [], allowBrowserGeo: true, locationFetchType: "browserGeolocation", address: 'foo', geolocation:'foo'  },
      { activeIssues: [], allowBrowserGeo: false, locationFetchType: "browserGeolocation", address: '', geolocation:'foo'  },
      { activeIssues: [], allowBrowserGeo: false, locationFetchType: "browserGeolocation", address: 'foo', geolocation:''  },
      { activeIssues: [], allowBrowserGeo: false, locationFetchType: "browserGeolocation", address: 'foo', geolocation:'foo'  },
      { activeIssues: [], allowBrowserGeo: false, locationFetchType: "ipAddress", address: '', geolocation:'foo'  },
      { activeIssues: [], allowBrowserGeo: false, locationFetchType: "ipAddress", address: 'foo', geolocation:'foo'  }
    ];

    it('should invoke send with fetchingLocation, then fetchActiveIssues', () => {
      doExpects(testCases, ["fetchingLocation", "fetchActiveIssues"]);
    });

  });  


  describe('active issues, geolocation is not set, but address is set', () => {

    const testCases = [
      { activeIssues: ["issue1"], allowBrowserGeo: false, locationFetchType: "browserGeolocation", address: 'foo', geolocation:''  }
    ];

    it('should invoke send with fetchingLocation, then fetchActiveIssues', () => {
      doExpects(testCases, ["fetchingLocation", "fetchActiveIssues"]);
    });

  });  


  describe('locationFetchType is ipAddress and geolocation is not set', () => {

    const testCases = [
      { activeIssues: ["issue1"], allowBrowserGeo: true, locationFetchType: "ipAddress", address: '', geolocation:''  },
      { activeIssues: ["issue1"], allowBrowserGeo: true, locationFetchType: "ipAddress", address: 'foo', geolocation:''  },
      { activeIssues: ["issue1"], allowBrowserGeo: false, locationFetchType: "ipAddress", address: '', geolocation:''  },
      { activeIssues: ["issue1"], allowBrowserGeo: false, locationFetchType: "ipAddress", address: 'foo', geolocation:''  },
      { activeIssues: [], allowBrowserGeo: true, locationFetchType: "ipAddress", address: '', geolocation:''  },
      { activeIssues: [], allowBrowserGeo: true, locationFetchType: "ipAddress", address: 'foo', geolocation:''  },
      { activeIssues: [], allowBrowserGeo: false, locationFetchType: "ipAddress", address: '', geolocation:''  },
      { activeIssues: [], allowBrowserGeo: false, locationFetchType: "ipAddress", address: 'foo', geolocation:''  }
    ];

    it('should invoke send with fetchLocationByIP', () => {
      doExpects(testCases, ["fetchLocationByIP"]);
    });

  });  

});