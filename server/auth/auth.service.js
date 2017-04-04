'use strict';
const config = require(__base + 'modules/t1t-config');
const rp = require('request-promise');
const _ = require('lodash');

function proxy (options) {
    let endpoint = config.gw.auth.uri + options.uri;

    let requestOptions = {
        method: options.verb,
        uri: endpoint.replace('/auth', ''),
        followRedirect : true,
        resolveWithFullResponse: true,
        json: true
    };

    if (!_.isEmpty(options.payload)) {
        requestOptions.body = options.payload;
        requestOptions.json = true;
    }

    let headers = {};
    if (options.authorization) {
        headers['Authorization'] = options.authorization;
    }
    headers['apikey'] = config.gw.apikey;
    headers['Content-Type'] = 'application/json';
    requestOptions.headers = headers;


    console.log('request sent');
    return rp(requestOptions);
}

module.exports = {
    proxy: proxy
};