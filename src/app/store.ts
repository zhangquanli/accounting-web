import { Action, configureStore, ThunkAction } from '@reduxjs/toolkit';
import counterReducer from "../features/counter/counterSlice";
import userInfoReducer from "../redux/userInfoSlice";
import subjectReducer from "../redux/subjectSlice";

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    userInfo: userInfoReducer,
    subject: subjectReducer,
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType,
  RootState,
  unknown,
  Action<string>>;
