;(function(angular) {
  "use strict";

  angular.module("app.directives", [])

    .directive("collapseNavAccordion", ["$rootScope", function($rs) {
      return {
        restrict: "A",
        link: function(scope, el, attrs) {
          var lists = el.find("ul").parent("li"), 	// target li which has sub ul
            a = lists.children("a"),
            aul = lists.find("ul a"),
            listsRest = el.children("li").not(lists),
            aRest = listsRest.children("a"),
            stopClick = 0;


          a.on("click", function(e) {
            if(!scope.navHorizontal) {
              if(e.timeStamp - stopClick > 300) {
                var self = $(this),
                  parent = self.parent("li");
                // remove `open` class from all
                lists.not(parent).removeClass("open");
                parent.toggleClass("open");
                stopClick = e.timeStamp;
              }
              e.preventDefault();
            }
            e.stopPropagation();
            e.stopImmediatePropagation();
          });

          aul.on("touchend", function(e) {
            if(scope.isMobile) {
              $rs.navOffCanvas = $rs.navOffCanvas ? false : true;
            }
            e.stopPropagation();
            e.stopImmediatePropagation();
          });

          aRest.on("touchend", function(e) {
            if(scope.isMobile) {
              $rs.navOffCanvas = $rs.navOffCanvas ? false : true;
            }
            e.stopPropagation();
            e.stopImmediatePropagation();
          });



          // slide up nested nav when clicked on aRest
          aRest.on("click", function(e) {
            if(!scope.navHorizontal) {
              var parent = aRest.parent("li");
              lists.not(parent).removeClass("open");

            }
            e.stopPropagation();
            e.stopImmediatePropagation();
          });

        }
      };
    }])





// highlight active nav
    .directive("highlightActive", ["$location", function($location) {
      return {
        restrict: "A",
        link: function(scope, el, attrs) {
          var links = el.find("a"),
            path = function() {return $location.path()},
            highlightActive = function(links, path) {
              var path = "#" + path;
              angular.forEach(links, function(link) {
                var link = angular.element(link),
                  li = link.parent("li"),
                  href = link.attr("href");

                if(li.hasClass("active")) {
                  li.removeClass("active");
                }
                if(path.indexOf(href) === 0) {
                  li.addClass("active");
                }
              });
            };

          highlightActive(links, $location.path());
          scope.$watch(path, function(newVal, oldVal) {
            if(newVal === oldVal) {return;}
            highlightActive(links, $location.path());
          });
        }
      };
    }])

// perfect-scrollbar simple directive
    .directive("customScrollbar", ["$interval", function($interval) {
      return {
        restrict: "A",
        link: function(scope, el, attrs) {
          // if(!scope.$isMobile) // not initialize for mobile
          // {
          el.perfectScrollbar({
            suppressScrollX: true
          });

          $interval(function() {
            if(el[0].scrollHeight >= el[0].clientHeight) {
              el.perfectScrollbar("update");
            }
          }, 400);	// late update means more performance.
          // }

        }
      };
    }])


// Authentication directives
    .directive('authAccordionGroup', function () {
      return {
        scope: { title: '=heading'},
        transclude: true,
        templateUrl: "/views/templates/auth/accordion-group.html"
      };
    })

    .directive('oauth2', function() {
      return {
        templateUrl: "/views/templates/auth/oauth2.html"
      };
    })

    .directive('basicAuth', function() {
      return {
        templateUrl: "/views/templates/auth/basic.html"
      };
    })

    .directive('keyAuth', function() {
      return {
        templateUrl: "/views/templates/auth/key.html"
      };
    })

    .directive('queryAuth', function() {
      return {
        templateUrl: "/views/templates/auth/query.html"
      };
    })

    .directive('overview', function () {
      return {
        restrict: 'E',
        scope: {
          entityVersion: "=",
          type: "@"
        },
        transclude: true,
        templateUrl: '/views/templates/overview/overview.html'
      };
    })

    .directive('activityList', function () {
      return {
        restrict: 'E',
        scope: {
          type: '@',
          activities: '='
        },
        bindToController: true,
        templateUrl: '/views/templates/activity.html'
      };
    })

    .directive('definitionSelect', function ($parse) {
      return {
        restrict: 'A',
        scope: false,
        link: function(scope, element, attrs) {
          var fn = $parse(attrs.definitionSelect);

          element.on('change', function(onChangeEvent) {
            var reader = new FileReader();

            reader.onload = function(onLoadEvent) {
              scope.$apply(function() {
                fn(scope, {$fileContent:onLoadEvent.target.result});
              });
            };

            reader.readAsText((onChangeEvent.srcElement || onChangeEvent.target).files[0]);
          });
        }
      };
    })

    .directive('overviewHeader', function () {
      return {
        restrict: 'E',
        scope: {
          name: "@",
          description: "@",
          icon: "@",
          entityVersion: "=",
          versions: "=",
          selectVersion: "&",
          newVersion: "&",
          endpoint: "@"
        },
        bindToController: true,
        transclude: true,
        templateUrl: '/views/templates/overview/overview-header.html'
      };
    })

    .directive('overviewStatus', function () {
      return {
        restrict: 'E',
        scope: {
          createdOn: "@",
          createdBy: "@",
          status: "@"
        },
        templateUrl: '/views/templates/overview/overview-status.html'
      };
    })

    .directive('overviewTabs', function () {
      return {
        restrict:'E',
        transclude: true,
        templateUrl: '/views/templates/overview/overview-tabs.html'
      };
    })

    .directive('policyList', function () {
      return {
        restrict: 'E',
        scope: {
          policies: "=",
          policyDetails: "=",
          remove: "=removeFunction",
          reorder: "=reorderFunction",
          type: "@",
          org: "@orgId",
          id: "@pageId",
          version: "@"
        },
        controller: function($scope) {
          $scope.policyListOptions = {
            containerPositioning: 'relative',

            orderChanged: function(event) {
              $scope.ctrl.reorder($scope.ctrl.policies);
            }
          };

          $scope.pluginName = $scope.$parent.pluginName;
        },
        controllerAs: 'ctrl',
        bindToController: true,
        templateUrl: 'views/templates/policyList.html'
      };
    })


    .directive('statusLabel', function () {
      return {
        restrict: "E",
        scope: { status: '@'},
        template: '<label class=\"label text-uppercase\" ' +
        'data-ng-class=\"{\'label-success\': status === \'Published\' || status === \'Registered\' || status === \'Locked\',' +
        '\'label-warning\': status === \'Ready\' || status === \'Created\', ' +
        '\'label-muted\': status === \'Retired\'}\">' +
        '{{status}}</label>'
      };
    })


// add full body class for custom pages.
    .directive("customPage", ["$location",function($location) {
      return {
        restrict: "A",
        link: function(scope, element, attrs) {

          var path = function() {return $location.path(); };
          var addBg = function(path) {
            scope.bodyFull = false;
            switch(path) {
              case "/404": case "/pages/404" : case "/pages/signin" :
              case "/pages/signup" : case "/pages/forget-pass" :
              case "/pages/lock-screen":
                scope.bodyFull = true;
            }

          };
          addBg(path());

          scope.$watch(path, function(newVal, oldVal) {
            if(angular.equals(newVal, oldVal)) { return; }
            addBg(path());
          });

        }
      };

    }]);

}(window.angular));






