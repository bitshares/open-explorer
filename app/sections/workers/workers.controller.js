(function () {
    'use strict';

    angular.module('app.workers')
        .controller('workersCtrl', ['$scope', '$filter', '$routeParams', '$http', 'appConfig', 'utilities', workersCtrl]);

    function workersCtrl($scope, $filter, $routeParams, $http, appConfig, utilities) {

        $http.get(appConfig.urls.python_backend + "/get_workers")
            .then(function(response) {
                var workers_current = [];
                var workers_expired = [];
                var start, end, now;
                for(var i = 0; i < response.data.length; i++) {


                    var now_d = new Date();
                    var start_d = new Date(response.data[i][0].work_begin_date);
                    var end_d = new Date(response.data[i][0].work_end_date);
                    start = start_d.toLocaleString();
                    end = end_d.toLocaleString();
                    now = now_d.toLocaleString();
                    var start_date = start.split(" ", 1);
                    var end_date = end.split(" ", 1);

                    var votes_for = utilities.formatBalance(response.data[i][0].total_votes_for, 5);
                    var daily_pay = utilities.formatBalance(response.data[i][0].daily_pay, 5);
                    var tclass = "";

                    var parsed;

                    var have_url = 0;
                    if(response.data[i][0].url && response.data[i][0].url !== "http://") {
                        have_url = 1;
                    }

                    if(now_d > end_d) {
                        tclass = "danger";
                        parsed = { name: response.data[i][0].name,
                                   daily_pay: daily_pay, url: response.data[i][0].url,
                                   have_url: have_url,
                                   votes_for: votes_for,
                                   votes_against: response.data[i][0].total_votes_against,
                                   worker: response.data[i][0].worker_account,
                                   start: start_date[0], end: end_date[0],
                                   id: response.data[i][0].id,
                                   worker_name: response.data[i][0].worker_account_name,
                                   tclass: tclass, perc: response.data[i][0].perc
                        };
                        workers_expired.push(parsed);
                    }
                    else {
                        var voting_now = "";
                        if(now_d > start_d) {

                            if(response.data[i][0].perc >= 50 && response.data[i][0].perc < 100) {
                                tclass = "warning";
                            }
                            else if(response.data[i][0].perc >= 100) {
                                tclass = "success";
                            }
                        }
                        else {
                            tclass = "";
                            if(start_d > now_d) {
                                voting_now = "VOTING NOW!";
                            }
                        }
                        parsed = { name: response.data[i][0].name,
                                   daily_pay: daily_pay,
                                   url: response.data[i][0].url,
                                   have_url: have_url,
                                   votes_for: votes_for,
                                   votes_against: response.data[i][0].total_votes_against,
                                   worker: response.data[i][0].worker_account,
                                   start: start_date[0],
                                   end: end_date[0],
                                   id: response.data[i][0].id,
                                   worker_name: response.data[i][0].worker_account_name,
                                   tclass: tclass,
                                   perc: response.data[i][0].perc,
                                   voting_now: voting_now
                        };
                        workers_current.push(parsed);
                    }
                }
                $scope.workers_current = workers_current;
                $scope.workers_expired = workers_expired;
            });


        utilities.columnsort($scope, "start", "sortColumn", "sortClass", "reverse", "reverseclass", "column");
        utilities.columnsort($scope, "start", "sortColumn2", "sortClass2", "reverse2", "reverseclass2", "column2");


        /*
        // table 1
        // column to sort
        $scope.column = 'start';
        // sort ordering (Ascending or Descending). Set true for desending
        $scope.reverse = true;
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
        $scope.column2 = 'start';
        // sort ordering (Ascending or Descending). Set true for desending
        $scope.reverse2 = true;
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
        */
    }


})();
