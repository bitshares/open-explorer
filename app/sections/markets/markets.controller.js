(function () {
    'use strict';

    angular.module('app.markets')
        .controller('marketsCtrl', ['$scope', '$filter', '$routeParams', '$location', '$http', 'appConfig', marketsCtrl]);

    function marketsCtrl($scope, $filter, $routeParams, $location, $http, appConfig) {

        var path = $location.path();
        var name = $routeParams.name;

        if(name) {
            name = name.toUpperCase();
            if(path.includes("markets")) {
                var name2 = $routeParams.name2;

                [name,name2] = [name2,name];
                //console.log(name2);

                var asks = [];
                var bids = [];
                $http.get(appConfig.urls.python_backend + "/get_order_book?base=" + name + "&quote=" + name2)
                    .then(function(response) {
                        angular.forEach(response.data.asks, function(value, key) {

                            var base_precision = 5;
                            var quote_precision = 5;
                            $http.get(appConfig.urls.python_backend + "/get_asset?asset_id=" + name)
                                .then(function(response_p) {
                                    base_precision = response_p.data[0].precision;

                                    $http.get(appConfig.urls.python_backend + "/get_asset?asset_id=" + name2)
                                        .then(function(response_p2) {
                                            quote_precision = response_p2.data[0].precision;

                                            var parsed = {base: value.base, price: value.price, quote: value.quote, base_precision: base_precision, quote_precision: quote_precision};
                                            asks.push(parsed);

                                        });
                                });
                        });
                        $scope.asks = asks;

                        angular.forEach(response.data.bids, function(value, key) {
                            var base_precision = 5;
                            var quote_precision = 5;
                            $http.get(appConfig.urls.python_backend + "/get_asset?asset_id=" + name)
                                .then(function(response_p) {
                                    base_precision = response_p.data[0].precision;

                                    $http.get(appConfig.urls.python_backend + "/get_asset?asset_id=" + name2)
                                        .then(function(response_p2) {
                                            quote_precision = response_p2.data[0].precision;

                                            var parsed = {base: value.base, price: value.price, quote: value.quote, base_precision: base_precision, quote_precision: quote_precision};
                                            bids.push(parsed);

                                        });
                                });
                        });
                        $scope.bids = bids;
                    });

                var ticker = {};
                $http.get(appConfig.urls.python_backend + "/get_ticker?base=" + name + "&quote=" + name2)
                    .then(function(response3) {
                        var base_precision = 5;
                        $http.get(appConfig.urls.python_backend + "/get_asset?asset_id=" + name)
                            .then(function(response_p) {
                                base_precision = response_p.data[0].precision;

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
                            });


                        //console.log(ticker);
                    });
                //console.log(ticker);
                //$scope.ticker = ticker;

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
                //});
                /*
                 $scope.pricechart = {};
                 $http.get(appConfig.urls.python_backend + "/market_chart_dates")
                 .then(function(response) {
                 //console.log(response.data);
                 $http.get(appConfig.urls.python_backend + "/market_chart_data?base=" + name + "&quote=" + name2)
                 .then(function(response2) {

                 $scope.pricechart.options = {
                 animation: true,
                 title : {
                 text: name + '/' + name2
                 },
                 tooltip : {
                 trigger: 'axis'
                 },
                 legend: {
                 data:['Blu']
                 },
                 toolbox: {
                 show : true,
                 feature : {
                 saveAsImage : {show: true, title: "save as image"}
                 }
                 },

                 xAxis : [
                 {
                 type : 'category',
                 boundaryGap : true,
                 axisTick: {onGap:false},
                 splitLine: {show:false},
                 data : response.data,
                 }
                 ],
                 yAxis : [
                 {
                 type : 'value',
                 scale:true,
                 boundaryGap: [0.01, 0.01],
                 min: 0
                 }
                 ],
                 calculable : true,
                 series : [
                 {
                 name:'Price',
                 type:'candlestick',
                 itemStyle: {
                 normal: {
                 color: 'green',
                 color0: 'red',
                 borderColor: 'green',
                 borderColor0: 'red'

                 }
                 },
                 data: response2.data
                 }
                 ]
                 };
                 });
                 });
                 */
                // table 1
                // column to sort
                $scope.column = 'price';
                // sort ordering (Ascending or Descending). Set true for desending
                $scope.reverse = false;
                // called on header click
                $scope.sortColumn = function(col){
                    $scope.column = col;
                    if($scope.reverse){
                        $scope.reverse = false;
                        $scope.reverseclass = 'arrow-up';
                    }else{
                        $scope.reverse = true;
                        $scope.reverseclass = 'arrow-down';
                    }
                };
                // remove and change class
                $scope.sortClass = function(col) {
                    if ($scope.column == col) {
                        if ($scope.reverse) {
                            return 'arrow-down';
                        } else {
                            return 'arrow-up';
                        }
                    } else {
                        return '';
                    }
                }
                // table 2
                // column to sort
                $scope.column2 = 'price';
                // sort ordering (Ascending or Descending). Set true for desending
                $scope.reverse2 = true;
                // called on header click
                $scope.sortColumn2 = function(col2){
                    $scope.column2 = col2;
                    if($scope.reverse2){
                        $scope.reverse2 = false;
                        $scope.reverseclass2 = 'arrow-up';
                    }else{
                        $scope.reverse2 = true;
                        $scope.reverseclass2 = 'arrow-down';
                    }
                };
                // remove and change class
                $scope.sortClass2 = function(col2) {
                    if ($scope.column2 == col2) {
                        if ($scope.reverse2) {
                            return 'arrow-down';
                        } else {
                            return 'arrow-up';
                        }
                    } else {
                        return '';
                    }
                }


            }
        }
        else {
            if(path == "/markets") {
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
            // column to sort
            $scope.column = 'volume';
            // sort ordering (Ascending or Descending). Set true for desending
            $scope.reverse = true;
            // called on header click
            $scope.sortColumn = function(col){
                $scope.column = col;
                if($scope.reverse){
                    $scope.reverse = false;
                    $scope.reverseclass = 'arrow-up';
                }else{
                    $scope.reverse = true;
                    $scope.reverseclass = 'arrow-down';
                }
            };
            // remove and change class
            $scope.sortClass = function(col) {
                if ($scope.column == col) {
                    if ($scope.reverse) {
                        return 'arrow-down';
                    } else {
                        return 'arrow-up';
                    }
                } else {
                    return '';
                }
            }
        }
    }
    function getParameterByName(name) {
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
            results = regex.exec(location.search);
        return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    }
})();
