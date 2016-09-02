var market_module = angular.module('black_market', ['ngRoute', 'ngStorage', 'uiGmapgoogle-maps'])
////////////////////////////////////////////////routes provider////////////////////////////////////////////////
market_module.config(function ($routeProvider) {
      $routeProvider
        .when('/',{
          templateUrl: 'partials/profile.html'
        })
        .when('/search',{
          templateUrl: 'partials/search.html'
        })
        .when('/lobby',{
          templateUrl: 'partials/lobby.html'
        })
        .when('/room/:id',{
          templateUrl: 'partials/room.html'
        })
        .otherwise({
          redirectTo: '/'
        });
    });
// Directive for Angular-Google Maps
market_module.config(function(uiGmapGoogleMapApiProvider) {
    uiGmapGoogleMapApiProvider.configure({
        key: 'AIzaSyC3SQ3ovU47it6DB23_yZTfCbWTOT3r_1E',
        libraries: 'weather,geometry,visualization'
    });
})
// Directive for map loading gif
market_module.directive('loading', function () {
      return {
        restrict: 'E',
        replace:true,
        template: '<div class="loading"><img class="loading" src="../images/loading.gif"/></div>',
        link: function (scope, element, attr) {
              scope.$watch('loading', function (val) {
                  if (val)
                      $(element).show();
                  else
                      $(element).hide();
              });
        }
      }
  })
market_module.directive('schrollBottom', function () {
  return {
    scope: {
      schrollBottom: "="
    },
    link: function (scope, element) {
      scope.$watchCollection('schrollBottom', function (newValue) {
        if (newValue)
        {
          $(element).scrollTop($(element)[0].scrollHeight);
        }
      });
    }
  }
})
