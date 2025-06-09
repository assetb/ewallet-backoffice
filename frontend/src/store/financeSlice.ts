import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RedemptionRequest, HistoryRecord } from "../models/requestModels";

interface FinanceState {
  merchants: { merchantId: string; merchantName: string }[];
  redemptionRequests: RedemptionRequest[];
  history: HistoryRecord[];
  balance: number;
  loading: boolean;
  error: string | null;
}

const initialState: FinanceState = {
  merchants: [],
  redemptionRequests: [],
  history: [],
  balance: 0,
  loading: false,
  error: null
};

const financeSlice = createSlice({
  name: "finance",
  initialState,
  reducers: {
    fetchStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchMerchantsSuccess(
      state,
      action: PayloadAction<{ merchantId: string; merchantName: string }[]>
    ) {
      state.merchants = action.payload;
      state.loading = false;
    },
    fetchRedemptionRequestsSuccess(state, action: PayloadAction<RedemptionRequest[]>) {
      state.redemptionRequests = action.payload;
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
    clearFinanceState(state) {
      state.merchants = [];
      state.redemptionRequests = [];
      state.history = [];
      state.balance = 0;
      state.loading = false;
      state.error = null;
    }
  }
});

export const {
  fetchStart,
  fetchMerchantsSuccess,
  fetchRedemptionRequestsSuccess,
  fetchHistorySuccess,
  fetchBalanceSuccess,
  fetchFailure,
  clearFinanceState
} = financeSlice.actions;

export default financeSlice.reducer;
