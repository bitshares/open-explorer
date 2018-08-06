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
            }
        };
    }

})();
