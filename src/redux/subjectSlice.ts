import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { selectSubjects } from "../services/subjectAPI";

export interface SubjectState {
  tree: any[];

}

const initialState: SubjectState = {
  tree: [],
}

export const reloadSubjectTree = createAsyncThunk(
  'subject/reload',
  async () => {
    return await selectSubjects({});
  }
);

export const subjectSlice = createSlice({
  name: 'subject',
  initialState,
  reducers: {
    getFullSubjectIds:state => {

    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(reloadSubjectTree.fulfilled, (state, action) => {
        state.tree = action.payload;
      });
  },
});

const subjectReducer = subjectSlice.reducer;

export default subjectReducer;