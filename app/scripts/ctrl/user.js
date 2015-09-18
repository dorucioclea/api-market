;(function(angular) {
  "use strict";


  angular.module("app.ctrl.user", [])

    /// ==== User Controller
    .controller("UserCtrl", ["$scope", "currentUserModel", "headerModel", "userScreenModel", "toastService",
      function ($scope, currentUserModel, headerModel, userScreenModel, toastService) {

        $scope.toasts = toastService.toasts;
        $scope.toastService = toastService;
        headerModel.setIsButtonVisible(true, true);
        $scope.selectedTab = 1;

        $scope.currentUserModel = currentUserModel;
        $scope.updatedInfo = currentUserModel.currentUser;

        $scope.isActive = function (tabName) {
          return tabName === userScreenModel.selectedTab;
        };
      }])

    .controller("UserEmailCtrl", ["userScreenModel", function(userScreenModel) {
      userScreenModel.updateTab('Email');
    }])

    .controller("UserProfileCtrl", ["$scope", "$state", "userScreenModel", "CurrentUserInfo", "toastService",
      function($scope, $state, userScreenModel, CurrentUserInfo, toastService) {
        userScreenModel.updateTab('Profile');

        $scope.saveUserDetails = function (details) {
          var updateObject = {
            fullName: details,
            pic: $scope.currentUserModel.currentUser.base64pic
          };
          CurrentUserInfo.update({}, updateObject, function (reply) {
            toastService.createToast('info', 'Profile updated!', true);
          }, function (error) {
            toastService.createErrorToast('Could not update your Profile.');
          });
        };


      }])
    .controller("UserNotificationsCtrl", ["userScreenModel", function(userScreenModel) {
      userScreenModel.updateTab('Notifications');
    }]);

  // #end
})(window.angular);
