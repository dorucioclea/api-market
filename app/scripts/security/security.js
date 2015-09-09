/**
 * This file contains the necessary information to process our security layer.
 *
 * @author Maarten Casteels
 * @since 2015
 */

(function ($, console) {
  'use strict';

  var config = {
    "Base": {
      "ApiKeyName": "apikey",
      "Url": "http://apim.t1t.be:8000/"
    },
    "Storage": {
      "LocalStorage": "apim-",
      "SessionStorage": "apim_session-"
    },
    "Security": {
      "RedirectUrl": "dev/apiengine/v1/users/idp/redirect",
      "ApiKey": "80fc20d5d299410cc16033cf3b4e0769",
      "IdpUrl": "https://idp.t1t.be:9443/samlsso",
      "SpUrl": "http://api.t1t.be/API-Engine-web/v1/users/idp/callback",
      "SpName": "apimarket"
    }
  };

  function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
      results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
  }

  if (!sessionStorage.getItem(config.Storage.SessionStorage + config.Base.ApiKeyName)) {

    var apikey = getParameterByName(config.Base.ApiKeyName);

    var clientUrl = window.location.origin;

    if (!apikey) {
      var url = config.Base.Url + config.Security.RedirectUrl;
      var data = "{\"idpUrl\": \"" + config.Security.IdpUrl + "\", \"spUrl\": \"" + config.Security.SpUrl + "\", \"spName\": \"" + config.Security.SpName + "\", \"clientAppRedirect\": \"" + clientUrl + "\"}";

      $.ajax({
        method: 'POST',
        url: url,
        data: data,
        dataType: 'text',
        crossOrigin: true,
        contentType: 'application/json',
        headers: {
          'apikey': config.Security.ApiKey
        },
        success: function (data, status, jqXHR) {
          window.location.href = data;
        },
        error: function (jqXHR, textStatus, errorThrown) {
          console.error("Request failed with error code:", textStatus);
          console.error(errorThrown);
          console.error(jqXHR);
        }
      });
    } else {
      sessionStorage.setItem(config.Storage.SessionStorage + config.Base.ApiKeyName, apikey);
      window.location.href = clientUrl;
    }
  }
})(window.jQuery, window.console);
