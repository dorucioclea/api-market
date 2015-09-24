;(function(angular) {
  "use strict";


  angular.module("app.ctrl.modals", [])


    /// ==== AddPolicy Controller
    .controller("AddPolicyCtrl", ["$scope", "$modal", "$state", "$stateParams", "policyDefs", "toastService", "TOAST_TYPES", "PlanVersionPolicy", "ServiceVersionPolicy",
      function ($scope, $modal, $state, $stateParams, policyDefs, toastService, TOAST_TYPES, PlanVersionPolicy, ServiceVersionPolicy) {

        $scope.policyDefs = policyDefs;
        $scope.valid = false;
        $scope.selectedPolicy = null;

        switch ($state.current.data.type) {
          case 'plan':
            PlanVersionPolicy.query({orgId: $stateParams.orgId, planId: $stateParams.planId, versionId: $stateParams.versionId}, function (reply) {
              removeUsedPolicies(reply);
            });
            break;
          case 'service':
            ServiceVersionPolicy.query({ orgId: $stateParams.orgId, svcId: $stateParams.svcId, versionId: $stateParams.versionId }, function(reply) {
              removeUsedPolicies(reply);
            });
            break;
        }

        var removeUsedPolicies = function (usedPolicies) {
          angular.forEach(usedPolicies, function (policy) {
            for (var i = 0; i < $scope.policyDefs.length; i++ ) {
              if ($scope.policyDefs[i].id === policy.policyDefinitionId) {
                $scope.policyDefs.splice(i, 1);
                break;
              }
            }
          });
        };

        $scope.modalClose = function() {
          $scope.$close();	// this method is associated with $modal scope which is this.
        };

        $scope.setValid = function (isValid) {
          $scope.valid = isValid;
        };

        $scope.setConfig = function(config) {
          $scope.config = config;
        };
        $scope.getConfig = function() {
          return $scope.config;
        };

        $scope.addPolicy = function() {
          var config = $scope.getConfig();
          var newPolicy = {
            definitionId: $scope.selectedPolicy.id,
            configuration: angular.toJson(config)
          };

          switch ($state.current.data.type) {
            case 'plan':
              PlanVersionPolicy.save({ orgId: $stateParams.orgId, planId: $stateParams.planId, versionId: $stateParams.versionId }, newPolicy, function(reply) {
                $scope.modalClose();
                $state.forceReload();
                toastService.createToast(TOAST_TYPES.SUCCESS, 'Plan policy successfully added.', true);
              }, function (error) {
                $scope.modalClose();
                toastService.createErrorToast(error, 'Could not create the plan policy.');
              });
              break;
            case 'service':
              ServiceVersionPolicy.save({ orgId: $stateParams.orgId, svcId: $stateParams.svcId, versionId: $stateParams.versionId }, newPolicy, function(reply) {
                $scope.modalClose();
                $state.forceReload();
                toastService.createToast(TOAST_TYPES.SUCCESS, 'Service policy successfully added.', true);
              }, function (error) {
                $scope.modalClose();
                toastService.createErrorToast(error, 'Could not create the service policy.');
              });
              break;
          }

        };

        $scope.selectPolicy = function (policy) {
          if (!policy) {
            $scope.include = undefined;
          } else {
            $scope.selectedPolicy = policy;
            $scope.config = {};
            if ($scope.selectedPolicy.formType === 'JsonSchema') {
              //All plugins should fall into this category!
              $scope.include = 'views/modals/partials/policy/json-schema.html';
            } else {
              $scope.include = 'views/modals/partials/policy/Default.html';
            }
          }
        };

      }])

/// ==== Contract creation: Plan Selection Controller
    .controller("PlanSelectCtrl",
    ["$scope", "$modal", "$state", "$stateParams", "$timeout", "selectedApp", "orgScreenModel", "svcModel",
      "toastService", "TOAST_TYPES", "Application", "ApplicationContract", "ApplicationVersion", "CurrentUserAppOrgs", "PlanVersion", "PlanVersionPolicy",
      function ($scope, $modal, $state, $stateParams, $timeout, selectedApp, orgScreenModel, svcModel,
                toastService, TOAST_TYPES, Application, ApplicationContract, ApplicationVersion, CurrentUserAppOrgs, PlanVersion, PlanVersionPolicy) {

        $scope.service = svcModel.getService();
        $scope.orgScreenModel = orgScreenModel;
        var hasAppContext = false;
        if (angular.isDefined(selectedApp.appVersion) && selectedApp.appVersion !== null) {
          $scope.selectedAppVersion = selectedApp.appVersion;
          hasAppContext = true;
        }
        $scope.availablePlans = [];
        $scope.selectedPlanPolicyDetails = [];
        var noPlanSelected = true;

        var checkOrgContext = function () {
          if (orgScreenModel.organization === undefined) {
            // No org context, get user's AppOrgs
            $scope.hasOrgContext = false;
            CurrentUserAppOrgs.query({}, function (reply) {
              $scope.appOrgs = reply;
            });
          } else {
            $scope.hasOrgContext = true;
            $scope.org = orgScreenModel.organization;
          }
        };

        var getOrgApps = function (orgId) {
          Application.query({ orgId: orgId }, function (data) {
            $scope.applications = data;
            if (hasAppContext) {
              getAppVersions($scope.selectedAppVersion.id);
            } else {
              getAppVersions(data[0].id);
            }
          });
        };

        var getAppVersions = function (appId) {
          if (hasAppContext) {
            appId = $scope.selectedAppVersion.id;
          }
          ApplicationVersion.query({ orgId: $scope.org.id, appId: appId }, function (data) {
            $scope.versions = data;
            if(!hasAppContext) {
              $scope.selectedAppVersion = data[0];
              selectedApp.updateApplication(data[0]);
            }
          });
        };

        var getAvailablePlans = function () {
          angular.forEach($scope.service.plans, function (value) {
            PlanVersion.get({orgId: $scope.service.service.organization.id, planId: value.planId, versionId: value.version}, function (planVersion) {
              $scope.availablePlans.push(planVersion);
              if (noPlanSelected) {
                $scope.selectedPlan = planVersion;
                getPlanPolicies();
                noPlanSelected = false;
              }
            });
          });
        };

        var getPlanPolicies = function () {
          PlanVersionPolicy.query({orgId: $scope.selectedPlan.plan.organization.id, planId: $scope.selectedPlan.plan.id, versionId: $scope.selectedPlan.version}, function (policies) {
            $scope.selectedPlanPolicies = policies;
            angular.forEach(policies, function (policy) {
              getPlanPolicyDetails(policy);
            });
          });
        };

        var getPlanPolicyDetails = function (policy) {
          PlanVersionPolicy.get({orgId: $scope.selectedPlan.plan.organization.id, planId: $scope.selectedPlan.plan.id, versionId: $scope.selectedPlan.version, policyId: policy.id}, function (deets) {
            $scope.selectedPlanPolicyDetails[deets.id] = deets;
          });
        };

        $scope.selectOrg = function (organization) {
          orgScreenModel.getOrgDataForId(orgScreenModel, organization.id);
          $scope.org = organization;
          $scope.hasOrgContext = true;
          getOrgApps(organization.id);
        };

        $scope.selectApp = function (application) {
          $scope.selectedAppVersion = application;
          getAppVersions(application.id);
        };

        $scope.selectPlan = function (plan) {
          $scope.selectedPlan = plan;
          getPlanPolicies();
        };

        $scope.selectVersion = function (version) {
          $scope.selectedAppVersion = version;
          selectedApp.updateApplication(version);
        };

        checkOrgContext();
        if ($scope.hasOrgContext) {
          getOrgApps(orgScreenModel.organization.id);
        }
        getAvailablePlans();

        $scope.startCreateContract = function() {
          var contract = {
            serviceOrgId: $scope.service.service.organization.id,
            serviceId: $scope.service.service.id,
            serviceVersion: $scope.service.version,
            planId: $scope.selectedPlan.plan.id
          };
          ApplicationContract.save({orgId: $scope.selectedAppVersion.organizationId, appId: $scope.selectedAppVersion.id, versionId: $scope.selectedAppVersion.version}, contract, function (data) {
            $state.go('root.market-dash', {orgId: $scope.selectedAppVersion.organizationId});
            $scope.modalClose();
            var msg = '<b>Contract created!</b><br>' +
              'A contract was created between application <b>' + $scope.selectedAppVersion.name + ' ' + $scope.selectedAppVersion.version + '</b> and service <b>' +
              $scope.service.service.organization.name + ' ' + $scope.service.service.name + ' ' + $scope.service.version + '</b>, using plan <b>' +
              $scope.selectedPlan.plan.name + ' ' + $scope.selectedPlan.version + '</b>.';
            toastService.createToast(TOAST_TYPES.SUCCESS, msg, true);
          }, function (error) {
            $state.go('root.market-dash', {orgId: $scope.selectedAppVersion.organizationId});
            $scope.modalClose();
            toastService.createErrorToast(error, 'Could not create the contract.');
          });
        };

        $scope.modalClose = function() {
          $scope.$close();	// this method is associated with $modal scope which is this.
        };

      }])

/// ==== PublishApplication Controller
    .controller("PublishApplicationCtrl", ["$scope", "$rootScope", "$state", "$modal", "appVersion", "appContracts", "actionService",
      function ($scope, $rootScope, $state, $modal, appVersion, appContracts, actionService) {

        $scope.selectedAppVersion = appVersion;
        $scope.contracts = appContracts;

        $scope.modalClose = function() {
          $scope.$close();	// this method is associated with $modal scope which is this.
        };

        $scope.doPublish = function () {
          actionService.publishApp($scope.selectedAppVersion, true);
          $scope.modalClose();
        };

      }])

/// ==== RetireApplication Controller
    .controller("RetireApplicationCtrl", ["$scope", "$rootScope", "$modal", "appVersion", "appContracts", 'actionService',
      function ($scope, $rootScope, $modal, appVersion, appContracts, actionService) {

        $scope.applicationVersion = appVersion;
        $scope.contracts = appContracts;

        $scope.modalClose = function() {
          $scope.$close();	// this method is associated with $modal scope which is this.
        };

        $scope.doRetire = function () {
          actionService.retireApp($scope.applicationVersion, true);
          $scope.modalClose();
        };

      }])

/// ==== NewApplication Controller
    .controller("NewApplicationCtrl", ["$scope", "$modal", "$state", "flowFactory", "alertService", "imageService", "orgScreenModel", "toastService", "TOAST_TYPES", "Application",
      function ($scope, $modal, $state, flowFactory, alertService, imageService, orgScreenModel, toastService, TOAST_TYPES, Application) {

        alertService.resetAllAlerts();
        $scope.currentOrg = orgScreenModel.organization;
        $scope.imageService = imageService;
        $scope.alerts = alertService.alerts;
        $scope.flow = flowFactory.create({
          singleFile: true
        });

        $scope.readFile = function ($file) {
          if(imageService.checkFileType($file)) {
            imageService.readFile($file);
            return true;
          } else {
            return false;
          }
        };

        $scope.closeAlert = function(index) {
          alertService.closeAlert(index);
        };

        $scope.createApplication = function (application) {
          if (imageService.image.fileData) {
            application.base64logo = imageService.image.fileData;
          } else {
            application.base64logo = "";
          }
          Application.save({orgId: $scope.currentOrg.id}, application, function (app) {
            $scope.modalClose();
            $state.forceReload();
            toastService.createToast(TOAST_TYPES.SUCCESS, 'Application <b>' + app.name +  '</b> created!', true);
          }, function (error) {
            if (error.status !== 409){
              $scope.modalClose();
            }
            toastService.createErrorToast(error, 'Could not create application.');
          });
        };

        $scope.modalClose = function() {
          imageService.clear();
          $scope.$close();	// this method is associated with $modal scope which is this.
        };

      }])

/// ==== NewPlan Controller
    .controller("NewPlanCtrl", ["$scope", "$modal", "$state", "$stateParams", "orgScreenModel", "toastService", "TOAST_TYPES", "Plan",
      function ($scope, $modal, $state, $stateParams, orgScreenModel, toastService, TOAST_TYPES, Plan) {

        $scope.org = orgScreenModel.organization;

        $scope.createPlan = function (plan) {
          Plan.save({ orgId: $stateParams.orgId }, plan, function (newPlan) {
            $scope.modalClose();
            $state.go('root.plan.overview', {orgId: $stateParams.orgId, planId: newPlan.id, versionId: plan.initialVersion});
            toastService.createToast(TOAST_TYPES.SUCCESS, 'Plan <b>' + newPlan.name + '</b> created!', true);
          }, function (error) {
            if (error.status !== 409) {
              $scope.modalClose();
            }
            toastService.createErrorToast(error, 'Could not create plan.');
          });
        };

        $scope.modalClose = function() {
          $scope.$close();	// this method is associated with $modal scope which is this.
        };

      }])

    /// ==== EditImgCtrl Controller
    .controller("EditImgCtrl", ["$scope", "$modal", "$state", "$stateParams", "flowFactory", "alertService", "imageService", "toastService", "TOAST_TYPES", "appScreenModel", "currentUserModel", "svcScreenModel", "Application", "CurrentUserInfo", "Service",
      function ($scope, $modal, $state, $stateParams, flowFactory, alertService, imageService, toastService, TOAST_TYPES, appScreenModel, currentUserModel, svcScreenModel, Application, CurrentUserInfo, Service) {
        var type = {};

        if (angular.isUndefined($stateParams.appId) && angular.isUndefined($stateParams.svcId)) {
          type = 'User';
          $scope.currentLogo = currentUserModel.currentUser.base64pic;
        } else if (angular.isUndefined($stateParams.planId) && angular.isUndefined($stateParams.svcId)) {
          type = 'Application';
          $scope.currentLogo = appScreenModel.application.application.base64logo;
        } else {
          type = 'Service';
          $scope.currentLogo = svcScreenModel.service.service.base64logo;
        }
        alertService.resetAllAlerts();
        $scope.imageService = imageService;
        $scope.alerts = alertService.alerts;
        $scope.flow = flowFactory.create({
          singleFile: true
        });

        $scope.cancel = function () {
          imageService.clear();
          $scope.flow.cancel();
        };

        $scope.readFile = function ($file) {
          if(imageService.checkFileType($file)) {
            imageService.readFile($file);
            return true;
          } else {
            return false;
          }
        };

        $scope.closeAlert = function(index) {
          alertService.closeAlert(index);
        };

        $scope.updateLogo = function () {
          var updateObject = {};
          if (type === 'User') {
            if (imageService.image.fileData) {
              updateObject.pic = imageService.image.fileData;
            } else {
              updateObject.pic = "";
            }
          } else {
            if (imageService.image.fileData) {
              updateObject.base64logo = imageService.image.fileData;
            } else {
              updateObject.base64logo = "";
            }
          }

          switch (type) {
            case 'Application':
              Application.update({orgId: $stateParams.orgId, appId: $stateParams.appId}, updateObject, function (reply) {
                handleResult(true, 'Application logo updated!');
              }, function (error) {
                handleResult(false, 'Could not update Application Logo.', error);
              });
              break;
            case 'Service':
              Service.update({orgId: $stateParams.orgId, svcId: $stateParams.svcId}, updateObject, function (reply) {
                handleResult(true, 'Service logo updated!');
              }, function (error) {
                handleResult(false, 'Could not update Service Logo.', error);
              });
              break;
            case 'User':
              CurrentUserInfo.update({}, updateObject, function (reply) {
                handleResult(true, 'Profile pictured saved!');
              }, function (error) {
                handleResult(false, 'Could not update Profile Picture.', error);
              });
              break;
          }
        };

        var handleResult = function (success, msg, error) {
          $scope.modalClose();
          if (success) {
            $state.forceReload();
            toastService.createToast(TOAST_TYPES.SUCCESS, msg, true);
          } else {
            toastService.createErrorToast(error, msg);
          }
        };

        $scope.modalClose = function() {
          imageService.clear();
          $scope.$close();	// this method is associated with $modal scope which is this.
        };

      }])

    /// ==== NewVersion Controller
    .controller("NewVersionCtrl",
    ["$scope", "$state", "$stateParams", "appScreenModel", "planScreenModel", "svcScreenModel", "toastService", "ApplicationVersion", "PlanVersion", "ServiceVersion",
      function ($scope, $state, $stateParams, appScreenModel, planScreenModel, svcScreenModel, toastService, ApplicationVersion, PlanVersion, ServiceVersion) {
        var type = {};

        if (angular.isUndefined($stateParams.appId) && angular.isUndefined($stateParams.svcId)) {
          type = 'Plan';
          $scope.currentVersion = planScreenModel.plan.version;
        } else if (angular.isUndefined($stateParams.planId) && angular.isUndefined($stateParams.svcId)) {
          type = 'Application';
          $scope.currentVersion = appScreenModel.application.version;
        } else {
          type = 'Service';
          $scope.currentVersion = svcScreenModel.service.version;
        }

        $scope.newVersion = '';
        $scope.shouldClone = true;

        $scope.createVersion = function () {
          var newVersion = {
            version: $scope.newVersion,
            clone: $scope.shouldClone,
            cloneVersion: $scope.currentVersion
          };

          switch (type) {
            case 'Application':
              ApplicationVersion.save({ orgId: $stateParams.orgId, appId: $stateParams.appId }, newVersion, function (newAppVersion) {
                $scope.modalClose();
                $state.go('root.application.overview', {orgId: $stateParams.orgId, appId: newAppVersion.application.id, versionId: newAppVersion.version});
              }, function (error) {
                handleError(error, 'application');
              });
              break;
            case 'Plan':
              PlanVersion.save({ orgId: $stateParams.orgId, planId: $stateParams.planId }, newVersion, function (newPlanVersion) {
                $scope.modalClose();
                $state.go('root.plan.overview', {orgId: $stateParams.orgId, planId: newPlanVersion.plan.id, versionId: newPlanVersion.version});
              }, function (error) {
                handleError(error, 'plan');
              });
              break;
            case 'Service':
              ServiceVersion.save({ orgId: $stateParams.orgId, svcId: $stateParams.svcId }, newVersion, function (newSvcVersion) {
                $scope.modalClose();
                $state.go('root.service.overview', {orgId: $stateParams.orgId, svcId: newSvcVersion.service.id, versionId: newSvcVersion.version});
              }, function (error) {
                handleError(error, 'service');
              });
              break;
          }
        };

        var handleError = function (error, type) {
          if (error.status !== 409) {
            $scope.modalClose();
          }
          toastService.createErrorToast(error, 'Could not create new ' + type + ' version.');
        };

        $scope.modalClose = function() {
          $scope.$close();	// this method is associated with $modal scope which is this.
        };

      }])

/// ==== NewService Controller
    .controller("NewServiceCtrl", ["$scope", "$modal", "$state", "$stateParams", "flowFactory", "alertService", "imageService", "orgScreenModel", "toastService", "TOAST_TYPES", "Categories", "Service",
      function ($scope, $modal, $state, $stateParams, flowFactory, alertService, imageService, orgScreenModel, toastService, TOAST_TYPES, Categories, Service) {

        alertService.resetAllAlerts();
        Categories.query({}, function (reply) {
          $scope.currentCategories = reply;
        });
        $scope.org = orgScreenModel.organization;
        $scope.imageService = imageService;
        $scope.alerts = alertService.alerts;
        $scope.flow = flowFactory.create({
          singleFile: true
        });
        $scope.basePathPattern = /^[[a-z\-]+$/;

        $scope.readFile = function ($file) {
          if(imageService.checkFileType($file)) {
            imageService.readFile($file);
            return true;
          } else {
            return false;
          }
        };

        $scope.closeAlert = function(index) {
          alertService.closeAlert(index);
        };

        $scope.createService = function (svc, categories) {
          var cats = [];
          for (var i = 0; i < categories.length; i++) {
            cats.push(categories[i].text);
          }
          if (imageService.image.fileData) {
            svc.base64logo = imageService.image.fileData;
          } else {
            svc.base64logo = "";
          }
          var basePathStart = '/';
          svc.basepath = basePathStart.concat(svc.basepath);
          svc.categories = cats;

          Service.save({ orgId: $stateParams.orgId }, svc, function (newSvc) {
            $scope.modalClose();
            $state.go('root.service.overview', {orgId: $stateParams.orgId, svcId: newSvc.id, versionId: svc.initialVersion});
            toastService.createToast(TOAST_TYPES.SUCCESS, 'Service <b>' + newSvc.name + '</b> created!', true);
          }, function (error) {
            if (error.status !== 409) {
              $scope.modalClose();
            }
            toastService.createErrorToast(error, 'Could not create service.');
          });
        };

        $scope.modalClose = function() {
          imageService.clear();
          $scope.$close();	// this method is associated with $modal scope which is this.
        };

      }])

/// ==== NewOrganization Controller
    .controller("NewOrganizationCtrl", ["$scope", "$modal", "$state", "publisherMode", "currentUserModel", "toastService", "TOAST_TYPES", "Organization",
      function ($scope, $modal, $state, publisherMode, currentUserModel, toastService, TOAST_TYPES, Organization) {

        $scope.createOrganization = function (org) {
          Organization.save(org, function (newOrg) {
            currentUserModel.updateCurrentUserInfo(currentUserModel);
            $scope.modalClose();
            if (publisherMode) {
              $state.go('root.organization', {orgId: newOrg.id});
            } else {
              $state.go('root.market-dash', {orgId: newOrg.id});
            }
            toastService.createToast(TOAST_TYPES.SUCCESS, 'Organization <b>' + newOrg.name + '</b> created!', true);
          }, function (error) {
            if (error.status !== 409) {
              $scope.modalClose();
              $state.go('root.myOrganizations');
            }
            toastService.createErrorToast(error, 'Could not create organization.');
          });
        };

        $scope.modalClose = function() {
          $scope.$close();	// this method is associated with $modal scope which is this.
        };

      }]);

  // #end
})(window.angular);
