;(function(angular) {
  "use strict";


  angular.module("app.ctrl.user", [])

  /// ==== User Controller
    .controller("UserCtrl", ["$scope", "userInfo", "headerModel", "userScreenModel", function ($scope, userInfo, headerModel, userScreenModel) {

      headerModel.setIsButtonVisible(true, true);
      $scope.selectedTab = 1;

      $scope.currentUserInfo = userInfo;

      $scope.isActive = function (tabName) {
        return tabName === userScreenModel.selectedTab;
      };
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
})(window.angular);
