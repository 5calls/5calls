# 5 Calls

## How the site works

Pages on the site are static files built with hugo. This makes things speedy to load and cheap to host.
We make certain sections of the site dynamic by injecting small react components that handle ~1 task. Components are:
- Location selector
- Reps list on issue pages
- Local office list
- Script customizations
- Outcome buttons
- Total calls on home page

Our goal is to keep the pages fast, publish the info that people read first statically in html so it renders ~immediately and then load any dynamic content in small components on the page afterwards.

## Building and running the app

### Prerequisites

- [Install hugo](https://gohugo.io/installation/) if not already installed.
  - Hugo is a static site generator that builds the HTML pages from markdown content and templates
- [Install yarn](https://yarnpkg.com/getting-started/install) if not already installed. Update it to the latest version with:
  ```
  yarn install
  ```

### For development

First, fetch the latest content (from `/react` directory, run once initially):
```
cd react
yarn build-content
```
This fetches the latest topics and builds hugo content files.

Then, run these commands in parallel (in separate terminal windows/tabs):

1. **Start Hugo server** (from root directory):
   ```
   hugo server
   ```

2. **Build React components** (from `/react` directory):
   ```
   cd react
   yarn build-js:dev
   ```
   This watches for changes and rebuilds the React components automatically.

3. **Run the development server** (from `/react` directory):
   ```
   cd react
   yarn start
   ```

### Viewing the site
- Open http://localhost:1313 (from hugo server)

The hugo server will automatically reload changes after a few seconds. If you're not seeing your changes, try a hard reload (shift+cmd+r).

### Production build
- `hugo` will build the site and content, placing the final built site in `public/`

This happens automatically for production via netlify but you will have to run manually for local installs.

## Deployment

New versions are deployed to netlify automatically from `main`

## Archived content

The content archives are not updated each build but with a separate `yarn build-archives` command. This content is then committed to the repo, unlike the active content.

Right now this only includes content from previous Congressional sessions, ideally we should update this with content from the current session as soon as it's no longer callable.
