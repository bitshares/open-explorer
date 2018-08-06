(function () {
    'use strict';

    angular.module('app.blocks')
        .controller('blocksCtrl', ['$scope', '$filter', '$routeParams', '$location', 'utilities', 'networkService', blocksCtrl]);

    function blocksCtrl($scope, $filter, $routeParams, $location, utilities, networkService) {

        var path = $location.path();
        var name = $routeParams.name;
        if(name) {

            name = name.toUpperCase();
            if(path.includes("blocks")) {

                networkService.getBlock(name, function (returnData) {
                    $scope.data = returnData;
                });
            }
        }
        else
        {
            if (path === "/blocks") {

                networkService.getBigBlocks(function (returnData) {
                    $scope.blocks = returnData;
                });

                utilities.columnsort($scope, "operations", "sortColumn", "sortClass", "reverse", "reverseclass", "column");

            }
        }
    }
})();
