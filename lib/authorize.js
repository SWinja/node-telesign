/* MODULES */

var crypto = require('crypto');
var moment = require('moment');
var queryString = require('query-string');
var NEWLINE = '\n';

/* CONSTRUCTOR */

(function() {

  var Authorize = {};

  /* PRIVATE VARIABLES */

  var params, nonce, currentTime;

  /* PUBLIC FUNCTIONS */

  Authorize.setup = function(setupParams) {
    params = setupParams;
  };

  Authorize.getContentType = function(method, fields) {
    let contentType = '';
    if (method === 'POST' || method === 'PUT') {
      contentType = 'application/x-www-form-urlencoded; charset=utf-8';
    }
    // the case of Json to pass
    if (method === 'POST' && fields === 'json') {
      contentType = 'application/json';
    }
    return contentType;
  };

  Authorize.getAuthHeader = function(method, resource, fields, fieldsJson) {
    nonce = createNonce();
    currentTime = getDateString();

    var contentType = Authorize.getContentType(method, fields);

    var stringToSign =
      method + NEWLINE +
      contentType + NEWLINE +
      NEWLINE +
      'x-ts-auth-method:' + params.authMethod.name + NEWLINE +
      'x-ts-date:' + currentTime + NEWLINE +
      'x-ts-nonce:' + nonce;

    if (fields && (method === 'POST' || method === 'PUT')) {
      if (contentType === 'application/json') {
        stringToSign += NEWLINE + JSON.stringify(fieldsJson);
      } else {
        stringToSign += NEWLINE + queryString.stringify(fields);
      }
    }

    resource = (resource.indexOf('?') > 0)? resource.substr(0, resource.indexOf('?')) : resource;
    stringToSign += NEWLINE + '/v' + params.version + resource;

    // DEBUG
    // console.warn("String to sign:", stringToSign);

    var signature = crypto.createHmac(params.authMethod.hash, new Buffer(params.apiKey, 'base64'));
    signature = signature.update(stringToSign).digest('base64');
    var authorization = 'TSA ' + params.customerId + ':' + signature;
    return authorization;
  };

  Authorize.getHeaders = function(method, resource, fields, fieldsJson) {
    var authHeader = Authorize.getAuthHeader(method, resource, fields, fieldsJson);
    var headers = {
      'Authorization': authHeader,
      'x-ts-date': currentTime,
      'x-ts-auth-method': params.authMethod.name,
      'x-ts-nonce': nonce
    };

    if (method === 'POST' || method === 'PUT') {
      headers['Content-Type'] = Authorize.getContentType(method, fields);
      headers['Content-Length'] = (fieldsJson)? JSON.stringify(fieldsJson).length : queryString.stringify(fields).length;
    }

    return headers;
  };

  /* PRIVATE FUNCTIONS */

  function getDateString() {
    return moment.utc().format('dd, DD MMM YYYY HH:mm:ss ZZ');
  }

  // according to crypto docs, this should never block
  function createNonce() {
    var buf = crypto.randomBytes(48);
    var nonce = buf.toString('hex');
    return nonce;
  }

  /* NPM EXPORT */

  if (typeof module === 'object' && module.exports) {
    module.exports = Authorize;
  } else {
    throw new Error('This module only works with NPM in NodeJS/IO.JS environments.');
  }

}());
