(function () {
    'use strict';

    angular.module('app.proxies')
        .controller('proxiesCtrl', ['$scope', '$filter', '$routeParams', '$http', 'appConfig', 'utilities', proxiesCtrl]);

    function proxiesCtrl($scope, $filter, $routeParams, $http, appConfig, utilities) {

        $http.get(appConfig.urls.python_backend + "/top_proxies")
            .then(function(response) {
                //console.log(response.data);
                var proxies = [];
                var counter = 1;
                angular.forEach(response.data, function(value, key) {
                    var parsed = { position: counter, account: value[0], account_name: value[1], power: utilities.formatBalance(value[2], 5), followers: value[3], perc: value[4]};
                    if(counter <= 10)
                        proxies.push(parsed);
                    counter++;
                });
                $scope.proxies = proxies;
            });

        // column to sort
        $scope.column = 'position';
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

    }
    
})();
