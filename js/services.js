/**
* starter.services Module
*
* Description
*/
angular.module('starter.services', []).
factory('TwitterService', function($cordovaOauth, $cordovaOauthUtility, $http,  $resource, $q){
  // 1
  var twitterKey = "STORAGE.TWITTER_KEY";
  var clientId = 'QpO3HvQjQkcbxvvlZOoQ';
  var clientSecret = 'g7Rsrn6hznqkhVQDIqqTfjM2GdLSEQfIoBLc3Row3w0';
  var woeidKey = 'STORAGE.WOEID';
  // 2
  function storeUserToken(data) {
    window.localStorage.setItem(twitterKey, JSON.stringify(data));
  }

  function getStoredToken() {
    return window.localStorage.getItem(twitterKey);
  }

  // 3
  function createTwitterSignature(method, url) {
    var token = angular.fromJson(getStoredToken());
    var oauthObject = {
        oauth_consumer_key: clientId,
        oauth_nonce: $cordovaOauthUtility.createNonce(10),
        oauth_signature_method: "HMAC-SHA1",
        oauth_token: token.oauth_token,
        oauth_timestamp: Math.round((new Date()).getTime() / 1000.0),
        oauth_version: "1.0"
    };
    var signatureObj = $cordovaOauthUtility.createSignature(method, url, oauthObject, {}, clientSecret, token.oauth_token_secret);
    $http.defaults.headers.common.Authorization = signatureObj.authorization_header;
  }

  // Create Singature with request has params:
  function createTwitterSignatureParams(method, url, params) {
    var token = angular.fromJson(getStoredToken());
    var oauthObject = {
        oauth_consumer_key: clientId,
        oauth_nonce: $cordovaOauthUtility.createNonce(10),
        oauth_signature_method: "HMAC-SHA1",
        oauth_token: token.oauth_token,
        oauth_timestamp: Math.round((new Date()).getTime() / 1000.0),
        oauth_version: "1.0"
    };
    var signatureObj = $cordovaOauthUtility.createSignature(method, url, oauthObject, params, clientSecret, token.oauth_token_secret);
    $http.defaults.headers.common.Authorization = signatureObj.authorization_header;
  }

  // Function sorte location id.
  function storeLocation(data) {
    window.localStorage.setItem(woeidKey, data);
  }

  // Function get location.
  function getLocation() {
    return window.localStorage.getItem(woeidKey);
  }

  return {
    // 4
    initialize: function() {
      var deferred = $q.defer();
      var token = getStoredToken();
      if (token !== null) {
        deferred.resolve(true);
      } else {
        $cordovaOauth.twitter(clientId, clientSecret).then(function(result) {
          storeUserToken(result);
          deferred.resolve(true);
        }, function(error) {
          deferred.reject(false);
        });
      }
      return deferred.promise;
    },
    // 5
    isAuthenticated: function() {
      return getStoredToken() !== null;
    },
    // Check Location Ready.
    hasLocation: function() {
      return getLocation() !== null;
    },
    // Get Location of current user.
    getCurrentLocation: function(latitude, longitude) {
      var url_request_place = 'https://api.twitter.com/1.1/trends/closest.json';
      createTwitterSignatureParams('GET', url_request_place, {lat: latitude, long: longitude});
      $resource(url_request_place,{lat: latitude,long: longitude}).query().$promise.then(function(data) {
        window.localStorage.setItem(woeidKey, data.$promise.$$state.value[0].woeid);
      }, function(error) {
        console.log(error);
      });
    },
    // Get Trends closest.
    getTweetsNearBy: function() {
      var woeid = window.localStorage.getItem(woeidKey);
      var url_request_tweets = 'https://api.twitter.com/1.1/trends/place.json';
      createTwitterSignatureParams('GET', url_request_tweets, {id: woeid});
      return $resource(url_request_tweets,{id: woeid}).query();

    },
    // Call search twitter api.
    getTweets: function(keyword) {
      var search_url = 'https://api.twitter.com/1.1/users/search.json';
      createTwitterSignatureParams('GET', search_url, {q: keyword});
      return $resource(search_url,{q: keyword}).query();
    },
    storeUserToken: storeUserToken,
    getStoredToken: getStoredToken,
    createTwitterSignature: createTwitterSignature,
  };
});
