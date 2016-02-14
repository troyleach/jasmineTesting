var testingAngularApp = angular.module('testingAngularApp', []);

testingAngularApp.controller('testingAngularCtrl', function($rootScope, $scope, $http, $timeout){
  $scope.siteTitle = "Tesing AngularJS";
  $scope.title = "To learn how to test an AngularJS app";
  $scope.destinations = [];
  $scope.apiKey = "e3d427454f62baa56732a0e48c5fcb25";
  $scope.newDestination = {
    city: undefined,
    country: undefined
  };

  $scope.addDestination = function() {
    $scope.destinations.push(
      {
        city: $scope.newDestination.city,
        country: $scope.newDestination.country
      }
    );
  }

  $scope.removeDestination = function(index) {
    $scope.destinations.splice(index, 1);
  }





  $rootScope.messageWatcher = $rootScope.$watch('message', function() {
    if ($rootScope.message) {
      $timeout(function() {
        $rootScope.message = null; 
      }, 3000); 
    };
  });

});


  testingAngularApp.filter('warmestDestinations', function() {
    return function(destinations, minimumTemp) {
      var warmDestinations= [];

      angular.forEach(destinations, function(destination) {
console.log(destination);
        if(destination.weather && destination.weather.temp && destination.weather.temp >= minimumTemp)
        {
          warmDestinations.push(destination); 
        }
      });

      return warmDestinations;
    }; 
  });

  testingAngularApp.service('ConvertKelvin', function() {
      this.convertTempScale = function(temp, tempScale) {
        if(tempScale == "fahrenheit") {
          return Math.round((temp - 273) * 1.8 + 32)  
        } else if(tempScale == "celsius") {
          return Math.round(temp - 273 ); 
        } else {
          return "Sorry, I do not recognise that temperture scale"; 
        };
       }
    });

  testingAngularApp.directive('destinationDirective', function() {
    return {
      scope: {
              destination: '=',
              apiKey: '=',
              onRemove: '&'
             }, 
      template:
        '<span>{{destination.city}}, {{destination.country}}</span>' +
        '<span ng-if="destination.weather">' +
          '- {{destination.weather.main}}, {{destination.weather.temp}}' +
        '</span>' +
        '<button ng-click="onRemove()">Remove</button>' +
        '<button ng-click="getWeather(destination)">Update Weather</button>',
      controller: function ($http, $rootScope, $scope, ConvertKelvin) {
        $scope.getWeather = function(destination) {
          $http.get("http://api.openweathermap.org/data/2.5/weather?q=" + destination.city +  "&appid=" + $scope.apiKey).then(
              function successCallbak(response) {
                if(response.data.weather) {
                  destination.weather = {};
                  destination.weather.main = response.data.weather[0].main;
                  destination.weather.temp = ConvertKelvin.convertTempScale(response.data.main.temp, "fahrenheit");
                } else {
                  $rootScope.message = "City not found";  
                } 
              },
               function errorCallback(error) {
                  $rootScope.message = "Sever error";
               }
          );
        };
      }
    }  
   });

