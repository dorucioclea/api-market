(function () {
    'use strict';

    angular.module('app.organizations')
        .directive('apimOrgTable', organizationsTable);

    
    function organizationsTable() {
        return {
            restrict: 'E',
            scope: {
                orgs: '=',
                memberOrgs: '=',
                publisherMode: '='
            },
            templateUrl: 'views/templates/organization/organizations-table.html',
            controller: function ($scope, orgService, toastService, RequestMembership) {
                $scope.orgService = orgService;
                $scope.isMember = isMember;
                $scope.requestMembership = requestMembership;


                function isMember(org) {
                    for (var i = 0; i < $scope.memberOrgs.length; i++) {
                        if ($scope.memberOrgs[i].id === org.id) {
                            return true;
                        }
                    }
                    return false;
                }

                function requestMembership(org){
                    RequestMembership.save({orgId: org.id},{}, function () {
                        toastService.info('Your request has been sent. You will be notified when the organization owner makes a decision.');
                    });
                }
            }
        }
    }
})();
