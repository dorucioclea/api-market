'use strict';
const config = require(__base + 'modules/t1t-config');
const srvProxy = require('./auth.service.js');

function proxy(req, res) {
    const options = {
        verb: req.method,
        uri: req.originalUrl,
        payload: req.body,
        authorization: req.headers.authorization
    };

    srvProxy.proxy(options).then(response => {
        console.log(response);
        return res.status(response.statusCode).json(response.body);
    }, err => {
        console.log(err);
        return res.status(500).json(err);
    });
}

module.exports = {
    proxy: proxy
};