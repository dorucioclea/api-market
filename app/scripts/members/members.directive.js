(function () {
    'use strict';

    angular.module('app.members')
        .directive('apimPendingMemberList', pendingMemberList);

    
    function pendingMemberList() {
        return {
            restrict: 'E',
            scope: {
                orgId: '@',
                pendingRequests: '=',
                filter: '='
            },
            templateUrl: 'views/templates/members/pending-list.html',
            controller: function ($scope, filterFilter, memberService, toastService) {
                $scope.grantMembership = grantMembership;
                $scope.rejectRequest = rejectRequest;

                $scope.$watch('filter', function (newVal) {
                    applyFilter();
                });

                function applyFilter() {
                    $scope.filteredRequests = filterFilter($scope.pendingRequests, $scope.filter);
                }

                function grantMembership(request, roleId) {
                    // TODO add modal confirmation?
                    memberService.grantMembership($scope.orgId, request, roleId).then(function () {
                        $scope.pendingRequests.splice($scope.pendingRequests.indexOf(request), 1);
                        applyFilter();
                        toastService.success('<b>' + request.userDetails.fullName + '</b> is now a member of the organization with role <b>' + role + '</b>.');
                    }, function (error) {
                        toastService.createErrorToast(error, 'Could not grant membership');
                    })
                }

                function rejectRequest(request) {
                    // TODO add modal confirmation?
                    memberService.rejectMembershipRequest(request).then(function () {
                        $scope.pendingRequests.splice($scope.pendingRequests.indexOf(request), 1);
                        applyFilter();
                        toastService.info('Request from <b>' + request.userDetails.fullName  + '</b> rejected.');
                    }, function (error) {
                        toastService.createErrorToast(error, 'Could not reject membership request');
                    })
                }
            }
        }
    }
})();
