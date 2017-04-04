'use strict';
const config = require(__base + 'modules/t1t-config');
const rp = require('request-promise');
const _ = require('lodash');

function proxy (options) {
    let endpoint = config.gw.web.uri + options.uri;

    let requestOptions = {
        method: options.verb,
        uri: endpoint.replace('/api', ''),
        followRedirect : false,
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
    headers['apikey'] = config.apikey;
    headers['Content-Type'] = 'application/json';
    requestOptions.headers = headers;

    return rp(requestOptions);
}

module.exports = {
    proxy: proxy
};