import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { UploadedFileRecord } from "../models/fileModels";

interface ManagerState {
  uploadedFiles: UploadedFileRecord[];
  loading: boolean;
  error: string | null;
}

const initialState: ManagerState = {
  uploadedFiles: [],
  loading: false,
  error: null
};

const managerSlice = createSlice({
  name: "manager",
  initialState,
  reducers: {
    fetchFilesStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchFilesSuccess(state, action: PayloadAction<UploadedFileRecord[]>) {
      state.uploadedFiles = action.payload;
      state.loading = false;
    },
    fetchFilesFailure(state, action: PayloadAction<string>) {
      state.error = action.payload;
      state.loading = false;
    },
    clearManagerState(state) {
      state.uploadedFiles = [];
      state.loading = false;
      state.error = null;
    }
  }
});

export const {
  fetchFilesStart,
  fetchFilesSuccess,
  fetchFilesFailure,
  clearManagerState
} = managerSlice.actions;

export default managerSlice.reducer;
