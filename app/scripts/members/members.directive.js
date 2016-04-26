(function () {
    'use strict';

    angular.module('app.members')
        .directive('apimPendingMemberList', pendingMemberList);

    
    function pendingMemberList() {
        return {
            restrict: 'E',
            scope: {
                orgId: '@',
                pendingRequests: '='
            },
            templateUrl: 'views/templates/members/pending-list.html',
            controller: function ($scope, memberService, toastService) {
                $scope.grantMembership = grantMembership;
                $scope.rejectRequest = rejectRequest;


                function grantMembership(request, roleId) {
                    memberService.grantMembership($scope.orgId, request, roleId).then(function () {
                        $scope.pendingRequests.splice($scope.pendingRequests.indexOf(request), 1);
                        toastService.success('<b>' + request.userDetails.fullName + '</b> is now a member of the organization with role <b>' + role + '</b>.');
                    }, function (error) {
                        toastService.createErrorToast(error, 'Could not grant membership');
                    })
                }

                function rejectRequest(request) {
                    console.log(request);
                    memberService.rejectMembershipRequest(request).then(function () {
                        toastService.info('Request from <b>' + request.userDetails.fullName  + '</b> rejected.');
                        $scope.pendingRequests.splice($scope.pendingRequests.indexOf(request), 1);
                    }, function (error) {
                        toastService.createErrorToast(error, 'Could not reject membership request');
                    })
                }
            }
        }
    }
})();
