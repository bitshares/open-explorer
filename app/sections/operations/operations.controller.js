(function () {
    'use strict';

    angular.module('app.operations')
        .controller('operationsCtrl', ['$scope', '$filter', '$routeParams', '$http', 'appConfig', 'utilities', operationsCtrl]);

    function operationsCtrl($scope, $filter, $routeParams, $http, appConfig, utilities) {

        var block_num = "";
        var block_time = "";
        var virtual_op = "";
        var trx_in_block = "";
        var op_in_trx = "";
        var result = [];
        var type = "";
        var name = $routeParams.name;

        $http.get(appConfig.urls.python_backend + "/operation_full_elastic?operation_id=" + name)
            .then(function(response) {
                //console.log(response.data[0]);
                block_num = response.data[0].block_num;
                block_time = response.data[0].block_time;
                virtual_op = response.data[0].virtual_op;
                trx_in_block = response.data[0].trx_in_block;
                op_in_trx = response.data[0].op_in_trx;
                result = response.data[0].result;
                type = response.data[0].op[0];
                //console.log(response.data[0]);
                var raw_obj = response.data[0].op[1];
                var op_type =  utilities.operationType(type);

                var operation_text = "";
                operation_text = utilities.opText(appConfig, $http, type, raw_obj, function(returnData) {
                    $scope.data = { name: name , block_num: block_num, virtual_op: virtual_op, trx_in_block: trx_in_block, op_in_trx: op_in_trx , result: result, type: op_type[0], color: op_type[1], raw: raw_obj, operation_text: returnData, block_time: block_time};

                });
            });
    }
})();
