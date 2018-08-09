(function() {
    'use strict';

    angular.module('app').factory('accountService', accountService);
    accountService.$inject = ['$http', 'appConfig', 'utilities', 'assetService'];

    function accountService($http, appConfig, utilities, assetService) {

        return {
            getRichList: function(callback) {
                $http.get(appConfig.urls.python_backend + "/accounts").then(function(response) {
                    var richs = [];
                    for(var i = 0; i < response.data.length; i++) {
                        var amount = utilities.formatBalance(response.data[i].amount, 5);
                        var account = {
                            name: response.data[i].name,
                            id: response.data[i].account_id,
                            amount: amount
                        };
                        richs.push(account);
                    }
                    callback(richs);
                });
            },
            // Todo: Cache
            checkIfWorker: function(account_id, callback) {
                var results = [];
                var is_worker = false;
                var worker_votes = 0;
                $http.get(appConfig.urls.python_backend + "/get_workers").then(function (response) {
                    for (var i = 0; i < response.data.length; i++) {
                        var worker_account = response.data[i][0].worker_account;
                        if (worker_account === account_id) {
                            is_worker = true;
                            worker_votes = utilities.formatBalance(response.data[i][0].total_votes_for, 5);
                            results[0] = is_worker;
                            results[1] = worker_votes;
                            callback(results);
                            break;
                        }
                    }
                });
            },
            checkIfWitness: function(account_id, callback) {
                var results = [];
                var is_witness = false;
                var witness_votes = 0;
                $http.get(appConfig.urls.python_backend + "/get_witnesses").then(function (response) {
                    for (var i = 0; i < response.data.length; i++) {
                        var witness_account = response.data[i][0].witness_account;
                        if (witness_account === account_id) {
                            is_witness = true;
                            witness_votes = utilities.formatBalance(response.data[i][0].total_votes, 5);
                            results[0] = is_witness;
                            results[1] = witness_votes;
                            callback(results);
                            break;
                        }
                    }
                });
            },
            checkIfCommittee: function(account_id, callback) {
                var results = [];
                var is_committee_member = false;
                var committee_votes = 0;
                $http.get(appConfig.urls.python_backend + "/get_committee_members").then(function (response) {
                    for (var i = 0; i < response.data.length; i++) {
                        var committee_member_account = response.data[i][0].committee_member_account;
                        if (committee_member_account === account_id) {
                            is_committee_member = true;
                            committee_votes = utilities.formatBalance(response.data[i][0].total_votes, 5);
                            results[0] = is_committee_member;
                            results[1] = committee_votes;
                            callback(results);
                            break;
                        }
                    }
                });
            },
            checkIfProxy: function(account_id, callback) {
                var results = [];
                var is_proxy = false;
                var proxy_votes = 0;
                $http.get(appConfig.urls.python_backend + "/top_proxies").then(function (response) {
                    for (var i = 0; i < response.data.length; i++) {
                        var proxy_account = response.data[i][0];
                        if (proxy_account === account_id) {
                            is_proxy = true;
                            proxy_votes = utilities.formatBalance(response.data[i][2], 5);
                            results[0] = is_proxy;
                            results[1] = proxy_votes;
                            callback(results);
                            break;
                        }
                    }
                });
            },
            getReferrers: function(account_id, page, callback) {
                var results = [];
                $http.get(appConfig.urls.python_backend + "/get_all_referrers?account_id=" + account_id + "&page=" + page)
                    .then(function (response) {

                    for (var i = 0; i < response.data.length; i++) {
                        var referrer = {
                            account_id: response.data[i][1],
                            account_name: response.data[i][2]
                        };
                        results.push(referrer);
                    }
                    callback(results);
                });
            },
            getReferrerCount: function(account, callback) {
                var count = 0;
                $http.get(appConfig.urls.python_backend + "/referrer_count?account_id=" + account).then(function (response) {
                    count = response.data[0];
                    callback(count);
                });
            },
            getFullAccount: function(account, callback) {
                var full_account = {};
                $http.get(appConfig.urls.python_backend + "/full_account?account_id=" + account).then(function (response) {
                    full_account  = response.data[0][1];
                    callback(full_account);
                });
            },
            getAccountName: function(account_id, callback) {
                var account_name = "";
                $http.get(appConfig.urls.python_backend + "/account_name?account_id=" + account_id).then(function (response) {
                    account_name = response.data;
                    callback(account_name);
                });
            },
            parseAuth: function(auth, type, callback) {
                var results = [];
                angular.forEach(auth, function (value, key) {
                    var authline = {};
                    if(type === "key") {
                        authline = {
                            key: value[0],
                            threshold: value[1]
                        };
                        results.push(authline);
                    }
                    else if(type === "account") {
                        $http.get(appConfig.urls.python_backend + "/account_name?account_id=" + value[0]).then(function (response) {
                            authline = {
                                account: value[0],
                                threshold: value[1],
                                account_name: response.data
                            };
                            results.push(authline);
                        });
                    }
                });
                callback(results);
            },
            parseBalance: function(limit_orders, call_orders, balance, precision, symbol, callback) {
                var limit_orders_counter = 0;
                angular.forEach(limit_orders, function (value, key) {
                    if (value.sell_price.quote.asset_id === balance.asset_type) {
                        limit_orders_counter++;
                    }
                });
                var call_orders_counter = 0;
                angular.forEach(call_orders, function (value, key) {
                    if (value.call_price.quote.asset_id === balance.asset_type) {
                        call_orders_counter++;
                    }
                });
                //if (balance === 0) { return; }
                var balanceline = {
                    asset: balance.asset_type,
                    asset_name: symbol,
                    balance: parseFloat(utilities.formatBalance(balance.balance, precision)),
                    id: balance.id,
                    //owner: balance.owner,
                    call_orders_counter: parseInt(call_orders_counter),
                    limit_orders_counter: parseInt(limit_orders_counter)
                };
                callback(balanceline);
            },
            parseVotes: function(votes, callback) {
                var results = [];
                angular.forEach(votes, function (value, key) {
                    var type = "";
                    var account;
                    if (value.id.substr(0, 4) === "1.6.") {
                        type = "witness";
                        account = value.witness_account;
                    }
                    else if (value.id.substr(0, 4) === "1.5.") {
                        type = "committee member";
                        account = value.committee_member_account;
                    }
                    else if (value.id.substr(0, 4) === "1.14") {
                        type = "worker";
                        account = value.worker_account;
                    }
                    else {
                        type = "other";
                        account = "no name";
                    }
                    var parsed = {
                        id: value.id,
                        type: type,
                        account: account
                    };
                    results.push(parsed);
                });
                callback(results);
            },
            parseUIAs: function(assets, callback) {
                var results = [];
                angular.forEach(assets, function (value, key) {
                    //console.log(this);
                    assetService.getAssetNameAndPrecision(value, function (returnData) {
                        var uia = {
                            asset_id: value,
                            asset_name: returnData.symbol
                        };
                        results.push(uia);
                    });
                });
                callback(results);
            },

            parseProposals: function(proposals, callback) {
                var results = [];
                angular.forEach(proposals, function (value, key) {
                    var proposal = {
                        id: value
                    };
                    results.push(proposal);
                });
                callback(results);
            },
            parseVesting: function(vesting_balances, callback) {
                var results = [];
                if (vesting_balances.length > 0) {
                    angular.forEach(vesting_balances, function (value, key) {
                        assetService.getAssetNameAndPrecision(value.balance.asset_id, function (returnData) {
                            var vesting = {
                                id: value.id,
                                balance: utilities.formatBalance(value.balance.amount, returnData.precision),
                                asset_id: value.balance.asset_id,
                                asset_name: returnData.symbol
                            };
                            results.push(vesting);
                        });
                    });
                    callback(results);
                }
            },
            getAccountHistory: function(account_id, page, callback) {
                $http.get(appConfig.urls.python_backend + "/account_history_pager_elastic?account_id=" + account_id + "&page=" + page)
                    .then(function (response) {

                    var results = [];
                    var c = 0;
                    angular.forEach(response.data, function (value, key) {
                        var timestamp;
                        var witness;
                        var op = utilities.operationType(value.op[0]);
                        var op_type = op[0];
                        var op_color = op[1];
                        var time = new Date(value.timestamp);
                        timestamp = time.toLocaleString();
                        witness = value.witness;
                        var operation = {
                            operation_id: value.id,
                            block_num: value.block_num,
                            time: timestamp,
                            witness: witness,
                            op_type: op_type,
                            op_color: op_color
                        };
                        var operation_text = "";
                        operation_text = utilities.opText(appConfig, $http, value.op[0],value.op[1], function(returnData) {
                            operation.operation_text = returnData;
                        });
                        results.push(operation);
                    });
                    callback(results);
                });
            }
        };
    }

})();
