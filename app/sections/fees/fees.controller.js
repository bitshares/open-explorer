(function () {
    'use strict';

    angular.module('app.fees')
        .controller('feesCtrl', ['$scope', 'utilities', 'networkService', feesCtrl]);

    function feesCtrl($scope, utilities, networkService) {

        networkService.getFees(function (returnData) {
            $scope.fees = returnData;
        });

        utilities.columnsort($scope, "identifier", "sortColumn", "sortClass", "reverse", "reverseclass", "column");

    }
})();
