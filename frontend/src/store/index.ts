import { configureStore } from "@reduxjs/toolkit";
import authReducer, { AuthState } from "./authSlice";
import managerReducer from "./managerSlice";
import financeReducer from "./financeSlice";
import supervisorReducer from "./supervisorSlice";

export interface RootState {
  auth: AuthState;
  manager: ReturnType<typeof managerReducer>;
  finance: ReturnType<typeof financeReducer>;
  supervisor: ReturnType<typeof supervisorReducer>;
}

const store = configureStore({
  reducer: {
    auth: authReducer,
    manager: managerReducer,
    finance: financeReducer,
    supervisor: supervisorReducer
  }
});

export type AppDispatch = typeof store.dispatch;

// Хуки-обёртки для useDispatch и useSelector
import { useDispatch, useSelector, TypedUseSelectorHook } from "react-redux";
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export default store;
