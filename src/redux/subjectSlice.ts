import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { selectSubjects } from "../services/subjectAPI";

export interface SubjectState {
  data: any[];
  categories: any[];
}

const initialState: SubjectState = {
  data: [],
  categories: [
    { value: 'ASSETS', label: '资产类' },
    { value: 'LIABILITY', label: '负债类' },
    { value: 'OWNERS_EQUITY', label: '所有者权益' },
    { value: 'COST', label: '成本类' },
    { value: 'PROFIT_AND_LOSS', label: '损益类' },
  ],
}

export const reloadSubjects = createAsyncThunk(
  'subject/reload',
  async () => {
    const subjects = await selectSubjects();
    const subjectGroups: any = {};
    for (let subject of subjects) {
      if (Object.keys(subjectGroups).includes(subject.parentNum)) {
        subjectGroups[subject.parentNum].push(subject);
      } else {
        subjectGroups[subject.parentNum] = [subject];
      }
    }
    const fillTree: any = (parentNum: string, subjectGroups: any) => {
      const result: any[] = subjectGroups[parentNum];
      if (!result || result.length < 1) return undefined;
      return result.map(item => {
        const children = fillTree(item.num, subjectGroups);
        return { ...item, children };
      })
    }
    return fillTree('0', subjectGroups);
  },
);

export const subjectSlice = createSlice({
  name: 'subject',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(reloadSubjects.fulfilled, (state, action) => {
      state.data = action.payload;
    });
  },
});

const subjectReducer = subjectSlice.reducer;

export default subjectReducer;