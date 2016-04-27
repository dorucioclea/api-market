(function () {
    'use strict';

    angular.module('app.members')
        .service('memberHelper', memberHelper)
        .service('memberService', memberService);

    function memberHelper($modal, $state, toastService, TOAST_TYPES, currentUserModel, Member) {
        this.addMember = addMember;
        this.grantRoleToMember = grantRoleToMember;
        this.removeMember = removeMember;
        this.transferOwnership = transferOwnership;

        function addMember(org, roles) {
            $modal.open({
                templateUrl: 'views/modals/organizationAddMember.html',
                size: 'lg',
                controller: 'AddOrgMemberCtrl as ctrl',
                resolve: {
                    org: function() {
                        return org;
                    },
                    roles: function() {
                        return roles;
                    }
                },
                backdrop : 'static',
                windowClass: 'default'	// Animation Class put here.
            });
        }

        function grantRoleToMember(org, role, currentUser, member) {
            var updateObject = {
                userId: member.userId,
                roleId: role.id
            };
            Member.update({orgId: org.id, userId: member.userId},
                updateObject,
                function (reply) {
                    Member.query({orgId: org.id}, function (updatedList) {
                        if (member.userId === currentUser.username) {
                            // We changed our own role, need to update the CurrentUserInfo
                            currentUserModel.updateCurrentUserInfo(currentUserModel);
                        }
                        $state.forceReload();
                        var name = member.userName ? member.userName : member.userId;
                        toastService.createToast(TOAST_TYPES.INFO,
                            '<b>' + name + '</b> now has the <b>' + role.name + '</b> role.', true);
                    }, function (error) {
                        toastService.createErrorToast(error, 'Could not retrieve updated member roles');
                    });
                },
                function (error) {
                    toastService.createErrorToast(error, 'Could not update member role');
                });
        }

        function removeMember(org, member) {
            $modal.open({
                templateUrl: 'views/modals/organizationRemoveMember.html',
                size: 'lg',
                controller: 'MemberRemoveCtrl as ctrl',
                resolve: {
                    org: function () {
                        return org;
                    },
                    member: function () {
                        return member;
                    }
                },
                backdrop : 'static',
                windowClass: 'default'	// Animation Class put here.
            });
        }

        function transferOwnership(org, currentUser, member) {
            $modal.open({
                templateUrl: 'views/modals/organizationTransferOwner.html',
                size: 'lg',
                controller: 'TransferOrgCtrl as ctrl',
                resolve: {
                    org: function () {
                        return org;
                    },
                    currentOwner: function () {
                        return currentUser;
                    },
                    newOwner: function () {
                        return member;
                    }
                },
                backdrop : 'static',
                windowClass: 'default'	// Animation Class put here.
            });
        }
    }

    function memberService($q, Member, MembershipRequests, Users) {
        this.getMemberDetails = getMemberDetails;
        this.getMembersForOrg = getMembersForOrg;
        this.getPendingRequests = getPendingRequests;
        this.grantMembership = grantMembership;
        this.rejectMembershipRequest = rejectMembershipRequest;


        function getMemberDetails(userId) {
            return Users.get({ userId: userId }).$promise;
        }
        
        function getMembersForOrg(orgId) {
            return Member.query({orgId: orgId}).$promise;
        }

        function getPendingRequests(orgId) {
            return MembershipRequests.query({ orgId: orgId }).$promise;
        }
        
        function grantMembership(orgId, request, roleId) {
            // TODO implement backend call to update status of request
            var newMemberObj = {
                userId: request.userDetails.username,
                roleId: roleId
            };
            return Member.save({ orgId: orgId }, newMemberObj).$promise;
        }
        
        function rejectMembershipRequest(userId, role) {
            // TODO implement backend
            return $q.when('OK');
            // return $q.reject('FAIL');
        }
    }

})();
