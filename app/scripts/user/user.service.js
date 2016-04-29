(function () {
    'use strict';

    angular.module('app.user')
        .service('currentUserModel', currentUserModel);
    
    
    function currentUserModel(orgScreenModel, CurrentUserInfo) {
        var permissionTree = [];
        this.currentUser = {};

        this.updateCurrentUserInfo = function (currentUserModel) {
            return CurrentUserInfo.get({}, function (userInfo) {
                currentUserModel.currentUser = userInfo;
                createPermissionsTree(userInfo.permissions);
            }).$promise;
        };

        this.setCurrentUserInfo = function (currentUserInfo) {
            this.currentUser = currentUserInfo;
            createPermissionsTree(currentUserInfo.permissions);
        };

        var createPermissionsTree = function (permissions) {
            permissionTree = [];
            angular.forEach(permissions, function (value) {
                if (!permissionTree[value.organizationId]) {
                    permissionTree[value.organizationId] = [];
                }
                permissionTree[value.organizationId].push(value.name);
            });
        };

        this.isAuthorizedFor = function(permission) {
            return permissionTree[orgScreenModel.organization.id].indexOf(permission) !== -1;
        };

        this.isAuthroizedForAny = function (permissions) {
            for (var i = 0; i < permissions.length; i++) {
                if (this.isAuthorizedFor(permissions[i])) {
                    return true;
                }
            }
            return false;
        };
    }

})();
