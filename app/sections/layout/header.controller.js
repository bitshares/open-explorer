(function () {
    'use strict';

    angular.module('app.header')
        .controller('headerCtrl', ['$scope', '$filter', '$routeParams', '$location', '$http', headerCtrl]);

    function headerCtrl($scope, $filter, $routeParams, $location, $http) {

        $scope.search = undefined;
        $scope.value = ""
        $scope.updateData = function(search){
            var start = $scope.search;
            var data = [];

            var by = $scope.radioValue;
            //console.log(by);

            if(by == "account") {

                $http.get("http://23.94.69.140:5000/lookup_accounts?start=" + start)
                    .then(function (response) {
                        //console.log(response.data);

                        for (var i = 0; i < response.data.length; i++) {

                            data[i] = response.data[i][0];
                        }
                    });
            }
            else if(by == "asset") {

                $http.get("http://23.94.69.140:5000/lookup_assets?start=" + start.toUpperCase())
                    .then(function (response) {
                        //console.log(response.data);

                        for (var i = 0; i < response.data.length; i++) {

                            data[i] = response.data[i][0];
                        }
                    });
            }
            else if(by == "block") {
                var number = start;
                $http.get("http://23.94.69.140:5000/getlastblocknumber")
                    .then(function (response) {
                        //console.log(response.data);
                        while (number <= response.data) {
                            data.push(number);
                            number *= 10;
                            number++;
                            data.push(number);
                        }
                });
            }
            $scope.states = data;

        }

        $scope.submitForm = function (){

            if ($scope.radioValue == "block")
                $location.path('/blocks/' + $scope.search + '/');
            else if ($scope.radioValue == "account")
                $location.path('/accounts/' + $scope.search + '/');
            else if ($scope.radioValue == "object")
                $location.path('/objects/' + $scope.search + '/');
            else if ($scope.radioValue == "asset")
                $location.path('/assets/' + $scope.search + '/');


        };
        $scope.required = true;
        $scope.radioValue = 'account';
    }

})();
