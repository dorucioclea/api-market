(function () {
    'use strict';

    angular.module('app.administration')
        .service('adminHelper', adminHelper)
        .service('adminTab', adminTab);


    function adminTab() {
        this.selectedTab = 'Users';

        this.updateTab = function updateTab(newTab) {
            this.selectedTab = newTab;
        }
    }

    //ADMIN SERVICE
    function adminHelper($uibModal, $q, StatusInfo, OAuthCentralExpTime, JWTCentralExpTime, TermsAdmin){
        this.addAdmin = addAdmin;
        this.getStatus = getStatus;
        this.removeAdmin = removeAdmin;
        this.updateExpirationTimes = updateExpirationTimes;
        this.setDefaultTerms = setDefaultTerms;
        
        function addAdmin(username){
            $uibModal.open({
                templateUrl: 'views/modals/organizationAddAdmin.html',
                size: 'lg',
                controller: 'AddAdminCtrl as ctrl',
                resolve: {
                    username: function() {
                        return username;
                    }
                },
                backdrop : 'static',
                windowClass: 'default'	// Animation Class put here.
            });
        }
        
        function getStatus() {
            return StatusInfo.get().$promise;    
        }
        
        function setDefaultTerms() {
            // TODO implementation
            return $q.when('updated');
        }
        
        function removeAdmin(admin){
            $uibModal.open({
                templateUrl: 'views/modals/organizationRemoveAdmin.html',
                size: 'lg',
                controller: 'RemoveAdminCtrl as ctrl',
                resolve: {
                    admin: function () {
                        return admin;
                    }
                },
                backdrop : 'static',
                windowClass: 'default'	// Animation Class put here.
            });
        }
        
        function updateExpirationTimes(oauthExpTime, jwtExpTime) {
            var updateJWTObj = {
                expirationTime: jwtExpTime
            };
            var updateOAuthObj = {
                expirationTime: oauthExpTime
            };
            return $q.all(JWTCentralExpTime.save({},updateJWTObj).$promise,
                OAuthCentralExpTime.save({},updateOAuthObj).$promise);
        }
    }

})();
