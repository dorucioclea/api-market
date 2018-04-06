Trust1Gateway - Marketplace: API Marketplace for the Trust1Gateway
==================================================================
[![][t1g-logo]][Trust1Gateway-url]

Open source API manager build on [Kong](https://getkong.org/)
The API marketplace is an Angular application consuming the Trust1Gateway API Engine.
It's a convenient way for developers to manage application security credentials, configuration
and the contracted services.

Github project
--------------
Source: <https://github.com/Trust1Team/api-gateway>

Kong version
------------

![][kong-logo]

Using the open source Kong 0.10.1 (CE)

Documentation
-------------
We are working on the Trust1Gateway documentation:
[Trust1Gateway - Documentation](https://www.gitbook.com/book/t1t/trust1gateway-marketplace-guide/details)


## Running development server

### Installing dependencies
Run `yarn install` to install all dependencies. Use of Yarn is recommended, but `npm install` will work too if you don't have Yarn installed.

### Running
For development purposes, make sure your `config.yaml` file is up to date and the environment is set to "local" or "development".
You can then run `nodemon app.js` to start a nodemon process which watches for changes in the BFF (this assumes you have nodemon installed);
 Then run `grunt serve` to start a livereload server which watches for changes in the client.


## Building for deployment

Please see the [deployment guide](https://t1t.gitbooks.io/trust1gateway-architecture-deployment/content/deployment/t1g-marketplace.html):.



## Testing

Running `grunt test` will run the unit tests with karma.



[Trust1Team-url]: https://trust1team.com
[Trust1Gateway-url]: https://www.trust1gateway.com
[Github-T1G]: https://github.com/Trust1Team/api-gateway
[t1t-logo]: http://imgur.com/lukAaxx.png
[t1c-logo]: http://i.imgur.com/We0DIvj.png
[t1g-logo]: https://i.imgur.com/zsGZaoC.png
[t1g-documentation]: https://www.gitbook.com/book/t1t/trust1gateway-marketplace-guide/details
[kong-logo]: https://i.imgur.com/ykM19BJ.png
[kong-uri]: https://getkong.org/



