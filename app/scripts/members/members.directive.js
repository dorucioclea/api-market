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
            controller: function ($scope, $rootScope, $uibModal, filterFilter, memberService, toastService, EVENTS) {
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

                    var modalinstance = $uibModal.open({
                        templateUrl: 'views/modals/membershipGrant.html',
                        controller: 'GrantMembershipModalCtrl as ctrl',
                        resolve: {
                            user: function () {
                                return request.userDetails;
                            },
                            role: function () {
                                return roleId;
                            }
                        },
                        backdrop: 'static'
                    });

                    modalinstance.result.then(function() {
                        memberService.grantMembership($scope.orgId, request, roleId).then(function () {
                            $scope.pendingRequests.splice($scope.pendingRequests.indexOf(request), 1);
                            applyFilter();
                            toastService.success('<b>' + request.userDetails.fullName + '</b> is now a member of the organization with role <b>' + roleId + '</b>.');
                            $rootScope.$broadcast(EVENTS.MEMBER_LIST_UPDATED);
                        }, function (error) {
                            toastService.createErrorToast(error, 'Could not grant membership');
                        })
                    })
                }

                function rejectRequest(request) {
                    
                    var modalinstance = $uibModal.open({
                        templateUrl: 'views/modals/membershipReject.html',
                        controller: 'RejectMembershipModalCtrl as ctrl',
                        resolve: {
                            user: function () {
                                return request.userDetails         
                            }
                        },
                        backdrop: 'static'
                    });
                    
                    modalinstance.result.then(function () {
                        memberService.rejectMembershipRequest(request.organizationId, request.userId).then(function () {
                            $scope.pendingRequests.splice($scope.pendingRequests.indexOf(request), 1);
                            applyFilter();
                            toastService.info('Request from <b>' + request.userDetails.fullName  + '</b> rejected.');
                        }, function (error) {
                            toastService.createErrorToast(error, 'Could not reject membership request');
                        })
                    })
                }
            }
        }
    }
})();
