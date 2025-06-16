import {Injectable} from "@angular/core";

// TODO: Replace localhost dynamically with the actual host.
// TODO: Add `state` param to foil XSRF attacks
// Since this is a public URL we're redirecting the user to, this is safe
// to check in, but the client secret used in oauth should be hidden.
const OAUTH_TARGET = "https://app.ynab.com/oauth/authorize?client_id=thOD8wIVAOXHYQZ1SJx2GrnuSkyvxFZqg0zU2gx_xY0&redirect_uri=http%3A%2F%2Flocalhost%3A5002%2Fauth&response_type=code&scope=";

@Injectable({providedIn: 'root'})
export class YnabAuthManager {
  beginAuth() {
    window.location.href = OAUTH_TARGET;
  }
}
