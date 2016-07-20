map_module.controller('mapsController', function($scope, $location, $http){
  $scope.chooseLocation = function(){
    var element = angular.element(document.querySelector('#maptest'));
    $http.get('https://maps.googleapis.com/maps/api/geocode/json?address='+$scope.location.name+'&key=AIzaSyC3SQ3ovU47it6DB23_yZTfCbWTOT3r_1E').success(function($http){
      console.log($http)

      element.html("<div id='map'></div><script>var map;function initMap() {map = new google.maps.Map(document.getElementById('map'), {center: {lat: "+$http.results[0].geometry.location.lat+", lng: "+$http.results[0].geometry.location.lng+"},zoom: 15});var marker = new google.maps.Marker({position:{lat: "+$http.results[0].geometry.location.lat+", lng: "+$http.results[0].geometry.location.lng+"}, map: map, title: 'Meet Up Here' })}</script><script src='https://maps.googleapis.com/maps/api/js?key=AIzaSyC3SQ3ovU47it6DB23_yZTfCbWTOT3r_1E&callback=initMap'async defer></script>")
      socket.emit('location_sumbitted', {location: $scope.location.name, lat: $http.results[0].geometry.location.lat, lng: $http.results[0].geometry.location.lng})
      $scope.location = {}
    })
  }
})
