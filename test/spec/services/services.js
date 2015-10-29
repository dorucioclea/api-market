'use strict';

describe('Services tests', function () {

    beforeEach(module('app'));

    describe('Service: actionService', function() {

        var planEntityVersion = {plan: {id: 'MockedPlan',
            organization: {id: 'MockedOrganization'}}, version: 'v1'};

        it('returns a Lock Plan action', inject(function(actionService, ACTIONS) {
            expect(actionService.createAction(planEntityVersion, ACTIONS.LOCK))
                .toEqual({type: 'lockPlan',
                    organizationId: 'MockedOrganization',
                    entityId: 'MockedPlan',
                    entityVersion: 'v1'});
        }));

        var appEntityVersion = {application: {id: 'MockedApp',
            organization: {id: 'MockedOrganization'}}, version: 'v1'};

        it('returns a Register Application action', inject(function(actionService, ACTIONS) {
            expect(actionService.createAction(appEntityVersion, ACTIONS.REGISTER))
                .toEqual({type: 'registerApplication',
                    organizationId: 'MockedOrganization',
                    entityId: 'MockedApp',
                    entityVersion: 'v1'});
        }));
        it('returns an Unregister Application action', inject(function(actionService, ACTIONS) {
            expect(actionService.createAction(appEntityVersion, ACTIONS.UNREGISTER))
                .toEqual({type: 'unregisterApplication',
                    organizationId: 'MockedOrganization',
                    entityId: 'MockedApp',
                    entityVersion: 'v1'});
        }));

        var serviceEntityVersion = {service: {id: 'MockedService',
            organization: {id: 'MockedOrganization'}}, version: 'v1'};

        it('returns a Publish Service action', inject(function(actionService, ACTIONS) {
            expect(actionService.createAction(serviceEntityVersion, ACTIONS.PUBLISH))
                .toEqual({type: 'publishService',
                    organizationId: 'MockedOrganization',
                    entityId: 'MockedService',
                    entityVersion: 'v1'});
        }));
        it('returns a Retire Service action', inject(function(actionService, ACTIONS) {
            expect(actionService.createAction(serviceEntityVersion, ACTIONS.RETIRE))
                .toEqual({type: 'retireService',
                    organizationId: 'MockedOrganization',
                    entityId: 'MockedService',
                    entityVersion: 'v1'});
        }));

    });

    describe('Service: alertService', function() {

        it('is initialized with an empty alerts array', inject(function(alertService) {
            expect(alertService.alerts.length).toBe(0);
        }));

        it('adds an alert to the alerts array', inject(function (alertService, ALERT_TYPES) {
            alertService.addAlert(ALERT_TYPES.WARNING, 'This is a test alert');

            expect(alertService.alerts.length).toBe(1);
            expect(alertService.alerts[0]).toEqual({type: 'warning', msg: 'This is a test alert'});
        }));

        it('closes an alert', inject(function (alertService, ALERT_TYPES) {
            alertService.addAlert(ALERT_TYPES.WARNING, 'This is a test alert');
            expect(alertService.alerts.length).toBe(1);
            alertService.closeAlert(0);
            expect(alertService.alerts.length).toBe(0);
        }));

        it('adds 3 alerts to the alerts array and closes the second one', inject(function (alertService, ALERT_TYPES) {
            alertService.addAlert(ALERT_TYPES.WARNING, 'This is a test alert');
            alertService.addAlert(ALERT_TYPES.SUCCESS, 'Second Alert');
            alertService.addAlert(ALERT_TYPES.INFO, 'Third Alert');

            expect(alertService.alerts.length).toBe(3);
            expect(alertService.alerts[1]).toEqual({type: 'success', msg: 'Second Alert'});
            expect(alertService.alerts[2]).toEqual({type: 'info', msg: 'Third Alert'});

            alertService.closeAlert(1);
            expect(alertService.alerts.length).toBe(2);
            expect(alertService.alerts[0]).toEqual({type: 'warning', msg: 'This is a test alert'});
            expect(alertService.alerts[1]).toEqual({type: 'info', msg: 'Third Alert'});
        }));

        it('resets all alerts', inject(function (alertService, ALERT_TYPES) {
            alertService.addAlert(ALERT_TYPES.WARNING, 'This is a test alert');
            expect(alertService.alerts.length).toBe(1);
            alertService.resetAllAlerts();
            expect(alertService.alerts.length).toBe(0);

            alertService.addAlert(ALERT_TYPES.WARNING, 'This is a test alert');
            alertService.addAlert(ALERT_TYPES.SUCCESS, 'Second Alert');
            alertService.addAlert(ALERT_TYPES.INFO, 'Third Alert');
            alertService.addAlert(ALERT_TYPES.INFO, 'Alert 4');
            alertService.addAlert(ALERT_TYPES.INFO, 'Alert 5');
            alertService.addAlert(ALERT_TYPES.INFO, 'Alert 6');

            expect(alertService.alerts.length).toBe(6);
            alertService.resetAllAlerts();
            expect(alertService.alerts.length).toBe(0);
        }));
    });
});
