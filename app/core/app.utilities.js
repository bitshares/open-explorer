(function() {
    'use strict';

    angular.module('app')
        .factory('utilities', [utilities]);

    function utilities() {

        function formatNumber(x) {
            var parts = x.toString().split(".");

            if(x < 1) parts[1] = parts[1];
            else if(x > 1 && x < 100) parts[1] = parts[1].substr(0,2);
            else if(x > 100 && x < 1000) parts[1] = parts[1].substr(0,1);
            else if(x > 1000) parts[1] = "";

            parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            if(x > 1000) return parts[0];
            else return parts.join(".");
        }

        return {
            opText: function (appConfig, $http, operation_type, operation, callback) {
                var operation_account = 0;
                var operation_text;

                if (operation_type == 0) {
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

                    //console.log(from);
                }
                else if (operation_type == 1) {
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

                                    //console.log(response_asset);

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
                else if (operation_type == 2) {
                    var fee_paying_account = operation.fee_paying_account;
                    operation_account = fee_paying_account;

                    $http.get(appConfig.urls.python_backend + "/account_name?account_id=" + operation_account)
                        .then(function (response_name) {

                            operation_text = "<a href='/#/accounts/" + operation_account + "'>" + response_name.data + "</a> cancel order";
                            callback(operation_text);
                        });

                }
                else if (operation_type == 3) {
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
                else if (operation_type == 4) {
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
                else if (operation_type == 5) {
                    var registrar = operation.registrar;
                    var referrer =  operation.referrer;
                    var name =  operation.name;
                    operation_account = registrar;

                    $http.get(appConfig.urls.python_backend + "/account_name?account_id=" + operation_account)
                        .then(function (response_name) {

                            operation_text = "<a href='/#/accounts/" + operation_account + "'>" + response_name.data + "</a>  register <a href='/#/accounts/" + name + "'>" + name + "</a>";

                            if(registrar != referrer) {

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
                else if (operation_type == 6) {
                    var operation_account = operation.account;

                    $http.get(appConfig.urls.python_backend + "/account_name?account_id=" + operation_account)
                        .then(function (response_name) {

                            operation_text = "<a href='/#/accounts/" + operation_account + "'>" + response_name.data + "</a> updated account data";
                            callback(operation_text);
                        });
                }


                else if (operation_type == 14) {
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


                else if (operation_type == 19) {
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
                else if (operation_type == 22) {
                    var fee_paying_account = operation.fee_paying_account;
                    operation_account = fee_paying_account;

                    $http.get(appConfig.urls.python_backend + "/account_name?account_id=" + operation_account)
                        .then(function (response_name) {
                            operation_text = "<a href='/#/accounts/" + operation_account + "'>" + response_name.data + "</a>  created a proposal";
                            callback(operation_text);
                        });
                }
                else if (operation_type == 23) {
                    var fee_paying_account = operation.fee_paying_account;
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


            }
        }
    }

})();
