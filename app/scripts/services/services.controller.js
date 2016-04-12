(function () {
    'use strict';

    angular.module('app.service')
        .controller('ServiceCtrl', serviceCtrl)
        .controller('ServiceActivityCtrl', serviceActivityCtrl)
        .controller('ServiceImplementationCtrl', serviceImplCtrl)
        .controller('ServiceDefinitionCtrl', serviceDefinitionCtrl)
        .controller('ServicePlansCtrl', servicePlansCtrl)
        .controller('ServiceScopeCtrl', serviceScopeCtrl)
        .controller('ServicePoliciesCtrl', servicePoliciesCtrl)
        .controller('ServiceTermsCtrl', serviceTermsCtrl)
        .controller('ServiceAnnouncementsCtrl', serviceAnnouncementsCtrl)
        .controller('ServiceSupportCtrl', serviceSupportCtrl)
        .controller('ServiceOverviewCtrl', serviceOverviewCtrl)
        .controller('ServiceMetricsController', serviceMetricsCtrl);


    function serviceCtrl($scope, $state, $stateParams, $modal, orgData, orgScreenModel, support,
                         svcData, svcVersions, svcScreenModel, resourceUtil, toastService, TOAST_TYPES, service) {

        orgScreenModel.updateOrganization(orgData);
        $scope.serviceVersion = svcData;
        svcScreenModel.updateService(svcData);
        $scope.displayTab = svcScreenModel;
        $scope.versions = svcVersions;
        $scope.support = support;
        $scope.isDeprecated = $scope.serviceVersion.status === 'Deprecated';
        $scope.isReady = $scope.serviceVersion.status === 'Ready';
        $scope.isPublished =
            $scope.serviceVersion.status === 'Published' || $scope.serviceVersion.status === 'Deprecated';
        $scope.isRetired = $scope.serviceVersion.status === 'Retired';
        $scope.tabStatus = svcScreenModel.tabStatus;
        $scope.toasts = toastService.toasts;
        $scope.toastService = toastService;
        $scope.confirmDeleteSvc = confirmDeleteSvc;
        $scope.confirmDeprecateSvc = confirmDeprecateSvc;
        $scope.confirmPublishSvc = confirmPublishSvc;
        $scope.confirmRetireSvc = confirmRetireSvc;

        service.getDefinition($stateParams.orgId, $stateParams.svcId, $stateParams.versionId).then(function (reply) {
            // Clean the reply so we have the pure data object, then
            // Check number of properties in the object, if 0, there is no definition present
            if (Object.keys(resourceUtil.cleanResponse(reply)).length > 0) {
                svcScreenModel.setHasDefinition(true);
            } else {
                svcScreenModel.setHasDefinition(false);
            }
        }, function (error) {
            svcScreenModel.setHasDefinition(false);
        });

        $scope.selectVersion = function (version) {
            $state.go($state.$current.name,
                {orgId: $stateParams.orgId, svcId: $stateParams.svcId, versionId: version.version});
        };


        function confirmDeleteSvc() {
            var modalInstance = $modal.open({
                templateUrl: 'views/modals/serviceDelete.html',
                size: 'lg',
                controller: 'DeleteServiceCtrl as ctrl',
                resolve: {
                    organizationId: function () {
                        return $scope.serviceVersion.service.organization.id;
                    },
                    serviceId: function () {
                        return $scope.serviceVersion.service.id;
                    },
                    serviceName: function () {
                        return $scope.serviceVersion.service.name;
                    }
                },
                backdrop: 'static',
                windowClass: $scope.modalAnim	// Animation Class put here.
            });

            modalInstance.result.then(function (result) {
                if (result === 'success') {
                    $state.go('root.organization.services', {orgId: $scope.serviceVersion.service.organization.id});
                }
            });
        }

        function confirmDeprecateSvc() {
            $modal.open({
                templateUrl: 'views/modals/serviceDeprecate.html',
                size: 'lg',
                controller: 'DeprecateServiceCtrl as ctrl',
                resolve: {
                    svcVersion: function () {
                        return $scope.serviceVersion;
                    }
                },
                backdrop: 'static',
                windowClass: $scope.modalAnim	// Animation Class put here.
            });
        }

        function confirmPublishSvc() {
            $modal.open({
                templateUrl: 'views/modals/servicePublish.html',
                size: 'lg',
                controller: 'PublishServiceCtrl as ctrl',
                resolve: {
                    svcVersion: function () {
                        return $scope.serviceVersion;
                    }
                },
                backdrop: 'static',
                windowClass: $scope.modalAnim	// Animation Class put here.
            });
        }

        function confirmRetireSvc() {
            $modal.open({
                templateUrl: 'views/modals/serviceRetire.html',
                size: 'lg',
                controller: 'RetireServiceCtrl as ctrl',
                resolve: {
                    svcVersion: function () {
                        return $scope.serviceVersion;
                    }
                },
                backdrop: 'static',
                windowClass: $scope.modalAnim	// Animation Class put here.
            });
        }

        $scope.updateDesc = function (newValue) {
            service.updateDescription($stateParams.orgId, $stateParams.svcId, newValue).then(function (reply) {
                toastService.createToast(TOAST_TYPES.INFO, 'Description updated.', true);
            }, function (error) {
                toastService.createErrorToast(error, 'Could not update service\'s description.');
            });
        };

        $scope.showInfoModal = function () {
            $modal.open({
                templateUrl: 'views/modals/helpView.html',
                size: 'lg',
                controller: 'HelpCtrl as ctrl',
                resolve: {
                    type: function () {
                        return 'service';
                    }
                },
                backdrop: 'static',
                windowClass: $scope.modalAnim	// Animation Class put here.
            });
        };

    }

    function serviceActivityCtrl($scope, activityData, svcScreenModel) {

        $scope.activities = activityData.beans;
        svcScreenModel.updateTab('Activity');

    }


    function serviceImplCtrl($scope, $state, toastService, TOAST_TYPES, REGEX, svcScreenModel, service, svcData) {

        $scope.serviceVersion = svcData;
        $scope.updatedService = {
            endpointType: 'rest',
            endpoint: $scope.serviceVersion.endpoint,
            gateways: [{gatewayId: 'KongGateway'}]
        };
        svcScreenModel.updateService(svcData);
        $scope.implementationRegex = REGEX.IMPLEMENTATION;
        $scope.version = svcScreenModel.service;

        $scope.typeOptions = ['rest'];
        svcScreenModel.updateTab('Implementation');

        $scope.selectType = function (newType) {
            $scope.updatedService.endpointType = newType;
        };

        var checkValid = function () {
            var valid = true;
            if (!$scope.updatedService.endpointType || angular.isUndefined($scope.updatedService.endpoint)) {
                valid = false;
            } else if ($scope.updatedService.endpoint === null || $scope.updatedService.endpoint.length === 0) {
                valid = false;
            }
            $scope.isValid = valid;
        };

        $scope.$watch('updatedService', function (newValue) {
            if ($scope.version) {
                var dirty = false;
                if (newValue.endpoint !== $scope.version.endpoint ||
                    newValue.endpointType !== $scope.version.endpointType) {
                    dirty = true;
                }
                checkValid();
                $scope.isDirty = dirty;
            }
        }, true);

        $scope.reset = function () {
            $scope.updatedService.endpoint = $scope.version.endpoint;
            $scope.updatedService.endpointType = $scope.version.endpointType;
            $scope.isDirty = false;
        };

        $scope.saveService = function () {
            service.updateServiceVersion(orgId, svcId, versionId, $scope.updatedService).then(
                function (reply) {
                    toastService.createToast(TOAST_TYPES.SUCCESS,
                        'Endpoint for <b>' + $scope.serviceVersion.service.name + '</b> updated.',
                        true);
                    $scope.isDirty = false;
                    if ($scope.tabStatus.hasImplementation) {
                        $state.forceReload();
                    } else {
                        svcScreenModel.setHasImplementation(true);
                        $state.go('^.definition');
                    }
                }, function (error) {
                    toastService.createErrorToast(error, 'Could not update implementation endpoint.');
                });
        };

    }

    function serviceDefinitionCtrl($scope, $state, $stateParams, endpoint, resourceUtil, toastService, TOAST_TYPES,
                                   SwaggerDocFetch, svcScreenModel, service) {

        svcScreenModel.updateTab('Definition');
        $scope.selectedMethod = 'JSON File';
        $scope.definitionLoaded = false;
        $scope.noDefinition = false;
        $scope.doFetch = doFetch;
        $scope.loadDefinition = loadDefinition;
        $scope.loadPreview = loadPreview;
        $scope.reset = reset;
        $scope.saveDefinition = saveDefinition;
        $scope.selectMethod = selectMethod;
        $scope.isSubmitting = false;

        service.getDefinition($stateParams.orgId, $stateParams.svcId, $stateParams.versionId).then(
            function (reply) {
                // Clean the reply so we have the pure data object
                var cleanReply = resourceUtil.cleanResponse(reply);
                // Check number of properties in the object, if 0, there is no definition present
                if (Object.keys(cleanReply).length > 0) {
                    $scope.currentDefinition = cleanReply;
                    $scope.updatedDefinition = $scope.currentDefinition;
                    $scope.loadSwaggerUi($scope.currentDefinition,
                        'original-swagger-ui-container', endpoint, true);
                } else {
                    $scope.noDefinition = true;
                }
            }, function (error) {
                $scope.noDefinition = true;
            });

        function doFetch(uri) {
            $scope.isSubmitting = true;
            var swaggerDocObj = {
                swaggerURI: uri
            };
            SwaggerDocFetch.save({}, swaggerDocObj, function (reply) {
                $scope.isSubmitting = false;
                $scope.result = 'success';
                loadDefinition(angular.fromJson(reply.swaggerDoc));
            }, function (error) {
                $scope.isSubmitting = false;
                $scope.result = 'error';
            });
        }

        function loadDefinition($fileContent) {
            try {
                $scope.updatedDefinition = angular.fromJson($fileContent);
                $scope.loadPreview($scope.updatedDefinition);
            } catch (err) {
                toastService.warning("<b>Error parsing Swagger JSON!</b>" +
                    "<br><span class='small'>Encountered an error while parsing the Swagger definition." +
                    "<br>Please double-check your JSON syntax.</span>" +
                    "<br><span class='small'><b>" + err + '</b></span>');
            }
        }

        function loadPreview(spec) {
            $scope.definitionLoaded = true;
            $scope.loadSwaggerUi(spec, 'swagger-ui-container', endpoint, true);
        }

        function reset() {
            $scope.definitionLoaded = false;
            $scope.updatedDefinition = $scope.currentDefinition;
        }

        function saveDefinition() {
            service.updateDefinition($stateParams.orgId, $stateParams.svcId, $stateParams.versionId,
                $scope.updatedDefinition).then(
                function (data) {
                    toastService.createToast(TOAST_TYPES.SUCCESS,
                        'Service Definition for <b>' + $scope.serviceVersion.service.name + '</b> updated.',
                        true);
                    if ($scope.tabStatus.hasDefinition) {
                        $state.forceReload();
                    } else {
                        svcScreenModel.setHasDefinition(true);
                        $state.go('^.plans');
                    }
                },
                function (error) {
                    toastService.createErrorToast(error, 'Could not update the definition.');
                });
        }

        function selectMethod(method) {
            $scope.selectedMethod = method;
        }

        $scope.$watch('updatedDefinition', function (def) {
            $scope.changed = (def !== $scope.currentDefinition);
            $scope.invalid = (def === $scope.currentDefinition);
        }, true);
    }

    function servicePlansCtrl($scope, $state, $stateParams, $q, planData, svcScreenModel,
                              toastService, TOAST_TYPES, PlanVersion) {

        svcScreenModel.updateTab('Plans');
        var definedPlans = planData;
        var lockedPlans = [];
        $scope.updatedService = {};
        $scope.version = svcScreenModel.service;

        var getSelectedPlans = function () {
            var selectedPlans = [];
            for (var i = 0; i < lockedPlans.length; i++) {
                var plan = lockedPlans[i];
                if (plan.checked) {
                    var selectedPlan = {};
                    selectedPlan.planId = plan.id;
                    selectedPlan.version = plan.selectedVersion;
                    selectedPlans.push(selectedPlan);
                }
            }
            return selectedPlans;
        };

        //find locked plan versions
        $q(function (resolve) {
            var promises = [];
            angular.forEach(definedPlans, function (plan) {
                promises.push($q(function (resolve, reject) {
                    PlanVersion.query({orgId: $stateParams.orgId, planId: plan.id}, function (planVersions) {
                        var lockedVersions = [];
                        for (var j = 0; j < planVersions.length; j++) {
                            var planVersion = planVersions[j];
                            if (planVersion.status === 'Locked') {
                                lockedVersions.push(planVersion.version);
                            }
                        }
                        // if we found locked plan versions then add them
                        if (lockedVersions.length > 0) {
                            plan.lockedVersions = lockedVersions;
                            lockedPlans.push(plan);
                        }
                        resolve(planVersions);
                    }, reject);
                }));
            });
            $q.all(promises).then(function () {
                lockedPlans.sort(function (a, b) {
                    if (a.id.toLowerCase() < b.id.toLowerCase()) {
                        return -1;
                    } else if (b.id < a.id) {
                        return 1;
                    } else {
                        return 0;
                    }
                });
                resolve(lockedPlans);
                $scope.plans = lockedPlans;
                $scope.reset();
            });
        });

        $scope.$watch('plans', function (newValue) {
            $scope.updatedService.plans = getSelectedPlans();
        }, true);

        $scope.reset = function () {
            for (var i = 0; i < lockedPlans.length; i++) {
                lockedPlans[i].selectedVersion = lockedPlans[i].lockedVersions[0];
                for (var j = 0; j < $scope.version.plans.length; j++) {
                    if (lockedPlans[i].id === $scope.version.plans[j].planId) {
                        lockedPlans[i].checked = true;
                        lockedPlans[i].selectedVersion = $scope.version.plans[j].version;
                        break;
                    }
                    lockedPlans[i].checked = false;
                }
            }
            $scope.updatedService.plans = getSelectedPlans();
            $scope.isDirty = false;
        };

        $scope.$watch('updatedService', function (newValue) {
            var dirty = false;
            if (newValue.plans && $scope.version.plans &&
                newValue.plans.length !== $scope.version.plans.length) {
                dirty = true;
            } else if (newValue.plans && $scope.version.plans) {
                for (var i = 0; i < $scope.version.plans.length; i++) {
                    var p1 = $scope.version.plans[i];

                    for (var j = 0; j < newValue.plans.length; j++) {
                        var p2 = newValue.plans[j];
                        if (p1.planId === p2.planId) {
                            // Found Plan, if versions are not equal ==> dirty
                            if (p1.version !== p2.version) {
                                dirty = true;
                            }
                            break;
                        }
                    }
                }
            }
            $scope.isDirty = dirty;
        }, true);

        $scope.saveService = function () {
            service.updateServiceVersion($stateParams.orgId, $stateParams.svcId. $stateParams.versionId,
                $scope.updatedService).then(
                function (reply) {
                    toastService.createToast(TOAST_TYPES.SUCCESS,
                        'Available Plans for <b>' + $scope.serviceVersion.service.name + '</b> updated.',
                        true);
                    $state.go('^.scopes').then(function () {
                        $state.forceReload();
                    });
                },
                function (error) {
                    toastService.createErrorToast(error, 'Could not update the enabled plans.');
                });
        };

    }

    function serviceScopeCtrl($scope, $state, marketplaces, svcScreenModel, serviceMarketplaces,
                              toastService, TOAST_TYPES, svcData) {
        $scope.mkts = marketplaces.availableMarketplaces;
        var serviceMkts = serviceMarketplaces.availableMarketplaces;
        init();
        $scope.visibilities = ['Show', 'Hide'];
        svcScreenModel.updateTab('Scopes');
        $scope.updatedService = {};

        var selectedMarketplaces = [];

        $scope.orgId = svcData.service.organization.id;
        $scope.svcId = svcData.service.id;
        $scope.versionId = svcData.version;

        /*set the current state of the service version*/
        function init(){
            if(serviceMkts){
                angular.forEach(serviceMkts, function(svmkt){
                    angular.forEach($scope.mkts,function(mkt){
                        if(mkt.code === svmkt.code) {
                            mkt.checked = true;
                            mkt.selectedVisibility = (svmkt.show)?'Show':'Hide';
                        }
                    });
                });
            }
        }

        $scope.$watch('mkts', function (newValue) {
            selectedMarketplaces=[];
            angular.forEach(newValue,function(val){
                if(val.checked===true)selectedMarketplaces.push(val);
            });
            setSelectedMarketplaces(selectedMarketplaces);
            $scope.isDirty = selectedMarketplaces.length>0;
        }, true);

        function setSelectedMarketplaces(selectedMkts){
            if(selectedMkts){
                var mktVisibilities = [];
                angular.forEach(selectedMkts,function(sMkt){
                    var mktVisibility = {};
                    mktVisibility.code = sMkt.code;
                    if(sMkt.selectedVisibility){
                        mktVisibility.show = (sMkt.selectedVisibility =='Hide')?false:true;
                    }else mktVisibility.show = true;//default true
                    mktVisibilities.push(mktVisibility);
                });
                $scope.updatedService.visibility = mktVisibilities;
            }else $scope.updatedService.visibility= {};
        };

        $scope.reset = function () {
            init();
            $scope.isDirty = false;
        };

        function changed(){
            //verify if updateservice is different from the new configuration
            //serviceMkts
            var newConfig = $scope.updatedService.visibility;
            var originalConfig = [];
            console.log("verify original: "+JSON.stringify(serviceMkts));
            console.log("with new: "+JSON.stringify(newConfig));
            for(var key in serviceMkts) {
                originalConfig.push(serviceMkts[key]);
            }
            console.log("verify original reformatted: "+JSON.stringify(originalConfig));
            console.log("Compare: "+arraysEqual(newConfig,originalConfig));
            return ! arraysEqual(newConfig,originalConfig);
        }

        function arraysEqual(a, b) {
            if (a === b) return true;
            if (a == null || b == null) return false;
            if (a.length != b.length) return false;
            for (var i = 0; i < a.length; ++i) {
                if(! _.isEqual(a[i], b[i])) return false;
            }
            return true;
        }

        $scope.saveService = function () {
            if($scope.updatedService && changed()){
                console.log("updatedservice: "+ JSON.stringify($scope.updatedService));
                service.updateServiceVersion($scope.orgId, $scope.svcId, $scope.versionId, $scope.updatedService).then(
                    function (reply) {
                        toastService.createToast(TOAST_TYPES.SUCCESS,
                            'Availability for <b>' + $scope.serviceVersion.service.name + '</b> updated.',
                            true);
                        $state.go('^.policies').then(function () {
                            $state.forceReload();
                        });
                    },
                    function (error) {
                        toastService.createErrorToast(error, 'Could not update the enabled plans.');
                    });
            }
            $scope.isDirty = false;
        };
    }

    function servicePoliciesCtrl($scope, $modal, $stateParams, policyData, policyConfiguration,
                                 svcScreenModel, service) {

        $scope.policies = policyData;
        $scope.policyDetails = policyConfiguration;
        svcScreenModel.updateTab('Policies');

        $scope.removePolicy = function (policy) {
            service.removePolicy($stateParams.orgId, $stateParams.svcId, $stateParams.versionId, policy.id).then(
                function (data) {
                    angular.forEach($scope.policies, function (p, index) {
                        if (policy === p) {
                            $scope.policies.splice(index, 1);
                        }
                    });
                });
        };

        $scope.modalAnim = 'default';

        $scope.modalAddPolicy = function () {
            $modal.open({
                templateUrl: '/views/modals/policyAdd.html',
                size: 'lg',
                controller: 'AddPolicyCtrl as ctrl',
                resolve: {
                    policyDefs: function (PolicyDefs) {
                        return PolicyDefs.query({}).$promise;
                    }
                },
                backdrop: 'static',
                windowClass: $scope.modalAnim	// Animation Class put here.
            });

        };
    }

    function serviceTermsCtrl($scope, $state, svcScreenModel, toastService, TOAST_TYPES) {

        svcScreenModel.updateTab('Terms');
        $scope.htmlTerms = $scope.serviceVersion.service.terms;
        $scope.doSave = doSave;
        $scope.reset = reset;

        function doSave() {
            var termsObject = {terms: $scope.htmlTerms};
            service.updateTerms($scope.serviceVersion.service.organization.id, $scope.serviceVersion.service.id,
                termsObject).then(
                function (reply) {
                    $state.forceReload();
                    toastService.createToast(TOAST_TYPES.SUCCESS,
                        'Terms & Conditions for <b>' + $scope.serviceVersion.service.name + '</b> updated.',
                        true);
                }, function (error) {
                    toastService.createErrorToast(error, 'Could not update the terms & conditions.');
                });
        }

        function reset() {
            $scope.htmlTerms = $scope.serviceVersion.service.terms;
        }

        $scope.$watch('htmlTerms', function (terms) {
            $scope.changed = (terms !== $scope.serviceVersion.service.terms);
            $scope.invalid = (terms === $scope.serviceVersion.service.terms);
        }, true);

    }

    function serviceAnnouncementsCtrl($scope, $modal, svcScreenModel, announcements) {

        svcScreenModel.updateTab('Announcements');
        $scope.modalNewAnnouncement = modalNewAnnouncement;
        $scope.modalViewAnnouncement = modalViewAnnouncement;
        $scope.announcements = announcements;

        function modalNewAnnouncement() {
            $modal.open({
                templateUrl: 'views/modals/announcementCreate.html',
                size: 'lg',
                controller: 'NewAnnouncementCtrl as ctrl',
                resolve: {
                    svcVersion: function () {
                        return $scope.serviceVersion;
                    }
                },
                backdrop: 'static',
                windowClass: $scope.modalAnim	// Animation Class put here.
            });
        }

        function modalViewAnnouncement(announcement) {
            $modal.open({
                templateUrl: 'views/modals/announcementView.html',
                size: 'lg',
                controller: 'ViewAnnouncementCtrl as ctrl',
                resolve: {
                    announcement: function () {
                        return announcement;
                    }
                },
                backdrop: 'static',
                windowClass: $scope.modalAnim	// Animation Class put here.
            });
        }

    }

    function serviceSupportCtrl($scope, $modal, svcScreenModel) {

        svcScreenModel.updateTab('Support');
        $scope.modalNewAnnouncement = modalNewAnnouncement;
        $scope.modalViewAnnouncement = modalViewAnnouncement;

        function modalNewAnnouncement() {
            $modal.open({
                templateUrl: 'views/modals/announcementCreate.html',
                size: 'lg',
                controller: 'NewAnnouncementCtrl as ctrl',
                resolve: {
                    svcVersion: function () {
                        return $scope.serviceVersion;
                    }
                },
                backdrop: 'static',
                windowClass: $scope.modalAnim	// Animation Class put here.
            });
        }

        function modalViewAnnouncement(announcement) {
            $modal.open({
                templateUrl: 'views/modals/announcementView.html',
                size: 'lg',
                controller: 'ViewAnnouncementCtrl as ctrl',
                resolve: {
                    announcement: function () {
                        return announcement;
                    }
                },
                backdrop: 'static',
                windowClass: $scope.modalAnim	// Animation Class put here.
            });
        }

    }

    function serviceOverviewCtrl($scope, svcContracts, svcScreenModel) {

        svcScreenModel.updateTab('Overview');
        $scope.contractCount = svcContracts.length;
        classifyContracts(svcContracts);

        function classifyContracts(contracts) {
            $scope.contractOrgIds = [];
            $scope.contractOrgs = [];
            angular.forEach(contracts, function (contract) {
                if (!$scope.contractOrgs[contract.appOrganizationId]) {
                    $scope.contractOrgs[contract.appOrganizationId] = {
                        name: contract.appOrganizationName,
                        contracts: []
                    };
                }
                if ($scope.contractOrgIds.indexOf(contract.appOrganizationId) === -1) {
                    $scope.contractOrgIds.push(contract.appOrganizationId);
                }
                $scope.contractOrgs[contract.appOrganizationId].contracts.push(contract);
            });
        }

    }

    function serviceMetricsCtrl($scope, $stateParams, svcScreenModel,
                                ServiceMetricsResponse, ServiceMetricsResponseSummary, ServiceMarketInfo) {

        init();
        function init() {
            svcScreenModel.updateTab('Metrics');
            $scope.responseHistogramData = [];
            $scope.summary = {};
            $scope.marketInfo = {};
            $scope.uptime = [];

            $scope.fromDt = new Date();
            $scope.fromDt.setDate($scope.fromDt.getDate() - 7); //Start with a one week period
            $scope.toDt = new Date();
            $scope.interval = 'day';
            $scope.isIntervalMinute = false;
            updateMetrics();
        }

        $scope.open = function ($event, to) {
            $event.preventDefault();
            $event.stopPropagation();

            if (to) {
                $scope.toOpened = true;
            } else {
                $scope.fromOpened = true;
            }
        };

        ServiceMarketInfo.get(
            {orgId: $stateParams.orgId, svcId: $stateParams.svcId, versionId: $stateParams.versionId},
            function (reply) {
                $scope.marketInfo = reply;
                $scope.uptime.push(reply);
            });

        function updateMetrics() {
            ServiceMetricsResponse.get(
                {
                    orgId: $stateParams.orgId,
                    svcId: $stateParams.svcId,
                    versionId: $stateParams.versionId,
                    from: $scope.fromDt,
                    to: $scope.toDt,
                    interval: $scope.interval
                },
                function (response) {
                    createResponseHistogram(response.data);
                });
            ServiceMetricsResponseSummary.get(
                {
                    orgId: $stateParams.orgId,
                    svcId: $stateParams.svcId,
                    versionId: $stateParams.versionId,
                    from: $scope.fromDt,
                    to: $scope.toDt
                },
                function (metrics) {
                    $scope.summary = metrics.data[0];
                });
        }

        function getMinuteMetrics() {
            $scope.fromDt = new Date();
            $scope.fromDt.setDate($scope.fromDt.getDate() - 1); // Only get minute statistics for the last day.
            $scope.toDt = new Date();
            updateMetrics();
        }

        $scope.$watch('fromDt', function (newValue, oldValue) {
            if (newValue !== oldValue) {
                if (!$scope.isIntervalMinute) {
                    updateMetrics();
                }
            }
        });

        $scope.$watch('toDt', function (newValue, oldValue) {
            if (newValue !== oldValue) {
                if (!$scope.isIntervalMinute) {
                    updateMetrics();
                }
            }
        });

        $scope.$watch('interval', function (newValue, oldValue) {
            if (newValue !== oldValue) {
                if ($scope.interval === 'minute') {
                    $scope.isIntervalMinute = true;
                    getMinuteMetrics();
                } else {
                    $scope.isIntervalMinute = false;
                }
                updateMetrics();
            }
        });

        $scope.formatFunction = function (x) {
            return x.getDay();
        };

        function setBlanksToZero(property) {
            return angular.isDefined(property) ? property : 0;
        }

        function createResponseHistogram(dataArray) {
            $scope.responseHistogramData = [];

            angular.forEach(dataArray, function (data) {
                var date = new Date(data.dateInterval);
                var display = '';

                switch ($scope.interval) {
                    case 'month':
                        display = date.getMonth();
                        break;
                    case 'week':
                        display = date.getDate() + '/' + (date.getMonth() + 1);
                        break;
                    case 'day':
                        display = date.getDate() + '/' + (date.getMonth() + 1);
                        break;
                    case 'hour':
                        display = date.getDate() + '/' + (date.getMonth() + 1) + ' ';
                        if (date.getHours < 10) {
                            display += '0';
                        }
                        display += date.getHours() + ':00';
                        break;
                    case 'minute':
                        display = date.getDate() + '/' + (date.getMonth() + 1) + ' ';
                        if (date.getHours() < 10) {
                            display += '0';
                        }
                        display += date.getHours() + ':';
                        if (date.getMinutes() < 10) {
                            display += '0';
                        }
                        display += date.getMinutes();
                        break;
                }

                var graphObject = {
                    'x': date,
                    'displayDate': display,
                    'latency_kong': setBlanksToZero(data.latencyKong),
                    'latency_proxy': setBlanksToZero(data.latencyProxy),
                    'latency_request': setBlanksToZero(data.latencyRequest),
                    'requests_count': setBlanksToZero(data.requestsCount),
                    'requests_wrong': setBlanksToZero(data.requestsWrong),
                    'response_wrong': setBlanksToZero(data.responseWrong)
                };
                $scope.responseHistogramData.push(graphObject);
            });

            $scope.responseHistogramData.sort(function (a, b) {
                return a.x - b.x;
            });
        }

        $scope.responseHistogramColumns = [
            {'id': 'latency_request', 'name': 'Request latency', 'type': 'line', 'color': 'blue'},
            {'id': 'latency_kong', 'name': 'Kong latency', 'type': 'line', 'color': '#071F82'},
            {'id': 'latency_proxy', 'name': 'Proxy latency', 'type': 'line', 'color': '#4F6378'},
            {'id': 'requests_count', 'name': 'Requests', 'type': 'line', 'color': '#25A26A'},
            {'id': 'requests_wrong', 'name': 'Malformed requests', 'type': 'line', 'color': '#FDBE28'},
            {'id': 'response_wrong', 'name': 'Service errors', 'type': 'line', 'color': '#D80303'}
        ];
        $scope.responseHistogramX = {'id': 'displayDate'};

        $scope.gaugeColumns = [{'id': 'uptime', 'name': 'Uptime %', 'type': 'gauge', 'color': 'green'}];

    }

})();
