(function() {
    'use strict';

    angular.module('app').factory('governanceService', governanceService);
    governanceService.$inject = ['$http', 'appConfig', 'utilities', 'networkService'];

    function governanceService($http, appConfig, utilities, networkService) {

        return {
            getCommitteeMembers: function(callback) {
                var active_committee = [];
                var standby_committee = [];
                var committee = [];

                networkService.getHeader(function (returnData) {
                    var committee_count = returnData.committee_count;

                    $http.get(appConfig.urls.python_backend + "/get_committee_members").then(function(response) {
                        var counter = 1;
                        angular.forEach(response.data, function(value, key) {
                            var parsed = {
                                id: value[0].id,
                                total_votes: utilities.formatBalance(value[0].total_votes, 5),
                                url: value[0].url,
                                committee_member_account: value[0].committee_member_account,
                                committee_member_account_name: value[0].committee_member_account_name,
                                counter: counter
                            };

                            if(counter <= committee_count) {
                                active_committee.push(parsed);
                            }
                            else {
                                standby_committee.push(parsed);
                            }
                            counter++;
                        });
                    });
                    committee[0] = active_committee;
                    committee[1] = standby_committee;
                    callback(committee);
                });
            },
            getWitnesses: function(callback) {
                var active_witnesses = [];
                var standby_witnesses = [];
                var witnesses = [];

                networkService.getHeader(function (returnData) {
                    var witness_count = returnData.witness_count;

                    $http.get(appConfig.urls.python_backend + "/get_witnesses").then(function(response) {
                        var counter = 1;
                        angular.forEach(response.data, function(value, key) {
                            var parsed = {
                                id: value[0].id,
                                last_aslot: value[0].last_aslot,
                                last_confirmed_block_num: value[0].last_confirmed_block_num,
                                pay_vb: value[0].pay_vb,
                                total_missed: value[0].total_missed,
                                total_votes: utilities.formatBalance(value[0].total_votes, 5),
                                url: value[0].url,
                                witness_account: value[0].witness_account,
                                witness_account_name: value[0].witness_account_name,
                                counter: counter
                            };

                            if(counter <= witness_count) {
                                active_witnesses.push(parsed);
                            }
                            else {
                                standby_witnesses.push(parsed);
                            }
                            counter++;
                        });
                    });
                    witnesses[0] = active_witnesses;
                    witnesses[1] = standby_witnesses;
                    callback(witnesses);
                });
            },
            getWorkers: function(callback) {
                $http.get(appConfig.urls.python_backend + "/get_workers").then(function(response) {
                    var workers_current = [];
                    var workers_expired = [];
                    var workers = [];
                    for(var i = 0; i < response.data.length; i++) {
                        var now = new Date();
                        var start = new Date(response.data[i][0].work_begin_date);
                        var end = new Date(response.data[i][0].work_end_date);

                        var votes_for = utilities.formatBalance(response.data[i][0].total_votes_for, 5);
                        var daily_pay = utilities.formatBalance(response.data[i][0].daily_pay, 5);
                        var tclass = "";

                        var worker;

                        var have_url = 0;
                        if(response.data[i][0].url && response.data[i][0].url !== "http://") {
                            have_url = 1;
                        }

                        if(now > end) {
                            tclass = "danger";
                            worker = {
                                name: response.data[i][0].name,
                                daily_pay: daily_pay,
                                url: response.data[i][0].url,
                                have_url: have_url,
                                votes_for: votes_for,
                                votes_against: response.data[i][0].total_votes_against,
                                worker: response.data[i][0].worker_account,
                                start: start.toDateString(),
                                end: end.toDateString(),
                                id: response.data[i][0].id,
                                worker_name: response.data[i][0].worker_account_name,
                                tclass: tclass, perc: response.data[i][0].perc
                            };
                            workers_expired.push(worker);
                        }
                        else {
                            var voting_now = "";
                            if(now > start) {
                                if(response.data[i][0].perc >= 50 && response.data[i][0].perc < 100) {
                                    tclass = "warning";
                                }
                                else if(response.data[i][0].perc >= 100) {
                                    tclass = "success";
                                }
                            }
                            else {
                                tclass = "";
                                if(start > now) {
                                    voting_now = "VOTING NOW!";
                                }
                            }
                            worker = {
                                name: response.data[i][0].name,
                                daily_pay: daily_pay,
                                url: response.data[i][0].url,
                                have_url: have_url,
                                votes_for: votes_for,
                                votes_against: response.data[i][0].total_votes_against,
                                worker: response.data[i][0].worker_account,
                                start: start.toDateString(),
                                end: end.toDateString(),
                                id: response.data[i][0].id,
                                worker_name: response.data[i][0].worker_account_name,
                                tclass: tclass,
                                perc: response.data[i][0].perc,
                                voting_now: voting_now
                            };
                            workers_current.push(worker);
                        }
                    }
                    workers[0] = workers_current;
                    workers[1] = workers_expired;
                    callback(workers);
                });
            },
            getProxies: function(callback) {
                $http.get(appConfig.urls.python_backend + "/top_proxies").then(function(response) {
                    var proxies = [];
                    var counter = 1;
                    angular.forEach(response.data, function(value, key) {
                        var parsed = {
                            position: counter,
                            account: value[0],
                            account_name: value[1],
                            power: value[2],
                            followers: value[3],
                            perc: value[4]
                        };
                        if(counter <= 10) {
                            proxies.push(parsed);
                        }
                        counter++;
                    });
                    callback(proxies);
                });
            },
            getWitnessVotes: function(callback) {
                $http.get(appConfig.urls.python_backend + "/witnesses_votes").then(function(response2) {
                    var witnesses = [];
                    angular.forEach(response2.data, function (value, key) {
                        var parsed = {
                            id: value[1],
                            witness_account_name: value[0],
                            proxy1: value[2].split(":")[1],
                            proxy2: value[3].split(":")[1],
                            proxy3: value[4].split(":")[1],
                            proxy4: value[5].split(":")[1],
                            proxy5: value[6].split(":")[1],
                            proxy6: value[7].split(":")[1],
                            proxy7: value[8].split(":")[1],
                            proxy8: value[9].split(":")[1],
                            proxy9: value[10].split(":")[1],
                            proxy10: value[11].split(":")[1],
                            tclass1: ((value[2].split(":")[1] === "Y") ? "success" : "danger"),
                            tclass2: ((value[3].split(":")[1] === "Y") ? "success" : "danger"),
                            tclass3: ((value[4].split(":")[1] === "Y") ? "success" : "danger"),
                            tclass4: ((value[5].split(":")[1] === "Y") ? "success" : "danger"),
                            tclass5: ((value[6].split(":")[1] === "Y") ? "success" : "danger"),
                            tclass6: ((value[7].split(":")[1] === "Y") ? "success" : "danger"),
                            tclass7: ((value[8].split(":")[1] === "Y") ? "success" : "danger"),
                            tclass8: ((value[9].split(":")[1] === "Y") ? "success" : "danger"),
                            tclass9: ((value[10].split(":")[1] === "Y") ? "success" : "danger"),
                            tclass10: ((value[11].split(":")[1] === "Y") ? "success" : "danger")
                        };
                        witnesses.push(parsed);
                    });
                    callback(witnesses);
                });
            },
            getWorkersVotes: function(callback) {
                $http.get(appConfig.urls.python_backend + "/workers_votes").then(function(response2) {
                    var workers = [];
                    angular.forEach(response2.data, function (value, key) {
                        var parsed = {
                            id: value[1],
                            worker_account_name: value[0],
                            worker_name: value[2],
                            proxy1: value[3].split(":")[1],
                            proxy2: value[4].split(":")[1],
                            proxy3: value[5].split(":")[1],
                            proxy4: value[6].split(":")[1],
                            proxy5: value[7].split(":")[1],
                            proxy6: value[8].split(":")[1],
                            proxy7: value[9].split(":")[1],
                            proxy8: value[10].split(":")[1],
                            proxy9: value[11].split(":")[1],
                            proxy10: value[12].split(":")[1],
                            tclass1: ((value[3].split(":")[1] === "Y") ? "success" : "danger"),
                            tclass2: ((value[4].split(":")[1] === "Y") ? "success" : "danger"),
                            tclass3: ((value[5].split(":")[1] === "Y") ? "success" : "danger"),
                            tclass4: ((value[6].split(":")[1] === "Y") ? "success" : "danger"),
                            tclass5: ((value[7].split(":")[1] === "Y") ? "success" : "danger"),
                            tclass6: ((value[8].split(":")[1] === "Y") ? "success" : "danger"),
                            tclass7: ((value[9].split(":")[1] === "Y") ? "success" : "danger"),
                            tclass8: ((value[10].split(":")[1] === "Y") ? "success" : "danger"),
                            tclass9: ((value[11].split(":")[1] === "Y") ? "success" : "danger"),
                            tclass10: ((value[12].split(":")[1] === "Y") ? "success" : "danger")
                        };
                        workers.push(parsed);
                    });
                    callback(workers);
                });
            },
            getCommitteeVotes: function(callback) {
                $http.get(appConfig.urls.python_backend + "/committee_votes").then(function(response) {
                    var committee = [];
                    angular.forEach(response.data, function (value, key) {
                        var parsed = {
                            id: value[1],
                            committee_account_name: value[0],
                            proxy1: value[1].split(":")[1],
                            proxy2: value[2].split(":")[1],
                            proxy3: value[3].split(":")[1],
                            proxy4: value[4].split(":")[1],
                            proxy5: value[5].split(":")[1],
                            proxy6: value[6].split(":")[1],
                            proxy7: value[7].split(":")[1],
                            proxy8: value[8].split(":")[1],
                            proxy9: value[9].split(":")[1],
                            proxy10: value[10].split(":")[1],
                            tclass1: ((value[1].split(":")[1] === "Y") ? "success" : "danger"),
                            tclass2: ((value[2].split(":")[1] === "Y") ? "success" : "danger"),
                            tclass3: ((value[3].split(":")[1] === "Y") ? "success" : "danger"),
                            tclass4: ((value[4].split(":")[1] === "Y") ? "success" : "danger"),
                            tclass5: ((value[5].split(":")[1] === "Y") ? "success" : "danger"),
                            tclass6: ((value[6].split(":")[1] === "Y") ? "success" : "danger"),
                            tclass7: ((value[7].split(":")[1] === "Y") ? "success" : "danger"),
                            tclass8: ((value[8].split(":")[1] === "Y") ? "success" : "danger"),
                            tclass9: ((value[9].split(":")[1] === "Y") ? "success" : "danger"),
                            tclass10: ((value[10].split(":")[1] === "Y") ? "success" : "danger")
                        };
                        committee.push(parsed);
                    });
                    callback(committee);
                });
            }
        };
    }

})();
