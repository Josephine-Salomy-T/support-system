const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

// Backward compatibility with existing keys used in app code
const LEGACY_TOKEN_KEY = 'token';
const LEGACY_USER_KEY = 'user';

export const authService = {
  login(token, user) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));

    localStorage.setItem(LEGACY_TOKEN_KEY, token);
    localStorage.setItem(LEGACY_USER_KEY, JSON.stringify(user));
  },
  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);

    localStorage.removeItem(LEGACY_TOKEN_KEY);
    localStorage.removeItem(LEGACY_USER_KEY);
  },
  getToken() {
    return localStorage.getItem(TOKEN_KEY) || localStorage.getItem(LEGACY_TOKEN_KEY);
  },
  getUser() {
    const user = localStorage.getItem(USER_KEY) || localStorage.getItem(LEGACY_USER_KEY);
    return user ? JSON.parse(user) : null;
  },
  isAuthenticated() {
    return !!this.getToken();
  }
};

