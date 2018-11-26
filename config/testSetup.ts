// fixes a warning during test that polyfills are required
// https://github.com/facebookincubator/create-react-app/issues/3199
// we don't use `react-scripts` so upgrading that isn't a proper solution for us
import 'raf/polyfill';
// enzyme configuration
import { configure } from 'enzyme';
import * as ReactSixteenAdapter from 'enzyme-adapter-react-16';

configure({ adapter: new ReactSixteenAdapter() });
