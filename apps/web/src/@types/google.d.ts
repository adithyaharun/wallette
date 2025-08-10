export type GoogleUser = {
  sub: string;
  name: string;
  given_name?: string | null;
  family_name?: string | null;
  picture?: string | null;
  email: string;
  email_verified: boolean;
};
