"use strict";

const handleOptionsRequest = async (req, res) => {
  res.writeHead(204);
  res.end();
};

module.exports = { handleOptionsRequest };
