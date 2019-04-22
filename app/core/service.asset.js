(function() {
    'use strict';

    angular.module('app').factory('assetService', assetService);
    assetService.$inject = ['$http', 'appConfig', 'utilities'];

    function assetService($http, appConfig, utilities) {

        return {
            getActiveAssets: function(callback) {
                var assets = [];

                $http.get(appConfig.urls.python_backend + "/assets").then(function (response) {

                    angular.forEach(response.data, function (value, key) {

                        var market_cap;
                        var supply;

                        if (value.asset_name.indexOf("OPEN") >= 0 || value.asset_name.indexOf("RUDEX") >= 0 ||
                            value.asset_name.indexOf("BRIDGE") >= 0 || value.asset_name.indexOf("GDEX") >= 0) {
                            market_cap = "-";
                            supply = "-";
                        }
                        else {
                            market_cap = Math.round(value.market_cap / 100000); // in bts always by now
                            var precision = 100000;
                            if (value.precision) {
                                precision = Math.pow(10, value.precision);
                            }
                            supply = Math.round(value.current_supply / precision);
                        }
                        var volume = Math.round(value["24h_volume"]);

                        var asset = {
                            name: value.asset_name,
                            id: value.asset_id,
                            price: value.latest_price,
                            volume: volume,
                            type: value.asset_type,
                            market_cap: market_cap,
                            supply: supply,
                            holders: value.holders_count
                        };

                        /* Todo: create function */
                        var name_lower = value.asset_name.replace("OPEN.", "").toLowerCase();
                        var url = "images/asset-symbols/" + name_lower + ".png";
                        var image_url = "";
                        $http({method: 'GET', url: url}).then(function successCallback(response) {
                            image_url = "images/asset-symbols/" + name_lower + ".png";
                            asset.image_url = image_url;
                            assets.push(asset);
                        }, function errorCallback(response) {
                            image_url = "images/asset-symbols/white.png";
                            asset.image_url = image_url;
                            assets.push(asset);
                        });

                    });
                    callback(assets);
                });
            },
            getDexVolume: function(callback) {
                var dex;
                $http.get(appConfig.urls.python_backend + "/dex_total_volume").then(function (response) {
                    dex = {
                        volume_bts: response.data.volume_bts,
                        volume_cny: response.data.volume_cny,
                        volume_usd: response.data.volume_usd,
                        market_cap_bts: response.data.market_cap_bts.toString().slice(0, -12),
                        market_cap_cny: response.data.market_cap_cny.toString().slice(0, -12),
                        market_cap_usd: response.data.market_cap_usd.toString().slice(0, -12)
                    };
                    callback(dex);
                });
            },
            getAssetFull: function(asset_id, callback) {

                $http.get(appConfig.urls.python_backend + "/asset_and_volume?asset_id=" + asset_id).then(function(response) {

                    var type;
                    var description;
                    if (response.data.issuer === "1.2.0") {
                        description = response.data.options.description;
                        type = "SmartCoin";
                    }
                    else {
                        var description_p = response.data.options.description.split('"');
                        description = description_p[3];
                        type = "User Issued";
                    }
                    if (response.data.symbol === "BTS") {
                        type = "Core Token";
                    }

                    var long_description = false;
                    try {
                        if (description.length > 100) {
                            long_description = true;
                        }
                    }
                    catch (err) {
                    }

                    var asset  = {
                        symbol: response.data.symbol,
                        id: response.data.id,
                        description: description,
                        long_description: long_description,
                        max_supply: utilities.formatBalance(response.data.options.max_supply, response.data.precision),
                        issuer: response.data.issuer,
                        precision: response.data.precision,
                        current_supply: utilities.formatBalance(response.data.current_supply, response.data.precision),
                        confidential_supply: utilities.formatBalance(response.data.confidential_supply, response.data.precision),
                        issuer_name: response.data.issuer_name,
                        accumulated_fees: utilities.formatBalance(response.data.accumulated_fees, response.data.precision),
                        fee_pool: utilities.formatBalance(response.data.fee_pool, response.data.precision),
                        type: type,
                        volume: parseInt(response.data.volume),
                        market_cap: response.data.mcap/100000,
                        bitasset_data_id: response.data.bitasset_data_id,
                        dynamic_asset_data_id: response.data.dynamic_asset_data_id

                    };

                    /* Todo: create function */
                    var name_lower = response.data.symbol.replace("OPEN.", "").toLowerCase();
                    var url = "images/asset-symbols/" + name_lower + ".png";
                    var image_url = "";
                    $http({method: 'GET', url: url}).then(function successCallback(response22) {
                        image_url = "images/asset-symbols/" + name_lower + ".png";
                        asset.image_url = image_url;
                    }, function errorCallback(response22) {
                        image_url = "images/asset-symbols/white.png";
                        asset.image_url = image_url;
                    });

                    callback(asset);

                });
            },
            getAssetHolders: function(asset_id, precision, callback) {
                var accounts = [];
                $http.get(appConfig.urls.python_backend + "/asset_holders?asset_id=" + asset_id).then(function(response) {
                    angular.forEach(response.data, function(value, key) {
                        var account = {
                            name: value.name,
                            amount: utilities.formatBalance(value.amount, precision),
                            id: value.account_id
                        };
                        accounts.push(account);
                    });
                    callback(accounts);
                });
            },
            getAssetHoldersCount: function(asset_id, callback) {
                $http.get(appConfig.urls.python_backend + "/asset_holders_count?asset_id=" + asset_id).then(function(response) {
                    var holders_count = response.data;
                    callback(holders_count);
                });
            },
            getAssetNameAndPrecision: function(asset_id, callback) {
                var results = {};
                $http.get(appConfig.urls.python_backend + "/asset?asset_id=" + asset_id).then(function (response) {
                    results.symbol = response.data.symbol;
                    results.precision = response.data.precision;
                    callback(results);
                });
            }
        };
    }

})();
