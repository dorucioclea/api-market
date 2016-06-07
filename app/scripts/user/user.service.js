(function () {
    'use strict';

    angular.module('app.user')
        .service('currentUser', currentUser)
        .service('currentUserModel', currentUserModel);

    function currentUser(CurrentUserInfo) {
        this.getInfo = getInfo;
        this.update = update;

        function getInfo() {
            return CurrentUserInfo.get().$promise;
        }

        function update(newUserInfo) {
            return CurrentUserInfo.update({}, newUserInfo).$promise;
        }
    }

    function currentUserModel(orgScreenModel, CurrentUserInfo) {
        var permissionTree = [];
        this.currentUser = {};
        
        this.isAuthorizedFor = isAuthorizedFor;
        this.isAuthorizedForAny = isAuthorizedForAny;
        this.isAuthorizedForIn = isAuthorizedForIn;
        this.updateCurrentUserInfo = updateCurrentUserInfo;

        function updateCurrentUserInfo(currentUserModel) {
            return CurrentUserInfo.get({}, function (userInfo) {
                currentUserModel.currentUser = userInfo;
                createPermissionsTree(userInfo.permissions);
            }).$promise;
        }

        this.setCurrentUserInfo = function (currentUserInfo) {
            this.currentUser = currentUserInfo;
            createPermissionsTree(currentUserInfo.permissions);
        };

        function createPermissionsTree(permissions) {
            permissionTree = [];
            angular.forEach(permissions, function (value) {
                if (!permissionTree[value.organizationId]) {
                    permissionTree[value.organizationId] = [];
                }
                permissionTree[value.organizationId].push(value.name);
            });
        }

        function isAuthorizedFor(permission) {
            return permissionTree[orgScreenModel.organization.id].indexOf(permission) !== -1;
        }

        function isAuthorizedForAny(permissions) {
            for (var i = 0; i < permissions.length; i++) {
                if (isAuthorizedFor(permissions[i])) {
                    return true;
                }
            }
            return false;
        }

        function isAuthorizedForIn(permission, orgId) {
            return permissionTree[orgId].indexOf(permission) !== -1;
        }
    }

})();
