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
            },
            getAssetMarkets: function(asset_id, callback) {
                var markets = [];
                $http.get(appConfig.urls.python_backend + "/get_markets?asset_id=" + asset_id).then(function(response) {
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
            },
            getOrderBook: function(base, quote, base_precision, quote_precision, callback) {
                var order_book = [];
                var asks = [];
                var bids = [];
                $http.get(appConfig.urls.python_backend + "/get_order_book?base=" + base + "&quote=" + quote + "&limit=10")
                    .then(function(response) {

                    var total = 0;
                    angular.forEach(response.data.asks, function(value, key) {
                        total = total + parseFloat(value.base);
                        var parsed = {
                            base1: parseFloat(value.base),
                            price1: parseFloat(value.price),
                            quote1: parseFloat(value.quote),
                            base_precision: base_precision,
                            quote_precision: quote_precision,
                            total1: total
                        };
                        asks.push(parsed);
                    });
                    total = 0;
                    angular.forEach(response.data.bids, function(value, key) {
                        total = total + parseFloat(value.base);
                        var parsed = {
                            base2: parseFloat(value.base),
                            price2: parseFloat(value.price),
                            quote2: parseFloat(value.quote),
                            base_precision: base_precision,
                            quote_precision: quote_precision,
                            total2: total
                        };
                        bids.push(parsed);
                    });
                    order_book[0] = asks;
                    order_book[1] = bids;
                    callback(order_book);
                });
            },
            getGroupedOrderBook: function(base, quote, base_precision, quote_precision, callback) {
                var grouped = [];
                $http.get(appConfig.urls.python_backend + "/get_grouped_limit_orders?base=" + base + "&quote=" + quote + "&group=10&limit=10")
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
                        }
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

                        var parsed = {
                                max_price: max_price,
                                min_price: min_price,
                                total_for_sale: total_for_sale,
                                base_precision: base_precision,
                                quote_precision: quote_precision
                        };
                        grouped.push(parsed);
                    });
                    callback(grouped);
                });
            },
            getAssetPrecision: function(asset_id, callback) {
                var precision;
                $http.get(appConfig.urls.python_backend + "/get_asset?asset_id=" + asset_id).then(function (response) {
                    precision = response.data[0].precision;
                    callback(precision);
                });
            },
            getTicker: function(base, quote, callback) {
                var ticker = {};
                $http.get(appConfig.urls.python_backend + "/get_ticker?base=" + base + "&quote=" + quote).then(function(response) {
                    var ticker = {
                        price: response.data.latest,
                        ask: response.data.lowest_ask,
                        bid: response.data.highest_bid,
                        base_volume: parseInt(response.data.base_volume),
                        quote_volume: parseInt(response.data.quote_volume),
                        perc_change: response.data.percent_change,
                        base: base,
                        quote: quote
                        //base_precision: base_precision
                    };
                    callback(ticker);
                });
            }
        };
    }

})();
