(function () {
    'use strict';

    angular.module('app')
        .config(['$routeProvider', function($routeProvider) {
            var routes, setRoutes;

            routes = [
                'dashboard',
				'assets', 'fees', 'witness', 'votes', 'workers', 'charts', 'search',
                'txs',
				'accounts',
                'markets'

            ]

            setRoutes = function(route) {
                var config, url;
                url = '/' + route;
                config = {
                    templateUrl: '' + route + '.html'
                };
                $routeProvider.when(url, config);
                return $routeProvider;
            };

            routes.forEach(function(route) {
                return setRoutes(route);
            });

            $routeProvider
                .when('/', {redirectTo: '/dashboard'})
                .when('/dashboard', {templateUrl: 'sections/dashboard/dashboard.html'})

                .when('/assets', {templateUrl: 'sections/assets/assets.html'})
                .when('/assets/:name', {templateUrl: 'sections/assets/asset.html'})

                .when('/blocks', {templateUrl: 'sections/blocks/blocks.html'})
                .when('/blocks/:name', {templateUrl: 'sections/blocks/block.html'})

                .when('/objects/:name', {templateUrl: 'sections/objects/object.html'})

                .when('/operations/:name', {templateUrl: 'sections/operations/operations.html'})
                .when('/404', {templateUrl: 'sections/pages/404.html'})

				.when('/accounts', {templateUrl: 'sections/accounts/accounts.html'})
				.when('/accounts/:name', {templateUrl: 'sections/accounts/account.html'})

				.when('/fees', {templateUrl: 'sections/fees/fees.html'})
				.when('/witness', {templateUrl: 'sections/witnesses/witnesses.html'})
				.when('/workers', {templateUrl: 'sections/workers/workers.html'})
				.when('/votes', {templateUrl: 'sections/voting/voting.html'})
                .when('/committee_members', {templateUrl: 'sections/committee_members/committee_members.html'})
                .when('/proxies', {templateUrl: 'sections/proxies/proxies.html'})

                .when('/search', {templateUrl: 'sections/search/search.html'})

                .when('/markets', {templateUrl: 'sections/markets/markets.html'})
                .when('/markets/:name/:name2', {templateUrl: 'sections/markets/market.html'})

                .when('/txs', {templateUrl: 'sections/txs/txs.html'})
                .when('/txs/:name', {templateUrl: 'sections/txs/tx.html'})

                .otherwise({ redirectTo: '/404'});

        }]
    );

})();
