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

                        if (value[1].indexOf("OPEN") >= 0 || value[1].indexOf("RUDEX") >= 0 ||
                            value[1].indexOf("BRIDGE") >= 0 || value[1].indexOf("GDEX") >= 0) {
                            market_cap = "-";
                            supply = "-";
                        }
                        else {
                            market_cap = Math.round(value[5] / 100000); // in bts always by now
                            var precision = 100000;
                            if (value[10]) {
                                precision = Math.pow(10, value[10]);
                            }
                            supply = Math.round(value[7] / precision);
                        }
                        var volume = Math.round(value[4]);

                        var asset = {
                            name: value[1],
                            id: value[2],
                            price: value[3],
                            volume: volume,
                            type: value[6],
                            market_cap: market_cap,
                            supply: supply,
                            holders: value[8]
                        };

                        var name_lower = value[1].replace("OPEN.", "").toLowerCase();
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
                $http.get(appConfig.urls.python_backend + "/get_dex_total_volume").then(function (response) {
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

                $http.get(appConfig.urls.python_backend + "/get_asset_and_volume?asset_id=" + asset_id).then(function(response) {

                    var type;
                    var description;
                    if (response.data[0].issuer === "1.2.0") {
                        description = response.data[0].options.description;
                        type = "SmartCoin";
                    }
                    else {
                        var description_p = response.data[0].options.description.split('"');
                        description = description_p[3];
                        type = "User Issued";
                    }
                    if (response.data[0].symbol === "BTS") {
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
                        symbol: response.data[0].symbol,
                        id: response.data[0].id,
                        description: description,
                        long_description: long_description,
                        max_supply: utilities.formatBalance(response.data[0].options.max_supply, response.data[0].precision),
                        issuer: response.data[0].issuer,
                        precision: response.data[0].precision,
                        current_supply: utilities.formatBalance(response.data[0].current_supply, response.data[0].precision),
                        confidential_supply: utilities.formatBalance(response.data[0].confidential_supply, response.data[0].precision),
                        //holders: response2.data,
                        issuer_name: response.data[0].issuer_name,
                        accumulated_fees: utilities.formatBalance(response.data[0].accumulated_fees, response.data[0].precision),
                        fee_pool: utilities.formatBalance(response.data[0].fee_pool, response.data[0].precision),
                        type: type,
                        //image_url: image_url,
                        volume: parseInt(response.data[0].volume),
                        market_cap: response.data[0].mcap/100000
                    };

                    var name_lower = response.data[0].symbol.replace("OPEN.", "").toLowerCase();
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
                $http.get(appConfig.urls.python_backend + "/get_asset_holders?asset_id=" + asset_id).then(function(response) {
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
                $http.get(appConfig.urls.python_backend + "/get_asset_holders_count?asset_id=" + asset_id).then(function(response) {
                    var holders_count = response.data;
                    callback(holders_count);
                });
            }

        };
    }

})();
