import mixpanel from 'mixpanel-browser/src/loader-module';

// one would think that because we mocked this in __mocks__ that we also wouldn't have to avoid calling it
// but here we are and I am done fighting with jest mocks
if (mixpanel) {
  mixpanel.init('776fce75f7e3ddfbb13b615dcb94ff95');
}

let environment = process.env.NODE_ENV === 'production';

let actions = {
  identify: id => {
    if (environment) {
      mixpanel.identify(id);
    }
  },
  alias: id => {
    if (environment) {
      mixpanel.alias(id);
    }
  },
  track: (name, props?) => {
    if (environment) {
      mixpanel.track(name, props);
    }
  },
  people: {
    set: props => {
      if (environment) {
        mixpanel.people.set(props);
      }
    },
    increment: props => {
      if (environment) {
        mixpanel.people.increment(props);
      }
    }
  },
  orig: mixpanel
};

export let Mixpanel = actions;
