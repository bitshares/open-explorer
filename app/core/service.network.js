(function() {
    'use strict';

    angular.module('app').factory('networkService', networkService);
    networkService.$inject = ['$http', 'appConfig', 'utilities'];

    function networkService($http, appConfig, utilities) {

        return {
            getHeader: function(callback) {
                var header;
                $http.get(appConfig.urls.python_backend + "/header").then(function(response) {

                    header = {
                        head_block_number: response.data.head_block_number,
                        accounts_registered_this_interval: response.data.accounts_registered_this_interval,
                        bts_market_cap: response.data.bts_market_cap,
                        quote_volume: response.data.quote_volume,
                        witness_count: response.data.witness_count,
                        committee_count: response.data.commitee_count
                    };
                    callback(header);
                });
            },

            getBigBlocks: function(callback) {
                $http.get(appConfig.urls.elasticsearch_wrapper + "/get_account_history?from_date=now-1w&to_date=now&type=aggs&agg_field=block_data.block_num&size=20")
                    .then(function (response) {

                    var blocks = [];
                    angular.forEach(response.data, function (value, key) {
                        $http.get(appConfig.urls.python_backend + "/get_block?block_num=" + value.key).then(function (response) {

                            var parsed = {
                                block_num: value.key,
                                operations: value.doc_count,
                                transactions: response.data.transactions.length,
                                timestamp: response.data.timestamp
                            };
                            blocks.push(parsed);
                        });
                    });
                    callback(blocks);
                });
            },
            getLastOperations: function(callback) {
                $http.get(appConfig.urls.elasticsearch_wrapper + "/get_account_history?from_date=now-1w&to_date=now&size=20")
                    .then(function (response) {

                        console.log(response.data);
                        var lastops = [];
                        angular.forEach(response.data, function (value, key) {

                            var operation = {};
                            operation.block_num = value.block_data.block_num;
                            operation.operation_id = value.account_history.operation_id;
                            operation.time = value.block_data.block_time;

                            var parsed_op = JSON.parse(value.operation_history.op);

                            utilities.opText(appConfig, $http, value.operation_type, parsed_op[1], function(returnData) {
                                operation.operation_text = returnData;
                            });

                            var type_res =  utilities.operationType(value.operation_type);
                            operation.type = type_res[0];
                            operation.color = type_res[1];


                            lastops.push(operation);
                            /*
                            parsed.operation_id = value.;
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
                            */
                        });
                        callback(lastops);
                    });
            }

        };
    }



})();
