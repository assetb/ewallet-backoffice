import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface AuthState {
  user: { userId: string; role: string; login: string } | null;
  token: string | null;
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem("token")
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser(
      state,
      action: PayloadAction<{ userId: string; role: string; login: string }>
    ) {
      state.user = action.payload;
    },
    clearUser(state) {
      state.user = null;
      state.token = null;
      localStorage.removeItem("token");
    },
    setToken(state, action: PayloadAction<string>) {
      state.token = action.payload;
      localStorage.setItem("token", action.payload);
    }
  }
});

export const { setUser, clearUser, setToken } = authSlice.actions;
export default authSlice.reducer;
