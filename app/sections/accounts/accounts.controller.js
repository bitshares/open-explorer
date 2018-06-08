(function () {
    'use strict';

    angular.module('app.accounts')
        .controller('accountsCtrl', ['$scope', '$filter', '$routeParams', '$location', '$http', '$websocket', 'appConfig', 'utilities', accountsCtrl]);

    function accountsCtrl($scope, $filter, $routeParams, $location, $http, $websocket, appConfig, utilities) {

		var path = $location.path();
		var name = $routeParams.name;
		if(name) {
            name = name.toLowerCase();
			if(path.includes("accounts")) {
				$http.get(appConfig.urls.python_backend + "/full_account?account_id=" + name)
					.then(function(response) {
                        //console.log(response.data[0][1]);
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
                        if (response.data[0][1].account.id == response.data[0][1].account.lifetime_referrer)
                            lifetime = "lifetime member";
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
                        try {
                            var bts_balance = response.data[0][1].balances[0].balance;
                        }
                        catch (err) {
                            var bts_balance = 0;
                        }
                        jdenticon.update("#identicon", sha256(response.data[0][1].account.name));
                        //$scope.identicon = identicon;

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

                        // owner keys
                        var owner_keys = [];
                        for (var i = 0; i < response.data[0][1].account.owner.key_auths.length; i++) {
                            var parsed = {
                                key: response.data[0][1].account.owner.key_auths[i][0],
                                threshold: response.data[0][1].account.owner.key_auths[i][1]
                            };
                            //console.log(parsed);
                            owner_keys.push(parsed);
                        }
                        $scope.owner_keys = owner_keys;

                        // owner accounts
                        var owner_accounts = [];
                        angular.forEach(response.data[0][1].account.owner.account_auths, function (value, key) {

                            //console.log(value);
                            // get account name
                            var account_name;
                            $http.get(appConfig.urls.python_backend + "/account_name?account_id=" + value[0])
                                .then(function (response_name) {
                                    account_name = response_name.data;
                                    var parsed = {account: value[0], threshold: value[1], account_name: account_name};
                                    owner_accounts.push(parsed);
                                });
                        });
                        $scope.owner_accounts = owner_accounts;

                        // active keys
                        var active_keys = [];
                        for (var i = 0; i < response.data[0][1].account.active.key_auths.length; i++) {
                            var parsed = {
                                key: response.data[0][1].account.active.key_auths[i][0],
                                threshold: response.data[0][1].account.active.key_auths[i][1]
                            };
                            //console.log(parsed);
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
                                        if (value2.sell_price.quote.asset_id == value.asset_type)
                                            limit_orders_counter++;
                                    });
                                    //console.log(limit_orders_counter);
                                    // oppen call orders
                                    var call_orders_counter = 0;
                                    angular.forEach(response.data[0][1].call_orders, function (value2, key2) {
                                        //console.log(value2);
                                        if (value2.call_price.quote.asset_id == value.asset_type)
                                            call_orders_counter++;
                                    });
                                    var balance = utilities.formatBalance(value.balance, asset_precision);
                                    if (balance == 0) return;
                                    var parsed = {
                                        asset: value.asset_type,
                                        asset_name: asset_name,
                                        balance: balance,
                                        id: value.id,
                                        owner: value.owner,
                                        call_orders_counter: call_orders_counter,
                                        limit_orders_counter: limit_orders_counter
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
                                    //console.log(response);
                                    var parsed = {asset_id: value, asset_name: response.data[0].symbol};
                                    user_issued_assets.push(parsed);
                                });
                        });
                        $scope.user_issued_assets = user_issued_assets;


                        // proposals
                        var proposals = [];
                        angular.forEach(response.data[0][1].proposals, function (value, key) {

                            //$http.get(appConfig.urls.python_backend + "/get_asset?asset_id=" + value)
                            //    .then(function(response) {
                            console.log(value);
                            var parsed = {id: value};
                            user_issued_assets.push(parsed);
                            //});
                        });
                        $scope.proposals = proposals;

                        // votes
                        var votes = [];
                        angular.forEach(response.data[0][1].votes, function (value, key) {

                            //$http.get(appConfig.urls.python_backend + "/get_asset?asset_id=" + value)
                            //    .then(function(response) {
                            //console.log(value);
                            var type = "";
                            var account;
                            console.log(value.id.substr(0, 4));
                            if (value.id.substr(0, 4) == "1.6.") {
                                type = "witness";
                                account = value.witness_account;
                            }
                            else if (value.id.substr(0, 4) == "1.5.") {
                                type = "committee member";
                                account = value.committee_member_account;
                            }
                            else if (value.id.substr(0, 4) == "1.14") {
                                type = "worker";
                                account = value.worker_account;
                            }
                            else {
                                type = "other";
                                account = "no name";
                            }
                            var parsed = {id: value.id, type: type, account: account};
                            votes.push(parsed);
                            //});
                        });
                        $scope.votes = votes;


                        // get if is worker
                        $scope.is_worker = 0;
                        $http.get(appConfig.urls.python_backend + "/get_workers")
                            .then(function (response_w) {
                                for (var i = 0; i < response_w.data.length; i++) {

                                    //console.log(response.data[0][1].account.id);
                                    //console.log(response_w.data[i][0].worker_account);
                                    var worker_account = response_w.data[i][0].worker_account;
                                    if (worker_account == response.data[0][1].account.id) {
                                        $scope.is_worker = 1;
                                        break;
                                    }

                                }
                            });

                        // get if is witness
                        $scope.is_witness = 0;
                        $http.get(appConfig.urls.python_backend + "/get_witnesses")
                            .then(function (response_w) {
                                for (var i = 0; i < response_w.data.length; i++) {

                                    //console.log(response.data[0][1].account.id);
                                    //console.log(response_w.data[i][0].worker_account);
                                    var witness_account = response_w.data[i][0].witness_account;
                                    if (witness_account == response.data[0][1].account.id) {
                                        $scope.is_witness = 1;
                                        break;
                                    }

                                }
                            });

                        // get if is committee_member
                        $scope.is_committee_member = 0;
                        $http.get(appConfig.urls.python_backend + "/get_committee_members")
                            .then(function (response_w) {
                                for (var i = 0; i < response_w.data.length; i++) {

                                    //console.log(response.data[0][1].account.id);
                                    //console.log(response_w.data[i][0].worker_account);
                                    var committee_member_account = response_w.data[i][0].committee_member_account;
                                    if (committee_member_account == response.data[0][1].account.id) {
                                        $scope.is_committee_member = 1;
                                        break;
                                    }

                                }
                            });

                        // get if is top proxy
                        $scope.is_proxy = 0;
                        $http.get(appConfig.urls.python_backend + "/top_proxies")
                            .then(function (response_w) {
                                for (var i = 0; i < response_w.data.length; i++) {

                                    //console.log(response.data[0][1].account.id);
                                    //console.log(response_w.data[i][0].worker_account);
                                    var proxy_account = response_w.data[i][0];
                                    if (proxy_account == response.data[0][1].account.id) {
                                        $scope.is_proxy = 1;
                                        break;
                                    }

                                }
                            });

                        // count of referrers
                        $http.get(appConfig.urls.python_backend + "/referrer_count?account_id=" + name)
                            .then(function (referrer_count) {
                                //console.log(referrer_count.data[0]);
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
                            if($scope.dataStream)
                                $scope.dataStream.close(true);

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

                        // column to sort
                        $scope.column = 'balance';
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

                    });

            }
		}
		else {
			var init;
            if(path == "/accounts") {
				$http.get(appConfig.urls.python_backend + "/accounts")
					.then(function(response) {
						//console.log(response.data);
						var richs = [];
						for(var i = 0; i < response.data.length; i++) { // for de 100 y ya esta
                            var amount = utilities.formatBalance(response.data[i].amount, 5);
							var parsed = { name: response.data[i].name, id: response.data[i].account_id, amount: amount };
							//console.log(parsed);
							richs.push(parsed);
						}
						$scope.richs = richs;
						//console.log($scope.richs);
				});

                // column to sort
                $scope.column = 'amount';
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
			}
		}
    }

})();
