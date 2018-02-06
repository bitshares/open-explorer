(function () {
    'use strict';

    angular.module('app.objects')
        .controller('objectsCtrl', ['$scope', '$filter', '$routeParams', '$http', 'appConfig', objectsCtrl]);

    function objectsCtrl($scope, $filter, $routeParams, $http, appConfig) {

        var name = $routeParams.name;
        $http.get(appConfig.urls.python_backend + "/get_object?object=" + name)
            .then(function(response) {
                //console.log(response.data);

                var object_id = response.data[0].id;
                var object_type = objectType(object_id);

                $scope.data = { raw: response.data, name: name, type: object_type };
            });
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

})();
