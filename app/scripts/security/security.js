/**
 * This file contains the necessary information to process our security layer.
 *
 * @author Maarten Casteels
 * @since 2015
 */

;
(function () {
  'use strict';

  function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
      results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
  }

  if (!sessionStorage.getItem("apim_session-apikey")) {

    var apikey = getParameterByName("apikey");

    if (!apikey) {
      //var url = 'http://api.t1t.be/API-Engine-web/v1/users/idp/redirect';
      var url = 'http://apim.t1t.be:8000/dev/apiengine/v1/users/idp/redirect';
      var clientUrl = "http://localhost:9000/";
      var data = "{\"idpUrl\": \"https://idp.t1t.be:9443/samlsso\", \"spUrl\": \"http://api.t1t.be/API-Engine-web/v1/users/idp/callback\", \"spName\": \"apimMartket\", \"clientAppRedirect\": \"" + clientUrl + "\"}";

      $.ajax({
        method: 'POST',
        url: url,
        data: data,
        dataType: 'text',
        crossOrigin: true,
        contentType: 'application/json',
        headers: {
          'apikey': '80fc20d5d299410cc16033cf3b4e0769'
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
      sessionStorage.setItem('apim_session-apikey', apikey);
      window.location.href = getBaseURL();
    }
  }
})();
