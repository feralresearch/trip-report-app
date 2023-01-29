import { createSlice } from "@reduxjs/toolkit";

let initialState = {
  service: {
    tripReport: { up: true }
  }
};

export const statusSlice = createSlice({
  name: "tripReport",
  initialState,
  reducers: {
    setServiceStatus: (state, { payload: { tripReport } }) => {
      state.service.tripReport.up = tripReport;
    }
  }
});

export const { setServiceStatus, setWorkingStatus } = statusSlice.actions;
export default statusSlice.reducer;
