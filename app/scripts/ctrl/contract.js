;(function(angular) {
  "use strict";


  angular.module("app.ctrl.contract", [])
    /// ==== Contract Controller
    .controller("ContractCtrl", ["$scope", "$state", "$stateParams", "actionService", "toastService",
      function($scope, $state, $stateParams, actionService, toastService) {

        $scope.applicationVersion = $stateParams.appVersion;
        $scope.serviceVersion = $stateParams.svcVersion;
        $scope.planVersion = $stateParams.planVersion;

        $scope.publishAppAndReturnToDash = function () {
          actionService.publishApp($scope.applicationVersion, false);
          $state.go('root.market-dash');
        };
      }]);
  // #end
})(window.angular);
