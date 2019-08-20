(function () {
    'use strict';

    angular.module('app.proxies')
        .controller('proxiesCtrl', ['$scope', '$filter', '$routeParams', '$http', 'appConfig', 'utilities',
            proxiesCtrl]);

    function proxiesCtrl($scope, $filter, $routeParams, $http, appConfig, utilities) {

        $http.get(appConfig.urls.python_backend + "/top_proxies").then(function(response) {
                let proxies = [];
                let counter = 1;
                angular.forEach(response.data, function(value, key) {
                    const parsed = {
                        position: counter,
                        account: value.id,
                        account_name: value.name,
                        power: utilities.formatBalance(value.bts_weight, 5),
                        followers: value.followers,
                        perc: value.bts_weight_percentage
                    };
                    if(counter <= 10)
                        proxies.push(parsed);
                    counter++;
                });
                $scope.proxies = proxies;
            });

        $scope.column = 'position';
        $scope.reverse = false;
        $scope.sortColumn = function(col){
            $scope.column = col;
            if($scope.reverse) {
                $scope.reverse = false;
                $scope.reverseclass = 'arrow-up';
            }
            else {
                $scope.reverse = true;
                $scope.reverseclass = 'arrow-down';
            }
        };
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
