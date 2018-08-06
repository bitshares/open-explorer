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
            },
            getFees: function(callback) {
                var fees = [];
                $http.get(appConfig.urls.python_backend + "/fees").then(function(response) {
                    var basic_fee = 0;
                    //var premium_fee = 0;
                    //var price_per_kbyte = 0;
                    for(var i = 0; i < response.data.parameters.current_fees.parameters.length; i++) {
                        if (response.data.parameters.current_fees.parameters[i][1].fee) {
                            basic_fee = response.data.parameters.current_fees.parameters[i][1].fee;
                        }
                        else {
                            basic_fee = response.data.parameters.current_fees.parameters[i][1].basic_fee;
                        }
                        var op_type  = utilities.operationType(response.data.parameters.current_fees.parameters[i][0]);

                        var fee = {
                            identifier: response.data.parameters.current_fees.parameters[i][0],
                            operation: op_type[0],
                            color: op_type[1],
                            basic_fee: utilities.formatBalance(basic_fee, 5),
                            premium_fee: utilities.formatBalance(response.data.parameters.current_fees.parameters[i][1].premium_fee, 5),
                            price_per_kbyte: utilities.formatBalance(response.data.parameters.current_fees.parameters[i][1].price_per_kbyte, 5)
                        };
                        fees.push(fee);
                    }
                });
                callback(fees);
            },
            getOperation: function(operation, callback) {
                var op;
                $http.get(appConfig.urls.python_backend + "/operation_full_elastic?operation_id=" + operation).then(function(response) {
                    var raw_obj = response.data[0].op[1];
                    var op_type =  utilities.operationType(response.data[0].op[0]);

                    utilities.opText(appConfig, $http, response.data[0].op[0], raw_obj, function(returnData) {
                        op = {
                            name: operation,
                            block_num: response.data[0].block_num,
                            virtual_op: response.data[0].virtual_op,
                            trx_in_block: response.data[0].trx_in_block,
                            op_in_trx: response.data[0].op_in_trx,
                            result: response.data[0].result,
                            type: op_type[0],
                            color: op_type[1],
                            raw: raw_obj,
                            operation_text: returnData,
                            block_time: response.data[0].block_time
                        };
                        callback(op);
                    });
                });
            }
        };
    }

})();
