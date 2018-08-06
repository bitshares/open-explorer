(function() {
    'use strict';

    angular.module('app').factory('chartService', chartService);
    chartService.$inject = ['$http', 'appConfig', 'utilities'];

    function chartService($http, appConfig, utilities) {

        return {
            dailyDEXChart: function(callback) {

                var dex_volume_chart = {};
                $http.get(appConfig.urls.python_backend + "/daily_volume_dex_dates").then(function (response) {
                    $http.get(appConfig.urls.python_backend + "/daily_volume_dex_data").then(function (response2) {

                        dex_volume_chart.options = {
                            animation: true,
                            title: {
                                text: 'Daily DEX Volume in BTS for the last 30 days'
                            },
                            tooltip: {
                                trigger: 'axis'
                            },
                            toolbox: {
                                show: true,
                                feature: {
                                    saveAsImage: {show: true, title: "save as image"}
                                }
                            },
                            xAxis: [{
                                boundaryGap: true,
                                data: response.data
                            }],
                            yAxis: [{
                                type: 'value',
                                scale: true,
                                axisLabel: {
                                    formatter: function (value) {
                                        return value / 1000000 + "M";
                                    }
                                }
                            }],
                            calculable: true,
                            series: [{
                                name: 'Volume',
                                type: 'bar',
                                itemStyle: {
                                    normal: {
                                        color: 'green',
                                        borderColor: 'green'
                                    }
                                },
                                data: response2.data
                            }]
                        };
                        callback(dex_volume_chart);
                    });
                });
            },
            TradingView: function(base, quote) {
                var widget = window.tvWidget = new TradingView.widget({
                    fullscreen: true,
                    symbol: base + '_' + quote,
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
                function getParameterByName(name) {
                    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
                    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
                        results = regex.exec(location.search);
                    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
                }
            },
            topOperationsChart: function(callback) {
                $http.get(appConfig.urls.elasticsearch_wrapper + "/get_account_history?from_date=now-1d&to_date=now&type=aggs&agg_field=operation_type&size=10")
                    .then(function(response) {

                    var legends = [];
                    var data = [];
                    var c = 0;
                    for(var i = 0; i < response.data.length; i++) {

                        ++c;
                        if(c > 7) { break; }

                        var name =  utilities.operationType(response.data[i].key)[0];
                        var color =  utilities.operationType(response.data[i].key)[1];

                        data.push({
                            value: response.data[i].doc_count,
                            name: name,
                            itemStyle: {
                                normal: {
                                    color: '#' + color
                                }
                            }
                        });

                        legends.push(name);
                    }
                    var operations_chart = {};
                    operations_chart.options = {
                        animation: true,
                        tooltip: {
                            trigger: 'item',
                            formatter: "{a} <br/>{b} : {c} ({d}%)"
                        },
                        legend: {
                            orient: 'vertical',
                            x: 'left',
                            data: legends,
                        },
                        toolbox: {
                            show: true,
                            feature: {
                                saveAsImage: {show: true, title: "save as image"}
                            }
                        },
                        calculable: true,
                        series: [{
                            name: 'Operation Type',
                            type: 'pie',
                            radius: ['50%', '70%'],
                            data: data,
                            label: {
                                normal: {
                                    show: false,
                                    position: 'center'
                                },
                                emphasis: {
                                    show: true,
                                    textStyle: {
                                        fontSize: '30',
                                        fontWeight: 'bold'
                                    }
                                }
                            },
                            labelLine: {
                                normal: {
                                    show: false
                                }
                            }
                        }]
                    };
                    callback(operations_chart);
                });
            },
            topProxiesChart: function(callback) {
                $http.get(appConfig.urls.python_backend + "/top_proxies").then(function(response) {

                    var proxies_chart = {};
                    proxies_chart.options = {
                        animation: true,
                        tooltip: {
                            trigger: 'item',
                            formatter: "{a} <br/>{b} : {c} ({d}%)"
                        },
                        legend: {
                            orient: 'vertical',
                            x: 'left',
                            data: [
                                response.data[0][1],
                                response.data[1][1],
                                response.data[2][1],
                                response.data[3][1],
                                response.data[4][1],
                                response.data[5][1],
                                response.data[6][1]
                            ]
                        },
                        toolbox: {
                            show: true,
                            feature: {
                                saveAsImage: {show: true, title: "save as image"}
                            }
                        },
                        calculable: true,
                        series: [{
                            color: ['#81CA80','#6BBCD7', '#E9C842', '#E96562', '#008000', '#FB8817', '#552AFF'],
                            name: 'Proxies',
                            type: 'pie',
                            radius: ['50%', '70%'],
                            itemStyle: {
                                normal: {
                                    label: {
                                        show: false
                                    },
                                    labelLine: {
                                        show: false
                                    }
                                },
                                emphasis: {
                                    label: {
                                        show: true,
                                        position: 'center',
                                        textStyle: {
                                            fontSize: '30',
                                            fontWeight: 'bold'
                                        }
                                    }
                                }
                            },
                            data: [
                                {value: response.data[0][2], name: response.data[0][1]},
                                {value: response.data[1][2], name: response.data[1][1]},
                                {value: response.data[2][2], name: response.data[2][1]},
                                {value: response.data[3][2], name: response.data[3][1]},
                                {value: response.data[4][2], name: response.data[4][1]},
                                {value: response.data[5][2], name: response.data[5][1]},
                                {value: response.data[6][2], name: response.data[6][1]}
                            ]
                        }]
                    };
                    callback(proxies_chart);
                });
            },
            topMarketsChart: function(callback) {
                $http.get(appConfig.urls.python_backend + "/top_markets").then(function(response) {

                    var markets_chart = {};
                    markets_chart.options = {
                        animation: true,
                        tooltip: {
                            trigger: 'item',
                            formatter: "{a} <br/>{b} : {c} ({d}%)"
                        },
                        legend: {
                            orient: 'vertical',
                            x: 'left',
                            data: [
                                response.data[0][0],
                                response.data[1][0],
                                response.data[2][0],
                                response.data[3][0],
                                response.data[4][0],
                                response.data[5][0],
                                response.data[6][0]
                            ]
                        },
                        toolbox: {
                            show: true,
                            feature: {
                                saveAsImage: {show: true, title: "save as image"}
                            }
                        },
                        calculable: true,
                        series: [{
                            color: ['#81CA80','#6BBCD7', '#E9C842', '#E96562', '#008000', '#FB8817', '#552AFF'],
                            name: 'Traffic source',
                            type: 'pie',
                            radius: ['50%', '70%'],
                            itemStyle: {
                                normal: {
                                    label: {
                                        show: false
                                    },
                                    labelLine: {
                                        show: false
                                    }
                                },
                                emphasis: {
                                    label: {
                                        show: true,
                                        position: 'center',
                                        textStyle: {
                                            fontSize: '30',
                                            fontWeight: 'bold'
                                        }
                                    }
                                }
                            },
                            data: [
                                {value: response.data[0][1], name: response.data[0][0]},
                                {value: response.data[1][1], name: response.data[1][0]},
                                {value: response.data[2][1], name: response.data[2][0]},
                                {value: response.data[3][1], name: response.data[3][0]},
                                {value: response.data[4][1], name: response.data[4][0]},
                                {value: response.data[5][1], name: response.data[5][0]},
                                {value: response.data[6][1], name: response.data[6][0]}
                            ]
                        }]
                    };
                    callback(markets_chart);
                });
            },
            topSmartCoinsChart: function(callback) {
                $http.get(appConfig.urls.python_backend + "/top_smartcoins").then(function(response) {
                    var smartcoins_chart = {};
                    smartcoins_chart.options = {
                        animation: true,
                        tooltip: {
                            trigger: 'item',
                            formatter: "{a} <br/>{b} : {c} ({d}%)"
                        },
                        legend: {
                            orient: 'vertical',
                            x: 'left',
                            data: [
                                response.data[0][0],
                                response.data[1][0],
                                response.data[2][0],
                                response.data[3][0],
                                response.data[4][0],
                                response.data[5][0],
                                response.data[6][0]
                            ]
                        },
                        toolbox: {
                            show: true,
                            feature: {
                                saveAsImage: {show: true, title: "save as image"}
                            }
                        },
                        calculable: true,
                        series: [{
                            color: ['#81CA80','#6BBCD7', '#E9C842', '#E96562', '#008000', '#FB8817', '#552AFF'],
                            name: 'Top Smartcoins',
                            type: 'pie',
                            roseType: 'radius',
                            max: 40,
                            itemStyle: {
                                normal: {
                                    label: {
                                        show: false
                                    },
                                    labelLine: {
                                        show: false
                                    }
                                },
                                emphasis: {
                                    label: {
                                        show: true
                                    },
                                    labelLine: {
                                        show: true
                                    }
                                }
                            },
                            data: [
                                {value: response.data[0][1], name: response.data[0][0]},
                                {value: response.data[1][1], name: response.data[1][0]},
                                {value: response.data[2][1], name: response.data[2][0]},
                                {value: response.data[3][1], name: response.data[3][0]},
                                {value: response.data[4][1], name: response.data[4][0]},
                                {value: response.data[5][1], name: response.data[5][0]},
                                {value: response.data[6][1], name: response.data[6][0]}
                            ]
                        }]
                    };
                    callback(smartcoins_chart);
                });
            },
            topUIAsChart: function(callback) {
                $http.get(appConfig.urls.python_backend + "/top_uias").then(function(response) {
                    var uias_chart = {};
                    uias_chart.options = {
                        animation: true,
                        tooltip: {
                            trigger: 'item',
                            formatter: "{a} <br/>{b} : {c} ({d}%)"
                        },
                        legend: {
                            orient: 'vertical',
                            x: 'left',
                            data: [
                                response.data[0][0],
                                response.data[1][0],
                                response.data[2][0],
                                response.data[3][0],
                                response.data[4][0],
                                response.data[5][0],
                                response.data[6][0]
                            ]
                        },
                        toolbox: {
                            show: true,
                            feature: {
                                saveAsImage: {show: true, title: "save as image"}
                            }
                        },
                        calculable: true,
                        series: [{
                            color: ['#81CA80','#6BBCD7', '#E9C842', '#E96562', '#008000', '#FB8817', '#552AFF'],
                            name: 'Top User Issued Assets',
                            type: 'pie',
                            roseType: 'radius',
                            max: 40,
                            itemStyle: {
                                normal: {
                                    label: {
                                        show: false
                                    },
                                    labelLine: {
                                        show: false
                                    }
                                },
                                emphasis: {
                                    label: {
                                        show: true
                                    },
                                    labelLine: {
                                        show: true
                                    }
                                }
                            },
                            data: [
                                {value: response.data[0][1], name: response.data[0][0]},
                                {value: response.data[1][1], name: response.data[1][0]},
                                {value: response.data[2][1], name: response.data[2][0]},
                                {value: response.data[3][1], name: response.data[3][0]},
                                {value: response.data[4][1], name: response.data[4][0]},
                                {value: response.data[5][1], name: response.data[5][0]},
                                {value: response.data[6][1], name: response.data[6][0]}
                            ]
                        }]
                    };
                    callback(uias_chart);
                });
            },
            topHoldersChart: function(callback) {
                $http.get(appConfig.urls.python_backend + "/top_holders").then(function(response) {

                    var holders_chart = {};
                    holders_chart.options = {
                        animation: true,
                        tooltip: {
                            trigger: 'item',
                            formatter: "{a} <br/>{b} : {c} ({d}%)"
                        },
                        legend: {
                            orient: 'vertical',
                            x: 'left',
                            data: [
                                response.data[0][2],
                                response.data[1][2],
                                response.data[2][2],
                                response.data[3][2],
                                response.data[4][2],
                                response.data[5][2],
                                response.data[6][2]
                            ]
                        },
                        toolbox: {
                            show: true,
                            feature: {
                                saveAsImage: {show: true, title: "save as image"}
                            }
                        },
                        calculable: true,
                        series: [{
                            color: ['#81CA80','#6BBCD7', '#E9C842', '#E96562', '#008000', '#FB8817', '#552AFF'],
                            name: 'Holders',
                            type: 'pie',
                            radius: ['50%', '70%'],
                            itemStyle: {
                                normal: {
                                    label: {
                                        show: false
                                    },
                                    labelLine: {
                                        show: false
                                    }
                                },
                                emphasis: {
                                    label: {
                                        show: true,
                                        position: 'center',
                                        textStyle: {
                                            fontSize: '30',
                                            fontWeight: 'bold'
                                        }
                                    }
                                }
                            },
                            data: [
                                {value: response.data[0][3], name: response.data[0][2]},
                                {value: response.data[1][3], name: response.data[1][2]},
                                {value: response.data[2][3], name: response.data[2][2]},
                                {value: response.data[3][3], name: response.data[3][2]},
                                {value: response.data[4][3], name: response.data[4][2]},
                                {value: response.data[5][3], name: response.data[5][2]},
                                {value: response.data[6][3], name: response.data[6][2]}
                            ]
                        }]
                    };
                    callback(holders_chart);
                });
            }
        };
    }

})();
