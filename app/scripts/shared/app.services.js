;(function(angular) {
  "use strict";


  angular.module("app.services", [])

    .service('actionService', ['$state', 'Action', 'ACTIONS', function ($state, Action, ACTIONS) {

      this.createAction = function (entityVersion, type) {
        var action = {};
        switch (type) {
          case ACTIONS.LOCK:
            action = {
              type: ACTIONS.LOCK,
              organizationId: entityVersion.plan.organization.id,
              entityId: entityVersion.plan.id,
              entityVersion: entityVersion.version
            };
            return action;
          case ACTIONS.REGISTER:
            action = {
              type: ACTIONS.REGISTER,
              entityVersion: entityVersion.version
            };
            if (angular.isDefined(entityVersion.organizationId)) {
              action.organizationId = entityVersion.organizationId;
              action.entityId = entityVersion.id;
            } else {
              action.organizationId = entityVersion.application.organization.id;
              action.entityId = entityVersion.application.id;
            }
            return action;
          case ACTIONS.UNREGISTER:
            action = {
              type: ACTIONS.UNREGISTER,
              entityVersion: entityVersion.version
            };
            if (angular.isDefined(entityVersion.organizationId)) {
              action.organizationId = entityVersion.organizationId;
              action.entityId = entityVersion.id;
            } else {
              action.organizationId = entityVersion.application.organization.id;
              action.entityId = entityVersion.application.id;
            }
            return action;
          case ACTIONS.PUBLISH:
            action = {
              type: ACTIONS.PUBLISH,
              organizationId: entityVersion.service.organization.id,
              entityId: entityVersion.service.id,
              entityVersion: entityVersion.version
            };
            return action;
          case ACTIONS.RETIRE:
            action = {
              type: ACTIONS.RETIRE,
              organizationId: entityVersion.service.organization.id,
              entityId: entityVersion.service.id,
              entityVersion: entityVersion.version
            };
            return action;
        }
      };

      var doAction = function (action, shouldReload) {
        Action.save(action, function (reply) {
          if (shouldReload) {
            $state.forceReload();
          }
        });
      };

      this.publishService = function (serviceVersion, shouldReload) {
        doAction(this.createAction(serviceVersion, ACTIONS.PUBLISH), shouldReload);
      };

      this.retireService = function (serviceVersion, shouldReload) {
        doAction(this.createAction(serviceVersion, ACTIONS.RETIRE), shouldReload);
      };

      this.lockPlan = function (planVersion, shouldReload) {
        doAction(this.createAction(planVersion, ACTIONS.LOCK), shouldReload);
      };

      this.publishApp = function (applicationVersion, shouldReload) {
        doAction(this.createAction(applicationVersion, ACTIONS.REGISTER), shouldReload);
      };

      this.retireApp = function (applicationVersion, shouldReload) {
        doAction(this.createAction(applicationVersion, ACTIONS.UNREGISTER), shouldReload);
      };
    }])

    .service('toastService', ['$timeout', function ($timeout) {
      var toasts = [];

      this.toasts = toasts;

      var closeToastAtIndex = function (index) {
        toasts.splice(index, 1);
      };

      this.closeAlert = function(index) {
        closeToastAtIndex(index);
      };

      this.createToast = function(type, msg, autoclose) {
        var toast = {
          type: type,
          msg: msg
        };
        this.toasts.push(toast);

        if(autoclose) {
          timedClose();
        }
      };

      var timedClose = function () {
        $timeout(function() {
          closeToastAtIndex(0);
        }, 2000);
      };
    }])

    .service('headerModel', function ($rootScope) {
      this.showExplore = true;
      this.showDash = true;

      this.setIsButtonVisible = function (explore, dash) {
        this.showExplore = explore;
        this.showDash = dash;
        $rootScope.$broadcast('buttonToggle', 'toggled!');
      };
    })

    .service('orgScreenModel', function () {

      this.selectedTab = 'Plans';
      this.organization = {};

      this.updateTab = function (newTab) {
        this.selectedTab = newTab;
      };

      this.updateOrganization = function (org) {
        this.organization = org;
      };

    })

    .service('svcTab', function () {

      this.selectedTab = 'Documentation';

      this.updateTab = function (newTab) {
        this.selectedTab = newTab;
      };

    })

    .service('svcScreenModel', function () {
      this.selectedTab = 'Overview';
      this.service = {};

      this.updateTab = function (newTab) {
        this.selectedTab = newTab;
      };

      this.updateService = function (newSvc) {
        this.service = newSvc;
      };
    })

    .service('selectedApp', function () {
      this.appVersion = null;

      this.updateApplication = function (newApp) {
        this.appVersion = newApp;
      };
    })

    .service('appScreenModel', function () {
      this.selectedTab = 'Overview';
      this.application = {};

      this.updateTab = function (newTab) {
        this.selectedTab = newTab;
      };

      this.updateApplication = function (newApp) {
        this.application = newApp;
      };
    })

    .service('planScreenModel', function () {
      this.selectedTab = 'Overview';
      this.plan = {};

      this.updateTab = function (newTab) {
        this.selectedTab = newTab;
      };

      this.updatePlan = function (plan) {
        this.plan = plan;
      };
    })

    .service('svcModel', function () {

      var service = null;

      this.setService = function (serv) {
        service = serv;
      };

      this.getService = function () {
        return service;
      };

    })

    .service('userScreenModel', function () {
      this.selectedTab = 'Profile';

      this.updateTab = function (newTab) {
        this.selectedTab = newTab;
      };
    });

})(window.angular);
