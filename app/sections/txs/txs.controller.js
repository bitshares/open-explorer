(function () {
    'use strict';

    angular.module('app.txs')
        .controller('txsCtrl', ['$scope', '$filter', '$routeParams', '$location', '$http', 'appConfig', txsCtrl]);

    function txsCtrl($scope, $filter, $routeParams, $location, $http, appConfig) {

        var path = $location.path();
        var name = $routeParams.name;

        if(name) {
            if (path.includes("txs")) {


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
