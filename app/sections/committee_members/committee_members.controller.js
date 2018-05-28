(function () {
    'use strict';

    angular.module('app.committee_members')
        .controller('committeeCtrl', ['$scope', '$filter', '$routeParams', '$http', 'appConfig', 'utilities', committeeCtrl]);

    function committeeCtrl($scope, $filter, $routeParams, $http, appConfig, utilities) {

        $http.get(appConfig.urls.python_backend + "/get_committee_members")
            .then(function(response) {
                //console.log(response.data);
                var active_committee = [];
                var standby_committee = [];
                var counter = 1;
                angular.forEach(response.data, function(value, key) {
                    //console.log(value[0].id);
                    var parsed = {id: value[0].id, total_votes: utilities.formatBalance(value[0].total_votes, 5), url: value[0].url,
                        committee_member_account: value[0].committee_member_account, committee_member_account_name: value[0].committee_member_account_name, counter: counter};

                    if(counter <= 11)
                        active_committee.push(parsed);
                    else
                        standby_committee.push(parsed);

                    counter++;
                });
                $scope.active_committee = active_committee;
                $scope.standby_committee = standby_committee;
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

})();
