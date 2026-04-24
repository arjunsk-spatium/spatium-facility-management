const http = require('http');

const options = {
  hostname: 'localhost',
  port: 8000,
  path: '/api/portal/modules/user/list/',
  method: 'GET',
};

// we can't do this easily without a token.
