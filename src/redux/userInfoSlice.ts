import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface UserInfoState {
  activeAccountId: number | undefined;
}

const initialState: UserInfoState = {
  activeAccountId: undefined,
}

export const userInfoSlice = createSlice({
  name: 'userInfo',
  initialState,
  reducers: {
    updateActiveAccountId: (state, action: PayloadAction<number | undefined>) => {
      state.activeAccountId = action.payload;
    },
  },
});

export const { updateActiveAccountId } = userInfoSlice.actions;

const userInfoReducer = userInfoSlice.reducer;

export default userInfoReducer;