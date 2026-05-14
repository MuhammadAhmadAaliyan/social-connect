import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';

//FETCH USER FROM FIRESTORE
export const fetchCurrentUser = createAsyncThunk(
  'user/fetchCurrentUser',
  async (userId: string) => {
    const userDoc = await getDoc(doc(db, 'users', userId));
    const data = userDoc.data();
    return {
      id: data?.id,
      ...data,
      createdAt: data?.createdAt.toDate().toISOString() || null,
    };
  },
);

const userSlice = createSlice({
  name: 'user',
  initialState: {
    currentUser: null as any,
    loading: false,
  },
  reducers: {
    //UPDATE USER
    updateCurrentUser: (state, action) => {
      state.currentUser = { ...state.currentUser, ...action.payload };
    },
    // CLEAR USER ON LOGOUT
    clearCurrentUser: (state) => {
      state.currentUser = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.currentUser = action.payload;
        state.loading = false;
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const { updateCurrentUser, clearCurrentUser } = userSlice.actions;
export default userSlice.reducer;
