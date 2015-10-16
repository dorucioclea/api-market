;(function(angular) {
    'use strict';

    angular.module('app.ctrl.user', [])

        /// ==== User Controller
        .controller('UserCtrl',
        function ($scope, currentUserModel, headerModel, userScreenModel, toastService, CurrentUserInfo) {

            init();

            $scope.toasts = toastService.toasts;
            $scope.toastService = toastService;
            $scope.selectedTab = 1;
            $scope.currentUserModel = currentUserModel;
            $scope.updatedInfo = currentUserModel.currentUser;
            $scope.isActive = isActive;
            $scope.saveUserDetails = saveUserDetails;

            function init() {
                if ($scope.publisherMode) {
                    headerModel.setIsButtonVisible(false, false, false);
                } else {
                    headerModel.setIsButtonVisible(true, true, true);
                }
            }

            function isActive(tabName) {
                return tabName === userScreenModel.selectedTab;
            }

            function saveUserDetails(details) {
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
            }
        })

        .controller('UserEmailCtrl', function(userScreenModel) {
            userScreenModel.updateTab('Email');
        })

        .controller('UserProfileCtrl',
        function($scope, $state, userScreenModel) {
            userScreenModel.updateTab('Profile');

        })
        .controller('UserNotificationsCtrl', function(userScreenModel) {
            userScreenModel.updateTab('Notifications');
        });

    // #end
})(window.angular);
