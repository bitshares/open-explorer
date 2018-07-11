(function () {
    'use strict';

    angular.module('app.voting')
        .controller('votingCtrl', ['$scope', '$filter', '$routeParams', '$location', '$http', 'appConfig', votingCtrl]);

    function votingCtrl($scope, $filter, $routeParams, $location, $http, appConfig) {

        $http.get(appConfig.urls.python_backend + "/top_proxies")
            .then(function(response) {
                //console.log(response.data);
                var proxies = [];
                var counter = 1;
                angular.forEach(response.data, function(value, key) {
                    var parsed = { position: counter, account: value[0], account_name: value[1], power: value[2],
                        followers: value[3], perc: value[4]};
                    if(counter <= 10)
                        proxies.push(parsed);
                    counter++;
                });
                $scope.proxies = proxies;
            });

        // witnesses
        $http.get(appConfig.urls.python_backend + "/witnesses_votes")
            .then(function(response2) {
                var witnesses = [];
                var counter = 1;
                angular.forEach(response2.data, function (value, key) {
                    var parsed = {id: value[1], witness_account_name: value[0], proxy1: value[2].split(":")[1],
                        proxy2: value[3].split(":")[1], proxy3: value[4].split(":")[1], proxy4: value[5].split(":")[1],
                        proxy5: value[6].split(":")[1], proxy6: value[7].split(":")[1],
                        proxy7: value[8].split(":")[1], proxy8: value[9].split(":")[1],
                        proxy9: value[10].split(":")[1], proxy10: value[11].split(":")[1],
                        tclass1: ((value[2].split(":")[1] === "Y") ? "success" : "danger"),
                        tclass2: ((value[3].split(":")[1] === "Y") ? "success" : "danger"),
                        tclass3: ((value[4].split(":")[1] === "Y") ? "success" : "danger"),
                        tclass4: ((value[5].split(":")[1] === "Y") ? "success" : "danger"),
                        tclass5: ((value[6].split(":")[1] === "Y") ? "success" : "danger"),
                        tclass6: ((value[7].split(":")[1] === "Y") ? "success" : "danger"),
                        tclass7: ((value[8].split(":")[1] === "Y") ? "success" : "danger"),
                        tclass8: ((value[9].split(":")[1] === "Y") ? "success" : "danger"),
                        tclass9: ((value[10].split(":")[1] === "Y") ? "success" : "danger"),
                        tclass10: ((value[11].split(":")[1] === "Y") ? "success" : "danger")};
                    witnesses.push(parsed);
                    counter++;
                });
                $scope.witnesses = witnesses;
            });

        // workers
        $http.get(appConfig.urls.python_backend + "/workers_votes")
            .then(function(response2) {
                var workers = [];
                var counter = 1;
                angular.forEach(response2.data, function (value, key) {
                    var parsed = {id: value[1], worker_account_name: value[0], worker_name: value[2], proxy1: value[3].split(":")[1],
                        proxy2: value[4].split(":")[1], proxy3: value[5].split(":")[1], proxy4: value[6].split(":")[1],
                        proxy5: value[7].split(":")[1], proxy6: value[8].split(":")[1], proxy7: value[9].split(":")[1],
                        proxy8: value[10].split(":")[1], proxy9: value[11].split(":")[1], proxy10: value[12].split(":")[1],
                        tclass1: ((value[3].split(":")[1] === "Y") ? "success" : "danger"),
                        tclass2: ((value[4].split(":")[1] === "Y") ? "success" : "danger"),
                        tclass3: ((value[5].split(":")[1] === "Y") ? "success" : "danger"),
                        tclass4: ((value[6].split(":")[1] === "Y") ? "success" : "danger"),
                        tclass5: ((value[7].split(":")[1] === "Y") ? "success" : "danger"),
                        tclass6: ((value[8].split(":")[1] === "Y") ? "success" : "danger"),
                        tclass7: ((value[9].split(":")[1] === "Y") ? "success" : "danger"),
                        tclass8: ((value[10].split(":")[1] === "Y") ? "success" : "danger"),
                        tclass9: ((value[11].split(":")[1] === "Y") ? "success" : "danger"),
                        tclass10: ((value[12].split(":")[1] === "Y") ? "success" : "danger")};
                    workers.push(parsed);
                    counter++;
                });
                $scope.workers = workers;
            });

        // committee
        $http.get(appConfig.urls.python_backend + "/committee_votes")
            .then(function(response2) {
                var committee = [];
                var counter = 1;
                angular.forEach(response2.data, function (value, key) {
                    var parsed = {id: value[1], committee_account_name: value[0], proxy1: value[2].split(":")[1],
                        proxy2: value[3].split(":")[1], proxy3: value[4].split(":")[1], proxy4: value[5].split(":")[1],
                        proxy5: value[6].split(":")[1], proxy6: value[7].split(":")[1], proxy7: value[8].split(":")[1],
                        proxy8: value[9].split(":")[1], proxy9: value[10].split(":")[1], proxy10: value[11].split(":")[1],
                        tclass1: ((value[2].split(":")[1] === "Y") ? "success" : "danger"),
                        tclass2: ((value[3].split(":")[1] === "Y") ? "success" : "danger"),
                        tclass3: ((value[4].split(":")[1] === "Y") ? "success" : "danger"),
                        tclass4: ((value[5].split(":")[1] === "Y") ? "success" : "danger"),
                        tclass5: ((value[6].split(":")[1] === "Y") ? "success" : "danger"),
                        tclass6: ((value[7].split(":")[1] === "Y") ? "success" : "danger"),
                        tclass7: ((value[8].split(":")[1] === "Y") ? "success" : "danger"),
                        tclass8: ((value[9].split(":")[1] === "Y") ? "success" : "danger"),
                        tclass9: ((value[10].split(":")[1] === "Y") ? "success" : "danger"),
                        tclass10: ((value[11].split(":")[1] === "Y") ? "success" : "danger")};
                    committee.push(parsed);
                    counter++;
                });
                $scope.committee = committee;
            });
    }

})();
