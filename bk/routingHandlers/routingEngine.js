'use strict'

const { handleNotFound } = require("./handleNotFound")
const { handleOptionsRequest } = require("./handleOptionsRequest")
const { routeHandlers } = require("./routeHandlers")

const routingEngine = async (req, res) => {
  const { url, method } = req

  if (method === 'OPTIONS') {
    await handleOptionsRequest(req, res)
    return
  }

  let routeHandled = false
  for (const { prefix, handler } of routeHandlers) {
    if (url.startsWith(prefix)) {
      await handler(req, res)
      routeHandled = true
      break
    }
  }
  if (!routeHandled) {
    await handleNotFound(req, res)
  }
}

module.exports = { routingEngine }
