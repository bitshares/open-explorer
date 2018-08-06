(function () {
    'use strict';

    angular.module('app.assets')
        .controller('assetsCtrl', ['$scope', '$routeParams', '$location', 'utilities', 'assetService', 'chartService', 'marketService', assetsCtrl]);

    function assetsCtrl($scope, $routeParams, $location, utilities, assetService, chartService, marketService) {

		var path = $location.path();
		var name = $routeParams.name;
		if(name) {
		    name = name.toUpperCase();
            if(path.includes("assets")) {

                assetService.getAssetFull(name, function (returnData) {
                    $scope.data = returnData;
                    assetService.getAssetHoldersCount(name, function (returnDataHolders) {
                        $scope.data.holders = returnDataHolders;
                    });
                    var precision = returnData.precision;
                    assetService.getAssetHolders(name, precision, function (returnDataHolders) {
                        $scope.accounts = returnDataHolders;
                    });
                });
                marketService.getAssetMarkets(name, function (returnData) {
                    $scope.markets = returnData;
                });
            }
            utilities.columnsort($scope, "volume", "sortColumn", "sortClass", "reverse", "reverseclass", "column");
            utilities.columnsort($scope, "amount", "sortColumn2", "sortClass2", "reverse2", "reverseclass2", "column");
		}
		else {
            if(path === "/assets") {

                assetService.getDexVolume(function (returnData) {
                    $scope.dynamic = returnData;
                });

                chartService.dailyDEXChart(function (returnData) {
                    $scope.dex_volume_chart = returnData;
                });

                assetService.getActiveAssets(function (returnData) {
                    $scope.assets = returnData;
                });

                utilities.columnsort($scope, "volume", "sortColumn", "sortClass", "reverse", "reverseclass", "column");
            }
		}
    }

})();
