'use strict'

const handleNotFound = async (req, res) => {
  res.statusCode = 404
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify({ message: 'Not found 404!' }))
}

module.exports = { handleNotFound }