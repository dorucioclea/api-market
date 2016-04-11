(function () {
    'use strict';

    angular.module('app.user')
        .service('currentUser', currentUser)
        .service('currentUserModel', currentUserModel)
        .service('loginHelper', loginHelper);


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

        this.updateCurrentUserInfo = function (currentUserModel) {
            console.log('update user info');
            return CurrentUserInfo.get({}, function (userInfo) {
                currentUserModel.currentUser = userInfo;
                console.log(currentUserModel.currentUser);
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

    // LOGIN HELPER SERVICE
    function loginHelper($http, $sessionStorage, $state, currentUser, jwtHelper, LogOutRedirect, CONFIG) {
        this.checkLoggedIn = checkLoggedIn;
        this.checkJWTInUrl = checkJWTInUrl;
        this.checkLoginRequiredForState = checkLoginRequiredForState;
        this.logout = logout;
        this.redirectToLogin = redirectToLogin;
        
        function checkLoggedIn() {
            return !!$sessionStorage.jwt;
        }

        function checkJWTInUrl() {
            return getParameterByName(CONFIG.BASE.JWT_HEADER_NAME).length > 0;
        }

        function checkLoginRequiredForState(currentState) {
            switch (currentState.name) {
                case '':
                case 'error':
                case 'oauth':
                case 'logout':
                case 'root.apis.grid':
                case 'root.apis.list':
                case 'root.search':
                    return false;
                default:
                    return true;
            }
        }

        function logout() {
            currentUser.getInfo().then(function (info) {
                var logOutObject = {
                    idpUrl: CONFIG.SECURITY.IDP_URL,
                    spName: CONFIG.SECURITY.SP_NAME,
                    username: info.username
                };
                LogOutRedirect.save({}, logOutObject, function (reply) {
                    console.log(reply);
                    var string = '';
                    angular.forEach(reply, function (value) {
                        if (typeof value === 'string') {
                            string += value;
                        }
                    });
                    console.log(string);
                    if (jwtHelper.isTokenExpired($sessionStorage.jwt)) {
                        $state.go('logout');
                    } else {
                        window.location.href = string;
                    }
                    delete $sessionStorage.jwt;
                });
            })

        }

        function redirectToLogin() {
            var jwt = getParameterByName(CONFIG.BASE.JWT_HEADER_NAME);
            var clientUrl = window.location.origin;
            if (!jwt) {
                var url = CONFIG.AUTH.URL + CONFIG.SECURITY.REDIRECT_URL;
                var data = '{"idpUrl": "' + CONFIG.SECURITY.IDP_URL + '", "spUrl": "' +
                    CONFIG.SECURITY.SP_URL + '", "spName": "' + CONFIG.SECURITY.SP_NAME +
                    '", "clientAppRedirect": "' + clientUrl + '", "token": "' +
                    CONFIG.SECURITY.CLIENT_TOKEN + '"}';
                //TODO redirect to correct page!

                return $http({
                    method: 'POST',
                    skipAuthorization: true,
                    url: url,
                    data: data,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    responseType: 'text'
                }).then(function (result) {
                    console.log("redirect result: "+JSON.stringify(result));
                    window.location.href = result.data;
                }, function (error) {
                    $state.go('accessdenied');
                    console.log('Request failed with error code: ', error.status);
                    console.log(error);
                });
            } else {
                $sessionStorage.jwt = jwt;
                window.location.href = clientUrl;
            }
        }

        function getParameterByName(name) {
            name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
            var regex = new RegExp('[\\?&]' + name + '=([^&#]*)'),
                results = regex.exec(location.search);
            return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
        }
    }

})();
