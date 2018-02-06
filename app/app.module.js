(function () {
    'use strict';

    angular.module('app', [
        // Angular modules
        'ngRoute',
        'ngAnimate',
        'ngAria',

        // 3rd Party Modules
        'ui.bootstrap',
        'angular-loading-bar',
		'ngWebSocket',
        'angular-google-analytics',

        // Custom modules
        'app.nav',
        'app.i18n',
        'app.chart',
        'app.accounts',
        'app.assets',
        'app.markets',
        'app.committee_members',
        'app.fees',
        'app.objects',
        'app.operations',
        'app.proxies',
        'app.search',
        'app.txs',
        'app.voting',
        'app.witnesses',
        'app.workers',
        'app.blocks',
        'app.header'
    ]);

})();








