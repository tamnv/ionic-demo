angular.module('starter.controllers', [])
.controller('appCtrl', ['$scope', '$ionicModal', '$timeout', 'TwitterService', '$state', function($scope,
  $ionicModal,
  $timeout,
  TwitterService,
  $state ){
  $scope.loginData = {};

  // Create the login modal that we will use later.
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it.
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal.
  $scope.login = function() {
    $scope.modal.show();
  };

  // Perform the login action when the user submits the login form.
  $scope.doLogin = function() {
    console.log($scope.loginData);
    $timeout(function() {
      $scope.closeLogin();
    }, 1000);
  };

  $scope.search = function() {
    $state.go('app.search');
  };
}])

// Twitter List Controller.
.controller('tweetsListCtrl', ['$scope', '$http', '$ionicPlatform', 'TwitterService', function($scope, $http, $ionicPlatform, TwitterService){
  // Function return geolocationSuccess.
  var geolocationSuccess = function(position) {
    $scope.latitude = position.coords.latitude;
    $scope.longitude = position.coords.longitude;
  }
  // Function return error when call get current position.
  var geolocationError = function(error) {
    console.log('Error code: ' + error.code + '\n' + 'message: '+ error.message);
  }
  navigator.geolocation.getCurrentPosition(geolocationSuccess, geolocationError);

  // Get Location.
  $scope.getLocation = function() {
    navigator.geolocation.getCurrentPosition(geolocationSuccess, geolocationError);
    $scope.places = TwitterService.getTrendsCloset($scope.latitude, $scope.longitude);
    // $scope.woeid = $scope.places.woeid;
    console.log($scope.places.woeid);
    // $scope.tweetsData = TwitterService.getTweetsNearBy($scope.woeid);
    // console.log($scope.tweetsData);
  }

  // 1
  $scope.correctTimestring = function(string) {
    return new Date(Date.parse(string));
  };
  // 2
  $scope.showHomeTimeline = function() {
    $scope.tweetsData = TwitterService.getTweetsNearBy($scope.woeid);
  };
  // Refresh content.
  $scope.doRefresh = function() {
    $scope.showHomeTimeline();
    $scope.$broadcast('scroll.refreshComplete');
  };

  //
  $ionicPlatform.ready(function() {
    if (TwitterService.isAuthenticated()) {
      //$scope.showHomeTimeline();
    } else {

      TwitterService.initialize().then(function(result) {
        if(result === true) {
          //$scope.showHomeTimeline();
        }
      });
    }
  });
}])

// About Page,
.controller('aboutCtrl', ['$scope', function($scope){

}])

// Imprint Page.
.controller('imprintCtrl', ['$scope', function($scope){

}])

// Search Controller.
.controller('searchCtrl', ['$scope', '$http', '$ionicHistory', '$ionicPlatform', '$state', 'TwitterService',function($scope,
  $http,
  $ionicHistory,
  $ionicPlatform,
  $state,
  TwitterService ){
  $scope.emptySearch = function() {
    $scope.txt_search = '';
  }
  $scope.goBack = function() {
    $ionicHistory.goBack();
  }

  $scope.searchRefresh = function() {
    $scope.showSearchResult($scope.txt_search);
    $scope.$broadcast('scroll.refreshComplete');
  }

  $scope.showSearchResult = function(keyword) {
    $scope.resultsData = TwitterService.getTweets(keyword);
  }
  $ionicPlatform.ready(function() {
    $scope.searchTweets = function() {
      if (TwitterService.isAuthenticated()) {
        $scope.showSearchResult($scope.txt_search);
      } else {
        TwitterService.initialize().then(function(result) {
          if(result === true) {
            $scope.showSearchResult($scope.txt_search);
          }
        });
      }
    }
  });

}]);
