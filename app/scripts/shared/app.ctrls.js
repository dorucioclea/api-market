;(function() {
"use strict";


angular.module("app.ctrls", [])

// Root Controller
.controller("AppCtrl", ["$rootScope", "$scope", "$timeout", function($rs, $scope, $timeout) {
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

    $scope.currentCategories = [];

    $scope.availableCategories = [{ id: 0, name: "Location" },
    { id: 1, name: "Business" },
    { id: 2, name: "Social" },
    { id: 3, name: "Communication" },
    { id: 4, name: "Data" },
    { id: 5, name: "Other" } ];


	$scope.navFull = false;
	$scope.toggleNav = function() {
		$scope.navFull = $scope.navFull ? false : true;
		$rs.navOffCanvas = $rs.navOffCanvas ? false : true;
		console.log("navOffCanvas: " + $scope.navOffCanvas);

		$timeout(function() {
			$rs.$broadcast("c3.resize");
		}, 260);	// adjust this time according to nav transition
	};

  $scope.toggleCategories = function(category) {
    var index = $scope.currentCategories.indexOf(category.id);
    if (index > -1) {
      // Category was already selected, remove from array
      $scope.currentCategories.splice(index, 1);
    } else {
      // Category was not selected, add id to array
      $scope.currentCategories.push(category.id)
    }
  };


  $scope.isCategorySelected = function (category) {
    if ($scope.currentCategories.length == 0) {
      // No filtering on category yet, show all buttons as enabled
      return "btn-tag-primary"
    } else {
      var index = $scope.currentCategories.indexOf(category.id);
      if (index > -1) {
        // Category is enabled, show in primary color
        return "btn-tag-primary"
      } else {
        // Category not enabled, show in default color
        return "btn-tag-default"
      }
    }
  };

  $scope.clearSelectedCategories = function() {
    $scope.currentCategories = [];
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


}])

.filter('pricing', function () {
    return function(apis, currentPricingFilter) {
      var out = [];
      for (var i = 0; i < apis.length; i++) {
        var api = apis[i];
        if (currentPricingFilter.toLowerCase() == 'all') {
          out.push(api)
        } else {
          if (currentPricingFilter.toLowerCase() == api.pricing.toLowerCase()) {
            out.push(api)
          }
        }
      }
      return out;
    }
  })

.filter('categories', function () {
    return function(apis, currentCategories) {
      if (currentCategories.length == 0) {
        return apis;
      } else {
        var out = [];
        for (var i = 0; i < apis.length; i++) {
          var api = apis[i];
          for (var j = 0; j < api.tags.length; j++) {
            var tag = api.tags[j];
            if (currentCategories.indexOf(tag) > -1) {
              out.push(api);
              break;
            }
          }
        }
        return out;
      }
    }
  })


/// ==== Dashboard Controller
.controller("DashboardCtrl", ["$scope", "$location", "apiService", function($scope, $location, apiService) {

  $scope.currentSorting = 'Popular';
  $scope.currentPricing = 'All';


  $scope.availableAPIs = [{ name: "Petstore", logoUrl: "images/yeoman.png", owner: "Swagger Team", ownerLogoUrl: "images/admin.jpg", pricing: "Free", users: 3234, followers: 232, uptimePercent: 100, description: 'Petstore swagger test API', tags: [1,4]},
    { name: "WeatherAPI", logoUrl: "images/yeoman.png", owner: "KMI", ownerLogoUrl: "images/sample/1.jpg", pricing: "Paid", users: 496, followers: 128, uptimePercent: 96, description: 'Returns weather forecasts for requested zip code', tags: [0,2]},
    { name: "Test API 1", logoUrl: "images/yeoman.png", owner: "Trust1Team", ownerLogoUrl: "images/sample/2.jpg", pricing: "Freemium", users: 3234, followers: 232, uptimePercent: 50, description: 'Test Description', tags: [0,2]},
    { name: "Google Experimental API with very long name", logoUrl: "images/yeoman.png", owner: "Google",  ownerLogoUrl: "images/sample/3.jpg", pricing: "FREE", users: 22, followers: 8, uptimePercent: 5, description: 'Google API', tags: [0,2]},
    { name: "Facebook Profile API", logoUrl: "images/yeoman.png", owner: "Facebook", ownerLogoUrl: "images/sample/4.jpg", pricing: "Freemium", users: 119320, followers: 9999, uptimePercent: 88, description: 'Test Description', tags: [0,2]}];


  $scope.goToApi = function(api) {
    apiService.selectApi(api);
    $location.path('api');
  };
}])

/// ==== API Announcements Controller
    .controller("AnnouncementCtrl", ["$scope", function($scope) {

    $scope.selectedAnnouncement = 0;

    $scope.announcements = [ { id: 0, timestring: '24 days ago', username: 'Trust1Team', content: { short: 'Release v1 available', description: "<p>It came to me that I was upon this dark common, helpless, unprotected, and alone.  Suddenly, like a thing falling upon me from without, came--fear.</p> <p>With an effort I turned and began a stumbling run through the heather.</p> <p>The fear I felt was no rational fear, but a panic terror not only of the Martians, but of the dusk and stillness all about me.  Such an extraordinary effect in unmanning me it had that I ran weeping silently as a child might do.  Once I had turned, I did not dare to look back.</p> <p>I remember I felt an extraordinary persuasion that I was being played with, that presently, when I was upon the very verge of safety, this mysterious death--as swift as the passage of light--would leap after me from the pit about the cylinder and strike me down.</p> <p>It is still a matter of wonder how the Martians are able to slay men so swiftly and so silently.  Many think that in some way they are able to generate an intense heat in a chamber of practically absolute non-conductivity.  This intense heat they project in a parallel beam against any object they choose, by means of a polished parabolic mirror of unknown composition, much as the parabolic mirror of a lighthouse projects a beam of light.  But no one has absolutely proved these details.  However it is done, it is certain that a beam of heat is the essence of the matter.  Heat, and invisible, instead of visible, light.  Whatever is combustible flashes into flame at its touch, lead runs like water, it softens iron, cracks and melts glass, and when it falls upon water, incontinently that explodes into steam.</p>"}},
      { id: 1, timestring: '3 months ago', username: 'Test user', content: { short: 'RC1 coming tomorrow!', description: "<p>THE WHALE NEVER FIGURED IN ANY GRAND IMPOSING WAY? In one of the mighty triumphs given to a Roman general upon his entering the world's capital, the bones of a whale, brought all the way from the Syrian coast, were the most conspicuous object in the cymballed procession.*</p> <p>*See subsequent chapters for something more on this head.</p> <p>Grant it, since you cite it; but, say what you will, there is no real dignity in whaling.</p> <p>NO DIGNITY IN WHALING? The dignity of our calling the very heavens attest. Cetus is a constellation in the South! No more! Drive down your hat in presence of the Czar, and take it off to Queequeg! No more! I know a man that, in his lifetime, has taken three hundred and fifty whales. I account that man more honourable than that great captain of antiquity who boasted of taking as many walled towns.</p> <p>And, as for me, if, by any possibility, there be any as yet undiscovered prime thing in me; if I shall ever deserve any real repute in that small but high hushed world which I might not be unreasonably ambitious of; if hereafter I shall do anything that, upon the whole, a man might rather have done than to have left undone; if, at my death, my executors, or more properly my creditors, find any precious MSS. in my desk, then here I prospectively ascribe all the honour and the glory to whaling; for a whale-ship was my Yale College and my Harvard.</p>"}},
      { id: 2, timestring: 'a year ago', username: 'Trust1Team', content: { short: 'Incubation started', description: "<p>To go on account grog coffer gun salmagundi lee scuppers scuttle Spanish Main chase. Lookout squiffy swab hardtack long boat Blimey spyglass grog blossom furl heave down. Hail-shot bilged on her anchor hornswaggle man-of-war pirate six pounders Pieces of Eight Letter of Marque wherry Nelsons folly.</p> <p>Gaff topgallant cable loot clap of thunder crimp walk the plank fore bilge rat pressgang. Case shot no prey, no pay ballast Arr smartly pinnace holystone rigging ye bring a spring upon her cable. Arr stern line plunder Gold Road cutlass log weigh anchor lugger execution dock.</p> <p>Gibbet gunwalls long clothes killick port bowsprit Sea Legs doubloon spyglass interloper. Topsail pillage to go on account Spanish Main lugsail pirate jury mast Admiral of the Black handsomely Plate Fleet. Fathom blow the man down Barbary Coast bowsprit Sea Legs gangplank reef draught loaded to the gunwalls chandler.</p>"}}];

    $scope.switchNotification = function(id) {
      $scope.selectedAnnouncement = id;
    }

  }])

/// ==== API Documentation Controller
.controller("ApiDocCtrl", ["$scope", "$location", "$modal", "apiService", "applicationService", function($scope, $location, $modal, apiService, applicationService) {

    // Test API object
    $scope.api = {name: "Test API", versions: ['v1', 'v2']};
    $scope.application = { name: 'App1', versions: ['v1', 'v2'], environments: [{id: 'dev', name: "Development"}, {id: 'acc', name: "Acceptance"}, {id: 'prod', name: "Production"}]};

    apiService.selectApi($scope.api);
    applicationService.selectApplication($scope.application);


    $scope.apiUrl = "";
    $scope.apiEnvironment = 'dev';
    $scope.apiBaseUrl = "http://petstore.swagger.io";
    $scope.apiVersion = apiService.getSelectedVersion();
    $scope.swaggerUi = null;

    $scope.loadSwaggerUi = function(url) {
      $scope.swaggerUi = new SwaggerUi({
        url:url,
        dom_id:"swagger-ui-container",
        validatorUrl: null,
        apisSorter: "alpha",
        operationsSorter: "alpha",
        docExpansion: "list",
        onComplete: function() {
          $('#swagger-ui-container').find('a').each(function(idx, elem) {
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
        },
        onFailure: function() {
          $scope.$apply(function(error) {
            $scope.definitionStatus = 'error';
            $scope.hasError = true;
            $scope.error = error;
          });
        }
      });
      $scope.swaggerUi.load();
    };

    $scope.updateUrl = function() {
      $scope.apiUrl = $scope.apiBaseUrl + '/' + $scope.apiEnvironment + '/' + $scope.apiVersion;
      switch ($scope.apiEnvironment) {
        case 'dev':
              $scope.swaggerUrl = "http://petstore.swagger.io/v2/swagger.json";
              break;
        case 'acc':
              $scope.swaggerUrl = "http://www.bittitan.com/swagger/api-docs";
              break;
        case 'prod':
              $scope.swaggerUrl = "http://api.3drobotics.com/api-docs";
              break;
      }
      apiService.selectVersion($scope.apiVersion);
      $scope.loadSwaggerUi($scope.swaggerUrl);
    };

    $scope.updateUrl();

    $scope.subscribe = function() {
      $location.path('contract');
    };

    $scope.modalAnim = "default";

    $scope.modalNewTicketOpen = function() {
      $modal.open({
        templateUrl: "views/modals/modalCreateTicket.html",
        size: "lg",
        controller: "ModalDemoCtrl",
        resolve: function() {},
        windowClass: $scope.modalAnim	// Animation Class put here.
      });

    };

    $scope.modalClose = function() {
      $scope.$close();	// this method is associated with $modal scope which is this.
    };

    $scope.openTicket = function() {
      $modal.open({
        templateUrl: "views/modals/modalViewTicket.html",
        size: "lg",
        controller: "ModalDemoCtrl",
        resolve: function() {},
        windowClass: $scope.modalAnim
      });
    };
  }])

  .directive('authAccordionGroup', function () {
    return {
      scope: { title: '=heading'},
      transclude: true,
      templateUrl: "/views/templates/auth/accordion-group.html"
    }
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

/// ==== Application Controller
.controller("ApplicationCtrl", ["$scope", "Application", function ($scope, Application) {

    Application.get({orgId: 'Hooli', appId: 'HooliCompressionEngine'}, function (data) {
      $scope.organization = data.organization;
      $scope.application = data;
    })


  }])

  /// ==== NewApplication Controller
.controller("NewApplicationCtrl", ["$scope", "Organization", "Application", function ($scope, Organization, Application) {

    Organization.get({id: 'Hooli'}, function (data) {
      $scope.organization = data;
    });


    $scope.createApplication = function (application) {
      Application.save({ orgId: $scope.organization.id }, application);
    };


  }])

  /// ==== Organization Controller
.controller("OrganizationCtrl", ["$scope", "Organization", "orgModel", function ($scope, Organization, orgModel) {

    var orgId = orgModel.selectedOrgId;

    Organization.get({id: orgId}, function (data) {
      $scope.organization = data;
    });

    $scope.updateOrgDescription = function () {
      var updatedOrg = new Organization();
      updatedOrg.description = $scope.organization.description;
      updatedOrg.$update({id: $scope.organization.id});
    }

  }])

/// ==== NewOrganization Controller
.controller("NewOrganizationCtrl", ["$scope", "$location", "Organization", "orgModel", function ($scope, $location, Organization, orgModel) {

    $scope.createOrganization = function (org) {
      Organization.save(org, function (organization) {
        orgModel.setSelectedOrgId(organization.id);
      });
    };

    $scope.$on('orgModel::selectedOrgUpdated', function (event) {
      $location.path('organization');
    });

  }])


  // +++ Organization Screen Subcontrollers +++
  /// ==== Plans Controller
    .controller("PlansCtrl", ["$scope", "Plan", "orgModel", function ($scope, Plan, orgModel) {

      Plan.query({orgId: orgModel.selectedOrgId}, function (data) {
        $scope.plans = data;
      });

    }])

  /// ==== Services Controller
  .controller("ServicesCtrl", ["$scope", "Service", "orgModel", function ($scope, Service, orgModel) {

    Service.query({orgId: orgModel.selectedOrgId}, function (data) {
      $scope.services = data;
    });

  }])

  /// ==== Applications Controller
  .controller("ApplicationsCtrl", ["$scope", "Application", "orgModel", function ($scope, Application, orgModel) {

    Application.query({orgId: orgModel.selectedOrgId}, function (data) {
      $scope.applications = data;
    });

  }])

  /// ==== Members Controller
  .controller("MembersCtrl", ["$scope", "Member", "orgModel", function ($scope, Member, orgModel) {

    Member.query({orgId: orgModel.selectedOrgId}, function (data) {
      $scope.members = data;
    });

  }])
  // +++ End Organization Screen Subcontrollers +++

/// ==== User Controller
.controller("UserCtrl", ["$scope", function ($scope) {

    $scope.selectedTab = 1;

    $scope.selectTab = function(tabId) {
      $scope.selectedTab = tabId;
    };

    $scope.pathForTab = function() {
      switch ($scope.selectedTab) {
        case 1:
              return "views/partials/user/profile.html";
        case 2:
              return "views/partials/user/account.html";
        case 3:
              return "views/partials/user/email.html";
        case 4:
              return "views/partials/user/notifications.html";
      }
    };

  }])

/// ==== Contract Controller
.controller("ContractCtrl", ["$scope", "$modal", "$location", "apiService", "applicationService", function($scope, $modal, $location, apiService, applicationService) {

    $scope.plans = [
      "Unlimited",
      "Bronze",
      "Silver",
      "Gold",
      "Platinum"
    ];

    $scope.updateApplicationVersion = function() {
      applicationService.selectVersion($scope.apiVersion);
    };

    $scope.updateEnvironment = function() {
      apiService.selectEnvironment($scope.apiEnvironment);
    };

    $scope.cancel = function() {
      $location.path('api');
    };

    $scope.api = apiService.getSelectedApi();
    $scope.apiVersion = apiService.getSelectedVersion();
    $scope.application = applicationService.getSelectedApplication();

  }]);


// #end
})();
