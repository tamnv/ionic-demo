angular.module('starter.controllers', [])
.controller('appCtrl', ['$scope', '$rootScope', '$ionicModal', '$timeout', 'TwitterService', '$state', '$ionicPopover', function($scope,
  $rootScope,
  $ionicModal,
  $timeout,
  TwitterService,
  $state,
  $ionicPopover ){
  $scope.loginData = {};
  // Init rootScope txt_search.
  $rootScope.txt_search = null;
  // Create the login modal that we will use later.
  /*$ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modal = modal;
  });*/

  // Triggered in the login modal to close it.
 /* $scope.closeLogin = function() {
    $scope.modal.hide();
  };*/

  // Open the login modal.
  $rootScope.isLogin = false;
  $scope.login = function() {
    TwitterService.initialize().then(function(result) {
      if (result === true) {
        $state.go('app.tweetslist');
        $rootScope.message = '';
        $rootScope.isLogin = true;
        $rootScope.hasLocation = false;
      }
    });
  };

  // Perform the login action when the user submits the login form.
  /*$scope.doLogin = function() {
    console.log($scope.loginData);
    $timeout(function() {
      $scope.closeLogin();
    }, 1000);
  };*/

  // Right Menu.
  $ionicPopover.fromTemplateUrl('templates/menu-right.html', {
    scope: $scope
  }).then(function(popover) {
    $scope.popover = popover;
  });
  // Open popover.
  $scope.openPopover = function($event) {
    $scope.popover.show($event);
  };
  // Close popover.
  $scope.closePopover = function() {
    $scope.popover.hide();
  };

  $scope.refreshTweets = function() {
    $state.go($state.current, {}, {reload: true});
    $scope.closePopover();
  }

  // Control sort function.
  $rootScope.resultType = 'recent';
  $scope.sortRecentTweets = function() {
    $rootScope.resultType = 'recent';
    $scope.closePopover();
  }

  $scope.sortPopularTweets = function() {
    $rootScope.resultType = 'popular';
    $scope.closePopover();
  }

  // Goto search template.
  $scope.search = function() {
    $state.go('app.search');
  };
}])

// Twitter List Controller.
.controller('tweetsListCtrl', ['$scope', '$rootScope', '$http', '$ionicPlatform', 'TwitterService', '$state', function(
  $scope,
  $rootScope,
  $http,
  $ionicPlatform,
  TwitterService,
  $state){
  // Function return geolocationSuccess.
  var geolocationSuccess = function(position) {
    $scope.latitude = position.coords.latitude;
    $scope.longitude = position.coords.longitude;
  }
  // Function return error when call get current position.
  var geolocationError = function(error) {
    console.log('Error code: ' + error.code + '\n' + 'message: '+ error.message);
  }
  // Message notice user login.
  if (TwitterService.isAuthenticated()) {
    $rootScope.isLogin = true;
  } else {
    $rootScope.message = 'Please login to use this function.';
  }
  var watch_id = navigator.geolocation.watchPosition(geolocationSuccess, geolocationError);
  // Check user has location or not.
  $scope.getCurrentLocation = function() {
    TwitterService.getCurrentLocation($scope.latitude, $scope.longitude);
    $scope.showHomeTimeline();
    $rootScope.hasLocation = true;
  }

  // 1
  $scope.correctTimestring = function(string) {
    return new Date(Date.parse(string));
  };

  $scope.getTrends = function() {
    $scope.showHomeTimeline();
    $scope.flagFirst = false;
  }

  // 2
  $scope.showHomeTimeline = function() {
    $scope.tweetsData = TwitterService.getTweetsNearBy();
  };
  // Refresh content.
  $scope.doRefresh = function() {
    $scope.showHomeTimeline();
    $scope.$broadcast('scroll.refreshComplete');
  };

  $scope.searchHashtag = function(hashtag) {
    $rootScope.txt_search = hashtag;
    $state.go('app.search');
  }
  //
  $ionicPlatform.ready(function() {
    if (TwitterService.isAuthenticated()) {
      if (TwitterService.hasLocation()) {
        $scope.showHomeTimeline();
      }
    } else {
      TwitterService.initialize().then(function(result) {
        if(result === true) {
          if (TwitterService.hasLocation()) {
            $scope.showHomeTimeline();
          }
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
.controller('searchCtrl', ['$scope', '$rootScope', '$ionicHistory', '$ionicPlatform', '$state', 'TwitterService',function($scope,
  $rootScope,
  $ionicHistory,
  $ionicPlatform,
  $state,
  TwitterService ){
  $scope.txt_search = $rootScope.txt_search;
  $scope.emptySearch = function() {
    $scope.txt_search = '';
  }
  $scope.goBack = function() {
    $ionicHistory.goBack();
  }

  $scope.$watch('txt_search', function() {
    $scope.showSearchResult($scope.txt_search);
  });

  $scope.$watch('resultType', function() {
    $scope.showSearchResult($scope.txt_search);
  });

  $scope.searchRefresh = function() {
    $scope.showSearchResult($scope.txt_search);
    $scope.$broadcast('scroll.refreshComplete');
  }

  $scope.showSearchResult = function(keyword) {
    $scope.resultsData = TwitterService.getTweets(keyword, $rootScope.resultType);
    console.log($scope.resultsData);
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

  // Open in browser.
  $scope.openBrowser = function(url) {
    window.open(url, '_system', 'location=yes');
  }
}]);
