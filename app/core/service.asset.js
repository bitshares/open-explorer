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

                        var name_lower = value[1].replace("OPEN.", "").toLowerCase();
                        var url = "http://open-explorer/images/asset-symbols/" + name_lower + ".png";
                        var image_url = "";

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

                        $http({method: 'GET', url: url}).then(function successCallback(response) {
                            image_url = "images/asset-symbols/" + name_lower + ".png";
                            asset.push({image_url: image_url});
                            assets.push(asset);
                        }, function errorCallback(response) {
                            image_url = "images/asset-symbols/white.png";
                            asset.push({image_url: image_url});
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
            }
        };
    }

})();
