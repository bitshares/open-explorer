(function () {
    'use strict';

    angular.module('app.witnesses')
        .controller('witnessesCtrl', ['$scope', 'utilities', 'governanceService', witnessesCtrl]);

    function witnessesCtrl($scope, utilities, governanceService) {
        
        governanceService.getWitnesses(function (returnData) {
            $scope.active_witnesses = returnData[0];
            $scope.standby_witnesses = returnData[1];
        });

        utilities.columnsort($scope, "total_votes", "sortColumn", "sortClass", "reverse", "reverseclass", "column");
        utilities.columnsort($scope, "total_votes", "sortColumn2", "sortClass2", "reverse2", "reverseclass2", "column2");
    }
    
})();
