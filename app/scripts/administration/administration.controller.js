;(function() {
    'use strict';

    angular.module('app.administration', [])
        .controller('AdministrationCtrl', administrationCtrl)
        .controller('AddAdminCtrl', addAdminCtrl)
        .controller('AdminExpirationCtrl', adminExpirationCtrl)
        .controller('AdminStatusCtrl', adminStatusCtrl)
        .controller('AdminUsersCtrl', adminUsersCtrl)
        .controller('RemoveAdminCtrl', removeAdminCtrl);

    function administrationCtrl($scope, adminTab, adminHelper, screenSize, toastService, TOAST_TYPES) {
        $scope.toasts = toastService.toasts;
        $scope.adminHelper = adminHelper;
        $scope.adminTab = adminTab;
        $scope.toastService = toastService;
        $scope.TOAST_TYPES = TOAST_TYPES;
        $scope.xs = screenSize.on('xs', function(match) {
            $scope.xs = match;
        });
    }


    function adminExpirationCtrl($scope,oauthExp,jwtExp) {
        $scope.adminTab.updateTab('Expiration');
        console.log(oauthExp);
        console.log(jwtExp);
        $scope.tokenTimeout = {
            oauth: oauthExp.expirationTime,
            jwt: jwtExp.expirationTime
        };
        $scope.updateExpirationTimes = updateExpirationTimes;


        function updateExpirationTimes() {
            $scope.adminHelper.updateExpirationTimes($scope.tokenTimeout.oauth, $scope.tokenTimeout.jwt).then(function (reply) {
                console.log(reply);
                $scope.toastService.createToast($scope.TOAST_TYPES.SUCCESS, "Expiration times updated!", true);
            }, function () {
                $scope.toastService.createToast($scope.TOAST_TYPES.DANGER, "Could not update expiration times.", true);
            });
        }
    }

    function adminStatusCtrl($scope, status) {
        $scope.adminTab.updateTab('Status');
        $scope.kongCluster = angular.fromJson(status.kongCluster);
        $scope.kongInfo = angular.fromJson(status.kongInfo);
        $scope.kongStatus = angular.fromJson(status.kongStatus);
        console.log($scope.kongCluster);
        console.log($scope.kongInfo);
        console.log($scope.kongStatus);
        $scope.status = status;
    }

    function adminUsersCtrl($scope, adminData) {
        $scope.adminTab.updateTab('Users');
        $scope.admins = adminData;
        $scope.addAdmin = addAdmin;
        $scope.removeAdmin = removeAdmin;

        function addAdmin() {
            $scope.adminHelper.addAdmin('someadmin');
        }

        function removeAdmin(admin) {
            $scope.adminHelper.removeAdmin(admin);
        }
    }

    function addAdminCtrl($scope, $modal, $state, username, toastService, AdminUser, TOAST_TYPES, EmailSearch) {
        $scope.addAdmin = addAdmin;
        $scope.username = username;
        $scope.modalClose = modalClose;
        $scope.selectedMethod = 'Username';
        $scope.selectMethod = selectMethod;

        function addAdmin(username,email) {
            var privuser;
            var privmail;
            var promise;
            var userpromise;
            switch ($scope.selectedMethod) {
                case 'Email':
                    var searchObj = {
                        userMail: ''
                    };
                    searchObj.userMail = email;
                    userpromise = EmailSearch.save({}, searchObj).$promise;
                    break;
                case 'Username':
                    privuser = username;
                    promise = AdminUser.save({id:privuser},function(reply){
                        $scope.modalClose();
                        $state.forceReload();
                        toastService.createToast(TOAST_TYPES.SUCCESS,
                            'Granted <b>' + privuser + '</b> with admin priviledges', true);
                    },function(err){toastService.createErrorToast(error, 'Failed to grand admin privileges.');});

                    break;
            }
            userpromise.then(function (user) {
                if (user) {
                    AdminUser.save({id:user.username},function(reply){
                        $scope.modalClose();
                        $state.forceReload();
                        toastService.createToast(TOAST_TYPES.SUCCESS,
                            'Granted <b>' + user.username + '</b> with admin priviledges', true);
                    },function(err){toastService.createErrorToast(error, 'Failed to grand admin privileges.');});
                } else {
                    toastService.createToast(TOAST_TYPES.WARNING,
                        'Could not find member to add with email address <b>' + email + '</b>.', true);
                }
            }, function (error) {
                toastService.createErrorToast(error, 'The user must have logged-in once, and entered an email.');
            });
        }

        function modalClose() {
            $scope.$close();	// this method is associated with $modal scope which is this.
        }

        function selectMethod(method) {
            $scope.selectedMethod = method;
        }
    }

    function removeAdminCtrl($scope, $modal, $state, admin, toastService, TOAST_TYPES, AdminUser) {
        $scope.doRemove = doRemove;
        $scope.admin = admin;
        $scope.modalClose = modalClose;

        function doRemove() {
            AdminUser.delete({id: admin.username}, function (success) {
                $state.forceReload();
                toastService.createToast(TOAST_TYPES.INFO,
                    '<b>' + name + '</b> admin privileges are removed.', true);
                $scope.modalClose();
            }, function (error) {
                toastService.createErrorToast(error, 'Could not remove admin privileges.');
            });
        }

        function modalClose() {
            $scope.$close();	// this method is associated with $modal scope which is this.
        }
    }
})();
