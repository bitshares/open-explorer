(function () {
    'use strict';

    angular.module('app.txs')
        .controller('txsCtrl', ['$scope', '$filter', '$routeParams', '$location', '$http', 'appConfig', 'utilities', txsCtrl]);

    function txsCtrl($scope, $filter, $routeParams, $location, $http, appConfig, utilities) {

        var path = $location.path();
        var name = $routeParams.name;

        if(name) {
            if (path.includes("txs")) {
                $http.get(appConfig.urls.elasticsearch_wrapper + "/get_trx?trx=" + name + "&size=1000")
                    .then(function(response) {

                        var operations = [];

                        $scope.data = {name: name, counter: response.data.length, block_num: response.data[0].block_data.block_num,
                        date: response.data[0].block_data.block_time};

                        angular.forEach(response.data, function (value, key) {
                            var op =  utilities.operationType(value.operation_type);
                            var op_type = op[0];
                            var op_color = op[1];

                            var parsed = {operation_id: value.account_history.operation_id, op_color: op_color, op_type: op_type};

                            var opArray = JSON.parse(value.operation_history.op);
                            var operation_text = "";
                            operation_text = utilities.opText(appConfig, $http, opArray[0],opArray[1], function(returnData) {
                                parsed.operation_text = returnData;
                            });
                            operations.push(parsed);
                        });
                        $scope.operations = operations;
                    });

            }
        }
        else {
            if (path == "/txs") {

                $http.get(appConfig.urls.elasticsearch_wrapper + "/get_account_history?from_date=now-1h&to_date=now&type=aggs&agg_field=block_data.trx_id.keyword")
                    .then(function (response) {

                        //console.log(response.data);
                        var transactions = [];
                        angular.forEach(response.data, function (value, key) {
                            //console.log(value);
                            var parsed = {trx_id: value.key, count: value.doc_count};
                            //if(counter <= 10)
                            transactions.push(parsed);
                        });
                        $scope.transactions = transactions;
                    });

            }
        }
    }

})();
