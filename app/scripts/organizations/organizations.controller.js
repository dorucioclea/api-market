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

    function membersCtrl($scope, $stateParams, memberData, roleData, orgScreenModel, memberHelper) {
        $scope.addMember = addMember;
        $scope.members = memberData;
        $scope.orgId = $stateParams.orgId;
        $scope.roles = roleData;

        orgScreenModel.updateTab('Members');

        function addMember() {
            memberHelper.addMember($scope.org, $scope.roles);
        }
    }

    function myOrganizationsCtrl($scope, $uibModal, filterFilter, appOrgData, svcOrgData, toastService, headerModel) {

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
            $scope.orgs.forEach(function (org) {
                org.isMember = true;
            });
        }

        $scope.$watch('searchText', function (newVal) {
            $scope.filteredOrgs = filterFilter($scope.orgs, {name: newVal});
        });

        function modalNewOrganization() {
            $uibModal.open({
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

    function organizationsCtrl($scope, appOrgData, orgs, svcOrgData, pendingOrgs, orgService, toastService, _) {

        $scope.doSearch = doSearch;
        $scope.orgNameRegex = '\\w+';
        init();

        function init() {
            if ($scope.publisherMode) {
                $scope.memberOrgs = svcOrgData;
            } else {
                $scope.memberOrgs = appOrgData;
            }
            $scope.pendingOrgs = pendingOrgs;
            $scope.orgs = processResults(orgs.beans);
            $scope.totalOrgs = orgs.totalSize;
        }

        function doSearch(searchString) {

            orgService.search(searchString).then(function (results) {
                $scope.totalOrgs = results.totalSize;
                results.beans.forEach(function (org) {
                    for (var i = 0; i < $scope.memberOrgs.length; i++) {
                        if ($scope.memberOrgs[i].id === org.id) {
                            org.isMember = true;
                        }
                    }
                    if(typeof pendingOrgs !== "undefined"){
                        for (var j = 0; j < $scope.pendingOrgs.length; j++) {
                            if ($scope.pendingOrgs[j].id === org.id) {
                                org.requestPending = true;
                            }
                        }
                    }
                });
                $scope.orgs = processResults(results.beans);
            }, function (error) {
                toastService.warning('<b>Could not complete search!</b><br><span class="small">An error occurred while executing the search. Please try again later.</span>');
            });
        }

        function processResults(orgs) {
            var processedOrgs = _.differenceWith(orgs, $scope.memberOrgs, function (a, b) {
                return a.id === b.id;
            });
            processedOrgs.forEach(function (org) {
                // check for pending membership
                for (var j = 0; j < $scope.pendingOrgs.length; j++){
                    if ($scope.pendingOrgs[j].id === org.id) {
                        org.requestPending = true;
                        break;
                    }
                }
            });
            return processedOrgs;
        }
    }

    function organizationCtrl($scope, $uibModal, $q, $stateParams, screenSize, orgData, organizationId, pendingContracts,
                              pendingMemberships, memberService, toastService, TOAST_TYPES, Organization, Member,
                              orgScreenModel, CONFIG) {

        $scope.displayTab = orgScreenModel;
        $scope.org = orgData;
        $scope.pendingMemberships = pendingMemberships;
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
        }

        function updateOrgDescription(newValue) {
            Organization.update({ id: organizationId }, { description: newValue }, function (reply) {
                toastService.createToast(TOAST_TYPES.INFO, 'Description updated.', true);
            }, function (error) {
                toastService.createErrorToast(error, 'Could not update the organization\'s description.');
            });
        }

        function updateOrgFriendlyName() {
            var modalinstance = $uibModal.open({
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
            var modalinstance = $uibModal.open({
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

    function pendingMembersCtrl($scope, $stateParams, orgScreenModel) {
        $scope.orgId = $stateParams.orgId;
        orgScreenModel.updateTab('Pending');
    }

    function plansCtrl($scope, $uibModal, planData, planVersions, orgScreenModel, PlanVersion) {

        $scope.plans = planData;
        $scope.planVersions = planVersions;
        $scope.modalAnim = 'default';
        $scope.canLock = canLock;
        $scope.confirmLockPlan = confirmLockPlan;
        $scope.modalNewPlan = modalNewPlan;

        orgScreenModel.updateTab('Plans');

        function modalNewPlan() {
            $uibModal.open({
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
                    $uibModal.open({
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

    function orgFriendlyNameModalCtrl($scope, $uibModalInstance, orgFriendlyName, REGEX) {
        $scope.cancel = cancel;
        $scope.ok = ok;
        $scope.orgFriendlyName = angular.copy(orgFriendlyName);
        $scope.regex = REGEX;


        function cancel() {
            $uibModalInstance.dismiss('canceled');
        }

        function ok() {
            $uibModalInstance.close($scope.orgFriendlyName);
        }
    }

    function orgVisibilityModalCtrl($scope, $uibModalInstance, currentlyPrivate) {
        $scope.cancel = cancel;
        $scope.ok = ok;
        $scope.currentlyPrivate = currentlyPrivate;
        $scope.setPrivate = currentlyPrivate;


        function cancel() {
            $uibModalInstance.dismiss('canceled');
        }

        function ok() {
            $uibModalInstance.close($scope.setPrivate);
        }
    }

    function servicesCtrl($scope, $state, $uibModal, svcData,
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
            $uibModal.open({
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
            var modalInstance = $uibModal.open({
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
                    $uibModal.open({
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
                    $uibModal.open({
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

