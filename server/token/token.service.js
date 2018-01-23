'use strict';
const config = require(__base + 'modules/t1t-config');
const reqUtil = require('../util/request.util');
const rp = require('request-promise');

function exchangeToken(kcToken, contractApiKey) {
    const endpoint = config.gw.auth.uri + '/login/idp/exchange';

    let requestOptions = {
        method: 'POST',
        uri: endpoint,
        followRedirect : false,
        simple: false,
        resolveWithFullResponse: true,
        json: true,
        body: kcToken,
        headers: reqUtil.defaultHeaders()
    };
    if (contractApiKey && contractApiKey.length) { requestOptions.headers.apikey = contractApiKey; }

    return rp(requestOptions);
}


module.exports = {
    exchangeToken: exchangeToken,
};
