;(function(angular) {
    'use strict';

    angular.module('app.ctrl.administration', [])

        /// ==== MyOrganizations Overview Controller
        .controller('AdministrationCtrl',
            function ($scope, $modal, appOrgData, svcOrgData, toastService, headerModel) {

                $scope.toasts = toastService.toasts;
                $scope.toastService = toastService;
                $scope.modalNewOrganization = modalNewOrganization;

                init();

                function init() {
                    headerModel.setIsButtonVisible(false, false, false);

                    if ($scope.publisherMode) {
                        $scope.orgs = svcOrgData;
                    } else {
                        $scope.orgs = appOrgData;
                    }
                }

                function modalNewOrganization() {
                    $modal.open({
                        templateUrl: 'views/modals/organizationCreate.html',
                        size: 'lg',
                        controller: 'NewOrganizationCtrl as ctrl',
                        resolve: {
                            publisherMode: function () {
                                return $scope.publisherMode;
                            }
                        },
                        backdrop : 'static',
                        windowClass: $scope.modalAnim	// Animation Class put here.
                    });

                }

            });
})(window.angular);
