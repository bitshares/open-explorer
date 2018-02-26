(function () {
    'use strict';

    angular.module('app.accounts')
        .controller('accountsCtrl', ['$scope', '$filter', '$routeParams', '$location', '$http', '$websocket', 'appConfig', accountsCtrl]);

    function accountsCtrl($scope, $filter, $routeParams, $location, $http, $websocket, appConfig) {

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
                        catch(err) {
                            cashback_balance_id = "";
                            cashback_balance_balance = 0;
                        }
                        var lifetime = "free member";
                        if(response.data[0][1].account.id == response.data[0][1].account.lifetime_referrer)
                            lifetime = "lifetime member";
                        var vesting_balances_string;
                        var vesting = [];
                        try {
                            var vesting_balances = response.data[0][1].vesting_balances;
                            angular.forEach(vesting_balances, function(value, key){

                                var vesting_balance_id = value.id;
                                var vesting_balance_balance = value.balance.amount;

                                var vesting_balance_asset = value.balance.asset_id;

                                $http.get(appConfig.urls.python_backend + "/get_asset?asset_id=" + vesting_balance_asset)
                                    .then(function(response_a) {

                                        var asset_name = response_a.data[0].symbol;
                                        var asset_precision = response_a.data[0].precision;
                                        var parsed = { id: vesting_balance_id, balance: formatBalance(vesting_balance_balance, asset_precision), asset_id: vesting_balance_asset, asset_name: asset_name };

                                        vesting.push(parsed);

                                    });


                            });

                        }
                        catch(err) {
                            //vesting_balances_string = "";
                        }
                        // TODO: get margin positions, call already in the api.py
                        var total_ops = response.data[0][1].statistics.total_ops;
                        var lifetime_fees_paid = response.data[0][1].statistics.lifetime_fees_paid;
                        try {
                            var bts_balance = response.data[0][1].balances[0].balance;
                        }
                        catch(err) {
                            var bts_balance = 0;
                        }
                        jdenticon.update("#identicon", sha256(response.data[0][1].account.name));
                        //$scope.identicon = identicon;
						$scope.account = { name:  response.data[0][1].account.name, id: response.data[0][1].account.id, referer: response.data[0][1].referrer_name, registrar: response.data[0][1].registrar_name,  statistics: response.data[0][1].account.statistics, cashback: cashback_balance_id, cashback_balance: formatBalance(cashback_balance_balance, 5), lifetime: lifetime,
                        total_ops: total_ops, lifetime_fees_paid: parseInt(formatBalance(lifetime_fees_paid, 5)), bts_balance: parseInt(formatBalance(bts_balance, 5)), vesting: vesting};

						// owner keys
						var owner_keys = [];
						for(var i = 0; i < response.data[0][1].account.owner.key_auths.length; i++) {
							var parsed = { key: response.data[0][1].account.owner.key_auths[i][0], threshold: response.data[0][1].account.owner.key_auths[i][1]};
							//console.log(parsed);
							owner_keys.push(parsed);
						}
						$scope.owner_keys = owner_keys;

						// owner accounts
						var owner_accounts = [];
                        angular.forEach(response.data[0][1].account.owner.account_auths, function(value, key){

                            //console.log(value);
						    // get account name
                            var account_name;
                            $http.get(appConfig.urls.python_backend + "/account_name?account_id=" + value[0])
                                .then(function(response_name) {
                                    account_name = response_name.data[0].name;
                                    var parsed = { account: value[0], threshold: value[1], account_name: account_name};
                                    owner_accounts.push(parsed);
                                });
						});
						$scope.owner_accounts = owner_accounts;

						// active keys
						var active_keys = [];
						for(var i = 0; i < response.data[0][1].account.active.key_auths.length; i++) {
							var parsed = { key: response.data[0][1].account.active.key_auths[i][0], threshold: response.data[0][1].account.active.key_auths[i][1]};
							//console.log(parsed);
							active_keys.push(parsed);
						}
						$scope.active_keys = active_keys;

						// active accounts
						var active_accounts = [];
                        angular.forEach(response.data[0][1].account.active.account_auths, function(value, key){
                            var account_name;
                            $http.get(appConfig.urls.python_backend + "/account_name?account_id=" + value[0])
                                .then(function(response_name) {
                                    account_name = response_name.data[0].name;
                                    var parsed = { account: value[0], threshold: value[1], account_name: account_name};
                                    active_accounts.push(parsed);
                                });
                        });
						$scope.active_accounts = active_accounts;

						// balances
						var balances = [];
                        angular.forEach(response.data[0][1].balances, function(value, key) {
                            var asset_name = "";
                            var asset_precision = 0;

                            $http.get(appConfig.urls.python_backend + "/get_asset?asset_id=" + value.asset_type)
                                .then(function(response2) {
                                    asset_name = response2.data[0].symbol;
                                    asset_precision = response2.data[0].precision;
                                    // open limit orders
                                    var limit_orders_counter = 0;
                                    angular.forEach(response.data[0][1].limit_orders, function(value2, key2) {
                                        if(value2.sell_price.quote.asset_id == value.asset_type)
                                            limit_orders_counter++;
                                    });
                                    //console.log(limit_orders_counter);
                                    // oppen call orders
                                    var call_orders_counter = 0;
                                    angular.forEach(response.data[0][1].call_orders, function(value2, key2) {
                                        //console.log(value2);
                                        if(value2.call_price.quote.asset_id == value.asset_type)
                                            call_orders_counter++;
                                    });
                                    var balance = formatBalance(value.balance, asset_precision);
                                    if(balance == 0) return;
                                    var parsed = { asset: value.asset_type, asset_name: asset_name, balance: balance, id: value.id, owner: value.owner, call_orders_counter: call_orders_counter, limit_orders_counter: limit_orders_counter};
                                    balances.push(parsed);
                                });
						});
						$scope.balances = balances;


                        // user issued assets
                        var user_issued_assets = [];
                        angular.forEach(response.data[0][1].assets, function(value, key) {

                            $http.get(appConfig.urls.python_backend + "/get_asset?asset_id=" + value)
                                .then(function(response) {
                                    //console.log(response);
                                    var parsed = {asset_id: value, asset_name: response.data[0].symbol};
                                    user_issued_assets.push(parsed);
                                });
                        });
                        $scope.user_issued_assets = user_issued_assets;


                        // proposals
                        var proposals = [];
                        angular.forEach(response.data[0][1].proposals, function(value, key) {

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
                        angular.forEach(response.data[0][1].votes, function(value, key) {

                            //$http.get(appConfig.urls.python_backend + "/get_asset?asset_id=" + value)
                            //    .then(function(response) {
                            //console.log(value);
                            var type = "";
                            var account;
                            console.log(value.id.substr(0, 4));
                            if(value.id.substr(0, 4) == "1.6.") {
                                type = "witness";
                                account = value.witness_account;
                            }
                            else if(value.id.substr(0, 4) == "1.5.") {
                                type = "committee member";
                                account = value.committee_member_account;
                            }
                            else if(value.id.substr(0, 4) == "1.14") {
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
                            .then(function(response_w) {
                                for(var i = 0; i < response_w.data.length; i++) {

                                    //console.log(response.data[0][1].account.id);
                                    //console.log(response_w.data[i][0].worker_account);
                                    var worker_account = response_w.data[i][0].worker_account;
                                    if(worker_account == response.data[0][1].account.id) {
                                        $scope.is_worker = 1;
                                        break;
                                    }

                                }
                            });

                        // get if is witness
                        $scope.is_witness = 0;
                        $http.get(appConfig.urls.python_backend + "/get_witnesses")
                            .then(function(response_w) {
                                for(var i = 0; i < response_w.data.length; i++) {

                                    //console.log(response.data[0][1].account.id);
                                    //console.log(response_w.data[i][0].worker_account);
                                    var witness_account = response_w.data[i][0].witness_account;
                                    if(witness_account == response.data[0][1].account.id) {
                                        $scope.is_witness = 1;
                                        break;
                                    }

                                }
                            });

                        // get if is committee_member
                        $scope.is_committee_member = 0;
                        $http.get(appConfig.urls.python_backend + "/get_committee_members")
                            .then(function(response_w) {
                                for(var i = 0; i < response_w.data.length; i++) {

                                    //console.log(response.data[0][1].account.id);
                                    //console.log(response_w.data[i][0].worker_account);
                                    var committee_member_account = response_w.data[i][0].committee_member_account;
                                    if(committee_member_account == response.data[0][1].account.id) {
                                        $scope.is_committee_member = 1;
                                        break;
                                    }

                                }
                            });

                        // get if is top proxy
                        $scope.is_proxy = 0;
                        $http.get(appConfig.urls.python_backend + "/top_proxies")
                            .then(function(response_w) {
                                for(var i = 0; i < response_w.data.length; i++) {

                                    //console.log(response.data[0][1].account.id);
                                    //console.log(response_w.data[i][0].worker_account);
                                    var proxy_account = response_w.data[i][0];
                                    if(proxy_account == response.data[0][1].account.id) {
                                        $scope.is_proxy = 1;
                                        break;
                                    }

                                }
                            });

                        // count of referrers
                        $http.get(appConfig.urls.python_backend + "/referrer_count?account_id=" + name)
                            .then(function(referrer_count) {
                                //console.log(referrer_count.data[0]);
                                $scope.referral_count = referrer_count.data[0];
                            });

                        // get referrers
                        var refs = [];
                        $http.get(appConfig.urls.python_backend + "/get_all_referrers?account_id=" + name)
                            .then(function(referrers) {
                                for(var i = 0; i < referrers.data.length; i++) {
                                    var parsed = {account_id: referrers.data[i][1], account_name: referrers.data[i][2]};
                                    refs.push(parsed);
                                }
                            });
                        $scope.referrers = refs;


				});

                var update = true;
                $scope.select = function(page) {
                    //var end, start;
                    //start = (page - 1) * $scope.numPerPage;
                    //end = start + $scope.numPerPage;
                    //return $scope.currentPageStores = $scope.filteredStores.slice(start, end);
                    //console.log(page);

                    //var total_ops = response.data[0][1].statistics.total_ops;
                    var pager = page -1;
                    //$location.url("#/" + pager);
                    if(pager == 0) {

                        // get static account history
                        $http.get(appConfig.urls.python_backend + "/account_history?account_id=" + name)
                            .then(function (response) {
                                //console.log(response.data);
                                var operations = [];
                                var c = 0;
                                angular.forEach(response.data, function (value, key) {
                                    // get the timestampt from block header
                                    var timestamp;
                                    var witness;
                                    //console.log(value);
                                    var op = operationType(value.op[0]);
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
                                    operations.push(parsed);
                                });
                                $scope.operations = operations;
                                $scope.currentPage = 0;
                            });

                        var dataStream = $websocket(appConfig.urls.websocket);
                        dataStream.send('{"method": "call", "params": [0, "set_subscribe_callback", [5, false]], "id": 6}');
                        dataStream.send('{"method": "call", "params": [0, "get_full_accounts", [["' + name + '"], true]], "id": 7}');

                        $scope.dataStream = dataStream;
                        var collection = [];
                        $scope.operations = [];


                        dataStream.onMessage(function (message) {
                            var parsed;
                            try {
                                parsed = JSON.parse(message.data).params[1][0][0];
                            }
                            catch (err) {
                            }

                            if (typeof(parsed) == 'object') {
                                if (parsed.id.substring(0, 4) == "2.9.") {
                                    var account = parsed.account;
                                    $http.get(appConfig.urls.python_backend + "/account_name?account_id=" + account)
                                        .then(function (response) {
                                            parsed.account_name = response.data[0].name;
                                        });

                                    // get operation details
                                    var operation_id = parsed.operation_id;
                                    $http.get(appConfig.urls.python_backend + "/operation?operation_id=" + operation_id)
                                        .then(function (response) {
                                            try {
                                                parsed.block_num = response.data[0].block_num;
                                                var op_type = operationType(response.data[0].op[0]);
                                                parsed.op_type = op_type[0];
                                                parsed.op_color = op_type[1];
                                                $http.get(appConfig.urls.python_backend + "/block_header?block_num=" + parsed.block_num)
                                                    .then(function (response2) {
                                                        var time = new Date(response2.data.timestamp);
                                                        time = time.toLocaleString();
                                                        parsed.time = time
                                                        parsed.witness = response2.data.witness;
                                                    });
                                            }
                                            catch (err) {
                                            }
                                        });

                                    $scope.operations.unshift(parsed);
                                }
                            }
                            if ($scope.operations.length > 20)
                                $scope.operations.splice(20, 1);
                        });

                    }
                    else {
                        //console.log(pager);
                        //console.log($scope.dataStream);
                        if($scope.dataStream)
                            $scope.dataStream.close(true);

                        $http.get(appConfig.urls.python_backend + "/account_history_pager?account_id=" + name + "&page=" + pager)
                            .then(function (response) {
                                //console.log(response.data);
                                var operations = [];
                                var c = 0;
                                angular.forEach(response.data, function (value, key) {
                                    // get the timestampt from block header
                                    var timestamp;
                                    var witness;
                                    //console.log(value);
                                    var op = operationType(value.op[0]);
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
                                    operations.push(parsed);
                                });
                                $scope.operations = operations;
                                $scope.currentPage = page;
                                //$scope.total_ops = total_ops;
                            });
                    }

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

                //console.log($scope.currentPage);
                //if(update) {
                    // get static account history
/*
                    $http.get(appConfig.urls.python_backend + "/account_history?account_id=" + name)
                        .then(function (response) {
                            //console.log(response.data);
                            var operations = [];
                            var c = 0;
                            angular.forEach(response.data, function (value, key) {
                                // get the timestampt from block header
                                var timestamp;
                                var witness;
                                //console.log(value);
                                var op = operationType(value.op[0]);
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
                                operations.push(parsed);
                            });
                            $scope.operations = operations;
                            $scope.currentPage = 0;
                        });
*/

                    }
			//}
		}
		else {
			var init;
            if(path == "/accounts") {
				$http.get(appConfig.urls.python_backend + "/accounts")
					.then(function(response) {
						//console.log(response.data);
						var richs = [];
						for(var i = 0; i < response.data.length; i++) { // for de 100 y ya esta
                            var amount = formatBalance(response.data[i].amount, 5);
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

        function formatBalance(number, presicion) {

            var result;
            var divideby =  Math.pow(10, presicion);
            var res = Number(number/divideby);
            return res;
        }

        function objectType(id) {
            var name;
            var color;
            var parts = id.split(".");
            var object_type = "";
            if (parts[0] == "1" && parts[1] == "1")
                object_type = "BASE";
            else if (parts[0] == "1" && parts[1] == "2")
                object_type = "ACCOUNT";
            else if (parts[0] == "1" && parts[1] == "3")
                object_type = "ASSET";
            else if (parts[0] == "1" && parts[1] == "4")
                object_type = "FORCE SETTLEMENT";
            else if (parts[0] == "1" && parts[1] == "5")
                object_type = "COMMITE MEMBER";
            else if (parts[0] == "1" && parts[1] == "6")
                object_type = "WITNESS";
            else if (parts[0] == "1" && parts[1] == "7")
                object_type = "LIMIT ORDER";
            else if (parts[0] == "1" && parts[1] == "8")
                object_type = "CALL ORDER";
            else if (parts[0] == "1" && parts[1] == "9")
                object_type = "CUSTOM";
            else if (parts[0] == "1" && parts[1] == "10")
                object_type = "PROPOSAL";
            else if (parts[0] == "1" && parts[1] == "11")
                object_type = "OPERATION HISTORY";
            else if (parts[0] == "1" && parts[1] == "12")
                object_type = "WITHDRAW PERMISSION";
            else if (parts[0] == "1" && parts[1] == "13")
                object_type = "VESTING BALANCE";
            else if (parts[0] == "1" && parts[1] == "14")
                object_type = "WORKER";
            else if (parts[0] == "1" && parts[1] == "15")
                object_type = "BALANCE";
            else if (parts[0] == "2" && parts[1] == "0")
                object_type = "GLOBAL PROPERTY";
            else if (parts[0] == "2" && parts[1] == "1")
                object_type = "DYNAMIC GLOBAL PROPERTY";
            //else if (parts[0] == "2" && parts[1] == "2")
            //    object_type = "ASSET DYNAMIC DATA";
            else if (parts[0] == "2" && parts[1] == "3")
                object_type = "ASSET DYNAMIC DATA";
            else if (parts[0] == "2" && parts[1] == "4")
                object_type = "ASSET BITASSET DATA";
            else if (parts[0] == "2" && parts[1] == "5")
                object_type = "ACCOUNT BALANCE";
            else if (parts[0] == "2" && parts[1] == "6")
                object_type = "ACCOUNT STATISTICS";
            else if (parts[0] == "2" && parts[1] == "7")
                object_type = "TRANSACTION";
            else if (parts[0] == "2" && parts[1] == "8")
                object_type = "BLOCK SUMMARY";
            else if (parts[0] == "2" && parts[1] == "9")
                object_type = "ACCOUNT TRANSACTION HISTORY";
            else if (parts[0] == "2" && parts[1] == "10")
                object_type = "BLINDER BALANCE";
            else if (parts[0] == "2" && parts[1] == "11")
                object_type = "CHAIN PROPERTY";
            else if (parts[0] == "2" && parts[1] == "12")
                object_type = "WITNESS SCHEDULE";
            else if (parts[0] == "2" && parts[1] == "13")
                object_type = "BUDGET RECORD";
            else if (parts[0] == "2" && parts[1] == "14")
                object_type = "SPECIAL AUTHORITY";

            return object_type;
        }

        function operationType(opType) {
            var name;
            var color;
            var results = [];
            if(opType == 0) {
                name = "TRANSFER";
                color = "81CA80";
            }
            else if(opType == 1) {
                name = "LIMIT ORDER CREATE";
                color = "6BBCD7";
            }
            else if(opType == 2) {
                name = "LIMIT ORDER CANCEL";
                color = "E9C842";
            }
            else if(opType == 3) {
                name = "CALL ORDER UPDATE";
                color = "E96562";
            }
            else if(opType == 4) {
                name = "FILL ORDER (VIRTUAL)";
                color = "008000";
            }
            else if(opType == 5) {
                name = "ACCOUNT CREATE";
                color = "CCCCCC";
            }
            else if(opType == 6) {
                name = "ACCOUNT UPDATE";
                color = "FF007F";
            }
            else if(opType == 7) {
                name = "ACCOUNT WHIELIST";
                color = "FB8817";
            }
            else if(opType == 8) {
                name = "ACCOUNT UPGRADE";
                color = "552AFF";
            }
            else if(opType == 9) {
                name = "ACCOUNT TRANSFER";
                color = "AA2AFF";
            }
            else if(opType == 10) {
                name = "ASSET CREATE";
                color = "D400FF";
            }
            else if(opType == 11) {
                name = "ASSET UPDATE";
                color = "0000FF";
            }
            else if(opType == 12) {
                name = "ASSET UPDATE BITASSET";
                color = "AA7FFF";
            }
            else if(opType == 13) {
                name = "ASSET UPDATE FEED PRODUCERS";
                color = "2A7FFF";
            }
            else if(opType == 14) {
                name = "ASSET ISSUE";
                color = "7FAAFF";
            }
            else if(opType == 15) {
                name = "ASSET RESERVE";
                color = "55FF7F";
            }
            else if(opType == 16) {
                name = "ASSET FUND FEE POOL";
                color = "55FF7F";
            }
            else if(opType == 17) {
                name = "ASSET SETTLE";
                color = "FFFFAA";
            }
            else if(opType == 18) {
                name = "ASSET GLOBAL SETTLE";
                color = "FFFF7F";
            }
            else if(opType == 19) {
                name = "ASSET PUBLISH FEED";
                color = "FF2A55";
            }
            else if(opType == 20) {
                name = "WITNESS UPDATE";
                color = "FFAA7F";
            }
            else if(opType == 21) {
                name = "PROPOSAL CREATE";
                color = "FFAA55";
            }
            else if(opType == 22) {
                name = "PROPOSAL UPDATE";
                color = "FF7F55";
            }
            else if(opType == 23) {
                name = "PROPOSAL DELETE";
                color = "FF552A";
            }
            else if(opType == 24) {
                name = "WITHDRAW PERMISSION CREATE";
                color = "FF00AA";
            }
            else if(opType == 25) {
                name = "WITHDRAW PERMISSION";
                color = "FF00FF";
            }
            else if(opType == 26) {
                name = "WITHDRAW PERMISSION CLAIM";
                color = "FF0055";
            }
            else if(opType == 27) {
                name = "WITHDRAW PERMISSION DELETE";
                color = "37B68Cc";
            }
            else if(opType == 28) {
                name = "COMITEE MEMBER CREATE";
                color = "37B68C";
            }
            else if(opType == 29) {
                name = "COMITEE MEMBER UPDATE";
                color = "6712E7";
            }
            else if(opType == 30) {
                name = "COMITEE MEMBER UPDATE GLOBAL PARAMETERS";
                color = "B637B6";
            }
            else if(opType == 31) {
                name = "VESTING BALANCE CREATE";
                color = "A5A5A5";
            }
            else if(opType == 32) {
                name = "VESTING BALANCE WITHDRAW";
                color = "696969";
            }
            else if(opType == 33) {
                name = "WORKER CREATE";
                color = "0F0F0F";
            }
            else if(opType == 34) {
                name = "CUSTOM";
                color = "0DB762";
            }
            else if(opType == 35) {
                name = "ASSERT";
                color = "FFFFFF";
            }
            else if(opType == 36) {
                name = "BALANCE CLAIM";
                color = "939314";
            }
            else if(opType == 37) {
                name = "OVERRIDE TRANSFER";
                color = "8D0DB7";
            }
            else if(opType == 38) {
                name = "TRANSFER TO BLIND";
                color = "C4EFC4";
            }
            else if(opType == 39) {
                name = "BLIND TRANSFER";
                color = "F29DF2";
            }
            else if(opType == 40) {
                name = "TRANSFER FROM BLIND";
                color = "9D9DF2";
            }
            else if(opType == 41) {
                name = "ASSET SETTLE CANCEL";
                color = "4ECEF8";
            }
            else if(opType == 42) {
                name = "ASSET CLAIM FEES";
                color = "F8794E";
            }
            else if(opType == 43) {
                name = "FBA DISTRIBUTE";
                color = "8808B2";
            }
            results[0] = name;
            results[1] = color;
            return results;
        }
    }

})();
