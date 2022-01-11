import { Action, configureStore, ThunkAction } from '@reduxjs/toolkit';
import counterReducer from "../features/counter/counterSlice";
import subjectBalanceReducer from "../redux/subjectBalanceSlice";

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    subjectBalance: subjectBalanceReducer,
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType,
  RootState,
  unknown,
  Action<string>>;
