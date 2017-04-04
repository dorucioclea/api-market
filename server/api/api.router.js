'use strict';

const express = require('express');
const ctrlApi = require('./api.controller.js');

module.exports = function createRouter(app) {
    const router = new express.Router();

    router.route('/api/*')
        .all(ctrlApi.proxy);

    // Register our routes
    app.use(router);
};