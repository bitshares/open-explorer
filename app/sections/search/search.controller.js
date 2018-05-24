(function () {
    'use strict';

    angular.module('app.search')
        .controller('searchCtrl', ['$scope', '$filter', '$routeParams', '$location', '$http', 'appConfig', searchCtrl]);

    function searchCtrl($scope, $filter, $routeParams, $location, $http, appConfig) {

        $scope.add2block = function(block) {
            $scope.block = block;
        };
        $scope.add2account = function(account) {
            $scope.account = account;
        };
        $scope.add2asset = function(asset) {
            $scope.asset = asset;
        };
        $scope.add2object = function(object) {
            $scope.object = object;
        };
        $scope.add2tx = function(tx) {
            $scope.tx = tx;
        };

        $scope.submit = function() {
            //console.log($scope);
            if ($scope.block)
                $location.path('/blocks/' + $scope.block + '/');
            else if ($scope.account)
                $location.path('/accounts/' + $scope.account + '/');
            else if ($scope.object)
                $location.path('/objects/' + $scope.object + '/');
            else if ($scope.asset)
                $location.path('/assets/' + $scope.asset + '/');
            else if ($scope.tx)
                $location.path('/txs/' + $scope.tx + '/');
        };
        $scope.required = true;
        $scope.updateData = function(param) {
            if(param == "block") {
                var start_block = $scope.block;
                var block_data = [];
                var number = start_block;
                $http.get(appConfig.urls.python_backend + "/getlastblocknumber")
                    .then(function (response) {
                        //console.log(response.data);
                        while (number <= response.data) {
                            block_data.push(number);
                            number *= 10;
                            number++;
                            block_data.push(number);
                        }
                    });
                $scope.blocks = block_data;
            }
            else if(param == "asset") {
                var start = $scope.asset;
                var asset_data = [];
                $http.get(appConfig.urls.python_backend + "/lookup_assets?start=" + start.toUpperCase())
                    .then(function (response) {
                        for (var i = 0; i < response.data.length; i++) {
                            asset_data[i] = response.data[i][0];
                        }
                    });
                $scope.assets = asset_data;
            }
            else if(param == "account") {
                var start = $scope.account;
                var account_data = [];
                $http.get(appConfig.urls.python_backend + "/lookup_accounts?start=" + start)
                    .then(function (response) {
                        for (var i = 0; i < response.data.length; i++) {
                            account_data[i] = response.data[i][0];
                        }
                    });
                $scope.accounts = account_data;
            }
            else if(param == "tx") {
                /*
                var start = $scope.account;
                var account_data = [];
                $http.get(appConfig.urls.python_backend + "/lookup_accounts?start=" + start)
                    .then(function (response) {
                        for (var i = 0; i < response.data.length; i++) {
                            account_data[i] = response.data[i][0];
                        }
                    });
                $scope.accounts = account_data;
                */
            }
        }
    }

})();
