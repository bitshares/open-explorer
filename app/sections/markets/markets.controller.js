(function () {
    'use strict';

    angular.module('app.markets')
        .controller('marketsCtrl', ['$scope', '$routeParams', '$location', 'utilities', 'marketService', 'chartService', marketsCtrl]);

    function marketsCtrl($scope, $routeParams, $location, utilities, marketService, chartService) {

        var path = $location.path();
        var name = $routeParams.name;

        if(name) {
            name = name.toUpperCase();
            if(path.includes("markets")) {
                var name2 = $routeParams.name2;
                name2 = name2.toUpperCase();

                [name,name2] = [name2,name];

                var base_precision;
                var quote_precision;
                marketService.getAssetPrecision(name, function (returnData) {
                    base_precision = returnData;

                    marketService.getAssetPrecision(name, function (returnData2) {
                        quote_precision = returnData2;

                        marketService.getTicker(name, name2, function (returnData3) {

                            $scope.ticker = returnData3;
                            $scope.ticker.base_precision = base_precision;
                        });

                        marketService.getOrderBook(name, name2, base_precision, quote_precision, function (returnData4) {
                            $scope.asks = returnData4[0];
                            $scope.bids = returnData4[1];
                        });

                        marketService.getGroupedOrderBook(name, name2, base_precision, quote_precision, function (returnData5) {
                            $scope.sell_grouped = returnData5;
                        });
                        marketService.getGroupedOrderBook(name2, name, quote_precision, base_precision, function (returnData6) {
                            $scope.buy_grouped = returnData6;
                        });
                    });
                });

                /*
                // Todo: need to subscribe for updates. probably in a subscribe service with other similars(dashboard, account).
                var dataStream = $websocket(appConfig.urls.websocket);
                dataStream.send('{"method": "call", "params": [0, "subscribe_to_market", [5, "' + base + '", "'+quote+'"]], "id": 7}');

                $scope.$on("$locationChangeStart", function(event) {
                    // when leaving page unsubscribe from market
                    dataStream.send('{"method": "call", "params": [0, "unsubscribe_from_market", ["' + base + '", "'+quote+'"]], "id": 8}');
                });

                dataStream.onMessage(function (message) {
                    var parsed;
                    try {
                        // none
                    }
                    catch (err) {
                    }
                });
                /// end subscription
                */

                chartService.TradingView(name, name2);

                utilities.columnsort($scope, "price1", "sortColumn", "sortClass", "reverse", "reverseclass", "columnToSort");
                utilities.columnsort($scope, "price2", "sortColumn2", "sortClass2", "reverse2", "reverseclass2", "columnToSort2");
                utilities.columnsort($scope, "min_price3", "sortColumn3", "sortClass3", "reverse3", "reverseclass3", "columnToSort3");
                utilities.columnsort($scope, "min_price4", "sortColumn4", "sortClass4", "reverse4", "reverseclass4", "columnToSort4");
            }
        }
        else {
            if(path === "/markets") {

                marketService.getActiveMarkets(function (returnData) {
                    $scope.markets = returnData;
                });

                utilities.columnsort($scope, "volume", "sortColumn", "sortClass", "reverse", "reverseclass", "column");
            }
        }
    }

})();
