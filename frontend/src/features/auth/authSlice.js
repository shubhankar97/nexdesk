import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import * as authService from '../../services/auth.service.js';
import { REFRESH_TOKEN_KEY, TOKEN_KEY } from './authConstants.js';

const readStoredToken = () => localStorage.getItem(TOKEN_KEY);
const readStoredRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_KEY);

const persistSession = ({ accessToken, refreshToken }) => {
  localStorage.setItem(TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
};

const clearPersistedSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

export const logout = createAsyncThunk('auth/logout', async () => {
  try {
    if (readStoredToken()) {
      await authService.logout();
    }
  } catch {
    // Ignore logout errors; clear local session regardless.
  } finally {
    clearPersistedSession();
  }
});

export const refreshSession = createAsyncThunk(
  'auth/refreshSession',
  async (_, { dispatch, rejectWithValue }) => {
    const storedRefreshToken = readStoredRefreshToken();

    if (!storedRefreshToken) {
      await dispatch(logout());
      return rejectWithValue(null);
    }

    const result = await authService.refreshTokens(storedRefreshToken);
    persistSession({
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });

    return {
      user: result.user,
      token: result.accessToken,
      refreshToken: result.refreshToken,
    };
  }
);

export const bootstrapAuth = createAsyncThunk(
  'auth/bootstrap',
  async (_, { dispatch, rejectWithValue }) => {
    const token = readStoredToken();

    if (!token) {
      return null;
    }

    try {
      const user = await authService.getMe();

      return {
        user,
        token,
        refreshToken: readStoredRefreshToken(),
      };
    } catch {
      try {
        return await dispatch(refreshSession()).unwrap();
      } catch {
        await dispatch(logout());
        return rejectWithValue(null);
      }
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: readStoredToken(),
    refreshToken: readStoredRefreshToken(),
    initializing: Boolean(readStoredToken()),
    status: 'idle',
  },
  reducers: {
    setSession(state, action) {
      const { accessToken, refreshToken, user } = action.payload;

      persistSession({ accessToken, refreshToken });
      state.token = accessToken;
      state.refreshToken = refreshToken;
      state.user = user;
      state.initializing = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(bootstrapAuth.pending, (state) => {
        if (state.token) {
          state.initializing = true;
        }
      })
      .addCase(bootstrapAuth.fulfilled, (state, action) => {
        state.initializing = false;

        if (action.payload) {
          state.user = action.payload.user;
          state.token = action.payload.token;
          state.refreshToken = action.payload.refreshToken;
        }
      })
      .addCase(bootstrapAuth.rejected, (state) => {
        state.initializing = false;
        state.user = null;
        state.token = null;
        state.refreshToken = null;
      })
      .addCase(refreshSession.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
      })
      .addCase(refreshSession.rejected, (state) => {
        state.user = null;
        state.token = null;
        state.refreshToken = null;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.initializing = false;
      });
  },
});

export const { setSession } = authSlice.actions;
export default authSlice.reducer;
