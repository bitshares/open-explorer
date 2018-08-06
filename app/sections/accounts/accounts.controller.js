(function () {
    'use strict';

    angular.module('app.accounts')
        .controller('accountsCtrl', ['$scope', '$filter', '$routeParams', '$location', '$http', '$websocket', 'appConfig', 'utilities', 'accountService', accountsCtrl]);

    function accountsCtrl($scope, $filter, $routeParams, $location, $http, $websocket, appConfig, utilities, accountService) {

		var path = $location.path();
		var name = $routeParams.name;
		if(name) {
            name = name.toLowerCase();
			if(path.includes("accounts")) {
				$http.get(appConfig.urls.python_backend + "/full_account?account_id=" + name)
					.then(function(response) {
                        var cashback_balance_id;
                        var cashback_balance_balance;
                        try {
                            cashback_balance_id = response.data[0][1].cashback_balance.id;
                            cashback_balance_balance = response.data[0][1].cashback_balance.balance.amount;
                        }
                        catch (err) {
                            cashback_balance_id = "";
                            cashback_balance_balance = 0;
                        }
                        var lifetime = "free member";
                        if (response.data[0][1].account.id === response.data[0][1].account.lifetime_referrer) {
                            lifetime = "lifetime member";
                        }
                        var vesting_balances_string;
                        var vesting = [];
                        try {
                            var vesting_balances = response.data[0][1].vesting_balances;
                            angular.forEach(vesting_balances, function (value, key) {

                                var vesting_balance_id = value.id;
                                var vesting_balance_balance = value.balance.amount;
                                var vesting_balance_asset = value.balance.asset_id;

                                $http.get(appConfig.urls.python_backend + "/get_asset?asset_id=" + vesting_balance_asset)
                                    .then(function (response_a) {

                                        var asset_name = response_a.data[0].symbol;
                                        var asset_precision = response_a.data[0].precision;
                                        var parsed = {
                                            id: vesting_balance_id,
                                            balance: utilities.formatBalance(vesting_balance_balance, asset_precision),
                                            asset_id: vesting_balance_asset,
                                            asset_name: asset_name
                                        };
                                        vesting.push(parsed);
                                    });
                            });
                        }
                        catch (err) {
                            //vesting_balances_string = "";
                        }
                        // TODO: get margin positions, call already in the api.py
                        var total_ops = response.data[0][1].statistics.total_ops;
                        var lifetime_fees_paid = response.data[0][1].statistics.lifetime_fees_paid;
                        var bts_balance;
                        try {
                            bts_balance = response.data[0][1].balances[0].balance;
                        }
                        catch (err) {
                            bts_balance = 0;
                        }

                        jdenticon.update("#identicon", sha256(response.data[0][1].account.name));

                        var voting_account_id = response.data[0][1].account.options.voting_account;
                        var voting_account_name = "";
                        $http.get(appConfig.urls.python_backend + "/account_name?account_id=" + response.data[0][1].account.options.voting_account)
                            .then(function (response_v_a) {
                                voting_account_name = response_v_a.data;
                                $scope.account = {
                                    name: response.data[0][1].account.name,
                                    id: response.data[0][1].account.id,
                                    referer: response.data[0][1].referrer_name,
                                    registrar: response.data[0][1].registrar_name,
                                    statistics: response.data[0][1].account.statistics,
                                    cashback: cashback_balance_id,
                                    cashback_balance: utilities.formatBalance(cashback_balance_balance, 5),
                                    lifetime: lifetime,
                                    total_ops: total_ops,
                                    lifetime_fees_paid: parseInt(utilities.formatBalance(lifetime_fees_paid, 5)),
                                    bts_balance: parseInt(utilities.formatBalance(bts_balance, 5)),
                                    vesting: vesting,
                                    memo_key: response.data[0][1].account.options.memo_key,
                                    voting_account_id: voting_account_id,
                                    voting_account_name: voting_account_name
                                };
                        });

                        var parsed;
                        // owner keys
                        var owner_keys = [];
                        for (var ok = 0; ok < response.data[0][1].account.owner.key_auths.length; ok++) {
                            parsed = {
                                key: response.data[0][1].account.owner.key_auths[ok][0],
                                threshold: response.data[0][1].account.owner.key_auths[ok][1]
                            };
                            owner_keys.push(parsed);
                        }
                        $scope.owner_keys = owner_keys;

                        // owner accounts
                        var owner_accounts = [];
                        //var parsed;
                        angular.forEach(response.data[0][1].account.owner.account_auths, function (value, key) {
                            // get account name
                            var account_name;
                            $http.get(appConfig.urls.python_backend + "/account_name?account_id=" + value[0])
                                .then(function (response_name) {
                                    account_name = response_name.data;
                                    parsed = {account: value[0], threshold: value[1], account_name: account_name};
                                    owner_accounts.push(parsed);
                            });
                        });
                        $scope.owner_accounts = owner_accounts;

                        // active keys
                        var active_keys = [];
                        for (var ak = 0; ak < response.data[0][1].account.active.key_auths.length; ak++) {
                            parsed = { key: response.data[0][1].account.active.key_auths[ak][0],
                                       threshold: response.data[0][1].account.active.key_auths[ak][1]
                            };
                            active_keys.push(parsed);
                        }
                        $scope.active_keys = active_keys;

                        // active accounts
                        var active_accounts = [];
                        angular.forEach(response.data[0][1].account.active.account_auths, function (value, key) {
                            var account_name;
                            $http.get(appConfig.urls.python_backend + "/account_name?account_id=" + value[0])
                                .then(function (response_name) {
                                    account_name = response_name.data;
                                    var parsed = {account: value[0], threshold: value[1], account_name: account_name};
                                    active_accounts.push(parsed);
                                });
                        });
                        $scope.active_accounts = active_accounts;

                        // balances
                        var balances = [];
                        angular.forEach(response.data[0][1].balances, function (value, key) {
                            var asset_name = "";
                            var asset_precision = 0;

                            $http.get(appConfig.urls.python_backend + "/get_asset?asset_id=" + value.asset_type)
                                .then(function (response2) {
                                    asset_name = response2.data[0].symbol;
                                    asset_precision = response2.data[0].precision;
                                    // open limit orders
                                    var limit_orders_counter = 0;
                                    angular.forEach(response.data[0][1].limit_orders, function (value2, key2) {
                                        if (value2.sell_price.quote.asset_id === value.asset_type) {
                                            limit_orders_counter++;
                                        }
                                    });
                                    // open call orders
                                    var call_orders_counter = 0;
                                    angular.forEach(response.data[0][1].call_orders, function (value2, key2) {
                                        //console.log(value2);
                                        if (value2.call_price.quote.asset_id === value.asset_type) {
                                            call_orders_counter++;
                                        }
                                    });
                                    var balance = utilities.formatBalance(value.balance, asset_precision);
                                    if (balance === 0) { return; }
                                    var parsed = {
                                        asset: value.asset_type,
                                        asset_name: asset_name,
                                        balance: parseFloat(balance),
                                        id: value.id,
                                        owner: value.owner,
                                        call_orders_counter: parseInt(call_orders_counter),
                                        limit_orders_counter: parseInt(limit_orders_counter)
                                    };
                                    balances.push(parsed);
                                });
                        });
                        $scope.balances = balances;

                        // user issued assets
                        var user_issued_assets = [];
                        angular.forEach(response.data[0][1].assets, function (value, key) {

                            $http.get(appConfig.urls.python_backend + "/get_asset?asset_id=" + value)
                                .then(function (response) {
                                    var parsed = {asset_id: value, asset_name: response.data[0].symbol};
                                    user_issued_assets.push(parsed);
                                });
                        });
                        $scope.user_issued_assets = user_issued_assets;


                        // proposals
                        var proposals = [];
                        angular.forEach(response.data[0][1].proposals, function (value, key) {
                            var parsed = {id: value};
                            user_issued_assets.push(parsed);
                        });
                        $scope.proposals = proposals;

                        // votes
                        var votes = [];
                        angular.forEach(response.data[0][1].votes, function (value, key) {
                            var type = "";
                            var account;
                            //console.log(value.id.substr(0, 4));
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
                            var parsed = {id: value.id, type: type, account: account};
                            votes.push(parsed);
                        });
                        $scope.votes = votes;

                        // get if is worker
                        $scope.is_worker = 0;
                        $http.get(appConfig.urls.python_backend + "/get_workers")
                            .then(function (response_w) {
                                for (var i = 0; i < response_w.data.length; i++) {
                                    var worker_account = response_w.data[i][0].worker_account;
                                    if (worker_account === response.data[0][1].account.id) {
                                        $scope.is_worker = 1;
                                        $scope.worker_votes = utilities.formatBalance(response_w.data[i][0].total_votes_for, 5);
                                        break;
                                    }

                                }
                        });

                        // get if is witness
                        $scope.is_witness = 0;
                        $http.get(appConfig.urls.python_backend + "/get_witnesses")
                            .then(function (response_w) {
                                for (var i = 0; i < response_w.data.length; i++) {
                                    var witness_account = response_w.data[i][0].witness_account;
                                    if (witness_account === response.data[0][1].account.id) {
                                        $scope.is_witness = 1;
                                        $scope.witness_votes = utilities.formatBalance(response_w.data[i][0].total_votes, 5);
                                        break;
                                    }
                                }
                        });

                        // get if is committee_member
                        $scope.is_committee_member = 0;
                        $http.get(appConfig.urls.python_backend + "/get_committee_members")
                            .then(function (response_w) {
                                for (var i = 0; i < response_w.data.length; i++) {
                                    var committee_member_account = response_w.data[i][0].committee_member_account;
                                    if (committee_member_account === response.data[0][1].account.id) {
                                        $scope.is_committee_member = 1;
                                        $scope.committee_votes = utilities.formatBalance(response_w.data[i][0].total_votes, 5);
                                        break;
                                    }
                                }
                        });

                        // get if is top proxy
                        $scope.is_proxy = 0;
                        $http.get(appConfig.urls.python_backend + "/top_proxies")
                            .then(function (response_w) {
                                for (var i = 0; i < response_w.data.length; i++) {
                                    var proxy_account = response_w.data[i][0];
                                    if (proxy_account === response.data[0][1].account.id) {
                                        $scope.is_proxy = 1;
                                        $scope.proxy_votes = utilities.formatBalance(response_w.data[i][2], 5);
                                        break;
                                    }

                                }
                        });

                        // count of referrers
                        $http.get(appConfig.urls.python_backend + "/referrer_count?account_id=" + name)
                            .then(function (referrer_count) {
                                $scope.referral_count = referrer_count.data[0];
                        });

                        // get referrers
                        $scope.select_referers = function(page_referers) {
                            var pager = page_referers -1;
                            var refs = [];
                            $http.get(appConfig.urls.python_backend + "/get_all_referrers?account_id=" + name + "&page=" + pager)
                                .then(function (referrers) {
                                    for (var i = 0; i < referrers.data.length; i++) {
                                        var parsed = {account_id: referrers.data[i][1], account_name: referrers.data[i][2]};
                                        refs.push(parsed);
                                    }
                            });
                            $scope.referrers = refs;
                            $scope.currentPageReferer = page_referers;

                        };
                        $scope.select_referers(1);

                        var update = true;
                        $scope.select = function(page) {
                            var pager = page -1;
                            if($scope.dataStream) {
                                $scope.dataStream.close(true);
                            }
                            $http.get(appConfig.urls.python_backend + "/account_history_pager_elastic?account_id=" + name + "&page=" + pager)
                                .then(function (response_ahp) {

                                    var operations = [];
                                    var c = 0;
                                    angular.forEach(response_ahp.data, function (value, key) {
                                        // get the timestampt from block header
                                        var timestamp;
                                        var witness;
                                        var op = utilities.operationType(value.op[0]);
                                        var op_type = op[0];
                                        var op_color = op[1];
                                        var time = new Date(value.timestamp);
                                        timestamp = time.toLocaleString();
                                        witness = value.witness;
                                        var parsed = {
                                            operation_id: value.id,
                                            block_num: value.block_num,
                                            time: timestamp,
                                            witness: witness,
                                            op_type: op_type,
                                            op_color: op_color
                                        };
                                        var operation_text = "";
                                        operation_text = utilities.opText(appConfig, $http, value.op[0],value.op[1], function(returnData) {
                                            parsed.operation_text = returnData;
                                        });
                                        operations.push(parsed);
                                    });
                                    $scope.operations = operations;
                                    $scope.currentPage = page;
                                });
                        };
                        $scope.select(1);

                        utilities.columnsort($scope, "balance", "sortColumn", "sortClass", "reverse", "reverseclass", "column");

					});
            }
		}
		else {
            if(path === "/accounts") {
                /*
				$http.get(appConfig.urls.python_backend + "/accounts")
					.then(function(response) {
						//console.log(response.data);
						var richs = [];
						for(var i = 0; i < response.data.length; i++) { // for de 100 y ya esta
                            var amount = utilities.formatBalance(response.data[i].amount, 5);
							var parsed = { name: response.data[i].name, id: response.data[i].account_id, amount: amount };
							richs.push(parsed);
						}
						$scope.richs = richs;
				});
				*/
                accountService.getRichList(function (returnData) {
                    $scope.richs = returnData;
                });

                utilities.columnsort($scope, "amount", "sortColumn", "sortClass", "reverse", "reverseclass", "column");

			}
		}
    }

})();
