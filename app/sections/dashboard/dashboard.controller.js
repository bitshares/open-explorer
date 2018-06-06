(function () {
    'use strict';

    angular.module('app').controller('DashboardCtrl', ['$scope', '$http', '$websocket', '$timeout', '$window','appConfig', 'utilities',  DashboardCtrl])

        .filter('to_trusted', ['$sce', function($sce){
            return function(text) {
                return $sce.trustAsHtml(text);
            };
        }]);

    function DashboardCtrl($scope, $http, $websocket, $timeout, $window, appConfig, utilities) {

        //var dataStream = $websocket('ws://node.testnet.bitshares.eu:18092');
        var dataStream = $websocket(appConfig.urls.websocket);
        dataStream.send('{"method": "set_subscribe_callback", "params": [5, true], "id": 6}')

        var collection = [];
        $scope.operations = [];

        dataStream.onMessage(function(message) {

            //console.log(JSON.parse(message.data).params[1][0][0]["id"]);
            try {
                var parsed = JSON.parse(message.data).params[1][0][0];
            }
            catch(err) {
                var parsed = "";
            }
            if(typeof(parsed) == 'object') {
			    if(parsed.id.substring(0,4) == "2.9.") {
				    // get operation details
				    var operation_id = parsed.operation_id;
				    $http.get(appConfig.urls.python_backend + "/operation?operation_id=" + operation_id)
					    .then(function(response) {
                            parsed.block_num = response.data[0].block_num;
					        if(response.data[0].op) {
                                var op_type =  utilities.operationType(response.data[0].op[0]);

                                parsed.type = op_type[0];
                                parsed.color = op_type[1];

                                var accounts_registered_this_interval = response.data[0].accounts_registered_this_interval;
                                var bts_market_cap = response.data[0].bts_market_cap;
                                var quote_volume = response.data[0].quote_volume;
                                var witness_count = response.data[0].witness_count;
                                var commitee_count = response.data[0].commitee_count;


                                $scope.dynamic = {
                                    head_block_number: response.data[0].block_num,
                                    accounts_registered_this_interval: accounts_registered_this_interval,
                                    bts_market_cap: bts_market_cap,
                                    quote_volume: quote_volume,
                                    witness_count: witness_count,
                                    commitee_count: commitee_count
                                };

                                var operation_text = "";
                                var operation_type = response.data[0].op[0];
                                var operation = response.data[0].op[1];
                                operation_text = utilities.opText(appConfig, $http, operation_type, operation, function (returnData) {
                                    parsed.operation_text = returnData;
                                    //jdenticon.update(".identicon");
                                });
                            }



				    });
				    parsed.time = new Date().toLocaleString();
				    $scope.operations.unshift(parsed);
			    }
		    }
		    if($scope.operations.length > 10)
			    $scope.operations.splice(10, 1);
            });

	        $http.get(appConfig.urls.python_backend + "/header")
		        .then(function(response) {

                $http.get(appConfig.urls.python_backend + "/lastnetworkops?last_block=" + response.data.head_block_number)
                    .then(function(response2) {

                    $scope.dynamic = { head_block_number: response.data.head_block_number, accounts_registered_this_interval: response.data.accounts_registered_this_interval,  bts_market_cap: response.data.bts_market_cap, quote_volume: response.data.quote_volume, witness_count: response.data.witness_count, commitee_count: response.data.commitee_count };

                    var last10 = [];

                    angular.forEach(response2.data, function(value, key) {
                        var parsed = {};
                        parsed.block_num = value[3];
                        parsed.operation_id = value[2];
                        parsed.account = value[7];
                        parsed.account_name = value[8];

                        var type_res =  utilities.operationType(value[9]);
                        parsed.type = type_res[0];
                        parsed.color = type_res[1];

                        parsed.id = value[1];
                        var time = new Date(value[6]);
                        parsed.time = time.toLocaleString();

                        var operation_type = value[9];
                        var operation = value[11];

                        var operation_text = "";
                        operation_text = utilities.opText(appConfig, $http, operation_type, operation, function(returnData) {
                            parsed.operation_text = returnData;
                        });

                        last10.push(parsed);
                        $scope.operations = last10;

                    });

                });
            $scope.dynamic = { head_block_number: response.data.head_block_number, accounts_registered_this_interval: response.data.accounts_registered_this_interval, bts_market_cap: response.data.bts_market_cap, quote_volume: response.data.quote_volume, witness_count: response.data.witness_count, commitee_count: response.data.commitee_count};
        });

        $scope.$on("$locationChangeStart", function(event) {
            // when leaving page unsubscribe from everything
            dataStream.send('{"method": "call", "params": [0, "cancel_all_subscriptions", []], "id": 8}');
        });

		// destroy the websocket!
		$scope.$on('$destroy',function(){
            if(dataStream)
                dataStream.close();
        });

		// dashboard charts

        // top 7 ops in chart
        $http.get(appConfig.urls.python_backend + "/top_operations")
            .then(function(response) {

                var legends = [];
                var data = [];
                var c = 0;
                for(var i = 0; i < response.data.length; i++) {

                    ++c;
                    if(c > 7) break;

                    var name =  utilities.operationType(response.data[i][0])[0];
                    var color =  utilities.operationType(response.data[i][0])[1];

                    data.push(
                        {
                            value: response.data[i][1],
                            name: name,
                            itemStyle: {
                                normal: {
                                    color: '#' + color
                                }
                            }
                        });

                    legends.push(name);
                }

                $scope.operations_chart = {};
                $scope.operations_chart.options = {
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
                    series: [
                        {
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
                        }
                    ]
                };
            });

        // proxies chart
        $http.get(appConfig.urls.python_backend + "/top_proxies")
            .then(function(response) {
                //console.log(response.data);

                $scope.proxies = {};
                $scope.proxies.options = {

                    animation: true,

                    tooltip: {
                        trigger: 'item',
                        formatter: "{a} <br/>{b} : {c} ({d}%)"
                    },
                    legend: {
                        orient: 'vertical',
                        x: 'left',
                        data: [response.data[0][1], response.data[1][1], response.data[2][1], response.data[3][1], response.data[4][1], response.data[5][1], response.data[6][1]]
                    },
                    toolbox: {
                        show: true,
                        feature: {
                            saveAsImage: {show: true, title: "save as image"}
                        }
                    },
                    calculable: true,
                    series: [
                        {
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
                        }
                    ]
                };
            });

        // markets chart - top 5 markets by volume 24 hs
        $http.get(appConfig.urls.python_backend + "/top_markets")
            .then(function(response) {
                //console.log(response.data);

                $scope.markets = {};
                $scope.markets.options = {

                    animation: true,

                    tooltip: {
                        trigger: 'item',
                        formatter: "{a} <br/>{b} : {c} ({d}%)"
                    },
                    legend: {
                        orient: 'vertical',
                        x: 'left',
                        data: [response.data[0][0], response.data[1][0], response.data[2][0], response.data[3][0], response.data[4][0], response.data[5][0], response.data[6][0]]
                    },
                    toolbox: {
                        show: true,
                        feature: {
                            saveAsImage: {show: true, title: "save as image"}
                        }
                    },
                    calculable: true,
                    series: [
                        {
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
                        }
                    ]
                };
            });

        // smartcoins chart - top 5 smartcoins by volume 24 hs
        $http.get(appConfig.urls.python_backend + "/top_smartcoins")
            .then(function(response) {
                $scope.smartcoins = {};
                $scope.smartcoins.options = {
                    //title : {
                    //    text: 'Nightingale rose diagram',
                    //    x:'center'
                    //},
                    animation: true,

                    tooltip: {
                        trigger: 'item',
                        formatter: "{a} <br/>{b} : {c} ({d}%)"
                    },
                    legend: {
                        orient: 'vertical',
                        x: 'left',
                        data: [response.data[0][0], response.data[1][0], response.data[2][0], response.data[3][0], response.data[4][0], response.data[5][0], response.data[6][0]]
                    },
                    toolbox: {
                        show: true,
                        feature: {
                            saveAsImage: {show: true, title: "save as image"}
                        }
                    },
                    calculable: true,
                    series: [
                        {
                            color: ['#81CA80','#6BBCD7', '#E9C842', '#E96562', '#008000', '#FB8817', '#552AFF'],
                            name: 'Top Smartcoins',
                            type: 'pie',
                            //radius : [20, 110],
                            //center : ['25%', 200],
                            roseType: 'radius',
                            //width: '40%',       // for funnel
                            max: 40,            // for funnel
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
                        }

                    ]

                };
            });

        // uias chart - top 5 uias by volume 24 hs
        $http.get(appConfig.urls.python_backend + "/top_uias")
            .then(function(response) {
                $scope.uias = {};
                $scope.uias.options = {

                    animation: true,
                    //title : {
                    //    text: 'Nightingale rose diagram',
                    //    x:'center'
                    //},
                    tooltip: {
                        trigger: 'item',
                        formatter: "{a} <br/>{b} : {c} ({d}%)"
                    },
                    legend: {
                        orient: 'vertical',
                        x: 'left',
                        data: [response.data[0][0], response.data[1][0], response.data[2][0], response.data[3][0], response.data[4][0], response.data[5][0], response.data[6][0]]
                    },
                    toolbox: {
                        show: true,
                        feature: {
                            saveAsImage: {show: true, title: "save as image"}
                        }
                    },
                    calculable: true,
                    series: [
                        {
                            color: ['#81CA80','#6BBCD7', '#E9C842', '#E96562', '#008000', '#FB8817', '#552AFF'],
                            name: 'Top User Issued Assets',
                            type: 'pie',
                            //radius : [20, 110],
                            //center : ['25%', 200],
                            roseType: 'radius',
                            //width: '40%',       // for funnel
                            max: 40,            // for funnel
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
                        }

                    ]

                };
            });

        // proxies chart
        $http.get(appConfig.urls.python_backend + "/top_holders")
            .then(function(response) {
                //console.log(response.data);

                $scope.holders = {};
                $scope.holders.options = {

                    animation: true,

                    tooltip: {
                        trigger: 'item',
                        formatter: "{a} <br/>{b} : {c} ({d}%)"
                    },
                    legend: {
                        orient: 'vertical',
                        x: 'left',
                        data: [response.data[0][2], response.data[1][2], response.data[2][2], response.data[3][2], response.data[4][2], response.data[5][2], response.data[6][2]]
                    },
                    toolbox: {
                        show: true,
                        feature: {
                            saveAsImage: {show: true, title: "save as image"}
                        }
                    },
                    calculable: true,
                    series: [
                        {
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
                        }
                    ]
                };
            });
        //$scope.showChart = showChart;
        $scope.showChart = function(chartToShow) {

            //console.log('fdfdf');

            $timeout(function() {
                $window.dispatchEvent(new Event("resize"));
            }, 1000);

            if(chartToShow == 0) {
                $timeout(function() {
                    $window.dispatchEvent(new Event("resize"));
                }, 100);

            }
            else if(chartToShow == 1) {
                $timeout(function() {
                    $window.dispatchEvent(new Event("resize"));
                }, 100);

            }
            else if(chartToShow == 2) {
                $timeout(function() {
                    $window.dispatchEvent(new Event("resize"));
                }, 100);

            }
            else if(chartToShow == 3) {
                $timeout(function() {
                    $window.dispatchEvent(new Event("resize"));
                }, 100);

            }
            else if(chartToShow == 4) {
                $timeout(function() {
                    $window.dispatchEvent(new Event("resize"));
                }, 100);

            }
            else if(chartToShow == 5) {
                $timeout(function() {
                    $window.dispatchEvent(new Event("resize"));
                }, 100);

            }
        };


        function random(){
            var r = Math.round(Math.random() * 100);
            return (r * (r % 2 == 0 ? 1 : -1));
        }
        function randomDataArray() {
            var d = [];
            var len = 100;
            while (len--) {
                d.push([
                    random(),
                    random(),
                    Math.abs(random()),
                ]);
            }
            return d;
        }
    }
})();
