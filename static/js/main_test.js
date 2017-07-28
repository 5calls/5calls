/* global arguments */

const chai = require("chai");
const expect = chai.expect;

// code to cause a module to re-run on require
// only until the code is cleaned up to be more testable
var moduleCache = arguments[5];
function clearFromCache(instance) {
  for (var key in moduleCache) {
    if (moduleCache[key].exports == instance) {
      delete moduleCache[key];
      return;
    }
  }
  throw "could not clear instance from module cache";
}

// returns a default 'state' object
function getDefaultState() {
  return {
    activeIssues: [],
    address: "",
    allowBrowserGeo: true,
    askingLocation: false,
    cachedCity: "",
    completedIssues: [],
    issueCategories: [],
    contactIndices: {},
    debug: false,
    fetchingLocation: true,
    geoCacheTime: "",
    geolocation: "",
    inactiveIssues: [],
    issues: [],
    locationFetchType: "browserGeolocation",
    showFieldOfficeNumbers: false,
    selectedLanguage:"en",
    splitDistrict: false,
    donations: {},
    totalCalls: 0,
    userStats: {
      all: [],
      contacted: 0,
      vm: 0,
      unavailable: 0
    },
    validatingLocation: false
  };
}

describe("applying localStorage settings to state", () => {
  var main, expected;

  beforeEach(function() {
    window.localStorage.clear();
    expected = getDefaultState();
  });

  afterEach(function() {
    clearFromCache(main);
  });

  describe("No localStorage values are available", () => {
    it("should have the default state", () => {
      main = require("./main");
      expect(main.state).to.deep.equal(expected);
    });
  });

  describe("org.5calls.location is set", () => {
    beforeEach(function() {
      window.localStorage["org.5calls.location"] = JSON.stringify(["90210"]);
      expected.address = "90210";
      expected.locationFetchType = "address";
      main = require("./main");
    });

    it('should set state.locationFetchType to "address"', () => {
      expect(main.state.locationFetchType).to.equal("address");
    });

    it("should set state.address to the value of org.5calls.location", () => {
      expect(main.state.address).to.equal("90210");
    });

    it("should not change other defaults", () => {
      expect(main.state).to.deep.equal(expected);
    });
  });

  describe("org.5calls.geolocation is set", () => {
    beforeEach(function() {
      window.localStorage["org.5calls.geolocation"] = JSON.stringify([
        "42.222,42.222"
      ]);
      expected.geolocation = "42.222,42.222";
      expected.fetchingLocation = false;
      main = require("./main");
    });

    it("should set state.fetchingLocation to false", () => {
      expect(main.state.fetchingLocation).to.equal(false);
    });

    it("should set state.geolocation to the value of org.5calls.geolocation", () => {
      expect(main.state.geolocation).to.equal("42.222,42.222");
    });

    it("should not change other defaults", () => {
      expect(main.state).to.deep.equal(expected);
    });
  });

  describe("org.5calls.allow_geolocation is true", () => {
    it("should not alter default state", () => {
      window.localStorage["org.5calls.allow_geolocation"] = JSON.stringify([
        true
      ]);

      main = require("./main");

      expect(main.state).to.deep.equal(expected);
    });
  });

  describe("org.5calls.allow_geolocation is false", () => {
    beforeEach(function() {
      window.localStorage["org.5calls.allow_geolocation"] = JSON.stringify([
        false
      ]);
      expected.allowBrowserGeo = false;
      expected.locationFetchType = "ipAddress";

      main = require("./main");
    });

    it("should set state.allowBrowserGeo to false", () => {
      expect(main.state.allowBrowserGeo).to.equal(false);
    });
    
    it('should set state.locationFetchType to "ipAddress"', () => {
      expect(main.state.locationFetchType).to.equal("ipAddress");
    });
    
    it("should not change other defaults", () => {
      expect(main.state).to.deep.equal(expected);
    });
  });

  describe("org.5calls.geolocation_time is set", () => {
    beforeEach(function() {
      window.localStorage["org.5calls.geolocation_time"] = JSON.stringify([
        123456789
      ]);
      expected.geoCacheTime = 123456789;
      main = require("./main");
    });

    it("should set state.geoCacheTime to value of org.5calls.geolocation_time", () => {
      expect(main.state.geoCacheTime).to.equal(123456789);
    });
    
    it("should not change other defaults", () => {
      expect(main.state).to.deep.equal(expected);
    });    
  });

  describe("org.5calls.geolocation_city is set", () => {
    beforeEach(function() {
      window.localStorage["org.5calls.geolocation_city"] = JSON.stringify([
        "Miami"
      ]);
      expected.cachedCity = "Miami";

      main = require("./main");
    });

    it("should set state.cachedCity to value of org.5calls.geolocation_city", () => {
      expect(main.state.cachedCity).to.equal("Miami");
    });
    
    it("should not change other defaults", () => {
      expect(main.state).to.deep.equal(expected);
    });        
  });

  describe("org.5calls.completed is set", () => {
    beforeEach(function() {
      window.localStorage["org.5calls.completed"] = JSON.stringify([
        "idforissue1",
        "idforissue2"
      ]);
      expected.completedIssues = ["idforissue1", "idforissue2"];

      main = require("./main");
    });

    it("should populate state.completedIssues array with the value of org.5calls.completed", () => {
      expect(main.state.completedIssues).to.deep.equal(["idforissue1", "idforissue2"]);
    });
    
    it("should not change other defaults", () => {
      expect(main.state).to.deep.equal(expected);
    });            
  });

  describe("org.5calls.userlocale is set", () => {
    it("should set state.selectedLanguage to value of org.5calls.userlocale", () => {
      window.localStorage["org.5calls.userlocale"] = JSON.stringify(["es"]);
      expected.selectedLanguage = "es";

      main = require("./main");

      expect(main.state).to.deep.equal(expected);
    });
  });

  describe("org.5calls.userStats is set", () => {
    var sampleUserStats = {
      all: [
        {
          contactid: "NY-CharlesESchumer",
          issueid: "recFqp7SJmPilMp91",
          result: "unavailable",
          time: 1492864540133
        }
      ],
      contacted: 0,
      vm: 0,
      unavailable: 1
    };
 
    beforeEach(function() {
      window.localStorage["org.5calls.userStats"] = JSON.stringify([
        sampleUserStats
      ]);
      expected.userStats = sampleUserStats;

      main = require("./main");
    });
    
    it("should set state.userStats object to org.5calls.userStats", () => {
      expect(main.state.userStats).to.deep.equal(sampleUserStats);
    });
    
    it("should not change other defaults", () => {
      expect(main.state).to.deep.equal(expected);
    });                
  });
});
