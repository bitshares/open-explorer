(function () {
    'use strict';

    angular.module('app.witnesses')
        .controller('witnessesCtrl', ['$scope', '$filter', '$routeParams', '$http', 'appConfig', witnessesCtrl]);

    function witnessesCtrl($scope, $filter, $routeParams, $http, appConfig) {

        $http.get(appConfig.urls.python_backend + "/header")
            .then(function(response_h) {
                var witness_count = response_h.data.witness_count;

                $http.get(appConfig.urls.python_backend + "/get_witnesses")
                    .then(function (response) {
                        var active_witnesses = [];
                        var standby_witnesses = [];
                        var counter = 1;
                        angular.forEach(response.data, function (value, key) {
                            var parsed = {
                                id: value[0].id,
                                last_aslot: value[0].last_aslot,
                                last_confirmed_block_num: value[0].last_confirmed_block_num,
                                pay_vb: value[0].pay_vb,
                                total_missed: value[0].total_missed,
                                total_votes: formatBalance(value[0].total_votes, 5),
                                url: value[0].url,
                                witness_account: value[0].witness_account,
                                witness_account_name: value[0].witness_account_name,
                                counter: counter
                            };
                            if (counter <= witness_count)
                                active_witnesses.push(parsed);
                            else
                                standby_witnesses.push(parsed);
                            counter++;
                        });

                        $scope.active_witnesses = active_witnesses;
                        $scope.standby_witnesses = standby_witnesses;
                    });
            });

        // table 1
        // column to sort
        $scope.column = 'counter';
        // sort ordering (Ascending or Descending). Set true for desending
        $scope.reverse = false;
        // called on header click
        $scope.sortColumn = function(col){
            $scope.column = col;
            if($scope.reverse){
                $scope.reverse = false;
                $scope.reverseclass = 'arrow-up';
            }else{
                $scope.reverse = true;
                $scope.reverseclass = 'arrow-down';
            }
        };
        // remove and change class
        $scope.sortClass = function(col) {
            if ($scope.column == col) {
                if ($scope.reverse) {
                    return 'arrow-down';
                } else {
                    return 'arrow-up';
                }
            } else {
                return '';
            }
        }
        // table 2
        // column to sort
        $scope.column2 = 'counter';
        // sort ordering (Ascending or Descending). Set true for desending
        $scope.reverse2 = false;
        // called on header click
        $scope.sortColumn2 = function(col2){
            $scope.column2 = col2;
            if($scope.reverse2){
                $scope.reverse2 = false;
                $scope.reverseclass2 = 'arrow-up';
            }else{
                $scope.reverse2 = true;
                $scope.reverseclass2 = 'arrow-down';
            }
        };
        // remove and change class
        $scope.sortClass2 = function(col2) {
            if ($scope.column2 == col2) {
                if ($scope.reverse2) {
                    return 'arrow-down';
                } else {
                    return 'arrow-up';
                }
            } else {
                return '';
            }
        }
    }

    function formatBalance(number, presicion) {
        var result;
        var divideby =  Math.pow(10, presicion);
        var res = Number(number/divideby);
        return res;
    }

})();
