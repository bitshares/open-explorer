(function () {
    'use strict';

    angular.module('app.blocks')
        .controller('blocksCtrl', ['$scope', '$filter', '$routeParams', '$location', '$http', 'appConfig', 'utilities', blocksCtrl]);

    function blocksCtrl($scope, $filter, $routeParams, $location, $http, appConfig, utilities) {

        var path = $location.path();
        var name = $routeParams.name;
        if(name) {

            name = name.toUpperCase();
            if(path.includes("blocks")) {

                $http.get(appConfig.urls.python_backend + "/get_block?block_num=" + name).then(function (response) {
                    var operations_count = 0;
                    for (var i = 0; i < response.data.transactions.length; i++) {
                       operations_count = operations_count + response.data.transactions[i].operations.length;
                    }
                    $scope.data = {
                            transactions: response.data.transactions,
                            block_num: name,
                            previous: response.data.previous,
                            timestamp: response.data.timestamp,
                            witness: response.data.witness,
                            witness_signature: response.data.witness_signature,
                            transaction_merkle_root: response.data.transaction_merkle_root,
                            transactions_count: response.data.transactions.length,
                            operations_count: operations_count,
                            next: parseInt(name) + 1,
                            prev: parseInt(name) - 1
                    };

                    /*
                    $http.get(appConfig.urls.elasticsearch_wrapper + "/get_block?block_num=" + name + "&size=1000")
                            .then(function (response) {

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
                            var operation_text = "";
                            operation_text = utilities.opText(appConfig, $http, opArray[0], opArray[1], function (returnData) {
                                parsed.operation_text = returnData;
                            });
                            operations.push(parsed);
                        });
                        $scope.operations = operations;
                    });
                    */
                });
            }
        }
        else
        {
            if (path === "/blocks") {

                $http.get(appConfig.urls.elasticsearch_wrapper + "/get_account_history?from_date=now-1w&to_date=now&type=aggs&agg_field=block_data.block_num&size=20")
                    .then(function (response) {

                        var blocks = [];
                        angular.forEach(response.data, function (value, key) {
                            $http.get(appConfig.urls.python_backend + "/get_block?block_num=" + value.key).then(function (response) {

                                var parsed = { block_num: value.key,
                                               operations: value.doc_count,
                                               transactions: response.data.transactions.length,
                                               timestamp: response.data.timestamp
                                };
                                blocks.push(parsed);
                            });
                        });
                        $scope.blocks = blocks;
                });

                utilities.columnsort($scope, "operations", "sortColumn", "sortClass", "reverse", "reverseclass", "column");

            }
        }
    }
})();
