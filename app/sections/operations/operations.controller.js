(function () {
    'use strict';

    angular.module('app.operations')
        .controller('operationsCtrl', ['$scope', '$routeParams', '$location', 'networkService', operationsCtrl]);

    function operationsCtrl($scope, $routeParams, $location, networkService) {

        const path = $location.path();
        const name = $routeParams.name;

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
                    const page = page_operations - 1;
                    const limit = 50;
                    const from = page * limit;

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
