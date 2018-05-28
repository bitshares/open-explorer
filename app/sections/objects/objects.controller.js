(function () {
    'use strict';

    angular.module('app.objects')
        .controller('objectsCtrl', ['$scope', '$filter', '$routeParams', '$http', 'appConfig','utilities', objectsCtrl]);

    function objectsCtrl($scope, $filter, $routeParams, $http, appConfig, utilities) {

        var name = $routeParams.name;
        $http.get(appConfig.urls.python_backend + "/get_object?object=" + name)
            .then(function(response) {
                //console.log(response.data);

                var object_id = response.data[0].id;
                var object_type = utilities.objectType(object_id);

                $scope.data = { raw: response.data, name: name, type: object_type };
            });
    }
})();
