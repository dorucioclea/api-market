(function () {
    'use strict';

    angular.module('app.ui')
        .component('apiPageBreadcrumbs', {
            template: '<div class="api-row breadcrumbs" style="background: #eee">' +
                        '<div class="api-content-container">' +
                            '<div class="panel" style="border: 0; background: #eee">' +
                                '<ol class="breadcrumb breadcrumb-small mb0" style="background: #eee" ng-transclude>' +
                                '</ol>' +
                            '</div>' +
                        '</div>' +
                    '</div>',
            transclude: true
        })
        .component('apiPageHeader', {
            templateUrl: 'views/ui/component-page-header.html',
            bindings: {
                'hasLogo': '<'
            },
            controller: function () {
                console.log(this.hasLogo);
            },
            transclude: {
                'logoSlot': '?base64Logo',
                'headerSlot': 'div'
            }
        });

})();
