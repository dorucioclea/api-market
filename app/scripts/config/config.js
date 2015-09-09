/**
 *
 * @author Maarten Casteels
 * @author Maarten Somers
 * @author Michallis Pashidis
 * @since 2015
 */

window.apimConfig = {
  Base: {
    ApiKeyName: "apikey"
  },
  StorageConfig: {
    LocalStorage: "apim-",
    SessionStorage: "apim_session-"
  },
  Security: {
    ApiKey: "80fc20d5d299410cc16033cf3b4e0769",
    SavedKey: this.StorageConfig.SessionStorage + this.Base.ApiKeyName,
    QueryParam: "apikey",
    IdpUrl: "https://idp.t1t.be:9443/samlsso",
    SpUrl: "http://apim.t1t.be:8000/dev/apiengine/v1/users/idp/callback",
    SpName: "apimMartket"
  }
};
