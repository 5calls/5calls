# 5 Calls

## building

- Build the react components:
  - `yarn deploy-js` will build the react components and move the js files into the hugo directories
- Fetch the current 5 Calls content
  - `yarn build-content` will fetch the latest topics and build hugo content files in the right place
- Build and deploy hugo
  - `hugo` will build the site and content, placing the final built site in `public/`

This happens automatically for production via netlify but you will have to run manually for local installs.
