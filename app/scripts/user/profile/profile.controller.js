(function () {
    'use strict';

    angular.module('app.user.profile')
    /// ==== User Controller
        .controller('UserCtrl', userCtrl)
        .controller('UserConnectedAppsCtrl', userConnectedAppsCtrl)
        .controller('UserEmailCtrl', userEmailCtrl)
        .controller('UserNotificationsCtrl', userNotificationsCtrl)
        .controller('UserProfileCtrl', userProfileCtrl);



    function userCtrl($scope, headerModel, userScreenModel, toastService, currentUser) {

        init();

        $scope.toasts = toastService.toasts;
        $scope.toastService = toastService;
        $scope.selectedTab = 1;
        $scope.user = userScreenModel;
        $scope.isActive = isActive;
        $scope.saveUserDetails = saveUserDetails;

        function init() {
            if ($scope.publisherMode) {
                headerModel.setIsButtonVisible(false, false, false);
            } else {
                headerModel.setIsButtonVisible(true, true, true);
            }

            userScreenModel.userInfo.base64pic = $scope.User.currentUser.base64pic;

            if ($scope.User.currentUser.bio != null && $scope.User.currentUser.bio.length > 0 && userScreenModel.userInfo.bio.length === 0) {
                userScreenModel.userInfo.bio = $scope.User.currentUser.bio;
            }

            if ($scope.User.currentUser.company != null && $scope.User.currentUser.company.length > 0 && userScreenModel.userInfo.company.length === 0) {
                userScreenModel.userInfo.company = $scope.User.currentUser.company;
            }

            if ($scope.User.currentUser.location != null && $scope.User.currentUser.location.length > 0 && userScreenModel.userInfo.location.length === 0) {
                userScreenModel.userInfo.location = $scope.User.currentUser.location;
            }

            if ($scope.User.currentUser.website != null && $scope.User.currentUser.website.length > 0 && userScreenModel.userInfo.website.length === 0) {
                userScreenModel.userInfo.website = $scope.User.currentUser.website;
            }

            if ($scope.User.currentUser.fullName != null && $scope.User.currentUser.fullName.length > 0 && userScreenModel.userInfo.fullName.length === 0) {
                userScreenModel.userInfo.fullName = $scope.User.currentUser.fullName;
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
                pic: details.base64pic
            };
            if (details.bio.length > 100000) {
                toastService.error("Maximum character limit of 100,000 for Bio exceeded");
            }
            else{
                currentUser.update(updateObject).then(function () {
                    $scope.User.updateCurrentUserInfo($scope.User);
                    toastService.createToast('info', 'Profile updated!', true);
                }, function (error) {
                    console.log(error);
                    toastService.createErrorToast(error, 'Could not update your Profile. ');
                });
            }
        }
    }
    
    function userConnectedAppsCtrl(userScreenModel) {
        userScreenModel.updateTab('Connected Apps');
    }

    function userEmailCtrl(userScreenModel) {
        userScreenModel.updateTab('Email');
    }

    function userProfileCtrl(userScreenModel) {
        userScreenModel.updateTab('Profile');

    }

    function userNotificationsCtrl(userScreenModel) {
        userScreenModel.updateTab('Notifications');
    }
})();
