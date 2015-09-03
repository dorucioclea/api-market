;(function() {
  "use strict";


angular.module("app.ctrl.api", [])

  /// ==== Service Doc Main Controller
  .controller("ApiDocCtrl", ["$scope", "$stateParams", "$modal", "svcData", "svcModel", "svcTab",
    function($scope, $stateParams, $modal, svcData, svcModel, svcTab) {

      svcModel.setService(svcData);
      $scope.serviceVersion = svcData;
      $scope.displayTab = svcTab;

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


/// ==== Service Swagger Documentation Controller
    .controller("DocumentationCtrl", ["$scope", "$modal", "$stateParams", "endpoint", "svcTab", "ServiceVersionDefinition",
      function($scope, $modal, $stateParams, endpoint, svcTab, ServiceVersionDefinition) {
        console.log("Endpoint loaded:"+JSON.stringify(endpoint));
        svcTab.updateTab('Documentation');
        $scope.endpoint = endpoint;

        ServiceVersionDefinition.get({orgId: $stateParams.orgId, svcId: $stateParams.svcId, versionId: $stateParams.versionId}, function (definitionSpec) {
          $scope.loadSwaggerUi(definitionSpec, "swagger-ui-container",endpoint);
        });

        $scope.modalAnim = "default";

        $scope.modalSelectApplicationForContract = function() {
          $modal.open({
            templateUrl: "views/modals/modalSelectApplication.html",
            size: "lg",
            controller: "AppSelectCtrl as ctrl",
            resolve: function() {},
            windowClass: $scope.modalAnim	// Animation Class put here.
          });

        };

      }])

  /// ==== Service Plans Controller
  .controller("SvcPlanCtrl", ["$scope", "svcTab", function($scope, svcTab) {

    svcTab.updateTab('Plans');

  }])

  /// ==== Service Announcements Controller
  .controller("AnnouncementCtrl", ["$scope", "svcTab", function($scope, svcTab) {

    svcTab.updateTab('Announcements');

    $scope.selectedAnnouncement = 0;

    $scope.announcements = [ { id: 0, timestring: '24 days ago', username: 'Trust1Team', content: { short: 'Release v1 available', description: "<p>It came to me that I was upon this dark common, helpless, unprotected, and alone.  Suddenly, like a thing falling upon me from without, came--fear.</p> <p>With an effort I turned and began a stumbling run through the heather.</p> <p>The fear I felt was no rational fear, but a panic terror not only of the Martians, but of the dusk and stillness all about me.  Such an extraordinary effect in unmanning me it had that I ran weeping silently as a child might do.  Once I had turned, I did not dare to look back.</p> <p>I remember I felt an extraordinary persuasion that I was being played with, that presently, when I was upon the very verge of safety, this mysterious death--as swift as the passage of light--would leap after me from the pit about the cylinder and strike me down.</p> <p>It is still a matter of wonder how the Martians are able to slay men so swiftly and so silently.  Many think that in some way they are able to generate an intense heat in a chamber of practically absolute non-conductivity.  This intense heat they project in a parallel beam against any object they choose, by means of a polished parabolic mirror of unknown composition, much as the parabolic mirror of a lighthouse projects a beam of light.  But no one has absolutely proved these details.  However it is done, it is certain that a beam of heat is the essence of the matter.  Heat, and invisible, instead of visible, light.  Whatever is combustible flashes into flame at its touch, lead runs like water, it softens iron, cracks and melts glass, and when it falls upon water, incontinently that explodes into steam.</p>"}},
      { id: 1, timestring: '3 months ago', username: 'Test user', content: { short: 'RC1 coming tomorrow!', description: "<p>THE WHALE NEVER FIGURED IN ANY GRAND IMPOSING WAY? In one of the mighty triumphs given to a Roman general upon his entering the world's capital, the bones of a whale, brought all the way from the Syrian coast, were the most conspicuous object in the cymballed procession.*</p> <p>*See subsequent chapters for something more on this head.</p> <p>Grant it, since you cite it; but, say what you will, there is no real dignity in whaling.</p> <p>NO DIGNITY IN WHALING? The dignity of our calling the very heavens attest. Cetus is a constellation in the South! No more! Drive down your hat in presence of the Czar, and take it off to Queequeg! No more! I know a man that, in his lifetime, has taken three hundred and fifty whales. I account that man more honourable than that great captain of antiquity who boasted of taking as many walled towns.</p> <p>And, as for me, if, by any possibility, there be any as yet undiscovered prime thing in me; if I shall ever deserve any real repute in that small but high hushed world which I might not be unreasonably ambitious of; if hereafter I shall do anything that, upon the whole, a man might rather have done than to have left undone; if, at my death, my executors, or more properly my creditors, find any precious MSS. in my desk, then here I prospectively ascribe all the honour and the glory to whaling; for a whale-ship was my Yale College and my Harvard.</p>"}},
      { id: 2, timestring: 'a year ago', username: 'Trust1Team', content: { short: 'Incubation started', description: "<p>To go on account grog coffer gun salmagundi lee scuppers scuttle Spanish Main chase. Lookout squiffy swab hardtack long boat Blimey spyglass grog blossom furl heave down. Hail-shot bilged on her anchor hornswaggle man-of-war pirate six pounders Pieces of Eight Letter of Marque wherry Nelsons folly.</p> <p>Gaff topgallant cable loot clap of thunder crimp walk the plank fore bilge rat pressgang. Case shot no prey, no pay ballast Arr smartly pinnace holystone rigging ye bring a spring upon her cable. Arr stern line plunder Gold Road cutlass log weigh anchor lugger execution dock.</p> <p>Gibbet gunwalls long clothes killick port bowsprit Sea Legs doubloon spyglass interloper. Topsail pillage to go on account Spanish Main lugsail pirate jury mast Admiral of the Black handsomely Plate Fleet. Fathom blow the man down Barbary Coast bowsprit Sea Legs gangplank reef draught loaded to the gunwalls chandler.</p>"}}];

    $scope.switchNotification = function(id) {
      $scope.selectedAnnouncement = id;
    }

  }])

  /// ==== Service Support Controller
  .controller("SupportCtrl", ["$scope", "svcTab", function($scope, svcTab) {

    svcTab.updateTab('Support');

  }])

  /// ==== Service Terms Controller
  .controller("TermsCtrl", ["$scope", "svcTab", function($scope, svcTab) {

    svcTab.updateTab('Terms');

  }]);

  // #end
})();
