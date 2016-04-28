(function () {
    'use strict';

    angular.module('app.organizations')
        .controller('ApplicationsCtrl', applicationsCtrl)
        .controller('MembersCtrl', membersCtrl)
        .controller('MyOrganizationsCtrl', myOrganizationsCtrl)
        .controller('OrganizationCtrl', organizationCtrl)
        .controller('OrganizationsCtrl', organizationsCtrl)
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
                $scope.memberOrgs = svcOrgData;
            } else {
                $scope.orgs = appOrgData;
                $scope.memberOrgs = appOrgData;
            }
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
                    }
                },
                backdrop : 'static',
                windowClass: $scope.modalAnim	// Animation Class put here.
            });

        }

    }

    function organizationsCtrl($scope, appOrgData, svcOrgData, orgService, SearchOrgs) {

        $scope.doSearch = doSearch;
        $scope.orgService = orgService;
        init();

        function init() {
            if ($scope.publisherMode) {
                $scope.memberOrgs = svcOrgData;
            } else {
                $scope.memberOrgs = appOrgData;
            }
        }

        function doSearch(searchString) {
            var search = {};
            search.filters = [{name: 'name', value: '%' + searchString + '%', operator: 'like'}];
            search.orderBy = {ascending: true, name: 'name'};
            search.paging = {page: 1, pageSize: 100};

            SearchOrgs.save(search, function (results) {
                $scope.totalOrgs = results.totalSize;
                $scope.orgs = results.beans;
            });
        }
    }

    function organizationCtrl($scope, $modal, $state, screenSize, orgData, organizationId, requests,
                              toastService, TOAST_TYPES, Organization, Member, orgScreenModel) {

        $scope.displayTab = orgScreenModel;
        $scope.org = orgData;
        $scope.pendingRequests = requests;
        $scope.toasts = toastService.toasts;
        $scope.toastService = toastService;
        $scope.xs = screenSize.on('xs', function(match) {
            $scope.xs = match;
        });
        $scope.updateOrgDescription = updateOrgDescription;
        $scope.updateOrgVisibility = updateOrgVisibility;
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
                Organization.update({id: organizationId}, { organizationPrivate: setOrgPrivate }, function (reply) {
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

    function servicesCtrl($scope, $state, $modal, svcData, svcVersions,
                          orgScreenModel, ServiceVersion) {

        $scope.services = svcData;
        $scope.serviceVersions = svcVersions;
        $scope.canPublish = canPublish;
        $scope.canRetire = canRetire;
        $scope.confirmDeleteSvc = confirmDeleteSvc;
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

