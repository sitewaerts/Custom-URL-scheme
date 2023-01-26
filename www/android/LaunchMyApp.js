(function () {
    "use strict";

  var remainingAttempts = 10;

  function waitForAndCallHandlerFunction(url) {
    if (typeof window.handleOpenURL === "function") {
      // Clear the intent when we have a handler (note that this is only done when the preference 'CustomURLSchemePluginClearsAndroidIntent' is 'true' in config.xml
      cordova.exec(
          null,
          function(error){console.warn("custom-url-scheme plugin: cannot clear intent", error)},
          "LaunchMyApp",
          "clearIntent",
          []);

      window.handleOpenURL(url);
    } else if (remainingAttempts-- > 0) {
      setTimeout(function(){waitForAndCallHandlerFunction(url);}, 500);
    }
  }

  function triggerOpenURL() {
    cordova.exec(
        waitForAndCallHandlerFunction,
        function(error){console.log("custom-url-scheme plugin: no initial open url found", error)},
        "LaunchMyApp",
        "checkIntent",
        []);
  }

  document.addEventListener("deviceready", triggerOpenURL, false);

  var launchmyapp = {
    getLastIntent: function(success, failure) {
      cordova.exec(
        success,
        failure,
        "LaunchMyApp",
        "getLastIntent",
        []);
    }
  }

  module.exports = launchmyapp;

}());
