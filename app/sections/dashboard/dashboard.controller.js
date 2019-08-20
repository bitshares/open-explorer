(function () {
    'use strict';

    angular.module('app').controller('DashboardCtrl', ['$scope', '$timeout', '$window', 'networkService',
        'chartService',  DashboardCtrl])

        .filter('to_trusted', ['$sce', function($sce){
            return function(text) {
                return $sce.trustAsHtml(text);
            };
        }]);

    function DashboardCtrl($scope, $timeout, $window, networkService, chartService) {

        networkService.getHeader(function (returnData) {
            $scope.dynamic = returnData;
        });
        
        $scope.select = function(page_operations) {
            const page = page_operations -1;
            const limit = 20;
            const from = page * limit;

            networkService.getLastOperations(limit, from, function (returnData) {
                $scope.operations = returnData;
                $scope.currentPage = page_operations;
                $scope.total_ops = 10000;
            });
        };
        $scope.select(1);

		chartService.topOperationsChart(function (returnData) {
            $scope.operations_chart = returnData;
        });

        chartService.topProxiesChart(function (returnData) {
            $scope.proxies_chart = returnData;
        });

        chartService.topMarketsChart(function (returnData) {
            $scope.markets_chart = returnData;
        });

        chartService.topSmartCoinsChart(function (returnData) {
            $scope.smartcoins_chart = returnData;
        });

        chartService.topUIAsChart(function (returnData) {
            $scope.uias_chart = returnData;
        });

        chartService.topHoldersChart(function (returnData) {
            $scope.holders_chart = returnData;
        });

        $scope.currentTabIndex = 0;
    }
})();
