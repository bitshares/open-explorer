(function () {
    'use strict';

    angular.module('app.workers')
        .controller('workersCtrl', ['$scope', 'utilities', 'governanceService', workersCtrl]);

    function workersCtrl($scope, utilities, governanceService) {
        
        governanceService.getWorkers(function (returnData) {
            $scope.workers_current = returnData[0];
            $scope.workers_expired = returnData[1];
        });

        utilities.columnsort($scope, "votes_for", "sortColumn", "sortClass", "reverse", "reverseclass", "column");
        utilities.columnsort($scope, "votes_for", "sortColumn2", "sortClass2", "reverse2", "reverseclass2", "column2");
    }

})();
