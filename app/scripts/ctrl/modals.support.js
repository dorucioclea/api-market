;(function(angular) {
    'use strict';

    angular.module('app.ctrl.modals.support', [])

/// ==== CreateSupportTicket Controller
        .controller('CreateSupportTicketCtrl', ['$scope', '$modal', '$state', 'serviceVersion', 'ServiceSupportTickets',
            'currentUserModel', 'toastService', 'TOAST_TYPES',
            function ($scope, $modal, $state, serviceVersion, ServiceSupportTickets,
                      currentUserModel, toastService, TOAST_TYPES) {

                $scope.newTicket = {
                    title: '',
                    description: ''
                };
                $scope.createTicket = createTicket;
                $scope.modalClose = modalClose;

                function createTicket() {
                    ServiceSupportTickets.save({orgId: serviceVersion.service.organization.id, svcId: serviceVersion.service.id},
                        $scope.newTicket,
                        function (reply) {
                            modalClose();
                            console.log(reply);
                            toastService.createToast(TOAST_TYPES.SUCCESS, '<b>Ticket created!</b>', true);
                            $state.forceReload();
                        }, function (error) {
                            modalClose();
                            toastService.createErrorToast(error, 'Could not create ticket');
                        }
                    );
                }
                function modalClose() {
                    $scope.$close();	// this method is associated with $modal scope which is this.
                }

            }])

    /// ==== ViewSupportTicket Controller
    .controller('ViewSupportTicketCtrl', ['$scope', '$modal', '$state', 'ticket', 'user', 'ServiceTicketComments',
        'currentUserModel', 'toastService', 'TOAST_TYPES',
        function ($scope, $modal, $state, ticket, user, ServiceTicketComments,
                  currentUserModel, toastService, TOAST_TYPES) {

            $scope.modalClose = modalClose;
            $scope.comments = [];
            $scope.comment = '';
            $scope.ticket = ticket;
            $scope.user = user;
            $scope.addComment = addComment;

            ServiceTicketComments.query({supportId: $scope.ticket.id}, function (reply) {
                $scope.comments = reply;
                $scope.comments.sort(function (a, b) {
                    return a.createdOn - b.createdOn;
                });
            });

            function addComment() {
                var commentObject = {
                    comment: $scope.comment
                };
                ServiceTicketComments.save({supportId: $scope.ticket.id}, commentObject, function (reply) {
                    $scope.comment = '';
                    $scope.commentForm.$setUntouched();
                    $scope.comments.push(reply);
                });
            }

            function modalClose() {
                $scope.$close();	// this method is associated with $modal scope which is this.
            }

        }]);

    // #end
})(window.angular);
