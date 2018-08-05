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
                $http.get(appConfig.urls.elasticsearch_wrapper + "/get_account_history?from_date=now-1h&to_date=now&size=20")
                    .then(function (response) {

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

                    });
                    callback(lastops);
                });
            },

            getBigTransactions: function(callback) {
                $http.get(appConfig.urls.elasticsearch_wrapper + "/get_account_history?from_date=now-1h&to_date=now&type=aggs&agg_field=block_data.trx_id.keyword&size=20")
                    .then(function (response) {

                    var transactions = [];
                    angular.forEach(response.data, function (value, key) {
                        if(value.key !== "") {
                            var parsed = {
                                trx_id: value.key,
                                count: value.doc_count
                            };
                            transactions.push(parsed);
                        }
                    });
                    callback(transactions);
                });
            },

            getTransactionMetaData: function(trx, callback) {
                var data;
                $http.get(appConfig.urls.elasticsearch_wrapper + "/get_trx?trx=" + trx + "&size=1&sort=-operation_history.sequence")
                    .then(function(response) {

                    data = {
                        hash: response.data[0].block_data.trx_id,
                        counter: response.data[0].operation_history.op_in_trx,
                        block_num: response.data[0].block_data.block_num,
                        date: response.data[0].block_data.block_time
                    };
                    callback(data);
                });
            },

            getTransactionOperations: function(trx, callback) {
                var data;
                $http.get(appConfig.urls.elasticsearch_wrapper + "/get_trx?trx=" + trx + "&size=100&sort=-operation_history.sequence")
                    .then(function(response) {

                    var operations = [];
                    angular.forEach(response.data, function (value, key) {
                        var op = utilities.operationType(value.operation_type);
                        var op_type = op[0];
                        var op_color = op[1];

                        var parsed = {
                            operation_id: value.account_history.operation_id,
                            op_color: op_color,
                            op_type: op_type
                        };

                        var opArray = JSON.parse(value.operation_history.op);
                        utilities.opText(appConfig, $http, opArray[0], opArray[1], function (returnData) {
                            parsed.operation_text = returnData;
                        });
                        operations.push(parsed);
                    });
                    callback(operations);
                });
            }
        };
    }

})();
