(function () {
    'use strict';

    angular.module('app.objects')
        .controller('objectsCtrl', ['$scope', '$routeParams','networkService', objectsCtrl]);

    function objectsCtrl($scope, $routeParams, networkService) {

        var name = $routeParams.name;

        networkService.getBigBlocks(name, function (returnData) {
            $scope.data = returnData;
        });
    }
})();
