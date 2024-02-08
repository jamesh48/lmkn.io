import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';

interface PopupModalDetails {
  title: string;
  body: string;
}

export const appInitialState: {
  popupModalDetails: PopupModalDetails;
} = {
  popupModalDetails: {
    title: '',
    body: '',
  },
};

export const appSlice = createSlice({
  name: 'app',
  initialState: appInitialState,
  reducers: {
    setPopupModalDetails: (
      state,
      action: PayloadAction<
        Partial<PopupModalDetails> & Omit<PopupModalDetails, 'state'>
      >
    ) => {
      Object.assign(state.popupModalDetails, action.payload);
    },
  },
});

export const { setPopupModalDetails } = appSlice.actions;

export const getPopupModalDetails = (state: RootState) =>
  state.app.popupModalDetails;

export default appSlice.reducer;
