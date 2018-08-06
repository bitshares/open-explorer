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
            }
        };
    }

})();
