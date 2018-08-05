(function() {
    'use strict';

    angular.module('app')
        .factory('utilities', [utilities]);

    function utilities() {

        function formatNumber(x) {
            try {
                var parts = x.toString().split(".");

                if (x < 1) { parts[1] = parts[1]; }
                else if (x > 1 && x < 100) { parts[1] = parts[1].substr(0, 2); }
                else if (x > 100 && x < 1000) { parts[1] = parts[1].substr(0, 1); }
                else if (x > 1000) { parts[1] = ""; }

                parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                if (x > 1000) { return parts[0]; }
                else { return parts.join("."); }
            }
            catch(err) {
                return x;
            }
        }

        return {
            opText: function (appConfig, $http, operation_type, operation, callback) {
                var operation_account = 0;
                var operation_text;
                var fee_paying_account;

                if (operation_type === 0) {
                    var from = operation.from;
                    var to = operation.to;

                    var amount_asset_id = operation.amount.asset_id;
                    var amount_amount = operation.amount.amount;

                    operation_account = from;

                    $http.get(appConfig.urls.python_backend + "/account_name?account_id=" + operation_account)
                        .then(function (response_name) {

                            // get me the to name:
                            $http.get(appConfig.urls.python_backend + "/account_name?account_id=" + to)
                                .then(function (response_name_to) {
                                    var to_name = response_name_to.data;

                                    $http.get(appConfig.urls.python_backend + "/get_asset?asset_id=" + amount_asset_id)
                                        .then(function (response_asset) {

                                            var asset_name = response_asset.data[0]["symbol"];
                                            var asset_precision = response_asset.data[0]["precision"];

                                            var divideby = Math.pow(10, asset_precision);
                                            var amount = Number(amount_amount / divideby);

                                            operation_text =  "<a href='/#/accounts/" + from + "'>" + response_name.data + "</a>";
                                            operation_text = operation_text + " sent " + formatNumber(amount) + " <a href='/#/assets/" + amount_asset_id + "'>" + asset_name + "</a> to <a href='/#/accounts/" + to + "'>" + to_name + "</a>";

                                            callback(operation_text);
                                    });
                            });
                    });
                }
                else if (operation_type === 1) {
                    var seller = operation.seller;
                    operation_account = seller;

                    var amount_to_sell_asset_id = operation.amount_to_sell.asset_id;
                    var amount_to_sell_amount = operation.amount_to_sell.amount;

                    var min_to_receive_asset_id = operation.min_to_receive.asset_id;
                    var min_to_receive_amount = operation.min_to_receive.amount;

                    $http.get(appConfig.urls.python_backend + "/account_name?account_id=" + operation_account)
                        .then(function (response_name) {

                            $http.get(appConfig.urls.python_backend + "/get_asset?asset_id=" + amount_to_sell_asset_id)
                                .then(function (response_asset1) {

                                    var sell_asset_name = response_asset1.data[0]["symbol"];
                                    var sell_asset_precision = response_asset1.data[0]["precision"];

                                    var divideby = Math.pow(10, sell_asset_precision);
                                    var sell_amount = Number(amount_to_sell_amount / divideby);

                                    $http.get(appConfig.urls.python_backend + "/get_asset?asset_id=" + min_to_receive_asset_id)
                                        .then(function (response_asset2) {

                                            var receive_asset_name = response_asset2.data[0]["symbol"];
                                            var receive_asset_precision = response_asset2.data[0]["precision"];

                                            var divideby = Math.pow(10, receive_asset_precision);
                                            var receive_amount = Number(min_to_receive_amount / divideby);

                                            operation_text =  "<a href='/#/accounts/" + operation_account + "'>" + response_name.data + "</a>";
                                            operation_text = operation_text + " wants " + formatNumber(receive_amount) + " <a href='/#/assets/" + min_to_receive_asset_id + "'>" + receive_asset_name + "</a> for ";
                                            operation_text = operation_text + formatNumber(sell_amount) + " <a href='/#/assets/" + amount_to_sell_asset_id + "'>" + sell_asset_name + "</a>";
                                            callback(operation_text);
                                    });
                            });
                    });
                }
                else if (operation_type === 2) {
                    fee_paying_account = operation.fee_paying_account;
                    operation_account = fee_paying_account;

                    $http.get(appConfig.urls.python_backend + "/account_name?account_id=" + operation_account)
                        .then(function (response_name) {

                            operation_text = "<a href='/#/accounts/" + operation_account + "'>" + response_name.data + "</a> cancel order";
                            callback(operation_text);
                    });
                }
                else if (operation_type === 3) {
                    var funding_account = operation.funding_account;
                    var delta_collateral_asset_id = operation.delta_collateral.asset_id;
                    var delta_debt_asset_id = operation.delta_debt.asset_id;

                    $http.get(appConfig.urls.python_backend + "/account_name?account_id=" + funding_account)
                        .then(function (response_name) {

                            $http.get(appConfig.urls.python_backend + "/get_asset?asset_id=" + delta_collateral_asset_id)
                                .then(function (response_asset1) {

                                    var asset1 = response_asset1.data[0]["symbol"];

                                    $http.get(appConfig.urls.python_backend + "/get_asset?asset_id=" + delta_debt_asset_id)
                                        .then(function (response_asset2) {

                                            var asset2 = response_asset2.data[0]["symbol"];

                                            operation_text = "<a href='/#/accounts/" + operation_account + "'>" + response_name.data + "</a> update debt/collateral for ";
                                            operation_text = operation_text + "<a href='#/markets/" + asset1 + "/" + asset2 + "'>" + asset1 + "/" + asset2 + "</a>";
                                            callback(operation_text);
                                    });
                            });
                    });
                }
                else if (operation_type === 4) {
                    var account_id = operation.account_id;
                    operation_account = account_id;

                    var pays_asset_id = operation.pays.asset_id;
                    var pays_amount = operation.pays.amount;

                    var receives_asset_id = operation.receives.asset_id;
                    var receives_amount = operation.receives.amount;

                    $http.get(appConfig.urls.python_backend + "/account_name?account_id=" + operation_account)
                        .then(function (response_name) {


                            $http.get(appConfig.urls.python_backend + "/get_asset?asset_id=" + pays_asset_id)
                                .then(function (response_asset1) {

                                    var pays_asset_name = response_asset1.data[0]["symbol"];
                                    var pays_asset_precision = response_asset1.data[0]["precision"];

                                    var divideby = Math.pow(10, pays_asset_precision);

                                    var p_amount = parseFloat(pays_amount / divideby);

                                    $http.get(appConfig.urls.python_backend + "/get_asset?asset_id=" + receives_asset_id)
                                        .then(function (response_asset2) {

                                            var receive_asset_name = response_asset2.data[0]["symbol"];
                                            var receive_asset_precision = response_asset2.data[0]["precision"];

                                            var divideby = Math.pow(10, receive_asset_precision);
                                            var receive_amount = Number(receives_amount / divideby);

                                            operation_text = "<a href='/#/accounts/" + operation_account + "'>" + response_name.data + "</a>";
                                            operation_text = operation_text + " paid " + formatNumber(p_amount) + " <a href='/#/assets/" + pays_asset_id + "'>" + pays_asset_name + "</a> for ";
                                            operation_text = operation_text + formatNumber(receive_amount) + " <a href='/#/assets/" + receives_asset_id + "'>" + receive_asset_name + "</a>";
                                            callback(operation_text);
                                    });
                            });
                    });
                }
                else if (operation_type === 5) {
                    var registrar = operation.registrar;
                    var referrer =  operation.referrer;
                    var name =  operation.name;
                    operation_account = registrar;

                    $http.get(appConfig.urls.python_backend + "/account_name?account_id=" + operation_account)
                        .then(function (response_name) {

                            operation_text = "<a href='/#/accounts/" + operation_account + "'>" + response_name.data + "</a>  register <a href='/#/accounts/" + name + "'>" + name + "</a>";

                            if(registrar !== referrer) {

                                $http.get(appConfig.urls.python_backend + "/account_name?account_id=" + referrer)
                                    .then(function (response_name2) {

                                        operation_text = operation_text + " thanks to " + "<a href='/#/accounts/" + referrer + "'>" + response_name2.data + "</a>";
                                        callback(operation_text);
                                    });
                            }
                            else {
                                callback(operation_text);
                            }
                    });
                }
                else if (operation_type === 6) {
                    operation_account = operation.account;

                    $http.get(appConfig.urls.python_backend + "/account_name?account_id=" + operation_account)
                        .then(function (response_name) {

                            operation_text = "<a href='/#/accounts/" + operation_account + "'>" + response_name.data + "</a> updated account data";
                            callback(operation_text);
                    });
                }
                else if (operation_type === 14) {
                    var issuer = operation.issuer;
                    var issue_to_account =  operation.issue_to_account;
                    var asset_to_issue_amount = operation.asset_to_issue.amount;
                    var asset_to_issue_asset_id = operation.asset_to_issue.asset_id;

                    $http.get(appConfig.urls.python_backend + "/account_name?account_id=" + issuer)
                        .then(function (response_name) {

                            $http.get(appConfig.urls.python_backend + "/get_asset?asset_id=" + asset_to_issue_asset_id)
                                .then(function (response_asset) {

                                    var asset_name = response_asset.data[0]["symbol"];
                                    var asset_precision = response_asset.data[0]["precision"];

                                    var divideby = Math.pow(10, asset_precision);
                                    var amount = Number(asset_to_issue_amount / divideby);

                                    $http.get(appConfig.urls.python_backend + "/account_name?account_id=" + issue_to_account)
                                        .then(function (response_name2) {

                                        operation_text = "<a href='/#/accounts/" + issuer + "'>" + response_name.data + "</a>  issued " + amount;
                                        operation_text = operation_text + " <a href='/#/assets/" + asset_to_issue_asset_id + "'>" + response_asset.data[0]["symbol"] + "</a>";
                                        operation_text = operation_text + " to <a href='/#/accounts/" + issue_to_account + "'>" + response_name2.data + "</a>";
                                        callback(operation_text);
                                    });
                            });
                    });
                }

                else if (operation_type === 15) {
                    operation_account = operation.payer;

                    var amount_to_reserve_amount = operation.amount_to_reserve.amount;
                    var amount_to_reserve_asset_id = operation.amount_to_reserve.asset_id;

                    $http.get(appConfig.urls.python_backend + "/account_name?account_id=" + operation_account)
                        .then(function (response_name) {

                            $http.get(appConfig.urls.python_backend + "/get_asset?asset_id=" + amount_to_reserve_asset_id)
                                .then(function (response_asset) {

                                    var asset_name = response_asset.data[0]["symbol"];
                                    var asset_precision = response_asset.data[0]["precision"];
                                    var divideby = Math.pow(10, asset_precision);
                                    var amount = Number(amount_to_reserve_amount / divideby);

                                    operation_text = "<a href='/#/accounts/" + operation_account + "'>" + response_name.data +
                                        "</a> burned(reserved) " + formatNumber(amount) + " <a href='/#/assets/" + amount_to_reserve_asset_id + "'>" +
                                        asset_name + "</a>";
                                    callback(operation_text);
                            });
                    });
                }

                else if (operation_type === 19) {
                    var publisher = operation.publisher;
                    var asset_id =  operation.asset_id;
                    operation_account = publisher;

                    $http.get(appConfig.urls.python_backend + "/account_name?account_id=" + operation_account)
                        .then(function (response_name) {

                            $http.get(appConfig.urls.python_backend + "/get_asset?asset_id=" + asset_id)
                                .then(function (response_asset) {

                                    operation_text = "<a href='/#/accounts/" + operation_account + "'>" + response_name.data + "</a>  published feed for ";
                                    operation_text = operation_text + "<a href='/#/assets/" + asset_id + "'>" + response_asset.data[0]["symbol"] + "</a>";
                                    callback(operation_text);
                            });
                    });
                }
                else if (operation_type === 22) {
                    fee_paying_account = operation.fee_paying_account;
                    operation_account = fee_paying_account;

                    $http.get(appConfig.urls.python_backend + "/account_name?account_id=" + operation_account)
                        .then(function (response_name) {
                            operation_text = "<a href='/#/accounts/" + operation_account + "'>" + response_name.data + "</a>  created a proposal";
                            callback(operation_text);
                    });
                }
                else if (operation_type === 23) {
                    fee_paying_account = operation.fee_paying_account;
                    var proposal = operation.proposal;
                    operation_account = fee_paying_account;

                    $http.get(appConfig.urls.python_backend + "/account_name?account_id=" + operation_account)
                        .then(function (response_name) {
                            operation_text = "<a href='/#/accounts/" + operation_account + "'>" + response_name.data + "</a>  updated ";
                            operation_text = operation_text + " proposal <a href='/#objects/"+proposal+"'>"+proposal+"</a>";
                            callback(operation_text);
                    });
                }
                else {
                    operation_text = "";
                    callback(operation_text);
                }

            },
            operationType: function (opType) {
                var name;
                var color;
                var results = [];
                if(opType === 0) {
                    name = "TRANSFER";
                    color = "81CA80";
                }
                else if(opType === 1) {
                    name = "LIMIT ORDER CREATE";
                    color = "6BBCD7";
                }
                else if(opType === 2) {
                    name = "LIMIT ORDER CANCEL";
                    color = "E9C842";
                }
                else if(opType === 3) {
                    name = "CALL ORDER UPDATE";
                    color = "E96562";
                }
                else if(opType === 4) {
                    name = "FILL ORDER (VIRTUAL)";
                    color = "008000";
                }
                else if(opType === 5) {
                    name = "ACCOUNT CREATE";
                    color = "CCCCCC";
                }
                else if(opType === 6) {
                    name = "ACCOUNT UPDATE";
                    color = "FF007F";
                }
                else if(opType === 7) {
                    name = "ACCOUNT WHIELIST";
                    color = "FB8817";
                }
                else if(opType === 8) {
                    name = "ACCOUNT UPGRADE";
                    color = "552AFF";
                }
                else if(opType === 9) {
                    name = "ACCOUNT TRANSFER";
                    color = "AA2AFF";
                }
                else if(opType === 10) {
                    name = "ASSET CREATE";
                    color = "D400FF";
                }
                else if(opType === 11) {
                    name = "ASSET UPDATE";
                    color = "0000FF";
                }
                else if(opType === 12) {
                    name = "ASSET UPDATE BITASSET";
                    color = "AA7FFF";
                }
                else if(opType === 13) {
                    name = "ASSET UPDATE FEED PRODUCERS";
                    color = "2A7FFF";
                }
                else if(opType === 14) {
                    name = "ASSET ISSUE";
                    color = "7FAAFF";
                }
                else if(opType === 15) {
                    name = "ASSET RESERVE";
                    color = "55FF7F";
                }
                else if(opType === 16) {
                    name = "ASSET FUND FEE POOL";
                    color = "55FF7F";
                }
                else if(opType === 17) {
                    name = "ASSET SETTLE";
                    color = "FFFFAA";
                }
                else if(opType === 18) {
                    name = "ASSET GLOBAL SETTLE";
                    color = "FFFF7F";
                }
                else if(opType === 19) {
                    name = "ASSET PUBLISH FEED";
                    color = "FF2A55";
                }
                else if(opType === 20) {
                    name = "WITNESS CREATE";
                    color = "FFAA7F";
                }
                else if(opType === 21) {
                    name = "WITNESS UPDATE";
                    color = "F1AA2A";
                }
                else if(opType === 22) {
                    name = "PROPOSAL CREATE";
                    color = "FFAA55";
                }
                else if(opType === 23) {
                    name = "PROPOSAL UPDATE";
                    color = "FF7F55";
                }
                else if(opType === 24) {
                    name = "PROPOSAL DELETE";
                    color = "FF552A";
                }
                else if(opType === 25) {
                    name = "WITHDRAW PERMISSION CREATE";
                    color = "FF00AA";
                }
                else if(opType === 26) {
                    name = "WITHDRAW PERMISSION";
                    color = "FF00FF";
                }
                else if(opType === 27) {
                    name = "WITHDRAW PERMISSION CLAIM";
                    color = "FF0055";
                }
                else if(opType === 28) {
                    name = "WITHDRAW PERMISSION DELETE";
                    color = "37B68Cc";
                }
                else if(opType === 29) {
                    name = "COMITEE MEMBER CREATE";
                    color = "37B68C";
                }
                else if(opType === 30) {
                    name = "COMITEE MEMBER UPDATE";
                    color = "6712E7";
                }
                else if(opType === 31) {
                    name = "COMITEE MEMBER UPDATE GLOBAL PARAMETERS";
                    color = "B637B6";
                }
                else if(opType === 32) {
                    name = "VESTING BALANCE CREATE";
                    color = "A5A5A5";
                }
                else if(opType === 33) {
                    name = "VESTING BALANCE WITHDRAW";
                    color = "696969";
                }
                else if(opType === 34) {
                    name = "WORKER CREATE";
                    color = "0F0F0F";
                }
                else if(opType === 35) {
                    name = "CUSTOM";
                    color = "0DB762";
                }
                else if(opType === 36) {
                    name = "ASSERT";
                    color = "FFFFFF";
                }
                else if(opType === 37) {
                    name = "BALANCE CLAIM";
                    color = "939314";
                }
                else if(opType === 38) {
                    name = "OVERRIDE TRANSFER";
                    color = "8D0DB7";
                }
                else if(opType === 39) {
                    name = "TRANSFER TO BLIND";
                    color = "C4EFC4";
                }
                else if(opType === 40) {
                    name = "BLIND TRANSFER";
                    color = "F29DF2";
                }
                else if(opType === 41) {
                    name = "TRANSFER FROM BLIND";
                    color = "9D9DF2";
                }
                else if(opType === 42) {
                    name = "ASSET SETTLE CANCEL";
                    color = "4ECEF8";
                }
                else if(opType === 43) {
                    name = "ASSET CLAIM FEES";
                    color = "F8794E";
                }
                else if(opType === 44) {
                    name = "FBA DISTRIBUTE";
                    color = "8808B2";
                }

                results[0] = name;
                results[1] = color;

                return results;
            },
            formatBalance: function (number, presicion) {
                var divideby =  Math.pow(10, presicion);
                return Number(number/divideby);
            },
            objectType: function (id) {
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
            },
            columnsort: function ($scope, column, sortColumn, sortClass, reverse, reverseclass, columnToSort) {

                $scope[column] = column;
                $scope[columnToSort] = column;


                // sort ordering (Ascending or Descending). Set true for desending
                $scope[reverse] = true;

                // called on header click
                $scope[sortColumn] = function(col){
                    $scope[columnToSort] = col;
                    if($scope[reverse]){
                        $scope[reverse] = false;
                        $scope[reverseclass] = 'arrow-up';
                    } else {
                        $scope[reverse] = true;
                        $scope[reverseclass] = 'arrow-down';
                    }
                };
                // remove and change class
                $scope[sortClass] = function(col) {
                    if ($scope[columnToSort] === col) {
                        //console.log($scope[column_name] + " - " + col);
                        if ($scope[reverse]) {
                            return 'arrow-down';
                        } else {
                            return 'arrow-up';
                        }
                    } else {
                        return '';
                    }
                };
            }
        }
    }

})();
