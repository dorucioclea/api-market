# api-market

This is the API Store & API Publisher repository.


## Running development server

For development purposes you can run `grunt serve` to start a livereload server with configuration for API Publisher, or run `grunt serve:mkt` to start a server with a profile for API Store.
Both of these will run against the online dev backend.

Run `grunt serveLocal` for a local docker machine, or a local API Engine.


## Building for deployment

There are build profiles available for many different environments, these can be found in the `Gruntfile.js` file.
Find the build profiles you want to use (for example `pub` for the publisher in dev), and then run `grunt <buildprofile>`, so for our example that would be `grunt pub`.

Once the build process completes, you will find the files to be deployed in the `dist` folder, as well as a .zip file containing the deployable.


## Testing

Running `grunt test` will run the unit tests with karma.
