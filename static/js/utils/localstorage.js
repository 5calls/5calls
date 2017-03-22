// localStorage wrapper
module.exports = {
  getAll: (storeName, cb) => {
    try {
      cb(JSON.parse(window.localStorage[storeName]))
    } catch (e) {
      cb([])
    }
  },
  add: (storeName, item, cb) => {
    module.exports.getAll(storeName, (items) => {
      items.push(item)
      saveStore(storeName, JSON.stringify(items), cb)
    })
  },
  replace: (storeName, index, item, cb) => {
    module.exports.getAll(storeName, (items) => {
      items[index] = item
      saveStore(storeName, JSON.stringify(items), cb)
    })
  },
  remove: (storeName, cb) => {
    module.exports.getAll(storeName, () => {
      window.localStorage.removeItem(storeName)
      cb()
    })
  },
}

// handle storage quota errors
function saveStore (storeName, storeItems, cb) {
  try {
    window.localStorage[storeName] = storeItems
    cb()
  }
  catch (e) {
    cb(e)
  }
}
