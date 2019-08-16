(function () {
    'use strict';

    angular.module('app.operations')
        .controller('operationsCtrl', ['$scope', '$routeParams', '$location', 'networkService', operationsCtrl]);

    function operationsCtrl($scope, $routeParams, $location, networkService) {

        var path = $location.path();
        var name = $routeParams.name;

        if(name) {
            if (path.includes("operations")) {
                networkService.getOperation(name, function (returnData) {
                    $scope.data = returnData;
                });
            }
        }
        else {
            if (path === "/operations") {
                $scope.select = function (page_operations) {
                    var page = page_operations - 1;
                    var limit = 50;
                    var from = page * limit;

                    networkService.getLastOperations(limit, from, function (returnData) {
                        $scope.operations = returnData;
                        $scope.currentPage = page_operations;
                        $scope.total_ops = 10000;
                    });
                };
                $scope.select(1);
            }
        }
    }
})();
