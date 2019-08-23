(function() {
    'use strict';

    angular.module('app')
        .factory('appConfig', [appConfig]);


    angular.module('app').config(['AnalyticsProvider', function (AnalyticsProvider) {
        // Add configuration code as desired
        AnalyticsProvider.setAccount('UA-101388661-2');  //UU-XXXXXXX-X should be your tracking code
    }]).run(['Analytics', function(Analytics) { }]);

    angular.module('app').config(['$locationProvider', function($locationProvider) {
        $locationProvider.hashPrefix('');
    }]);

    function appConfig() {
        var pageTransitionOpts = [
            {
                name: 'Fade up',
                "class": 'animate-fade-up'
            }, {
                name: 'Scale up',
                "class": 'ainmate-scale-up'
            }, {
                name: 'Slide in from right',
                "class": 'ainmate-slide-in-right'
            }, {
                name: 'Flip Y',
                "class": 'animate-flip-y'
            }
        ];
        var date = new Date();
        var year = date.getFullYear();
        var main = {
            brand: 'Bitshares Explorer',
            name: 'oxarbitrage',
            api_link: 'https://github.com/oxarbitrage/bitshares-python-api-backend',
            source_code_link: 'https://github.com/oxarbitrage/open-explorer',
            year: year,
            pageTransition: pageTransitionOpts[0]
        };
        var color = {
            primary:    '#4E7FE1',
            success:    '#81CA80',
            info:       '#6BBCD7',
            infoAlt:    '#7266BD',
            warning:    '#E9C842',
            danger:     '#E96562',
            gray:       '#DCDCDC'
        };

        var urls = {
            websocket: "ws://bts-seoul.clockwork.gr/ws",
            //python_backend: "http://185.208.208.184:5000",
            python_backend: "https://explorer.bitshares-kibana.info/",
            //elasticsearch_wrapper: "https://eswrapper.bitshares.eu", // infrastructure
            elasticsearch_wrapper: "https://explorer.bitshares-kibana.info/", // clockwork
            //elasticsearch_wrapper: "/elastic",
            //udf_wrapper: "http://185.208.208.184:5001"
            udf_wrapper: "https://explorer.bitshares-kibana.info/udf"
        };

        return {
            pageTransitionOpts: pageTransitionOpts,
            main: main,
            color: color,
            urls: urls
        };
    }


})();
