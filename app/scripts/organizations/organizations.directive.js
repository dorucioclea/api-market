(function () {
    'use strict';

    angular.module('app.organizations')
        .directive('apimOrgTable', organizationsTable);

    
    function organizationsTable() {
        return {
            restrict: 'E',
            scope: {
                orgs: '=',
                publisherMode: '='
            },
            templateUrl: 'views/templates/organization/organizations-table.html',
            controller: function ($scope, $uibModal, memberService, toastService) {
                $scope.requestMembership = requestMembership;

                function requestMembership(org){
                    var modalInstance = $uibModal.open({
                        templateUrl: 'views/modals/membershipRequestConfirm.html',
                        controller: 'ConfirmMembershipRequestModalCtrl as ctrl',
                        resolve: {
                            org: function () {
                                return org;
                            }
                        },
                        backdrop: 'static'
                    });
                    modalInstance.result.then(function () {
                        toastService.info('Requesting membership to <b>' + org.name +'</b>...');
                        memberService.requestMembership(org.id).then(function () {
                            org.requestPending = true;
                            toastService.success('<b>Your request has been sent.</b> You will be notified when the organization owner makes a decision.');
                        }, function (error) {
                            toastService.createErrorToast(error, 'Could not request membership');
                        }); 
                    });
                }
            }
        }
    }
})();
