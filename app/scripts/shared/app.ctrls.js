;(function() {
  "use strict";


  angular.module("app.ctrls", [])

// Root Controller
    .controller("AppCtrl", ["$rootScope", "$scope", "$modal", "$timeout", function($rs, $scope, $modal, $timeout) {
      var mm = window.matchMedia("(max-width: 767px)");

      $rs.isMobile = mm.matches ? true: false;

      $rs.safeApply = function(fn) {
        var phase = this.$root.$$phase;
        if(phase == '$apply' || phase == '$digest') {
          if(fn && (typeof(fn) === 'function')) {
            fn();
          }
        } else {
          this.$apply(fn);
        }
      };

      mm.addListener(function(m) {
        $rs.safeApply(function() {
          $rs.isMobile = (m.matches) ? true : false;
        });
      });

      //TODO Add function to verify if we are in publisher mode when the app starts or is refreshed
      $scope.publisherMode = true;
      //End

      $scope.togglePublisher = function () {
        $scope.publisherMode = !$scope.publisherMode;
      };

      $scope.loadSwaggerUi = function(spec, domId, endpoint) {
        $scope.swaggerUi = new SwaggerUi({
          spec: spec,
          dom_id: domId,
          showRequestHeaders: true,
          url: function(){if(endpoint === undefined || endpoint === null)return "/"; else return endpoint.managedEndpoint;}(),
          supportedSubmitMethods: ['get', 'post', 'put', 'delete', 'patch'],
          validatorUrl: null,
          apisSorter: "alpha",
          operationsSorter: "alpha",
          docExpansion: "none",
          onComplete: function() {
            $('#' + domId).find('a').each(function(idx, elem) {
              var href = $(elem).attr('href');
              if (href[0] == '#') {
                $(elem).removeAttr('href');
              }
            })
              .find('div.sandbox_header').each(function(idx, elem) {
                $(elem).remove();
              })
              .find("li.operation div.auth").each(function(idx, elem) {
                $(elem).remove();
              })
              .find("li.operation div.access").each(function(idx, elem) {
                $(elem).remove();
              });
            $scope.$apply(function(error) {
              $scope.definitionStatus = 'complete';
            });
            addApiKeyAuthorization();
          },
          onFailure: function() {
            $scope.$apply(function(error) {
              $scope.definitionStatus = 'error';
              $scope.hasError = true;
              $scope.error = error;
            });
          }
        });
        function addApiKeyAuthorization(){
          //TODO add key var
          var key = encodeURIComponent("someapikey");
          if(key && key.trim() != "") {
            var apiKeyAuth = new SwaggerClient.ApiKeyAuthorization("apikey", key, "header");
            $scope.swaggerUi.api.clientAuthorizations.add("api_key", apiKeyAuth);
          }
        }
        $scope.swaggerUi.load();
      };

      $scope.navFull = true;
      $scope.toggleNav = function() {
        $scope.navFull = $scope.navFull ? false : true;
        $rs.navOffCanvas = $rs.navOffCanvas ? false : true;
        console.log("navOffCanvas: " + $scope.navOffCanvas);

        $timeout(function() {
          $rs.$broadcast("c3.resize");
        }, 260);	// adjust this time according to nav transition
      };

      // ======= Site Settings
      $scope.toggleSettingsBox = function() {
        $scope.isSettingsOpen = $scope.isSettingsOpen ? false : true;
      };

      $scope.themeActive = "theme-zero";	// first theme

      $scope.fixedHeader = true;
      $scope.navHorizontal = false;	// this will access by other directive, so in rootScope.


      // === saving states
      var SETTINGS_STATES = "_setting-states";
      var statesQuery = {
        get : function() {
          return JSON.parse(localStorage.getItem(SETTINGS_STATES));
        },
        put : function(states) {
          localStorage.setItem(SETTINGS_STATES, JSON.stringify(states));
        }
      };

      // initialize the states
      var sQuery = statesQuery.get() || {
          navHorizontal: $scope.navHorizontal,
          fixedHeader: $scope.fixedHeader,
          //navFull: $scope.navFull,
          themeActive: $scope.themeActive
        };
      // console.log(savedStates);
      if(sQuery) {
        $scope.navHorizontal = sQuery.navHorizontal;
        $scope.fixedHeader = sQuery.fixedHeader;
        //$scope.navFull = sQuery.navFull;
        $scope.themeActive = sQuery.themeActive;
      }




      // putting the states
      $scope.onNavHorizontal = function() {
        sQuery.navHorizontal = $scope.navHorizontal;
        statesQuery.put(sQuery);
      };

      $scope.onNavFull = function() {
        sQuery.navFull = $scope.navFull;
        statesQuery.put(sQuery);

        $timeout(function() {
          $rs.$broadcast("c3.resize");
        }, 260);

      };

      $scope.onFixedHeader = function() {
        sQuery.fixedHeader = $scope.fixedHeader;
        statesQuery.put(sQuery);
      };

      $scope.onThemeActive = function() {
        sQuery.themeActive = $scope.themeActive;
        statesQuery.put(sQuery);
      };

      $scope.onThemeChange = function(theme) {
        $scope.themeActive = theme;
        $scope.onThemeActive();
      };


      $scope.modalNewVersion = function() {
        $modal.open({
          templateUrl: "/views/modals/modalNewVersion.html",
          size: "lg",
          controller: "NewVersionCtrl as ctrl",
          resolve: function() {},
          windowClass: $scope.modalAnim	// Animation Class put here.
        });

      };
    }])


    .controller("HeadCtrl", ["$scope", "Fullscreen", function($scope, Fullscreen) {
      $scope.toggleFloatingSidebar = function() {
        $scope.floatingSidebar = $scope.floatingSidebar ? false : true;
        console.log("floating-sidebar: " + $scope.floatingSidebar);
      };

      $scope.goFullScreen = function() {
        if (Fullscreen.isEnabled())
          Fullscreen.cancel();
        else
          Fullscreen.all()
      };


    }]);

// #end
})();
