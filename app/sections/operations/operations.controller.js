(function () {
    'use strict';

    angular.module('app.operations')
        .controller('operationsCtrl', ['$scope', '$routeParams', 'networkService', operationsCtrl]);

    function operationsCtrl($scope, $routeParams, networkService) {

        var name = $routeParams.name;
        networkService.getOperation(name, function (returnData) {
            $scope.data = returnData;
        });
    }
})();
