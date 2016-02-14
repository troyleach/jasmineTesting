describe("Testing AngularJS test suite", function() {
  beforeEach(module('testingAngularApp'));

  describe("Testing angularjs controller", function() {
    var scope, ctrl, httpBackend, timeout, $rootScope;

    beforeEach(inject(function($controller, $rootScope, $httpBackend, $timeout) {
      rootScope = $rootScope;
      scope = $rootScope.$new();
      ctrl = $controller('testingAngularCtrl', {$scope:scope});
      httpBackend = $httpBackend;
      timeout = $timeout;
    }));

    afterEach(function() {
     httpBackend.verifyNoOutstandingExpectation();
     httpBackend.verifyNoOutstandingRequest();
    });

    it("expect initialize the title in the scope", function() {
      expect(scope.title).toBeDefined();
      expect(scope.siteTitle).toBeDefined();
    
      expect(scope.siteTitle).toBe("Tesing AngularJS");
      expect(scope.title).toBe("To learn how to test an AngularJS app");
    });

    it('Should add 2 destinaiton to the destinations list', function() {
      expect(scope.destinations).toBeDefined();
      expect(scope.destinations.length).toBe(0);

      scope.newDestination = {
        city: "London",
        country: "England"
      };
      scope.addDestination();

      expect(scope.destinations.length).toBe(1);
      expect(scope.destinations[0].city).toBe("London");
      expect(scope.destinations[0].country).toBe("England");
      
      scope.newDestination.city = "Frankfurt";
      scope.newDestination.country = "Germany";

      scope.addDestination();

      expect(scope.destinations.length).toBe(2);
      expect(scope.destinations[1].city).toBe("Frankfurt");
      expect(scope.destinations[1].country).toBe("Germany");
      expect(scope.destinations[0].city).toBe("London");
      expect(scope.destinations[0].country).toBe("England");
    });

    it("Should remove a destination", function() {
      scope.newDestination = {
        city: "London",
        country: "England"
      };
      scope.destinations = [
        {
          city: "Paris",
          country: "France"
        },
        {
          city: "Warsaw",
          country: "Poland"
        }
      ]

      expect(scope.destinations.length).toBe(2);
      scope.removeDestination(0);
      expect(scope.destinations.length).toBe(1);
      console.log(scope.destinations);
      expect(scope.destinations[0].city).toBe("Warsaw");
      expect(scope.destinations[0].country).toBe("Poland");
    });

    it('should time out after a set time', function() {
      rootScope.message = "Error";
      expect(rootScope.message).toBe("Error");

      rootScope.$apply();
      timeout.flush();

      expect(rootScope.message).toBeNull();
    });

  });

  describe('Testing angularjs filter', function() {
    it('should return only warm destinations', inject(function($filter){
      var warmest = $filter('warmestDestinations');
      var destinations = [
        {
          city: "Beijing",
          country: "China",
          weather: {
            temp: 59
          }
        },
        {
          city: "Moscow",
          country: "russia",
        },
        {
          city: "Mexico City",
          country: "Mexico",
          weather: {
            temp: 99
          }
        },
        {
          city: "Lima",
          country: "Peru",
          weather: {
            temp: 75
          }
        }
      ];

      expect(destinations.length).toBe(4);
      var warmDestinations = warmest(destinations, 70);
      expect(warmDestinations.length).toBe(2);
      expect(warmDestinations[0].city).toBe("Mexico City");
      expect(warmDestinations[1].city).toBe("Lima");
    })); 
  });

  describe('Testing angularjs service', function() {
    it('Expect a temp in fahrenheit', inject(function(ConvertKelvin){

      expect(ConvertKelvin.convertTempScale(288, "fahrenheit")).toBe(59);
      expect(ConvertKelvin.convertTempScale(288, "celsius")).toBe(15);
      expect(ConvertKelvin.convertTempScale(288, "not a scale")).toBe("Sorry, I do not recognise that temperture scale");
    })); 
  });

  describe('Testing angularjs directive', function() {
    var scope, template, isolateScope, rootScope;
    beforeEach(inject(function ($compile, $rootScope, $httpBackend) {
      rootScope = $rootScope;
      scope = $rootScope.$new(); 
      httpBackend = $httpBackend;

      scope.destination = {
        city: "Tokyo",
        country: "Japan"
        };
      scope.apiKey = "xyz";

      var element = angular.element(
        '<div destination-directive destination="destination" api-key="apiKey" on-remove="remove()"></div>'  
      );

      template = $compile(element)(scope);
      scope.$digest();

      isolateScope = element.isolateScope();
    }));

    it('should update the weather for a specific destination', function() {
      scope.destination = {
        city: "Melbourne",
        country: "Australia"
      };

      httpBackend.expectGET("http://api.openweathermap.org/data/2.5/weather?q=" + scope.destination.city +  "&appid=" + scope.apiKey).respond(
          {
            weather: [{main: 'Rain', detail: 'Light rain'}],
            main: {temp: 288}
          });

      isolateScope.getWeather(scope.destination);
      httpBackend.flush();

      expect(scope.destination.weather.main).toBe("Rain");
      expect(scope.destination.weather.temp).toBe(59);
    });

    it('Expect a message if no city is found', function() {
      scope.destination = {
        city: "Melbourn",
        country: "Australia"
      };

      httpBackend.expectGET("http://api.openweathermap.org/data/2.5/weather?q=" + scope.destination.city +  "&appid=" + scope.apiKey).respond( { } );

      isolateScope.getWeather(scope.destination);
      httpBackend.flush();

      expect(rootScope.message).toBe("City not found");
    });

    it('Expect a Server Error message', function() {
      scope.destination = {
        city: "Melbourn",
        country: "Australia"
      };

      httpBackend.expectGET("http://api.openweathermap.org/data/2.5/weather?q=" + scope.destination.city +  "&appid=" + scope.apiKey).respond(500);

      isolateScope.getWeather(scope.destination);
      httpBackend.flush();

      expect(rootScope.message).toBe("Sever error");
    });


    it('Expect call teh parent controller remove function', function() {
      scope.removeTest = 1;

      scope.remove = function() {
        scope.removeTest++; 
      };

      isolateScope.onRemove();

      expect(scope.removeTest).toBe(2);
    });

    it('Expect correct HTML', function() {
      var templateAsHtml = template.html();

      expect(templateAsHtml).toContain('Tokyo, Japan');

      scope.destination.city = "London";
      scope.destination.country = "England";

      scope.$digest();
      templateAsHtml = template.html();

      expect(templateAsHtml).toContain("London, England");
    });
  });

});
