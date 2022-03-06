import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { selectSubjectBalances } from "../services/subjectBalanceAPI";

export interface SubjectBalanceState {
  options: any[];
}

const initialState: SubjectBalanceState = {
  options: [],
}

export const reloadSubjectBalances = createAsyncThunk(
  'subjectBalance/reload',
  async () => {
    const accountId = 12;
    const subjectBalances = await selectSubjectBalances(`accountId=${accountId}`);
    const subjectGroups: any = {};
    for (let subjectBalance of subjectBalances) {
      const { subject } = subjectBalance;
      if (Object.keys(subjectGroups).includes(subject.parentNum)) {
        subjectGroups[subject.parentNum].push(subjectBalance);
      } else {
        subjectGroups[subject.parentNum] = [subjectBalance];
      }
    }
    const fillTree: any = (parentNum: string, subjectGroups: any) => {
      const result: any[] = subjectGroups[parentNum];
      if (!result || result.length < 1) return undefined;
      return result.map(item => {
        const children = fillTree(item.subject.num, subjectGroups);
        return { ...item, children, name: item.subject.name };
      });
    }
    return fillTree('0', subjectGroups);
  },
);

export const subjectBalanceSlice = createSlice({
  name: 'subjectBalance',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(reloadSubjectBalances.fulfilled, (state, action) => {
      state.options = action.payload;
    });
  },
});

const subjectBalanceReducer = subjectBalanceSlice.reducer;

export default subjectBalanceReducer;