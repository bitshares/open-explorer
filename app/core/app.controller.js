(function () {
    'use strict';

    angular.module('app')
        .controller('AppCtrl', [ '$scope', '$rootScope', '$route', '$document', 'appConfig', AppCtrl]);

    function AppCtrl($scope, $rootScope, $route, $document, appConfig) {

        $scope.pageTransitionOpts = appConfig.pageTransitionOpts;
        $scope.main = appConfig.main;
        $scope.color = appConfig.color;
        $rootScope.$on("$routeChangeSuccess", function (event, currentRoute, previousRoute) {
            //$document.scrollTo(0, 0);
        });
    }

})(); 