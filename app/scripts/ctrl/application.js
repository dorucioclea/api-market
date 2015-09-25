;(function(angular) {
    'use strict';

    angular.module('app.ctrl.application', [])

  /// ==== Application Controller
      .controller('ApplicationCtrl', ['$scope', '$modal', '$state', '$stateParams', 'appData', 'appVersions',
        'appScreenModel', 'orgData', 'orgScreenModel', 'headerModel', 'actionService', 'toastService', 'TOAST_TYPES',
        'Application', 'ApplicationContract',
      function ($scope, $modal, $state, $stateParams, appData, appVersions,
                appScreenModel, orgData, orgScreenModel, headerModel, actionService, toastService, TOAST_TYPES,
                Application, ApplicationContract) {
          headerModel.setIsButtonVisible(true, true);
          orgScreenModel.updateOrganization(orgData);
          $scope.applicationVersion = appData;
          appScreenModel.updateApplication(appData);
          $scope.versions = appVersions;
          $scope.displayTab = appScreenModel;
          $scope.isReady = $scope.applicationVersion.status === 'Ready';
          $scope.isRegistered =
            $scope.applicationVersion.status === 'Registered' || $scope.applicationVersion.status === 'Retired';
          $scope.isRetired = $scope.applicationVersion.status === 'Retired';
          $scope.toasts = toastService.toasts;
          $scope.toastService = toastService;

          $scope.selectVersion = function (version) {
              $state.go($state.$current.name,
                {orgId: $stateParams.orgId, appId: $stateParams.appId, versionId: version.version});
          };

          $scope.breakContract = function (contract) {
              ApplicationContract.delete(
                {orgId: contract.appOrganizationId, appId: contract.appId, versionId: contract.appVersion,
                  contractId: contract.contractId}, function (reply) {
                  $state.forceReload();
              });
          };

          $scope.updateDesc = function (newValue) {
              Application.update({orgId: $stateParams.orgId, appId: $stateParams.appId}, {description: newValue},
                function (reply) {
                  toastService.createToast(TOAST_TYPES.INFO, 'Description updated.', true);
              }, function (error) {
                  toastService.createErrorToast(error, 'Could not update the description.');
              });
          };

          $scope.confirmPublishApp = function (appVersion) {
              $modal.open({
                  templateUrl: 'views/modals/modalPublishApplication.html',
                  size: 'lg',
                  controller: 'PublishApplicationCtrl as ctrl',
                  resolve: {
                      appVersion: function () {
                          return appVersion;
                      },
                      appContracts: function () {
                          return ApplicationContract.query(
                            {orgId: appVersion.application.organization.id, appId: appVersion.application.id,
                              versionId: appVersion.version}).$promise;
                      }
                  },
                  windowClass: $scope.modalAnim	// Animation Class put here.
              });
          };

          $scope.confirmRetireApp = function (appVersion) {
              $modal.open({
                  templateUrl: 'views/modals/modalRetireApplication.html',
                  size: 'lg',
                  controller: 'RetireApplicationCtrl as ctrl',
                  resolve: {
                      appVersion: function () {
                          return appVersion;
                      },
                      appContracts: function () {
                          return ApplicationContract.query(
                            {orgId: appVersion.application.organization.id, appId: appVersion.application.id,
                              versionId: appVersion.version}).$promise;
                      }
                  },
                  windowClass: $scope.modalAnim	// Animation Class put here.
              });
          };

      }])

    // +++ Application Screen Subcontrollers +++
    /// ==== Activity Controller
    .controller('ActivityCtrl', ['$scope', 'activityData', 'appScreenModel',
        function ($scope, activityData, appScreenModel) {

            $scope.activities = activityData.beans;
            appScreenModel.updateTab('Activity');

        }])
    /// ==== APIs Controller
    .controller('ApisCtrl', ['$scope', 'contractData', 'appScreenModel',
      function ($scope, contractData, appScreenModel) {

          $scope.contracts = contractData;
          appScreenModel.updateTab('APIs');

          $scope.toggle = function (contract) {
              contract.apiExpanded = !contract.apiExpanded;
          };

      }])
        /// ==== Contracts Controller
    .controller('ContractsCtrl', ['$scope', '$state', 'contractData', 'appScreenModel', 'docTester',
      function ($scope, $state, contractData, appScreenModel, docTester) {

          docTester.reset();
          $scope.contracts = contractData;
          appScreenModel.updateTab('Contracts');

          $scope.toApiDoc = function (contract) {
              $state.go('root.api.documentation',
                ({orgId: contract.serviceOrganizationId,
                  svcId: contract.serviceId,
                  versionId: contract.serviceVersion}));
              docTester.setPreferredContract(contract);
          };

      }])

    /// ==== Metrics Controller
    .controller('AppMetricsCtrl', ['$scope', '$stateParams', 'appScreenModel', 'ApplicationMetrics',
      function ($scope, $stateParams, appScreenModel, ApplicationMetrics) {

          appScreenModel.updateTab('Metrics');
          $scope.responseHistogramData = [];
          $scope.summary = {};
          $scope.marketInfo = {};
          $scope.uptime = [];

          $scope.fromDt = new Date();
          $scope.fromDt.setDate($scope.fromDt.getDate() - 7); //Start with a one week period
          $scope.toDt = new Date();
          $scope.interval = 'day';

          $scope.open = function($event, to) {
              $event.preventDefault();
              $event.stopPropagation();

              if (to) {
                  $scope.toOpened = true;
              } else {
                  $scope.fromOpened = true;
              }
          };

          var updateMetrics = function () {
              ApplicationMetrics.get({orgId: $stateParams.orgId, appId: $stateParams.appId,
                versionId: $stateParams.versionId, from: $scope.fromDt, to: $scope.toDt, interval: $scope.interval},
                function (stats) {
                    console.log(stats);
                });
          };

          $scope.$watch('fromDt', function () {
              updateMetrics();
          });

          $scope.$watch('toDt', function () {
              updateMetrics();
          });

          $scope.$watch('interval', function () {
              updateMetrics();
          });

      }])

    /// ==== Overview Controller
    .controller('OverviewCtrl', ['$scope', 'appScreenModel', function ($scope, appScreenModel) {

        appScreenModel.updateTab('Overview');

    }]);

    // #end
})(window.angular);
