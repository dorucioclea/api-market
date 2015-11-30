;(function(angular) {
    'use strict';

    angular.module('app.ctrl.organization', [])

        /// ==== Organizations Overview & Search Controller
        .controller('OrganizationsCtrl',
            function ($scope, Organization, SearchOrgs, CurrentUserAppOrgs, CurrentUserSvcOrgs) {

                $scope.isMember = isMember;
                $scope.doSearch = doSearch;
                var userOrgIds = null;

                function isMember(org) {
                    return userOrgIds.indexOf(org.id) > -1;
                }

                function doSearch(searchString) {
                    if (userOrgIds === null) {
                        userOrgIds = [];
                        if ($scope.publisherMode) {
                            CurrentUserSvcOrgs.query({}, function (reply) {
                                addOrgs(reply);
                            });
                        } else {
                            CurrentUserAppOrgs.query({}, function (reply) {
                                addOrgs(reply);
                            });
                        }

                    }

                    var addOrgs = function (reply) {
                        angular.forEach(reply, function (org) {
                            userOrgIds.push(org.id);
                        });
                    };

                    var search = {};
                    search.filters = [{name: 'name', value: '%' + searchString + '%', operator: 'like'}];
                    search.orderBy = {ascending: true, name: 'name'};
                    search.paging = {page: 1, pageSize: 100};

                    SearchOrgs.save(search, function (results) {
                        $scope.totalOrgs = results.totalSize;
                        $scope.orgs = results.beans;
                    });
                }
            })

        /// ==== MyOrganizations Overview Controller
        .controller('MyOrganizationsCtrl',
            function ($scope, $modal, appOrgData, svcOrgData, toastService, headerModel) {

                $scope.toasts = toastService.toasts;
                $scope.toastService = toastService;
                $scope.modalNewOrganization = modalNewOrganization;

                init();

                function init() {
                    headerModel.setIsButtonVisible(false, false, false);

                    if ($scope.publisherMode) {
                        $scope.orgs = svcOrgData;
                    } else {
                        $scope.orgs = appOrgData;
                    }
                }

                function modalNewOrganization() {
                    $modal.open({
                        templateUrl: 'views/modals/organizationCreate.html',
                        size: 'lg',
                        controller: 'NewOrganizationCtrl as ctrl',
                        resolve: {
                            publisherMode: function () {
                                return $scope.publisherMode;
                            }
                        },
                        windowClass: $scope.modalAnim	// Animation Class put here.
                    });

                }

            })

        /// ==== Organization Controller
        .controller('OrganizationCtrl',
            function ($scope, $state, $stateParams, screenSize, orgData,
                      toastService, TOAST_TYPES, Organization, Member, orgScreenModel) {

                $scope.displayTab = orgScreenModel;
                $scope.org = orgData;
                $scope.toasts = toastService.toasts;
                $scope.toastService = toastService;
                $scope.xs = screenSize.on('xs', function(match) {
                    $scope.xs = match;
                });
                $scope.updateOrgDescription = updateOrgDescription;
                init();

                function init() {
                    orgScreenModel.updateOrganization(orgData);
                    Member.query({orgId: $scope.org.id}, function (reply) {
                        $scope.memberCount = reply.length;
                    });
                }

                function updateOrgDescription(newValue) {
                    Organization.update({id: $stateParams.orgId}, {description: newValue}, function (reply) {
                        toastService.createToast(TOAST_TYPES.INFO, 'Description updated.', true);
                    }, function (error) {
                        toastService.createErrorToast(error, 'Could not update the organization\'s description.');
                    });
                }
            })

        // +++ Organization Screen Subcontrollers +++
        /// ==== Plans Controller
        .controller('PlansCtrl',
            function ($scope, $state, $modal, planData, planVersions, orgScreenModel, PlanVersion) {

                $scope.plans = planData;
                $scope.planVersions = planVersions;
                $scope.modalAnim = 'default';
                $scope.canLock = canLock;
                $scope.confirmLockPlan = confirmLockPlan;
                $scope.modalNewPlan = modalNewPlan;

                orgScreenModel.updateTab('Plans');

                function modalNewPlan() {
                    $modal.open({
                        templateUrl: 'views/modals/planCreate.html',
                        size: 'lg',
                        controller: 'NewPlanCtrl as ctrl',
                        resolve: function() {},
                        windowClass: $scope.modalAnim	// Animation Class put here.
                    });

                }

                function canLock(planVersion) {
                    return planVersion.status === 'Created';
                }

                function confirmLockPlan(planVersion) {
                    PlanVersion.get(
                        {orgId: planVersion.organizationId, planId: planVersion.id, versionId: planVersion.version},
                        function (reply) {
                            $modal.open({
                                templateUrl: 'views/modals/planLock.html',
                                size: 'lg',
                                controller: 'LockPlanCtrl as ctrl',
                                resolve: {
                                    planVersion: function () {
                                        return reply;
                                    }
                                },
                                windowClass: $scope.modalAnim	// Animation Class put here.
                            });
                        });
                }

            })

        /// ==== Services Controller
        .controller('ServicesCtrl',
            function ($scope, $state, $modal, svcData, svcVersions,
                      orgScreenModel, ServiceVersion) {

                $scope.services = svcData;
                $scope.serviceVersions = svcVersions;
                $scope.canPublish = canPublish;
                $scope.canRetire = canRetire;
                $scope.confirmPublishSvc = confirmPublishSvc;
                $scope.confirmRetireSvc = confirmRetireSvc;
                $scope.toMetrics = toMetrics;
                $scope.modalNewService = modalNewService;

                orgScreenModel.updateTab('Services');

                function modalNewService() {
                    $modal.open({
                        templateUrl: 'views/modals/serviceCreate.html',
                        size: 'lg',
                        controller: 'NewServiceCtrl as ctrl',
                        resolve: function() {},
                        windowClass: $scope.modalAnim	// Animation Class put here.
                    });

                }

                function canPublish(svcVersion) {
                    return svcVersion.status === 'Ready';
                }

                function canRetire(svcVersion) {
                    return svcVersion.status === 'Published';
                }

                function confirmPublishSvc(svcVersion) {
                    ServiceVersion.get(
                        {orgId: svcVersion.organizationId, svcId: svcVersion.id, versionId: svcVersion.version},
                        function (reply) {
                            $modal.open({
                                templateUrl: 'views/modals/servicePublish.html',
                                size: 'lg',
                                controller: 'PublishServiceCtrl as ctrl',
                                resolve: {
                                    svcVersion: function () {
                                        return reply;
                                    }
                                },
                                windowClass: $scope.modalAnim	// Animation Class put here.
                            });
                        });
                }

                function confirmRetireSvc(svcVersion) {
                    ServiceVersion.get(
                        {orgId: svcVersion.organizationId, svcId: svcVersion.id, versionId: svcVersion.version},
                        function (reply) {
                            $modal.open({
                                templateUrl: 'views/modals/serviceRetire.html',
                                size: 'lg',
                                controller: 'RetireServiceCtrl as ctrl',
                                resolve: {
                                    svcVersion: function () {
                                        return reply;
                                    }
                                },
                                windowClass: $scope.modalAnim	// Animation Class put here.
                            });
                        });
                }

                function toMetrics(svcVersion) {
                    $state.go('root.service.metrics',
                        {orgId: svcVersion.organizationId, svcId: svcVersion.id, versionId: svcVersion.version});
                }

            })

        /// ==== Applications Controller
        .controller('ApplicationsCtrl',
            function ($scope, $state, $modal, appData, orgScreenModel, ApplicationVersion) {

                $scope.applications = appData;
                $scope.goToApp = goToApp;

                orgScreenModel.updateTab('Applications');

                function goToApp(app) {
                    ApplicationVersion.query({orgId: app.organizationId, appId: app.id}, function (versions) {
                        $state.go('root.application.overview',
                            {orgId: app.organizationId, appId: app.id, versionId: versions[0].version});
                    });
                }

            })

        /// ==== Members Controller
        .controller('MembersCtrl',
            function ($scope, $state, $modal, $stateParams, memberData, roleData, orgScreenModel,
                      toastService, TOAST_TYPES, Member) {
                $scope.addMember = addMember;
                $scope.grantRoleToMember = grantRoleToMember;
                $scope.members = memberData;
                $scope.removeMember = removeMember;
                $scope.roles = roleData;
                $scope.transferOwnership = transferOwnership;

                orgScreenModel.updateTab('Members');

                function addMember() {
                    $modal.open({
                        templateUrl: 'views/modals/organizationAddMember.html',
                        size: 'lg',
                        controller: 'AddOrgMemberCtrl as ctrl',
                        resolve: {
                            org: function() {
                                return $scope.org;
                            },
                            roles: function() {
                                return $scope.roles;
                            }
                        },
                        windowClass: $scope.modalAnim	// Animation Class put here.
                    });
                }

                function grantRoleToMember(role, member) {
                    var updateObject = {
                        userId: member.userId,
                        roleId: role.id
                    };
                    Member.update({orgId: $stateParams.orgId, userId: member.userId},
                        updateObject,
                        function (reply) {
                            Member.query({orgId: $stateParams.orgId}, function (updatedList) {
                                $scope.members = updatedList;
                                if (member.userId === $scope.User.currentUser.username) {
                                    // We changed our own role, need to update the CurrentUserInfo
                                    $scope.User.updateCurrentUserInfo($scope.User);
                                }
                                var name = member.userName ? member.userName : member.userId;
                                toastService.createToast(TOAST_TYPES.INFO,
                                    '<b>' + name + '</b> now has the <b>' + role.name + '</b> role.', true);
                            }, function (error) {
                                toastService.createErrorToast(error, 'Could not retrieve updated member roles');
                            });
                        },
                        function (error) {
                            toastService.createErrorToast(error, 'Could not update member role');
                        });
                }

                function removeMember(member) {
                    $modal.open({
                        templateUrl: 'views/modals/organizationRemoveMember.html',
                        size: 'lg',
                        controller: 'MemberRemoveCtrl as ctrl',
                        resolve: {
                            org: function () {
                                return $scope.org;
                            },
                            member: function () {
                                return member;
                            }
                        },
                        windowClass: $scope.modalAnim	// Animation Class put here.
                    });
                }

                function transferOwnership(member) {
                    $modal.open({
                        templateUrl: 'views/modals/organizationTransferOwner.html',
                        size: 'lg',
                        controller: 'TransferOrgCtrl as ctrl',
                        resolve: {
                            org: function () {
                                return $scope.org;
                            },
                            currentOwner: function () {
                                return $scope.User.currentUser;
                            },
                            newOwner: function () {
                                return member;
                            }
                        },
                        windowClass: $scope.modalAnim	// Animation Class put here.
                    });
                }

            });
    // +++ End Organization Screen Subcontrollers +++

    // #end
})(window.angular);
