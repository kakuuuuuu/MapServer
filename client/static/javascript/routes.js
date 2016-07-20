var socket = io.connect();
var map_module = angular.module('map_app', ['ngRoute', 'ngStorage'])
////////////////////////////////////////////////login controller////////////////////////////////////////////////

////////////////////////////////////////////////routes provider////////////////////////////////////////////////

map_module.config(function ($routeProvider) {
      $routeProvider
        .when('/',{
            templateUrl: 'partials/location.html'
        })
        .when('/map',{
            templateUrl: 'partials/map.html'
        })
        .otherwise({
          redirectTo: '/'
        });
    });
