(function () {
    'use strict';

    angular.module('app.operations')
        .controller('operationsCtrl', ['$scope', '$filter', '$routeParams', '$http', 'appConfig', 'utilities', operationsCtrl]);

    function operationsCtrl($scope, $filter, $routeParams, $http, appConfig, utilities) {

        var block_num = "";
        var block_time = "";
        var virtual_op = "";
        var trx_in_block = "";
        var op_in_trx = "";
        var result = [];
        var type = "";
        var name = $routeParams.name;

        $http.get(appConfig.urls.python_backend + "/operation_full_elastic?operation_id=" + name)
            .then(function(response) {
                //console.log(response.data[0]);
                block_num = response.data[0].block_num;
                block_time = response.data[0].block_time;
                virtual_op = response.data[0].virtual_op;
                trx_in_block = response.data[0].trx_in_block;
                op_in_trx = response.data[0].op_in_trx;
                result = response.data[0].result;
                type = response.data[0].op[0];
                //console.log(response.data[0]);
                var raw_obj = response.data[0].op[1];
                var op_type = operationType(type);

                var operation_text = "";
                operation_text = utilities.opText(appConfig, $http, type, raw_obj, function(returnData) {
                    $scope.data = { name: name , block_num: block_num, virtual_op: virtual_op, trx_in_block: trx_in_block, op_in_trx: op_in_trx , result: result, type: op_type[0], color: op_type[1], raw: raw_obj, operation_text: returnData, block_time: block_time};

                });
            });
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
            name = "WITNESS CREATE";
            color = "FFAA7F";
        }
        else if(opType == 21) {
            name = "WITNESS UPDATE";
            color = "F1AA2A";
        }
        else if(opType == 22) {
            name = "PROPOSAL CREATE";
            color = "FFAA55";
        }
        else if(opType == 23) {
            name = "PROPOSAL UPDATE";
            color = "FF7F55";
        }
        else if(opType == 24) {
            name = "PROPOSAL DELETE";
            color = "FF552A";
        }
        else if(opType == 25) {
            name = "WITHDRAW PERMISSION CREATE";
            color = "FF00AA";
        }
        else if(opType == 26) {
            name = "WITHDRAW PERMISSION";
            color = "FF00FF";
        }
        else if(opType == 27) {
            name = "WITHDRAW PERMISSION CLAIM";
            color = "FF0055";
        }
        else if(opType == 28) {
            name = "WITHDRAW PERMISSION DELETE";
            color = "37B68Cc";
        }
        else if(opType == 29) {
            name = "COMITEE MEMBER CREATE";
            color = "37B68C";
        }
        else if(opType == 30) {
            name = "COMITEE MEMBER UPDATE";
            color = "6712E7";
        }
        else if(opType == 31) {
            name = "COMITEE MEMBER UPDATE GLOBAL PARAMETERS";
            color = "B637B6";
        }
        else if(opType == 32) {
            name = "VESTING BALANCE CREATE";
            color = "A5A5A5";
        }
        else if(opType == 33) {
            name = "VESTING BALANCE WITHDRAW";
            color = "696969";
        }
        else if(opType == 34) {
            name = "WORKER CREATE";
            color = "0F0F0F";
        }
        else if(opType == 35) {
            name = "CUSTOM";
            color = "0DB762";
        }
        else if(opType == 36) {
            name = "ASSERT";
            color = "FFFFFF";
        }
        else if(opType == 37) {
            name = "BALANCE CLAIM";
            color = "939314";
        }
        else if(opType == 38) {
            name = "OVERRIDE TRANSFER";
            color = "8D0DB7";
        }
        else if(opType == 39) {
            name = "TRANSFER TO BLIND";
            color = "C4EFC4";
        }
        else if(opType == 40) {
            name = "BLIND TRANSFER";
            color = "F29DF2";
        }
        else if(opType == 41) {
            name = "TRANSFER FROM BLIND";
            color = "9D9DF2";
        }
        else if(opType == 42) {
            name = "ASSET SETTLE CANCEL";
            color = "4ECEF8";
        }
        else if(opType == 43) {
            name = "ASSET CLAIM FEES";
            color = "F8794E";
        }
        else if(opType == 44) {
            name = "FBA DISTRIBUTE";
            color = "8808B2";
        }
        results[0] = name;
        results[1] = color;
        return results;
    }

})();
