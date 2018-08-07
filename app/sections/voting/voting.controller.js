(function () {
    'use strict';

    angular.module('app.voting')
        .controller('votingCtrl', ['$scope', 'governanceService', votingCtrl]);

    function votingCtrl($scope, governanceService) {

        governanceService.getProxies(function (returnData) {
            $scope.proxies = returnData;
        });
        governanceService.getWitnessVotes(function (returnData) {
            $scope.witnesses = returnData;
        });
        governanceService.getWorkersVotes(function (returnData) {
            $scope.workers = returnData;
        });
        governanceService.getCommitteeVotes(function (returnData) {
            $scope.committee = returnData;
        });
    }

})();
