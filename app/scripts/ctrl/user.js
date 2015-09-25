;(function(angular) {
    'use strict';

    angular.module('app.ctrl.user', [])

      /// ==== User Controller
      .controller('UserCtrl', ['$scope', 'currentUserModel', 'headerModel', 'userScreenModel',
        'toastService', 'CurrentUserInfo',
      function ($scope, currentUserModel, headerModel, userScreenModel, toastService, CurrentUserInfo) {

          $scope.toasts = toastService.toasts;
          $scope.toastService = toastService;
          headerModel.setIsButtonVisible(true, true);
          $scope.selectedTab = 1;

          $scope.currentUserModel = currentUserModel;
          console.log(currentUserModel);
          $scope.updatedInfo = currentUserModel.currentUser;

          $scope.isActive = function (tabName) {
              return tabName === userScreenModel.selectedTab;
          };

          $scope.saveUserDetails = function (details) {
              var updateObject = {
                  fullName: details.fullName,
                  company: details.company,
                  location: details.location,
                  bio: details.bio,
                  website: details.website,
                  email: details.email,
                  pic: $scope.currentUserModel.currentUser.base64pic
              };
              CurrentUserInfo.update({}, updateObject, function (reply) {
                  toastService.createToast('info', 'Profile updated!', true);
              }, function (error) {
                  toastService.createErrorToast(error, 'Could not update your Profile. ');
              });
          };
      }])

    .controller('UserEmailCtrl', ['userScreenModel', function(userScreenModel) {
        userScreenModel.updateTab('Email');
    }])

    .controller('UserProfileCtrl', ['$scope', '$state', 'userScreenModel',
      function($scope, $state, userScreenModel) {
          userScreenModel.updateTab('Profile');

      }])
    .controller('UserNotificationsCtrl', ['userScreenModel', function(userScreenModel) {
        userScreenModel.updateTab('Notifications');
    }]);

    // #end
})(window.angular);
