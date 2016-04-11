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
    function adminHelper($modal, $q, $state, toastService, TOAST_TYPES, currentUserModel, Admins, StatusInfo,OAuthCentralExpTime,JWTCentralExpTime){
        this.addAdmin = addAdmin;
        this.getStatus = getStatus;
        this.removeAdmin = removeAdmin;
        this.updateExpirationTimes = updateExpirationTimes;
        
        function addAdmin(username){
            $modal.open({
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
        
        function removeAdmin(admin){
            $modal.open({
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
            JWTCentralExpTime.save({},updateJWTObj);
            OAuthCentralExpTime.save({},updateOAuthObj);
            return $q.when('nothing special!');
        }
    }

})();
