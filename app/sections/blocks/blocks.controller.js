(function () {
    'use strict';

    angular.module('app.blocks')
        .controller('blocksCtrl', ['$scope', '$filter', '$routeParams', '$http', 'appConfig', blocksCtrl]);

    function blocksCtrl($scope, $filter, $routeParams, $http, appConfig) {

        var name = $routeParams.name;
        $http.get(appConfig.urls.python_backend + "/get_block?block_num=" + name)
            .then(function(response) {
                //console.log(response.data);
                var operations_count = 0;
                for(var i=0; i<response.data.transactions.length; i++) {
                    operations_count = operations_count + response.data.transactions[i].operations.length;
                }
                $scope.data = { transactions: response.data.transactions, block_num: name, previous: response.data.previous,
                    timestamp: response.data.timestamp, witness: response.data.witness, witness_signature: response.data.witness_signature,
                    transaction_merkle_root: response.data.transaction_merkle_root, transactions_count: response.data.transactions.length,
                    operations_count: operations_count, next: parseInt(name) + 1, prev: parseInt(name) - 1};
            });
    }

})();
