// index.js

const path = './react/node_modules'

module.exports = {
  onPreBuild: async () => {
    if (!(await utils.cache.has(path))) {
      console.log(`File ${path} not cached`)
    } else {
      console.log(`About to restore cached file ${path}...`)
      if (await utils.cache.restore(path)) {
        console.log(`Restored cached file ${path}`)
      }
    }
  },
  onPostBuild: async ({ utils }) => {
    if (await utils.cache.save(path)) {
      console.log(`Saved cached file ${path}`)
    }
  },
};
