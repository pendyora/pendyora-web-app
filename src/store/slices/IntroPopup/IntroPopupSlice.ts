import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

import { apiGetIntroPopUp } from '../../../services/authService';

const initialState: any = {
  introPopUpDetails: {},
  introPopUpFilter: null,
  introPopUpSelectedCategory: null,
  introPopUpSelectedFilter: 'all',
  introPopUpCounts: 0,
  introPopUpList: [],
  loading: false,
};

export const fetchIntroPopUpFilter = createAsyncThunk('introPopUp/fetchIntroPopUpFilter', async () => {
  try {
    const response = await apiGetIntroPopUp();

    return response.data;
  } catch (error) {
    return error;
  }
});

const introPopUpSlice = createSlice({
  name: 'introPopUp',
  initialState,
  reducers: {
    // // clearCartProducts: (state) => {
    // //   state.cartProducts = [];
    // //   state.productCounts = 0;
    // // },
    // setIntroPopUpSelectedCategory: (state, action: PayloadAction<any>) => {
    //   state.introPopUpSelectedCategory = action.payload;
    // },
    // setIntroPopUpSelectedFilter: (state, action: PayloadAction<any>) => {
    //   state.introPopUpSelectedFilter = action.payload;
    // },
    clearIntroPopUpDetails: (state) => {
      state.introPopUpDetails = {};
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchIntroPopUpFilter.pending, (state) => {
        state.loading = true;
        state.introPopUpList = [];
      })
      .addCase(fetchIntroPopUpFilter.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.introPopUpList = action.payload.data;
      })
      .addCase(fetchIntroPopUpFilter.rejected, (state) => {
        state.loading = false;
        state.introPopUpList = [];
      });
  },
});

// Export actions to be used in components
export const { clearIntroPopUpDetails } = introPopUpSlice.actions;

export default introPopUpSlice.reducer;
