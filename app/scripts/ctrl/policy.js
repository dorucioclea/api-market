;(function(angular) {
    'use strict';

    angular.module('app.ctrl.policy', [])

        .controller('DefaultPolicyConfigFormCtrl',
        function ($scope) {
            var validateRaw = function(config) {
                var valid = true;
                try {
                    var parsed = JSON.parse(config);
                    $scope.setConfig(parsed);
                } catch (e) {
                    valid = false;
                }
                $scope.setValid(valid);
            };
            if ($scope.getConfig()) {
                $scope.rawConfig = JSON.stringify($scope.getConfig(), null, 2);
            }
            $scope.$watch('rawConfig', validateRaw);
        })

        .controller('JsonSchemaPolicyConfigFormController',
        function ($scope, PolicyDefs) {

            // Watch for changes to selectedDef - if the user changes from one schema-based policy
            // to another schema-based policy, then the controller won't change.  The result is that
            // we need to refresh the schema when the selectedDef changes.
            $scope.$watch('selectedPolicy', function(newValue) {
                if (newValue && newValue.formType === 'JsonSchema') {
                    $scope.loadForm($scope.selectedPolicy);
                }
            });

            $scope.loadForm = function (policy) {
                $scope.setValid(false);
                PolicyDefs.get({policyId: policy.id}, function (policyData) {
                    $scope.schema = angular.fromJson(policyData.form);
                    $scope.$broadcast('schemaFormValidate');
                    $scope.setValid($scope.policyForm.$valid);
                });
            };

            $scope.form = ['*'];

            $scope.$watch('config', function() {
                $scope.setValid($scope.policyForm.$valid);
            }, true);

        });

    // #end
})(window.angular);
