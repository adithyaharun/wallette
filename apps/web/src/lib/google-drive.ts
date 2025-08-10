import type { GoogleUser } from "../@types/google";

// Google Drive API configuration and utilities
declare global {
  interface Window {
    gapi: typeof gapi;
    google: {
      accounts: {
        oauth2: {
          initTokenClient: (config: TokenClientConfig) => TokenClient;
          revoke: (token: string, callback?: () => void) => void;
        };
      };
    };
  }
}

interface TokenClientConfig {
  client_id: string;
  scope: string;
  callback: (response: TokenResponse) => void;
}

interface TokenClient {
  callback: (response: TokenResponse) => void;
  requestAccessToken: (options?: { prompt?: string }) => void;
}

interface TokenResponse {
  access_token: string;
  error?: string;
  error_description?: string;
}

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime: string;
}

interface DriveListResponse {
  nextPageToken?: string;
  files: DriveFile[];
}

export interface DriveConfig {
  clientId: string;
  apiKey: string;
  discoveryDoc: string;
  scopes: string;
}

export class GoogleDriveService {
  private config: DriveConfig;
  private tokenClient: TokenClient | null = null;
  private isInitialized = false;

  constructor(config: DriveConfig) {
    this.config = config;
    this.initialize = this.initialize.bind(this);
  }

  /**
   * Initialize the Google Drive API
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Load the Google API client
      await new Promise<void>((resolve, reject) => {
        if (window.gapi) {
          resolve();
        } else {
          const script = document.createElement("script");
          script.src = "https://apis.google.com/js/api.js";
          script.onload = () => resolve();
          script.onerror = reject;
          document.head.appendChild(script);
        }
      });

      // Initialize the API client
      await new Promise<void>((resolve, reject) => {
        window.gapi.load("client", async () => {
          try {
            await window.gapi.client.init({
              apiKey: this.config.apiKey,
              discoveryDocs: [this.config.discoveryDoc],
            });

            resolve();
          } catch (error) {
            reject(error);
          }
        });
      });

      await new Promise<void>((resolve, reject) => {
        window.gapi.load("client", async () => {
          try {
            await window.gapi.client.init({
              apiKey: this.config.apiKey,
              discoveryDocs: [this.config.discoveryDoc],
            });

            resolve();
          } catch (error) {
            reject(error);
          }
        });
      });

      // Initialize the token client for OAuth2
      this.tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: this.config.clientId,
        scope: this.config.scopes,
        callback: () => {}, // Will be set when requesting access
      });

      const token = localStorage.getItem("google_drive_token");
      if (token) {
        console.log("Restoring Google Drive token from localStorage.");
        window.gapi.client.setToken({ access_token: token });
      }

      this.isInitialized = true;
    } catch (error) {
      console.error("Failed to initialize Google Drive API:", error);
      throw error;
    }
  }

  async requestUserInfo(): Promise<GoogleUser> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (!this.tokenClient) {
      throw new Error("Token client not initialized");
    }

    const userInfo = await fetch(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: {
          Authorization: `Bearer ${this.getAccessToken()}`,
        },
      },
    );

    if (!userInfo.ok) {
      throw new Error("Failed to fetch user info");
    }

    const userData: GoogleUser = await userInfo.json();
    return userData;
  }

  /**
   * Request access token for Google Drive API
   */
  async requestAccessToken(): Promise<string> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (!this.tokenClient) {
      throw new Error("Token client not initialized");
    }

    return new Promise((resolve, reject) => {
      try {
        if (!this.tokenClient) {
          reject(new Error("Token client not initialized"));
          return;
        }

        this.tokenClient.callback = (response: TokenResponse) => {
          if (response.error !== undefined) {
            reject(response);
          } else {
            // Store the access token
            window.gapi.client.setToken({
              access_token: response.access_token,
            });
            resolve(response.access_token);
          }
        };

        if (window.gapi.client.getToken() === null) {
          // Prompt the user to select a Google Account and ask for consent
          this.tokenClient.requestAccessToken({ prompt: "consent" });
        } else {
          // Skip display of account chooser and consent dialog for an existing session
          this.tokenClient.requestAccessToken({ prompt: "" });
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Revoke the access token
   */
  revokeAccessToken(): void {
    const token = window.gapi.client?.getToken();
    if (token !== null) {
      window.google.accounts.oauth2.revoke(token.access_token, () => {
        window.gapi.client?.setToken(null);
      });
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = window.gapi.client?.getToken();
    return token !== null && !!token.access_token;
  }

  /**
   * Get the current access token
   */
  getAccessToken(): string | null {
    const token = window.gapi.client?.getToken();
    return token?.access_token || null;
  }

  /**
   * Make authenticated requests to Google Drive API
   * This is where you'll implement your specific Drive API calls
   */
  async makeRequest(
    method: string,
    path: string,
    params?: Record<string, unknown>,
  ): Promise<unknown> {
    if (!this.isAuthenticated()) {
      throw new Error("Not authenticated. Call requestAccessToken() first.");
    }

    try {
      const response = await window.gapi.client.request({
        method,
        path: `https://www.googleapis.com/drive/v3${path}`,
        params,
      });
      return response.result;
    } catch (error) {
      console.error("Google Drive API request failed:", error);
      throw error;
    }
  }

  // Example methods for common Drive operations

  /**
   * List files in Google Drive
   */
  async listFiles(pageSize = 10): Promise<DriveListResponse> {
    const result = await this.makeRequest("GET", "/files", {
      pageSize,
      fields: "nextPageToken, files(id, name, mimeType, modifiedTime)",
    });
    return result as DriveListResponse;
  }

  /**
   * Create a file in Google Drive
   */
  async createFile(
    name: string,
    content: string,
    mimeType = "text/plain",
  ): Promise<DriveFile> {
    const metadata = {
      name,
    };

    const form = new FormData();
    form.append(
      "metadata",
      new Blob([JSON.stringify(metadata)], {
        type: "application/json;charset=UTF-8",
      }),
    );

    form.append("file", new Blob([content], { type: mimeType }));

    const response = await fetch(
      "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.getAccessToken()}`,
        },
        body: form,
      },
    );

    return response.json() as Promise<DriveFile>;
  }

  /**
   * Download a file from Google Drive
   */
  async getFileContents(fileId: string): Promise<Blob> {
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
      {
        headers: {
          Authorization: `Bearer ${this.getAccessToken()}`,
        },
      },
    );

    return response.blob();
  }
}

// Default configuration - you'll need to replace these with your actual values
export const defaultDriveConfig: DriveConfig = {
  clientId:
    import.meta.env.VITE_GOOGLE_CLIENT_ID ||
    "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com",
  apiKey: import.meta.env.VITE_GOOGLE_API_KEY || "YOUR_GOOGLE_API_KEY",
  discoveryDoc: "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest",
  scopes: "https://www.googleapis.com/auth/drive.file",
};

// Create a singleton instance
export const driveService = new GoogleDriveService(defaultDriveConfig);
