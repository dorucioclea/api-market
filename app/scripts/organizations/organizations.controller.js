(function () {
    'use strict';

    angular.module('app.organizations')
        .controller('ApplicationsCtrl', applicationsCtrl)
        .controller('MembersCtrl', membersCtrl)
        .controller('MyOrganizationsCtrl', myOrganizationsCtrl)
        .controller('OrganizationCtrl', organizationCtrl)
        .controller('OrganizationsCtrl', organizationsCtrl)
        .controller('OrgFriendlyNameModalCtrl', orgFriendlyNameModalCtrl)
        .controller('OrgVisibilityModalCtrl', orgVisibilityModalCtrl)
        .controller('PendingCtrl', pendingMembersCtrl)
        .controller('PlansCtrl', plansCtrl)
        .controller('ServicesCtrl', servicesCtrl);


    function applicationsCtrl($scope, $state, appData, orgScreenModel, ApplicationVersion) {

        $scope.applications = appData;
        $scope.goToApp = goToApp;

        orgScreenModel.updateTab('Applications');

        function goToApp(app) {
            ApplicationVersion.query({orgId: app.organizationId, appId: app.id}, function (versions) {
                $state.go('root.application.overview',
                    {orgId: app.organizationId, appId: app.id, versionId: versions[0].version});
            });
        }

    }

    function membersCtrl($scope, $stateParams, memberData, memberDetails, roleData, orgScreenModel, memberHelper) {
        $scope.addMember = addMember;
        $scope.grantRoleToMember = grantRoleToMember;
        $scope.members = memberData;
        $scope.memberDetails = memberDetails;
        $scope.orgId = $stateParams.orgId;
        $scope.removeMember = removeMember;
        $scope.roles = roleData;
        $scope.transferOwnership = transferOwnership;

        orgScreenModel.updateTab('Members');

        function addMember() {
            memberHelper.addMember($scope.org, $scope.roles);
        }

        function grantRoleToMember(role, member) {
            memberHelper.grantRoleToMember($scope.org, role, $scope.User.currentUser, member);
        }

        function removeMember(member) {
            memberHelper.removeMember($scope.org, member);
        }

        function transferOwnership(member) {
            memberHelper.transferOwnership($scope.org, $scope.User.currentUser, member);
        }

    }

    function myOrganizationsCtrl($scope, $modal, filterFilter, appOrgData, svcOrgData, orgService, toastService, headerModel) {

        $scope.toasts = toastService.toasts;
        $scope.orgService = orgService;
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
            $scope.orgs.forEach(function (org) {
                org.isMember = true;
            });
        }

        $scope.$watch('searchText', function (newVal) {
            $scope.filteredOrgs = filterFilter($scope.orgs, {name: newVal});
        });

        function modalNewOrganization() {
            $modal.open({
                templateUrl: 'views/modals/organizationCreate.html',
                size: 'lg',
                controller: 'NewOrganizationCtrl as ctrl',
                resolve: {
                    publisherMode: function () {
                        return $scope.publisherMode;
                    },
                    admin: function () {
                        return $scope.User.currentUser.admin
                    }
                },
                backdrop : 'static',
                windowClass: $scope.modalAnim	// Animation Class put here.
            });

        }

    }

    function organizationsCtrl($scope, appOrgData, svcOrgData, notificationService, orgService, SearchOrgs) {

        $scope.doSearch = doSearch;
        $scope.orgService = orgService;
        init();

        function init() {
            if ($scope.publisherMode) {
                $scope.memberOrgs = svcOrgData;
            } else {
                $scope.memberOrgs = appOrgData;
            }
            notificationService.getOrgsWithPendingRequest().then(function (orgs) {
                $scope.pendingOrgs = orgs;
            });
        }

        function doSearch(searchString) {
            var search = {};
            search.filters = [{name: 'name', value: '%' + searchString + '%', operator: 'like'}];
            search.orderBy = {ascending: true, name: 'name'};
            search.paging = {page: 1, pageSize: 100};

            SearchOrgs.save(search, function (results) {
                $scope.totalOrgs = results.totalSize;
                results.beans.forEach(function (org) {
                    for (var i = 0; i < $scope.memberOrgs.length; i++) {
                        if ($scope.memberOrgs[i].id === org.id) {
                            org.isMember = true;
                        }
                    }
                    for (var j = 0; j < $scope.pendingOrgs.length; j++) {
                        if ($scope.pendingOrgs[j].id === org.id) {
                            org.requestPending = true;
                        }
                    }
                });
                $scope.orgs = results.beans;
            });
        }
    }

    function organizationCtrl($scope, $modal, $q, $stateParams, screenSize, orgData, organizationId, pendingContracts,
                              memberService, toastService, TOAST_TYPES, Organization, Member, orgScreenModel, CONFIG) {

        $scope.displayTab = orgScreenModel;
        $scope.org = orgData;
        $scope.pendingMemberships = [];
        $scope.pendingContracts = pendingContracts;
        $scope.toasts = toastService.toasts;
        $scope.toastService = toastService;
        $scope.xs = screenSize.on('xs', function(match) {
            $scope.xs = match;
        });
        $scope.updateOrgDescription = updateOrgDescription;
        $scope.updateOrgFriendlyName = updateOrgFriendlyName;
        $scope.updateOrgVisibility = updateOrgVisibility;
        $scope.useFriendlyNames = CONFIG.APP.ORG_FRIENDLY_NAME_ENABLED;
        init();

        function init() {
            orgScreenModel.updateOrganization(orgData);
            Member.query({orgId: $scope.org.id}, function (reply) {
                $scope.memberCount = reply.length;
            });

            if ($scope.User.isAuthorizedFor('orgAdmin')) {
                memberService.getPendingRequests($stateParams.orgId).then(function (requests) {
                    var promises = [];
                    requests.forEach(function (req) {
                        promises.push(memberService.getMemberDetails(req.userId).then(function (results) {
                            req.userDetails = results;
                        }));
                    });

                    $q.all(promises).then(function() {
                        $scope.pendingMemberships = requests;
                    })
                });
            }
        }

        function updateOrgDescription(newValue) {
            Organization.update({ id: organizationId }, { description: newValue }, function (reply) {
                toastService.createToast(TOAST_TYPES.INFO, 'Description updated.', true);
            }, function (error) {
                toastService.createErrorToast(error, 'Could not update the organization\'s description.');
            });
        }

        function updateOrgFriendlyName() {
            var modalinstance = $modal.open({
                templateUrl: 'views/modals/organizationEditFriendlyName.html',
                controller: 'OrgFriendlyNameModalCtrl as ctrl',
                resolve: {
                    orgFriendlyName: function () {
                        return $scope.org.friendlyName;
                    }
                },
                backdrop : 'static'
            });

            modalinstance.result.then(function (updatedOrgFriendlyName) {
                Organization.update({id: organizationId}, { friendlyName: updatedOrgFriendlyName }, function () {
                    toastService.success('Organization friendly name now set to <b>' + updatedOrgFriendlyName + '</b>');
                    $scope.org.friendlyName = updatedOrgFriendlyName;
                }, function (error) {
                    toastService.createErrorToast(error, 'Could not update the organization friendly name.');
                });
            })
        }

        function updateOrgVisibility() {
            var modalinstance = $modal.open({
                templateUrl: 'views/modals/organizationEditVisibility.html',
                controller: 'OrgVisibilityModalCtrl as ctrl',
                resolve: {
                    currentlyPrivate: function () {
                        return $scope.org.organizationPrivate;
                    }
                },
                backdrop : 'static'
            });

            modalinstance.result.then(function (setOrgPrivate) {
                Organization.update({id: organizationId}, { organizationPrivate: setOrgPrivate }, function () {
                    toastService.success(setOrgPrivate ? 'Organization now set to <b>Private</b>.' : 'Organization now set to <b>Public</b>.');
                    $scope.org.organizationPrivate = setOrgPrivate;
                }, function (error) {
                    toastService.createErrorToast(error, 'Could not update the organization visibility.');
                });
            })
        }
    }

    function pendingMembersCtrl($scope, $stateParams, roleData, filterFilter, orgScreenModel) {
        $scope.orgId = $stateParams.orgId;
        orgScreenModel.updateTab('Pending');
    }

    function plansCtrl($scope, $modal, planData, planVersions, orgScreenModel, PlanVersion) {

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
                backdrop : 'static',
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
                        backdrop : 'static',
                        windowClass: $scope.modalAnim	// Animation Class put here.
                    });
                });
        }

    }

    function orgFriendlyNameModalCtrl($scope, $modalInstance, orgFriendlyName, REGEX) {
        $scope.cancel = cancel;
        $scope.ok = ok;
        $scope.orgFriendlyName = angular.copy(orgFriendlyName);
        $scope.regex = REGEX;


        function cancel() {
            $modalInstance.dismiss('canceled');
        }

        function ok() {
            $modalInstance.close($scope.orgFriendlyName);
        }
    }

    function orgVisibilityModalCtrl($scope, $modalInstance, currentlyPrivate) {
        $scope.cancel = cancel;
        $scope.ok = ok;
        $scope.currentlyPrivate = currentlyPrivate;
        $scope.setPrivate = currentlyPrivate;


        function cancel() {
            $modalInstance.dismiss('canceled');
        }

        function ok() {
            $modalInstance.close($scope.setPrivate);
        }
    }

    function servicesCtrl($scope, $state, $modal, svcData,
                          orgScreenModel, ServiceVersion) {

        $scope.services = svcData;
        $scope.canPublish = canPublish;
        $scope.canRetire = canRetire;
        $scope.confirmDeleteSvc = confirmDeleteSvc;
        $scope.confirmPublishSvc = confirmPublishSvc;
        $scope.confirmRetireSvc = confirmRetireSvc;
        $scope.toMetrics = toMetrics;
        $scope.modalNewService = modalNewService;

        orgScreenModel.updateTab('Services');

        init();

        function init() {
            // Find services with pending contracts
            angular.forEach($scope.pendingContracts, function (pendingContract) {
                for (var i = 0; i < $scope.services.length; i++) {
                    var svc = $scope.services[i];
                    if (pendingContract.serviceOrg === svc.organizationId &&
                        pendingContract.serviceId === svc.serviceVersionDetails.id &&
                        pendingContract.serviceVersion === svc.serviceVersionDetails.version) {
                        svc.hasPendingContracts = true;
                    }
                }
            })
        }

        function modalNewService() {
            $modal.open({
                templateUrl: 'views/modals/serviceCreate.html',
                size: 'lg',
                controller: 'NewServiceCtrl as ctrl',
                resolve: function() {},
                backdrop : 'static',
                windowClass: $scope.modalAnim	// Animation Class put here.
            });

        }

        function canPublish(svcVersion) {
            return svcVersion.status === 'Ready';
        }

        function canRetire(svcVersion) {
            return svcVersion.status === 'Published';
        }

        function confirmDeleteSvc(svcVersion) {
            var modalInstance = $modal.open({
                templateUrl: 'views/modals/serviceDelete.html',
                size: 'lg',
                controller: 'DeleteServiceCtrl as ctrl',
                resolve: {
                    organizationId: function () {
                        return svcVersion.organizationId;
                    },
                    serviceId: function () {
                        return svcVersion.id;
                    },
                    serviceName: function () {
                        return svcVersion.name;
                    }
                },
                backdrop : 'static',
                windowClass: $scope.modalAnim	// Animation Class put here.
            });

            modalInstance.result.then(function (result) {
                if ( result === 'success') {
                    $state.forceReload();
                }
            });
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
                        backdrop : 'static',
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
                        backdrop : 'static',
                        windowClass: $scope.modalAnim	// Animation Class put here.
                    });
                });
        }

        function toMetrics(svcVersion) {
            $state.go('root.service.metrics',
                {orgId: svcVersion.organizationId, svcId: svcVersion.id, versionId: svcVersion.version});
        }

    }

})();

