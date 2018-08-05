(function () {
    'use strict';

    angular.module('app.committee_members')
        .controller('committeeCtrl', ['$scope', '$filter', '$routeParams', '$http', 'appConfig', 'utilities', committeeCtrl]);

    function committeeCtrl($scope, $filter, $routeParams, $http, appConfig, utilities) {

        $http.get(appConfig.urls.python_backend + "/get_committee_members")
            .then(function(response) {
                var active_committee = [];
                var standby_committee = [];
                var counter = 1;
                angular.forEach(response.data, function(value, key) {
                    var parsed = { id: value[0].id, total_votes: utilities.formatBalance(value[0].total_votes, 5),
                                   url: value[0].url, committee_member_account: value[0].committee_member_account,
                                   committee_member_account_name: value[0].committee_member_account_name, counter: counter
                    };
                    if(counter <= 11) {
                        active_committee.push(parsed);
                    }
                    else {
                        standby_committee.push(parsed);
                    }
                    counter++;
                });
                $scope.active_committee = active_committee;
                $scope.standby_committee = standby_committee;
            });

        utilities.columnsort($scope, "total_votes", "sortColumn", "sortClass", "reverse", "reverseclass", "column");
        utilities.columnsort($scope, "total_votes", "sortColumn2", "sortClass2", "reverse2", "reverseclass2", "column2");

    }
})();
