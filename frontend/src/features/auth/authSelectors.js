export const selectAuth = (state) => state.auth;

export const selectUser = (state) => state.auth.user;

export const selectToken = (state) => state.auth.token;

export const selectRefreshToken = (state) => state.auth.refreshToken;

export const selectIsAuthenticated = (state) => Boolean(state.auth.token);

export const selectAuthInitializing = (state) => state.auth.initializing;
