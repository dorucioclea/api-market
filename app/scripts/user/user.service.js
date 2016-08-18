(function () {
    'use strict';

    angular.module('app.user')
        .service('currentUser', currentUser)
        .service('currentUserModel', currentUserModel);

    function currentUser($q, CurrentUserInfo, CurrentUserApps, ApplicationContract, ApplicationVersion,
                         CurrentUserAppOrgs, CurrentUserServices, CurrentUserSvcOrgs, CurrentUserToken, appService, $http, CONFIG, _) {
        this.checkStatus = checkStatus;
        this.getInfo = getInfo;
        this.getUserAppOrgs = getUserAppOrgs;
        this.getUserApps = getUserApps;
        this.getUserSvcOrgs = getUserSvcOrgs;
        this.getUserServices = getUserServices;
        this.getUserGrants = getUserGrants;
        this.revokeUserGrants = revokeUserGrants;
        this.update = update;

        function checkStatus() {
            var status = { hasOrg: false, hasApp: false, hasContract: false };
            var deferred = $q.defer();

            getUserAppOrgs().then(function (orgs) {
                if (orgs.length > 0) {
                    status.hasOrg = true;
                    getUserApps().then(function (apps) {
                        if (apps.length > 0) {
                            status.hasApp = true;
                            checkAppsForContracts(apps).then(function (hasAppContract) {
                                status.hasContract = hasAppContract;
                                deferred.resolve(status);
                            })
                        } else {
                            deferred.resolve(status);
                        }
                    })
                } else {
                    deferred.resolve(status);
                }
            });
            return deferred.promise;
        }

        function checkAppsForContracts(userApps) {
            var promises = [];
            var contractPromises = [];
            angular.forEach(userApps, function (app) {
                promises.push(ApplicationVersion.query({orgId: app.organizationId, appId: app.id}).$promise);
            });
            return $q.all(promises).then(function (results) {
                angular.forEach(results, function (versions) {
                    angular.forEach(versions, function (version) {
                        contractPromises.push(ApplicationContract.query({orgId: version.organizationId, appId: version.id, versionId: version.version}).$promise);
                    });
                });
                return $q.all(contractPromises).then(function (versionContracts) {
                    var hasContract = false;
                    angular.forEach(versionContracts, function (contracts) {
                        if (contracts.length > 0) hasContract = true;
                    });
                    return hasContract;
                });
            });
        }

        function getInfo() {
            return CurrentUserInfo.get().$promise;
        }

        function getUserAppOrgs() {
            return CurrentUserAppOrgs.query().$promise;
        }

        function getUserApps() {
            return CurrentUserApps.query().$promise;
        }

        function getUserSvcOrgs() {
            return CurrentUserSvcOrgs.query().$promise;
        }

        function getUserServices() {
            return CurrentUserServices.query().$promise;
        }

        function update(newUserInfo) {
            return CurrentUserInfo.update({}, newUserInfo).$promise;
        }

        function getUserGrants() {
            return CurrentUserToken.query().$promise.then(function (results) {
                var promises = [];
                var grants = [];
                _.forEach(results, function (token) {
                    console.log(token);
                    var grant = {};
                    grant.originalToken = angular.copy(token);
                    promises.push(appService.getAppVersionDetails(token.organizationId, token.applicationId, token.version).then(function (appDetails) {
                        grant.appDetails = appDetails;
                        grants.push(grant);
                    }));
                });
                return $q.all(promises).then(function () {
                    return grants;
                });
            });
        }

        function revokeUserGrants(grants) {
            var promises = [];
            _.forEach(grants, function (grant) {
                promises.push($http({
                    method: 'DELETE',
                    url: CONFIG.BASE.URL + '/currentuser/oauth2/tokens',
                    data: grant,
                    headers: {'Content-Type': 'application/json;charset=utf-8'}
                }));
            });

            return $q.all(promises);
        }
    }

    function currentUserModel(orgScreenModel, CurrentUserInfo) {
        var permissionTree = [];
        this.currentUser = {};

        this.isAuthorizedFor = isAuthorizedFor;
        this.isAuthorizedForAny = isAuthorizedForAny;
        this.isAuthorizedForIn = isAuthorizedForIn;
        this.refreshCurrentUserInfo = refreshCurrentUserInfo;

        function refreshCurrentUserInfo(currentUserModel) {
            return CurrentUserInfo.get({}, function (userInfo) {
                currentUserModel.currentUser = userInfo;
                createPermissionsTree(userInfo.permissions);
            }).$promise;
        }

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
            if (permissionTree[orgScreenModel.organization.id]) return permissionTree[orgScreenModel.organization.id].indexOf(permission) !== -1;
            else return false;
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
            if (permissionTree[orgId]) return permissionTree[orgId].indexOf(permission) !== -1;
            else return false;
        }
    }

})();
