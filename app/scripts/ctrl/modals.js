;(function(angular) {
  "use strict";


  angular.module("app.ctrl.modals", [])


    /// ==== AddPolicy Controller
    .controller("AddPolicyCtrl", ["$scope", "$modal", "$state", "$stateParams", "policyDefs", "PlanVersionPolicy", "ServiceVersionPolicy",
      function ($scope, $modal, $state, $stateParams, policyDefs, PlanVersionPolicy, ServiceVersionPolicy) {

        $scope.policyDefs = policyDefs;
        $scope.valid = false;
        $scope.selectedPolicy = null;

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
              });
              break;
            case 'service':
              ServiceVersionPolicy.save({ orgId: $stateParams.orgId, svcId: $stateParams.svcId, versionId: $stateParams.versionId }, newPolicy, function(reply) {
                $scope.modalClose();
                $state.forceReload();
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
    .controller("PlanSelectCtrl", ["$scope", "$modal", "$state", "$stateParams", "$timeout", "selectedApp", "svcModel", "toastService", "TOAST_TYPES", "Application", "ApplicationContract", "ApplicationVersion", "PlanVersion", "PlanVersionPolicy",
      function ($scope, $modal, $state, $stateParams, $timeout, selectedApp, svcModel, toastService, TOAST_TYPES, Application, ApplicationContract, ApplicationVersion, PlanVersion, PlanVersionPolicy) {

        $scope.service = svcModel.getService();
        var hasAppContext = false;
        if (angular.isDefined(selectedApp.appVersion) && selectedApp.appVersion !== null) {
          $scope.selectedAppVersion = selectedApp.appVersion;
          hasAppContext = true;
        }
        $scope.availablePlans = [];
        var noPlanSelected = true;


        $scope.getOrgApps = function () {
          //TODO make orgId dynamic even when no app has been selected yet
          var orgId = 'Digipolis';
          if (hasAppContext) {
            orgId = $scope.selectedAppVersion.organizationId;
          }
          Application.query({ orgId: orgId }, function (data) {
            $scope.applications = data;
          });
        };

        $scope.getAppVersions = function () {
          //TODO make orgId dynamic even when no app has been selected yet
          if (hasAppContext) {
            ApplicationVersion.query({ orgId: $scope.selectedAppVersion.organizationId, appId: $scope.selectedAppVersion.id }, function (data) {
              $scope.versions = data;
            });
          }
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
          });
        };

        $scope.selectApp = function (application) {
          $scope.selectedAppVersion = application;
          hasAppContext = true;
          $scope.getAppVersions();
        };

        $scope.selectPlan = function (plan) {
          $scope.selectedPlan = plan;
          getPlanPolicies();
        };

        $scope.selectVersion = function (version) {
          $scope.selectedAppVersion = version;
        };

        $scope.getOrgApps();
        $scope.getAppVersions();
        getAvailablePlans();

        $scope.startCreateContract = function() {
          var contract = {
            serviceOrgId: $scope.service.service.organization.id,
            serviceId: $scope.service.service.id,
            serviceVersion: $scope.service.version,
            planId: $scope.selectedPlan.plan.id
          };
          ApplicationContract.save({orgId: $scope.selectedAppVersion.organizationId, appId: $scope.selectedAppVersion.id, versionId: $scope.selectedAppVersion.version}, contract, function (data) {
            $state.go('root.market-dash');
            var msg = '<b>Contract created!</b><br>' +
              'A contract was created between application <b>' + $scope.selectedAppVersion.name + ' ' + $scope.selectedAppVersion.version + '</b> and service <b>' +
              $scope.service.service.organization.name + ' ' + $scope.service.service.name + ' ' + $scope.service.version + '</b>, using plan <b>' +
              $scope.selectedPlan.plan.name + ' ' + $scope.selectedPlan.version + '</b>.';
            toastService.createToast(TOAST_TYPES.SUCCESS, msg, true);
            $scope.modalClose();
          });
        };

        $scope.modalClose = function() {
          $scope.$close();	// this method is associated with $modal scope which is this.
        };

      }])

    /// ==== AddServicePolicy Controller
    .controller("AddServicePolicyCtrl", ["$scope", "$modal", "$state", "$stateParams", "policyDefs", "ServiceVersionPolicy",
      function ($scope, $modal, $state, $stateParams, policyDefs, ServiceVersionPolicy) {

        $scope.policyDefs = policyDefs;
        $scope.valid = false;
        $scope.selectedPolicy = null;

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
            configuration: config
          };

          ServiceVersionPolicy.save({ orgId: $stateParams.orgId, svcId: $stateParams.svcId, versionId: $stateParams.versionId }, newPolicy, function(reply) {
            $scope.modalClose();
            $scope.forceReload();
          });
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
    .controller("NewApplicationCtrl", ["$scope", "$modal", "$state", "$stateParams", "flowFactory", "alertService", "imageService", "toastService", "TOAST_TYPES", "Application",
      function ($scope, $modal, $state, $stateParams, flowFactory, alertService, imageService, toastService, TOAST_TYPES, Application) {

        alertService.resetAllAlerts();
        $scope.imageService = imageService;
        $scope.alerts = alertService.alerts;
        $scope.flow = flowFactory.create({
          singleFile: true
        });

        $scope.readFile = function ($file, $event, $flow) {
          imageService.readFile($file, $event, $flow);
        };

        $scope.closeAlert = function(index) {
          alertService.closeAlert(index);
        };

        //TODO make orgId dynamic!
        $scope.createApplication = function (application) {
          if (imageService.image.fileData) {
            application.base64logo = imageService.image.fileData;
          } else {
            application.base64logo = "";
          }
          Application.save({ orgId: 'Digipolis' }, application, function (app) {
            $scope.modalClose();
            $state.forceReload();
            toastService.createToast(TOAST_TYPES.SUCCESS, 'Application created!', true);
          });
        };

        $scope.modalClose = function() {
          $scope.$close();	// this method is associated with $modal scope which is this.
        };

      }])

/// ==== NewPlan Controller
    .controller("NewPlanCtrl", ["$scope", "$modal", "$state", "$stateParams", "orgScreenModel", "Plan",
      function ($scope, $modal, $state, $stateParams, orgScreenModel, Plan) {

        $scope.org = orgScreenModel.organization;

        $scope.createPlan = function (plan) {
          Plan.save({ orgId: $stateParams.orgId }, plan, function (newPlan) {
            $scope.modalClose();
            $state.go('root.plan.overview', {orgId: $stateParams.orgId, planId: newPlan.id, versionId: plan.initialVersion});
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
                success('Application logo updated!');
              });
              break;
            case 'Service':
              Service.update({orgId: $stateParams.orgId, svcId: $stateParams.svcId}, updateObject, function (reply) {
                success('Service logo updated!');
              });
              break;
            case 'User':
              CurrentUserInfo.update({}, updateObject, function (reply) {
                success('Profile pictured saved!');
              });
              break;
          }
        };

        var success = function (msg) {
          $scope.modalClose();
          $state.forceReload();
          toastService.createToast(TOAST_TYPES.SUCCESS, msg, true);
        };

        $scope.modalClose = function() {
          imageService.clear();
          $scope.$close();	// this method is associated with $modal scope which is this.
        };

      }])

    /// ==== NewVersion Controller
    .controller("NewVersionCtrl",
    ["$scope", "$state", "$stateParams", "appScreenModel", "planScreenModel", "svcScreenModel", "ApplicationVersion", "PlanVersion", "ServiceVersion",
      function ($scope, $state, $stateParams, appScreenModel, planScreenModel, svcScreenModel, ApplicationVersion, PlanVersion, ServiceVersion) {
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
              });
              break;
            case 'Plan':
              PlanVersion.save({ orgId: $stateParams.orgId, planId: $stateParams.planId }, newVersion, function (newPlanVersion) {
                $scope.modalClose();
                $state.go('root.plan.overview', {orgId: $stateParams.orgId, planId: newPlanVersion.plan.id, versionId: newPlanVersion.version});
              });
              break;
            case 'Service':
              ServiceVersion.save({ orgId: $stateParams.orgId, svcId: $stateParams.svcId }, newVersion, function (newSvcVersion) {
                $scope.modalClose();
                $state.go('root.service.overview', {orgId: $stateParams.orgId, svcId: newSvcVersion.service.id, versionId: newSvcVersion.version});
              });
              break;
          }
        };

        $scope.modalClose = function() {
          $scope.$close();	// this method is associated with $modal scope which is this.
        };

      }])

/// ==== NewService Controller
    .controller("NewServiceCtrl", ["$scope", "$modal", "$state", "$stateParams", "flowFactory", "alertService", "imageService", "orgScreenModel", "Service",
      function ($scope, $modal, $state, $stateParams, flowFactory, alertService, imageService, orgScreenModel, Service) {

        alertService.resetAllAlerts();
        $scope.org = orgScreenModel.organization;
        $scope.imageService = imageService;
        $scope.alerts = alertService.alerts;
        $scope.flow = flowFactory.create({
          singleFile: true
        });

        $scope.readFile = function ($file, $event, $flow) {
          imageService.readFile($file, $event, $flow);
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
          svc.categories = cats;

          Service.save({ orgId: $stateParams.orgId }, svc, function (data) {
            $scope.modalClose();
            $state.forceReload();
          });
        };

        $scope.modalClose = function() {
          $scope.$close();	// this method is associated with $modal scope which is this.
        };

      }])

/// ==== NewOrganization Controller
    .controller("NewOrganizationCtrl", ["$scope", "$modal", "$state", "Organization",
      function ($scope, $modal, $state, Organization) {

        $scope.createOrganization = function (org) {
          Organization.save(org, function (data) {
            $scope.modalClose();
            $state.forceReload();
          });
        };

        $scope.modalClose = function() {
          $scope.$close();	// this method is associated with $modal scope which is this.
        };

      }]);

  // #end
})(window.angular);
