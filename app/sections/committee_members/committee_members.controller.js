(function () {
    'use strict';

    angular.module('app.committee_members')
        .controller('committeeCtrl', ['$scope', 'utilities', 'governanceService', committeeCtrl]);

    function committeeCtrl($scope, utilities, governanceService) {

        governanceService.getCommitteeMembers(function (returnData) {
            $scope.active_committee = returnData[0];
            $scope.standby_committee = returnData[1];
        });

        utilities.columnsort($scope, "total_votes", "sortColumn", "sortClass", "reverse", "reverseclass", "column");
        utilities.columnsort($scope, "total_votes", "sortColumn2", "sortClass2", "reverse2", "reverseclass2", "column2");

    }
})();
