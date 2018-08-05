(function () {
    'use strict';

    angular.module('app.markets')
        .controller('marketsCtrl', ['$scope', '$filter', '$routeParams', '$location', '$http', '$websocket', 'appConfig', 'utilities', marketsCtrl]);

    function marketsCtrl($scope, $filter, $routeParams, $location, $http, $websocket, appConfig, utilities) {

        var path = $location.path();
        var name = $routeParams.name;

        if(name) {
            name = name.toUpperCase();
            if(path.includes("markets")) {
                var name2 = $routeParams.name2;
                name2 = name2.toUpperCase();

                [name,name2] = [name2,name];
                //console.log(name2);

                var ticker = {};
                $http.get(appConfig.urls.python_backend + "/get_ticker?base=" + name + "&quote=" + name2)
                    .then(function(response3) {
                        //var base_precision = 5;
                        $http.get(appConfig.urls.python_backend + "/get_asset?asset_id=" + name)
                            .then(function(response_b) {
                                var base_id = response_b.data[0].id;
                                var base_precision = response_b.data[0].precision;


                                $http.get(appConfig.urls.python_backend + "/get_asset?asset_id=" + name2)
                                    .then(function(response_q) {
                                        var quote_id = response_q.data[0].id;
                                        var quote_precision = response_q.data[0].precision;

                                        var parsed = {
                                            price: response3.data.latest,
                                            ask: response3.data.lowest_ask,
                                            bid: response3.data.highest_bid,
                                            base_volume: parseInt(response3.data.base_volume),
                                            quote_volume: parseInt(response3.data.quote_volume),
                                            perc_change: response3.data.percent_change,
                                            base: name,
                                            quote: name2,
                                            base_precision: base_precision
                                        };
                                        $scope.ticker = parsed;

                                        // subscription
                                        var dataStream = $websocket(appConfig.urls.websocket);
                                        var base = base_id;
                                        var quote = quote_id;
                                        dataStream.send('{"method": "call", "params": [0, "subscribe_to_market", [5, "' + base + '", "'+quote+'"]], "id": 7}');

                                        $scope.$on("$locationChangeStart", function(event) {
                                            // when leaving page unsubscribe from market
                                            dataStream.send('{"method": "call", "params": [0, "unsubscribe_from_market", ["' + base + '", "'+quote+'"]], "id": 8}');
                                        });

                                        dataStream.onMessage(function (message) {
                                            var parsed;
                                            try {
                                                // lets update the ticker
                                                var ticker = {};
                                                $http.get(appConfig.urls.python_backend + "/get_ticker?base=" + name + "&quote=" + name2)
                                                    .then(function(response3) {
                                                        //var base_precision = 5;
                                                        $http.get(appConfig.urls.python_backend + "/get_asset?asset_id=" + name)
                                                            .then(function(response_p) {

                                                                var parsed = {
                                                                    price: response3.data.latest,
                                                                    ask: response3.data.lowest_ask,
                                                                    bid: response3.data.highest_bid,
                                                                    base_volume: parseInt(response3.data.base_volume),
                                                                    quote_volume: parseInt(response3.data.quote_volume),
                                                                    perc_change: response3.data.percent_change,
                                                                    base: name,
                                                                    quote: name2,
                                                                    base_precision: base_precision
                                                                };
                                                                $scope.ticker = parsed;

                                                                // order book
                                                                var asks = [];
                                                                var bids = [];
                                                                $http.get(appConfig.urls.python_backend + "/get_order_book?base=" + name + "&quote=" + name2 + "&limit=10")
                                                                    .then(function(response) {
                                                                        //console.log(response);
                                                                        var total = 0;
                                                                        angular.forEach(response.data.asks, function(value, key) {
                                                                            total = total + parseFloat(value.base);
                                                                            var parsed = { base1: parseFloat(value.base),
                                                                                           price1: parseFloat(value.price),
                                                                                           quote1: parseFloat(value.quote),
                                                                                           base_precision: base_precision,
                                                                                           quote_precision: quote_precision,
                                                                                           total1: total
                                                                            };
                                                                            asks.push(parsed);
                                                                        });
                                                                        $scope.asks = asks;

                                                                        total = 0;
                                                                        angular.forEach(response.data.bids, function(value, key) {
                                                                            total = total + parseFloat(value.base);
                                                                            var parsed = { base2: parseFloat(value.base),
                                                                                           price2: parseFloat(value.price),
                                                                                           quote2: parseFloat(value.quote),
                                                                                           base_precision: base_precision,
                                                                                           quote_precision: quote_precision,
                                                                                           total2: total
                                                                            };
                                                                            bids.push(parsed);
                                                                        });
                                                                        $scope.bids = bids;
                                                                });
                                                                // end order book


                                                                // grouped order book
                                                                // sell side
                                                                var grouped = [];
                                                                $http.get(appConfig.urls.python_backend + "/get_grouped_limit_orders?base=" + name + "&quote=" + name2 + "&group=10&limit=10")
                                                                    .then(function(response) {
                                                                        angular.forEach(response.data, function(value, key) {
                                                                            var total_for_sale = value.total_for_sale;
                                                                            var max_base_amount = parseInt(value.max_price.base.amount);
                                                                            var max_quote_amount = parseInt(value.max_price.quote.amount);
                                                                            var min_base_amount = parseInt(value.min_price.base.amount);
                                                                            var min_quote_amount = parseInt(value.min_price.quote.amount);

                                                                            var base_id = value.max_price.base.asset_id;
                                                                            var quote_id = value.max_price.quote.asset_id;

                                                                            var base_array = base_id.split(".");
                                                                            var quote_array = quote_id.split(".");
                                                                            var divide = 0;

                                                                            if(base_array[2] > quote_array[2])
                                                                            {
                                                                                divide = 1;
                                                                                //base_precision, quote_precision = quote_precision, base_precision;
                                                                                //quote_precision = [base_precision, base_precision = quote_precision][0];
                                                                            }
                                                                            //console.log(divide);
                                                                            var qp = Math.pow(10, parseInt(quote_precision));
                                                                            var bp = Math.pow(10, parseInt(base_precision));

                                                                            var max_price;
                                                                            var min_price;
                                                                            var min;
                                                                            var max;
                                                                            if(divide) {
                                                                                max = (max_quote_amount / qp) / (max_base_amount / bp);
                                                                                max_price = 1 / max;
                                                                                min = (min_quote_amount / qp) / (min_base_amount / bp);
                                                                                min_price = 1 / min;
                                                                            }
                                                                            else {
                                                                                max_price = parseFloat(max_base_amount / bp) / parseFloat(max_quote_amount / qp);
                                                                                min_price = parseFloat(min_base_amount / bp) / parseFloat(min_quote_amount / qp);
                                                                            }
                                                                            total_for_sale = Number(total_for_sale/bp);

                                                                            var parsed = { max_price3: max_price,
                                                                                           min_price3: min_price,
                                                                                           total_for_sale3: total_for_sale,
                                                                                           base_precision: base_precision,
                                                                                           quote_precision: quote_precision};
                                                                            grouped.push(parsed);
                                                                        });
                                                                        $scope.grouped = grouped;
                                                                });

                                                                // end sell side
                                                                // buy side
                                                                var grouped2 = [];
                                                                //name, name2 = name2, name;
                                                                //name2 = [name, name = name2][0];
                                                                var new_name = name2;
                                                                var new_name2 = name;
                                                                var new_base_precision = quote_precision;
                                                                var new_quote_precision = base_precision;
                                                                $http.get(appConfig.urls.python_backend + "/get_grouped_limit_orders?base=" + new_name + "&quote=" + new_name2 + "&group=10&limit=10")
                                                                    .then(function(response2) {
                                                                        angular.forEach(response2.data, function(value, key) {
                                                                            var total_for_sale = value.total_for_sale;
                                                                            // swap
                                                                            var max_base_amount = parseInt(value.max_price.quote.amount);
                                                                            var max_quote_amount = parseInt(value.max_price.base.amount);
                                                                            var min_base_amount = parseInt(value.min_price.quote.amount);
                                                                            var min_quote_amount = parseInt(value.min_price.base.amount);
                                                                            var base_id = value.max_price.quote.asset_id;
                                                                            var quote_id = value.max_price.base.asset_id;

                                                                            var base_array = base_id.split(".");
                                                                            var quote_array = quote_id.split(".");
                                                                            var divide = 0;

                                                                            if(base_array[2] > quote_array[2])
                                                                            {
                                                                                divide = 1;
                                                                                //new_base_precision, new_quote_precision = new_quote_precision, new_base_precision;
                                                                                //new_quote_precision = [new_base_precision, new_base_precision = new_quote_precision][0];
                                                                            }
                                                                            var qp = Math.pow(10, parseInt(new_quote_precision));
                                                                            var bp = Math.pow(10, parseInt(new_base_precision));

                                                                            var max_price;
                                                                            var min_price;
                                                                            var min;
                                                                            var max;
                                                                            if(divide) {
                                                                                max = (max_quote_amount / bp) / (max_base_amount / qp);
                                                                                max_price = 1 / max;
                                                                                min = (min_quote_amount / bp) / (min_base_amount / qp);
                                                                                min_price = 1 / min;
                                                                                //total_for_sale = Number(total_for_sale/qp);
                                                                            }
                                                                            else {
                                                                                max_price = parseFloat(max_base_amount / qp) / parseFloat(max_quote_amount / bp);
                                                                                min_price = parseFloat(min_base_amount / qp) / parseFloat(min_quote_amount / bp);
                                                                                //total_for_sale = Number(total_for_sale/bp);
                                                                            }

                                                                            total_for_sale = Number(total_for_sale/bp);
                                                                            var parsed = { max_price4: max_price,
                                                                                           min_price4: min_price,
                                                                                           total_for_sale4: total_for_sale,
                                                                                           base_precision: new_quote_precision,
                                                                                           quote_precision: new_base_precision};
                                                                            grouped2.push(parsed);
                                                                        });
                                                                        $scope.grouped2 = grouped2;
                                                                });

                                                                // end buy side
                                                                // end grouped order book
                                                            });
                                                    });
                                                parsed = JSON.parse(message.data);
                                                //console.log(parsed);
                                                //parsed = JSON.parse(message.data).params[1][0][0];
                                            }
                                            catch (err) {
                                            }
                                            //console.log(parsed);
                                        });
                                        /// end subscription
                                    });
                            });
                    });
                //TradingView.onready(function()
                //{
                var widget = window.tvWidget = new TradingView.widget({
                    fullscreen: true,
                    symbol: name + '_' + name2,
                    interval: '60',
                    container_id: "tv_chart_container",
                    //	BEWARE: no trailing slash is expected in feed URL
                    datafeed: new Datafeeds.UDFCompatibleDatafeed(appConfig.urls.udf_wrapper),
                    library_path: "charting_library/",
                    locale: getParameterByName('lang') || "en",
                    //	Regression Trend-related functionality is not implemented yet, so it's hidden for a while
                    drawings_access: { type: 'black', tools: [ { name: "Regression Trend" } ] },
                    disabled_features: ["use_localstorage_for_settings"],
                    enabled_features: ["study_templates"],
                    charts_storage_url: 'http://saveload.tradingview.com',
                    charts_storage_api_version: "1.1",
                    client_id: 'tradingview.com',
                    user_id: 'public_user_id'
                });

                utilities.columnsort($scope, "price1", "sortColumn", "sortClass", "reverse", "reverseclass", "columnToSort");
                utilities.columnsort($scope, "price2", "sortColumn2", "sortClass2", "reverse2", "reverseclass2", "columnToSort2");
                utilities.columnsort($scope, "min_price3", "sortColumn3", "sortClass3", "reverse3", "reverseclass3", "columnToSort3");
                utilities.columnsort($scope, "min_price4", "sortColumn4", "sortClass4", "reverse4", "reverseclass4", "columnToSort4");
            }
        }
        else {
            if(path === "/markets") {
                $http.get(appConfig.urls.python_backend + "/get_most_active_markets")
                    .then(function(response) {
                        //console.log(response.data);
                        var markets = [];
                        angular.forEach(response.data, function(value, key) {
                            var parsed = {pair: value[1], price: value[3], volume: value[4]};
                            markets.push(parsed);
                        });
                        $scope.markets = markets;
                    });
            }

            utilities.columnsort($scope, "volume", "sortColumn", "sortClass", "reverse", "reverseclass", "column");

        }
    }
    function getParameterByName(name) {
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
            results = regex.exec(location.search);
        return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    }

})();
