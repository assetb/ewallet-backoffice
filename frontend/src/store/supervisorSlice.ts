import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RedemptionRequest, HistoryRecord } from "../models/requestModels";

interface SupervisorState {
  pendingRequests: RedemptionRequest[];
  history: HistoryRecord[];
  balance: number;
  loading: boolean;
  error: string | null;
}

const initialState: SupervisorState = {
  pendingRequests: [],
  history: [],
  balance: 0,
  loading: false,
  error: null
};

const supervisorSlice = createSlice({
  name: "supervisor",
  initialState,
  reducers: {
    fetchStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchPendingRequestsSuccess(state, action: PayloadAction<RedemptionRequest[]>) {
      state.pendingRequests = action.payload;
      state.loading = false;
    },
    fetchHistorySuccess(state, action: PayloadAction<HistoryRecord[]>) {
      state.history = action.payload;
      state.loading = false;
    },
    fetchBalanceSuccess(state, action: PayloadAction<number>) {
      state.balance = action.payload;
      state.loading = false;
    },
    fetchFailure(state, action: PayloadAction<string>) {
      state.error = action.payload;
      state.loading = false;
    },
    clearSupervisorState(state) {
      state.pendingRequests = [];
      state.history = [];
      state.balance = 0;
      state.loading = false;
      state.error = null;
    }
  }
});

export const {
  fetchStart,
  fetchPendingRequestsSuccess,
  fetchHistorySuccess,
  fetchBalanceSuccess,
  fetchFailure,
  clearSupervisorState
} = supervisorSlice.actions;

export default supervisorSlice.reducer;
