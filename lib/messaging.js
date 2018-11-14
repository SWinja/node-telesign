/* LIB */

var sendRequest = require('./sendRequest');

/* CONSTRUCTOR */

(function() {

  var Messaging = {};

  /* PRIVATE VARIABLES */

  var params;

  /* PUBLIC FUNCTIONS */

  Messaging.setup = function(setupParams) {
    params = setupParams;
    sendRequest.setup(setupParams);
  };

  Messaging.get = function(options, callback) {
    if (!options || typeof options !== 'object') {
      throw new Error('Error calling Messaging Get - no params object provided.');
    } else if (!callback || typeof callback !== 'function') {
      throw new Error('Error calling Messaging Get - no callback function provided.');
    } else if (!options.referenceId) {
      return callback('Error calling Messaging Get - "referenceId" not provided in the request params.');
    }

    sendRequest.request({
      method: 'GET',
      resource: '/messaging/' + options.referenceId,
      qs: null
    }, function(err, data) {
      return callback(err, data);
    });
  };


  Messaging.sms = function(options, callback) {
    if (!options || typeof options !== 'object') {
      throw new Error('Error calling Messaging SMS - no params object provided.');
    } else if (!callback || typeof callback !== 'function') {
      throw new Error('Error calling Messaging SMS - no callback function provided.');
    } else if (!options.phoneNumber) {
      return callback('Error calling Messaging SMS - "phoneNumber" not provided in the request params.');
    } else if (!options.message) {
      return callback('Error calling Messaging SMS - "message" not provided in the request params.');
    } else if (!options.message_type) {
      return callback('Error calling Messaging SMS - "message_type" not provided in the request params.');
    }

    var fields = {
      phone_number: options.phoneNumber,
      message: options.message,
      message_type: options.message_type,
      sender_id: options.sender_id,
      account_lifecycle_event: options.account_lifecycle_event,
      originating_ip: options.originatingIp,
    };

    sendRequest.request({
      method: 'POST',
      resource: '/messaging',
      qs: null,
      fields: fields
    }, function(err, data) {
      return callback(err, data);
    });
  };


  /* NPM EXPORT */

  if (typeof module === 'object' && module.exports) {
    module.exports = Messaging;
  } else {
    throw new Error('This module only works with NPM in NodeJS/IO.JS environments.');
  }

}());
