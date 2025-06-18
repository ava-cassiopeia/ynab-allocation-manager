import {Injectable} from "@angular/core";

@Injectable({providedIn: 'root'})
export class YnabAuthManager {
  // TODO: Add `state` param to foil XSRF attacks
  // Since this is a public URL we're redirecting the user to, this is safe
  // to check in, but the client secret used in oauth should be hidden.
  private readonly baseUrl = "https://app.ynab.com/oauth/authorize";
  private readonly clientId = "thOD8wIVAOXHYQZ1SJx2GrnuSkyvxFZqg0zU2gx_xY0";
  private readonly responseType = "code";
  private readonly redirectUri: string;

  constructor() {
    const isLocalhost = window.location.hostname === "localhost";
    if (isLocalhost) {
      this.redirectUri = "http://localhost:5002/auth";
    } else {
      this.redirectUri = "https://yam.ynab.rocks/auth";
    }
  }

  beginAuth() {
    const params = new URLSearchParams();
    params.set("client_id", this.clientId);
    params.set("redirect_uri", this.redirectUri);
    params.set("response_type", this.responseType);
    params.set("scope", "");
    window.location.href = `${this.baseUrl}?${params.toString()}`;
  }
}
