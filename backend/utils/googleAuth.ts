import { OAuth2Client } from "google-auth-library";
import axios from "axios";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

const client = GOOGLE_CLIENT_ID ? new OAuth2Client(GOOGLE_CLIENT_ID) : null;

export interface GoogleUserInfo {
  sub: string;
  email: string;
  email_verified: boolean;
  name: string;
  picture: string;
  given_name: string;
  family_name: string;
}

export const verifyGoogleToken = async (
  token: string
): Promise<GoogleUserInfo | null> => {
  if (!client || !GOOGLE_CLIENT_ID) {
    console.warn("Google OAuth not configured. GOOGLE_CLIENT_ID is missing.");
    return null;
  }

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload) {
      return null;
    }

    return {
      sub: payload.sub,
      email: payload.email!,
      email_verified: payload.email_verified === true,
      name: payload.name || "",
      picture: payload.picture || "",
      given_name: payload.given_name || "",
      family_name: payload.family_name || "",
    };
  } catch (error) {
    console.warn("ID token verification failed, trying access token...", error);
    return await verifyAccessToken(token);
  }
};

export const verifyAccessToken = async (
  accessToken: string
): Promise<GoogleUserInfo | null> => {
  try {
    const response = await axios.get(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const userInfo = response.data;

    return {
      sub: userInfo.id,
      email: userInfo.email,
      email_verified: userInfo.verified_email === true,
      name: userInfo.name || "",
      picture: userInfo.picture || "",
      given_name: userInfo.given_name || "",
      family_name: userInfo.family_name || "",
    };
  } catch (error) {
    console.error("Error verifying Google access token:", error);
    return null;
  }
};
