(function () {
    'use strict';

    angular.module('app.core.keycloak', [])
        .service('kcHelper', kcHelper);


    function kcHelper(Auth) {
        this.logout = logout;
        this.redirectToLogin = redirectToLogin;

        function logout() {
            Auth.authz.logout();
        }

        function redirectToLogin() {
            Auth.authz.login();
        }
    }

}());
