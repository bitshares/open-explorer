(function() {
    'use strict';

    angular.module('app').factory('accountService', accountService);
    accountService.$inject = ['$http', 'appConfig', 'utilities'];

    function accountService($http, appConfig, utilities) {

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
            }
        };
    }

})();
