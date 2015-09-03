;(function() {
  "use strict";


  angular.module("app.ctrl.modals", [])


    /// ==== AddPolicy Controller
    .controller("AddPolicyCtrl", ["$scope", "$modal", "$state", "$stateParams", "policyDefs", "PlanVersionPolicy", "ServiceVersionPolicy",
      function ($scope, $modal, $state, $stateParams, policyDefs, PlanVersionPolicy, ServiceVersionPolicy) {

        $scope.policyDefs = policyDefs;
        $scope.valid = false;

        var ConfigForms = {
          BASICAuthenticationPolicy: 'basic-auth.html',
          IgnoredResourcesPolicy: 'ignored-resources.html',
          IPBlacklistPolicy: 'ip-list.html',
          IPWhitelistPolicy: 'ip-list.html',
          RateLimitingPolicy: 'rate-limiting.html',
          QuotaPolicy: 'quota.html',
          TransferQuotaPolicy: 'transfer-quota.html',
          AuthorizationPolicy: 'authorization.html',
          CachingPolicy: 'caching.html'
        };

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
            if ($scope.selectedPolicy.formType == 'JsonSchema') {
              //All plugins should fall into this category!
              $scope.include = 'views/modals/partials/policy/json-schema.html';
            } else {
              var inc = ConfigForms[$scope.selectedPolicy.id];
              if (!inc) {
                inc = 'Default.html';
              }
              $scope.include = 'views/modals/partials/policy/' + inc;
            }
          }
        };

      }])

/// ==== Application Selection Controller
    .controller("AppSelectCtrl", ["$scope", "$modal", "$state", "$stateParams", "$timeout", "svcModel", "Application", "ApplicationVersion", "CurrentUserAppOrgs",
      function ($scope, $modal, $state, $stateParams, $timeout, svcModel, Application, ApplicationVersion, CurrentUserAppOrgs) {

        $scope.orgSelected = false;
        $scope.appSelected = false;
        $scope.versionSelected = false;
        $scope.service = svcModel.getService();

        CurrentUserAppOrgs.query({}, function (data) {
          $scope.organizations = data;
        });

        $scope.getOrgApps = function (selectedOrg) {
          Application.query({orgId: selectedOrg.id}, function (data) {
            $scope.applications = data;
            $scope.orgSelected = true;
          })
        };

        $scope.getAppVersions = function (selectedApp) {
          ApplicationVersion.query({orgId: selectedApp.organizationId, appId: selectedApp.id}, function (data) {
            $scope.versions = data;
            $scope.appSelected = true;
          })
        };

        $scope.versionIsSelected = function () {
          $scope.versionSelected = true;
        };

        $scope.startCreateContract = function(selectedVersion) {
          $state.go('root.contract',
            { appOrgId: selectedVersion.organizationId, appId: selectedVersion.id, appVersion: selectedVersion.version,
              svcOrgId: $stateParams.orgId, svcId: $stateParams.svcId, svcVersion: $stateParams.versionId
            });
          $scope.$close();
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

        var ConfigForms = {
          BASICAuthenticationPolicy: 'basic-auth.html',
          IgnoredResourcesPolicy: 'ignored-resources.html',
          IPBlacklistPolicy: 'ip-list.html',
          IPWhitelistPolicy: 'ip-list.html',
          RateLimitingPolicy: 'rate-limiting.html',
          QuotaPolicy: 'quota.html',
          TransferQuotaPolicy: 'transfer-quota.html',
          AuthorizationPolicy: 'authorization.html',
          CachingPolicy: 'caching.html'
        };

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
          console.log(config);
          var newPolicy = {
            definitionId: $scope.selectedPolicy.id,
            configuration: config
          };
          console.log(newPolicy);

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
            if ($scope.selectedPolicy.formType == 'JsonSchema') {
              //All plugins should fall into this category!
              $scope.include = 'views/modals/partials/policy/json-schema.html';
            } else {
              var inc = ConfigForms[$scope.selectedPolicy.id];
              if (!inc) {
                inc = 'Default.html';
              }
              $scope.include = 'views/modals/partials/policy/' + inc;
            }
          }
        };

      }])

/// ==== NewApplication Controller
    .controller("NewApplicationCtrl", ["$scope", "$modal", "$state", "$stateParams", "orgScreenModel", "Application",
      function ($scope, $modal, $state, $stateParams, orgScreenModel, Application) {

        $scope.org = orgScreenModel.organization;

        $scope.createApplication = function (application) {
          Application.save({ orgId: $stateParams.orgId }, application, function (app) {
            $scope.modalClose();
            $state.forceReload();
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
            console.log(plan);
            $state.go('root.plan.overview', {orgId: $stateParams.orgId, planId: newPlan.id, versionId: plan.initialVersion});
          });
        };

        $scope.modalClose = function() {
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
    .controller("NewServiceCtrl", ["$scope", "$modal", "$state", "$stateParams", "orgScreenModel", "Service",
      function ($scope, $modal, $state, $stateParams, orgScreenModel, Service) {

        $scope.org = orgScreenModel.organization;


        $scope.createService = function (svc, categories) {
          var cats = [];
          for (var i = 0; i < categories.length; i++) {
            cats.push(categories[i].text);
          }
          svc.categories = cats;
          Service.save({ orgId: $stateParams.orgId }, svc, function (data) {
            $scope.modalClose();
            $state.forceReload();
          })
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
})();
