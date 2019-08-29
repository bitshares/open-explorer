(function() {
    'use strict';

    angular.module('app').factory('marketService', marketService);
    marketService.$inject = ['$http', 'appConfig'];

    function marketService($http, appConfig) {

        return {
            getActiveMarkets: function(callback) {
                let markets = [];
                $http.get(appConfig.urls.python_backend + "/most_active_markets").then(function(response) {

                    angular.forEach(response.data, function(value) {
                        const market = {
                            pair: value.pair,
                            price: value.latest_price,
                            volume: value["24h_volume"]
                        };
                        markets.push(market);
                    });

                    callback(markets);
                });
            },
            getAssetMarkets: function(asset_id, callback) {
                let markets = [];
                $http.get(appConfig.urls.python_backend + "/markets?asset_id=" + asset_id).then(function(response) {
                    angular.forEach(response.data, function(value) {
                        const market = {
                            pair: value.pair,
                            price: value.latest_price,
                            volume: value["24h_volume"]
                        };
                        markets.push(market);
                    });
                    callback(markets);
                });
            },
            getOrderBook: function(base, quote, base_precision, quote_precision, callback) {
                let order_book = [];
                let asks = [];
                let bids = [];
                $http.get(appConfig.urls.python_backend + "/order_book?base=" + base + "&quote=" + quote + "&limit=10")
                    .then(function(response) {

                    let total = 0;
                    angular.forEach(response.data.asks, function(value) {
                        total = total + parseFloat(value.base);
                        const parsed = {
                            base: parseFloat(value.base),
                            price: parseFloat(value.price),
                            quote: parseFloat(value.quote),
                            base_precision: base_precision,
                            quote_precision: quote_precision,
                            total: total
                        };
                        asks.push(parsed);
                    });
                    total = 0;
                    angular.forEach(response.data.bids, function(value) {
                        total = total + parseFloat(value.base);
                        const parsed = {
                            base: parseFloat(value.base),
                            price: parseFloat(value.price),
                            quote: parseFloat(value.quote),
                            base_precision: base_precision,
                            quote_precision: quote_precision,
                            total: total
                        };
                        bids.push(parsed);
                    });
                    order_book[0] = asks;
                    order_book[1] = bids;
                    callback(order_book);
                });
            },
            getGroupedOrderBook: function(base, quote, base_precision, quote_precision, callback) {
                let grouped = [];
                $http.get(appConfig.urls.python_backend + "/grouped_limit_orders?base=" + base + "&quote=" +
                    quote + "&group=10&limit=10")
                    .then(function(response) {

                        console.log(response);

                    angular.forEach(response.data, function(value) {
                        let total_for_sale = value.total_for_sale;
                        const max_base_amount = parseInt(value.max_price.base.amount);
                        const max_quote_amount = parseInt(value.max_price.quote.amount);
                        const min_base_amount = parseInt(value.min_price.base.amount);
                        const min_quote_amount = parseInt(value.min_price.quote.amount);

                        const base_id = value.max_price.base.asset_id;
                        const quote_id = value.max_price.quote.asset_id;

                        const base_array = base_id.split(".");
                        const quote_array = quote_id.split(".");
                        let divide = 0;

                        if(base_array[2] > quote_array[2])
                        {
                            divide = 1;
                        }
                        const qp = Math.pow(10, parseInt(quote_precision));
                        const bp = Math.pow(10, parseInt(base_precision));

                        let max_price;
                        let min_price;
                        let min;
                        let max;
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

                        const parsed = {
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
                let precision;
                $http.get(appConfig.urls.python_backend + "/asset?asset_id=" + asset_id).then(function (response) {
                    precision = response.data.precision;
                    callback(precision);
                });
            },
            getTicker: function(base, quote, callback) {
                let ticker = {};
                $http.get(appConfig.urls.python_backend + "/ticker?base=" + base + "&quote=" + quote)
                    .then(function(response) {
                    const ticker = {
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
