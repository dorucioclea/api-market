;(function() {
  "use strict";


  angular.module("app.ctrl.user", [])

  /// ==== User Controller
    .controller("UserCtrl", ["$scope", function ($scope) {

      $scope.selectedTab = 1;

      $scope.selectTab = function(tabId) {
        $scope.selectedTab = tabId;
      };

      $scope.pathForTab = function() {
        switch ($scope.selectedTab) {
          case 1:
            return "views/partials/user/profile.html";
          case 2:
            return "views/partials/user/account.html";
          case 3:
            return "views/partials/user/email.html";
          case 4:
            return "views/partials/user/notifications.html";
        }
      };

    }]);

  // #end
})();
