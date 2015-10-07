;(function(angular) {
    'use strict';

    angular.module('app.ctrls', [])

  // Root Controller
      .controller('AppCtrl', ['$rootScope', '$scope', '$state', '$modal', '$timeout',
        'Action', 'ACTIONS', 'currentUserModel', 'toastService', 'TOAST_TYPES', 'docTester', '$sessionStorage',
      function($rs, $scope, $state, $modal, $timeout,
               Action, ACTIONS, currentUserModel, toastService, TOAST_TYPES, docTester, $sessionStorage) {
          var mm = window.matchMedia('(max-width: 767px)');

          $rs.isMobile = mm.matches ? true : false;

          $rs.safeApply = function(fn) {
              var phase = this.$root.$$phase;
              if (phase === '$apply' || phase === '$digest') {
                  if (fn && (typeof(fn) === 'function')) {
                      fn();
                  }
              } else {
                  this.$apply(fn);
              }
          };

          $rs.$on('$stateChangeError', function(e, toState, toParams, fromState, fromParams, error) {
              if (error === 'Not Authorized') {
                  console.log('not authorized');
                  toastService.createToast(TOAST_TYPES.DANGER, 'You are not authorized to perform this action', true);
              }
          });

          mm.addListener(function(m) {
              $rs.safeApply(function() {
                  $rs.isMobile = (m.matches) ? true : false;
              });
          });

          //TODO Add function to verify if we are in publisher mode when the app starts or is refreshed
          $scope.publisherMode = true;
          //End

          //Make currentUserModel available to all child controllers
          $scope.User = currentUserModel;

          $scope.togglePublisher = function () {
              $scope.publisherMode = !$scope.publisherMode;
              setHeader();
          };

          var setHeader = function () {
              $scope.header = 'ACPAAS - API ' + ($scope.publisherMode ? 'Publisher' : 'Marketplace');
          };
          setHeader();

          $scope.loadSwaggerUi = function(spec, domId, endpoint) {
              $scope.swaggerUi = new SwaggerUi({
                  spec: spec,
                  dom_id: domId,
                  showRequestHeaders: true,
                  url: (endpoint === undefined || endpoint === null) ? '/' : endpoint.managedEndpoint,
                  supportedSubmitMethods: (endpoint === undefined || endpoint === null) ?
                    [] : ['get', 'post', 'put', 'delete', 'patch'],
                  validatorUrl: null,
                  apisSorter: 'alpha',
                  operationsSorter: 'alpha',
                  docExpansion: 'none',
                  onComplete: function() {
                      $('#' + domId).find('a').each(function(idx, elem) {
                          var href = $(elem).attr('href');
                          if (href[0] === '#') {
                              $(elem).removeAttr('href');
                          }
                      })
              .find('div.sandbox_header').each(function(idx, elem) {
                  $(elem).remove();
              })
              .find('li.operation div.auth').each(function(idx, elem) {
                  $(elem).remove();
              })
              .find('li.operation div.access').each(function(idx, elem) {
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
              function addApiKeyAuthorization() {
                  //TODO add key var - replace with var
                  var key;
                  if (docTester.preferredContract) {
                      key = docTester.apikey;
                  } else {
                      key = encodeURIComponent($sessionStorage.apikey);
                  }
                  if (key && key.trim() !== '') {
                      $scope.swaggerUi.api.clientAuthorizations.add('key',
                        new SwaggerClient.ApiKeyAuthorization('apikey', key, 'header'));
                  }
              }
              $scope.swaggerUi.load();
          };

          $scope.updateSwaggerHeader = function () {
              $scope.swaggerUi.api.clientAuthorizations.add('key',
                new SwaggerClient.ApiKeyAuthorization('apikey', docTester.apikey, 'header'));
          };

          $scope.addSwaggerTokenHeader = function (token) {
              $scope.swaggerUi.api.clientAuthorizations.add('token',
                new SwaggerClient.ApiKeyAuthorization('Authorization', token, 'header'));
          };

          $scope.navFull = true;
          $scope.toggleNav = function() {
              $scope.navFull = $scope.navFull ? false : true;
              $rs.navOffCanvas = $rs.navOffCanvas ? false : true;

              $timeout(function() {
                  $rs.$broadcast('c3.resize');
              }, 260);	// adjust this time according to nav transition
          };

          // ======= Site Settings
          $scope.toggleSettingsBox = function() {
              $scope.isSettingsOpen = $scope.isSettingsOpen ? false : true;
          };

          $scope.themeActive = 'theme-zero';	// first theme

          $scope.fixedHeader = true;
          $scope.navHorizontal = false;	// this will access by other directive, so in rootScope.

          // === saving states
          var SETTINGS_STATES = '_setting-states';
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
          if (sQuery) {
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
                  $rs.$broadcast('c3.resize');
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
                  templateUrl: '/views/modals/modalNewVersion.html',
                  size: 'lg',
                  controller: 'NewVersionCtrl as ctrl',
                  resolve: function() {},
                  windowClass: $scope.modalAnim	// Animation Class put here.
              });

          };
      }])

    .controller('EditLogoCtrl', ['$scope', '$modal', function($scope, $modal) {

        $scope.modalEditLogo = function() {
            $modal.open({
                templateUrl: 'views/modals/modalEditLogo.html',
                size: 'lg',
                controller: 'EditImgCtrl as ctrl',
                resolve: function() {},
                windowClass: $scope.modalAnim	// Animation Class put here.
            });

        };
    }])

    .controller('ErrorCtrl', function ($scope, $state, $sessionStorage) {
        $scope.error = $state.current.error;
        console.log($scope.error);

        $scope.retryLogin = function () {
            delete $sessionStorage.apikey;
            $state.go('root');
        };
    })

    .controller('HeadCtrl', ['$scope', '$state', '$sessionStorage', 'LogOutRedirect', 'CONFIG', 'docTester',
            'currentUser', 'currentUserModel', 'headerModel', 'orgScreenModel', 'Fullscreen',
      function($scope, $state, $sessionStorage, LogOutRedirect, CONFIG, docTester,
               currentUser, currentUserModel, headerModel, orgScreenModel, Fullscreen) {
          $scope.showExplore = headerModel.showExplore;
          $scope.showDash = headerModel.showDash;
          $scope.currentUserModel = currentUserModel;
          $scope.orgScreenModel = orgScreenModel;
          currentUserModel.setCurrentUserInfo(currentUser);
          $scope.doSearch = doSearch;
          $scope.doLogOut = doLogOut;

          function doSearch(query) {
              $state.go('root.search', {query: query});
          }

          function doLogOut() {
              var logOutObject = {
                  idpUrl: CONFIG.SECURITY.IDP_URL,
                  spName: CONFIG.SECURITY.SP_NAME,
                  username: $scope.User.currentUser.username
              };
              LogOutRedirect.save({}, logOutObject, function (reply) {
                  var string = '';
                  angular.forEach(reply, function (value) {
                      if (typeof value === 'string') {
                          string += value;
                      }
                  });
                  delete $sessionStorage.apikey;
                  window.location.href = string;
              });
          }

          $scope.toggleFloatingSidebar = function() {
              $scope.floatingSidebar = $scope.floatingSidebar ? false : true;
          };

          $scope.$on('buttonToggle', function (event, data) {
              $scope.showExplore = headerModel.showExplore;
              $scope.showDash = headerModel.showDash;
              $scope.showSearch = headerModel.showSearch;
          });

          $scope.goFullScreen = function() {
              if (Fullscreen.isEnabled()) {
                  Fullscreen.cancel();
              }
              else {
                  Fullscreen.all();
              }
          };

          $scope.toApis = function () {
              docTester.reset();
              $state.go('root.apis.grid');
          };

          $scope.toMarketDash = function () {
              if ($scope.orgScreenModel.organization === undefined) {
                  $state.go('root.myOrganizations');
              } else {
                  $state.go('root.market-dash', {orgId: $scope.orgScreenModel.organization.id});
              }
          };

      }]);

    // #end
})(window.angular);
