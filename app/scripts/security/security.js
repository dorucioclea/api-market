/**
 * This file contains the necessary information to process our security layer.
 *
 * @author Maarten Casteels
 * @since 2015
 */

;
(function ($, apimConfig) {
  'use strict';

  function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
      results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
  }

  function getBaseURL() {
    var url = location.href;  // entire url including querystring - also: window.location.href;
    var baseURL = url.substring(0, url.indexOf('/', 14));


    if (baseURL.indexOf('http://localhost') != -1) {
      // Base Url for localhost
      var url = location.href;  // window.location.href;
      var pathname = location.pathname;  // window.location.pathname;
      var index1 = url.indexOf(pathname);
      var index2 = url.indexOf("/", index1 + 1);
      var baseLocalUrl = url.substr(0, index2);

      return baseLocalUrl + "/";
    }
    else {
      // Root Url for domain name
      return baseURL + "/";
    }
  }

  if (!sessionStorage.getItem(apimConfig.Security.SavedKey)) {

    var apikey = getParameterByName(apimConfig.Base.ApiKeyName);

    if (!apikey) {
      var url = 'http://apim.t1t.be:8000/dev/apiengine/v1/users/idp/redirect';
      var data = "{\"idpUrl\": \"" + apimConfig.Security.IdpUrl + "\", \"spUrl\": \"" + apimConfig.Security.SpUrl + "\", \"spName\": \"" + apimConfig.Security.SpName + "\", \"clientAppRedirect\": \"" + getBaseURL() + "\"}";

      $.ajax({
        method: 'POST',
        url: url,
        data: data,
        dataType: 'text',
        contentType: 'application/json',
        headers: {
          'apikey': apimConfig.Security.ApiKey
        },
        success: function (data, status, jqXHR) {
          window.location.href = data;
        },
        error: function (jqXHR, textStatus, errorThrown) {
          console.error("Request failed with error code:", textStatus);
        }
      });
    } else {
      sessionStorage.setItem('apim_session-apikey', apikey);
      window.location.href = getBaseURL();
    }
  }
})(window.jQuery, window.apimConfig);
