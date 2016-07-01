(function () {
    'use strict';

    angular.module('app.tour', [])
        .service('tourGuide', tourGuide);
    

    function tourGuide($localStorage) {
        this.startMktDashTour = startMktDashTour;

        
        function startMktDashTour() {

            var options = {
                tripTheme: 'black',
                showNavigation: true,
                delay: -1,
                onTripClose: function () {
                    $localStorage.mktDashTourSeen = true;
                },
                onEnd: function () {
                    $localStorage.mktDashTourSeen = true;
                },
                skipLabel: 'End Tour'
            };

            var trip = new Trip([
                {
                    content: 'Now that you\'ve created your first application, would you like a quick tour of this screen?',
                    position: 'screen-center',
                    skipLabel: 'No thanks',
                    nextLabel: 'Sure, let\'s go!'
                },
                {
                    sel : $('#app-name'),
                    position: 's',
                    content : 'You can click the name of your application to show the Application Details screen'
                },
                {
                    sel : $('#version-dropdown'),
                    position: 's',
                    content : 'Applications can have versions'
                },
                {
                    sel : $('#version-dropdown'),
                    position: 's',
                    content : 'This button will allow you to switch between versions'
                },
                {
                    sel : $('#version-dropdown'),
                    position: 's',
                    content : 'Currently it is disabled because no additional versions exist'
                },
                {
                    sel : $('#version-dropdown'),
                    position: 's',
                    content : 'A new version can be created from the Application Details screen'
                },
                {
                    sel : $('#status'),
                    position: 's',
                    content : 'This is your Application\s status'
                },
                {
                    sel : $('#status'),
                    position: 's',
                    content : 'There are 4 possible statuses: \'Created\', \'Ready\', \'Registered\' and \'Retired\''
                },
                {
                    sel : $('#status'),
                    position: 's',
                    content : '\'Created\' status are newly created apps, without any contracts'
                },
                {
                    sel : $('#status'),
                    position: 's',
                    content : 'The status will change to \'Ready\' when an application has at least one contract'
                },
                {
                    sel : $('#status'),
                    position: 's',
                    content : 'Applications in \'Ready\' status can be registered on the API Gateway, activating their contracts'
                },
                {
                    sel : $('#status'),
                    position: 's',
                    content : '\'Registered\' status is for applications that are active on the API Gateway'
                },
                {
                    sel : $('#status'),
                    position: 's',
                    content : 'And lastly \'Retired\' applications have had their API keys revoked.'
                },
                {
                    sel : $('#new-contract'),
                    position: 's',
                    content : 'Click this button to add a new contract to this application'
                },
                {
                    sel : $('#delete-version'),
                    position: 's',
                    content : 'Use this button to delete an application version'
                },
                {
                    sel : $('#delete-version'),
                    position: 's',
                    content : 'If this is the last existing version, the entire application will be deleted.'
                },
                {
                    content: 'Once you add a contract to this application, additional options will be available.',
                    position: 'screen-center',
                    nextLabel: 'Got it'
                }
            ], options);

            trip.start();
        }
    }

})();
