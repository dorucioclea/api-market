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
                    ServiceSupportTickets.save({orgId: serviceVersion.service.organization.id,
                            svcId: serviceVersion.service.id},
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
        .controller('ViewSupportTicketCtrl', ['$scope', '$modal', '$state', 'currentUser', 'ticket', 'user',
            'publisherMode', 'serviceVersion',
            'ServiceTicketComments', 'ServiceSupportTickets', 'toastService', 'TOAST_TYPES',
            function ($scope, $modal, $state, currentUser, ticket, user, publisherMode, serviceVersion,
                      ServiceTicketComments, ServiceSupportTickets, toastService, TOAST_TYPES) {

                $scope.modalClose = modalClose;
                $scope.comments = [];
                $scope.comment = '';
                $scope.currentUser = currentUser;
                $scope.ticket = ticket;
                $scope.user = user;
                $scope.publisherMode = publisherMode;
                $scope.serviceVersion = serviceVersion;
                $scope.addComment = addComment;
                $scope.deleteIssue = deleteIssue;
                $scope.closeIssue = closeIssue;
                $scope.reOpenIssue = reOpenIssue;
                $scope.isServiceOwner = isServiceOwner;

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
                        toastService.createToast(TOAST_TYPES.INFO, '<b>Comment posted.</b>', true);
                    });
                }

                function deleteIssue() {
                    ServiceSupportTickets.remove({orgId: $scope.ticket.organizationId,
                        svcId: $scope.ticket.serviceId, supportId: $scope.ticket.id}, function (reply) {
                        $scope.modalClose();
                        toastService.createToast(TOAST_TYPES.WARNING, '<b>Ticket deleted.</b>', true);
                    });
                }

                function closeIssue() {
                    var ticketObject = {
                        title: $scope.ticket.title,
                        description: $scope.ticket.description,
                        status: 'CLOSED'
                    };
                    ServiceSupportTickets.update({orgId: $scope.ticket.organizationId,
                        svcId: $scope.ticket.serviceId, supportId: $scope.ticket.id}, ticketObject, function (reply) {
                        $scope.modalClose();
                        toastService.createToast(TOAST_TYPES.INFO, '<b>Ticket closed.</b>', true);
                    });
                }

                function reOpenIssue() {
                    var ticketObject = {
                        title: $scope.ticket.title,
                        description: $scope.ticket.description,
                        status: 'OPEN'
                    };
                    ServiceSupportTickets.update({orgId: $scope.ticket.organizationId,
                        svcId: $scope.ticket.serviceId, supportId: $scope.ticket.id}, ticketObject, function (reply) {
                        $scope.modalClose();
                        toastService.createToast(TOAST_TYPES.INFO, '<b>Ticket reopened!</b>', true);
                    });
                }

                function modalClose() {
                    $scope.$close();	// this method is associated with $modal scope which is this.
                    $state.forceReload();
                }

                function isServiceOwner() {
                    return $scope.serviceVersion.createdBy === $scope.currentUser.currentUser.username;
                }

            }]);

    // #end
})(window.angular);
