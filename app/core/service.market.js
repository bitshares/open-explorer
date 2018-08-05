(function() {
    'use strict';

    angular.module('app').factory('marketService', marketService);
    marketService.$inject = ['$http', 'appConfig', 'utilities'];

    function marketService($http, appConfig, utilities) {

        return {
            getActiveMarkets: function(callback) {
                var markets = [];
                $http.get(appConfig.urls.python_backend + "/get_most_active_markets").then(function(response) {

                    angular.forEach(response.data, function(value, key) {
                        var market = {
                            pair: value[1],
                            price: value[3],
                            volume: value[4]
                        };
                        markets.push(market);
                    });

                    callback(markets);
                });
            }
        };
    }

})();
