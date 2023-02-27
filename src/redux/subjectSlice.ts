import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import {selectSubjects} from "../services/subjectAPI";
import {array2Tree} from "../utils/tree";

export interface SubjectState {
    tree: any[];

}

const initialState: SubjectState = {
    tree: [],
}

export const reloadSubjectTree = createAsyncThunk(
    'subject/reload',
    async () => {
        const result = await selectSubjects({});
        return array2Tree(result, 'num', 'parentNum');
    }
);

export const subjectSlice = createSlice({
    name: 'subject',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(reloadSubjectTree.fulfilled, (state, action) => {
                state.tree = action.payload;
            });
    },
});

const subjectReducer = subjectSlice.reducer;

export default subjectReducer;