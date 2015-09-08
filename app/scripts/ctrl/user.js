;(function() {
  "use strict";


  angular.module("app.ctrl.user", [])

  /// ==== User Controller
    .controller("UserCtrl", ["$scope", "userInfo", "userScreenModel", function ($scope, userInfo, userScreenModel) {

      $scope.selectedTab = 1;

      $scope.currentUserInfo = userInfo;

      $scope.isActive = function (tabName) {
        return tabName == userScreenModel.selectedTab;
      }
    }])
    .controller("UserEmailCtrl", ["userScreenModel", function(userScreenModel) {
      userScreenModel.updateTab('Email');
    }])
    .controller("UserProfileCtrl", ["userScreenModel", function(userScreenModel) {
      userScreenModel.updateTab('Profile');
    }])
    .controller("UserNotificationsCtrl", ["userScreenModel", function(userScreenModel) {
      userScreenModel.updateTab('Notifications');
    }]);

  // #end
})();
