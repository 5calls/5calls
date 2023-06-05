# 5 Calls

## ways to help out

Hi there! Are you here to find out how you can volunteer your time to help with 5 Calls? Here are some ways you can help out with various skillsets:

- Web development: xxx
- Mobile development: xxx
- Policy and Writing: xxx

## how the site works

...well

## building

For development:
- start hugo with `hugo server`
- move to react folder with `cd react`
  - make sure yarn is up-to-date with `yarn`
  - then rebuild the js with `yarn build-js`

- Build the react components:
  - `yarn build-js` will build the react components and move the js files into the hugo directories
- Fetch the current 5 Calls content
  - `yarn build-content` will fetch the latest topics and build hugo content files in the right place
- Build and deploy hugo
  - `hugo` will build the site and content, placing the final built site in `public/`

This happens automatically for production via netlify but you will have to run manually for local installs.

## deployment

New versions are deployed to a google cloud storage bucket automatically with `main` via github actions.

## archived content

The content archives are not updated each build but with a separate `yarn build-archives` command. This content is then committed to the repo, unlike the active content.

Right now this only includes content from previous Congressional sessions, ideally we should update this with content from the current session as soon as it's no longer callable.
