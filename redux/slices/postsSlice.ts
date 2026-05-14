import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';

// FETCH POSTS FROM FIRESTORE
export const fetchPosts = createAsyncThunk('posts/fetchPosts', async () => {
  const postsSnap = await getDocs(
    query(collection(db, 'posts'), orderBy('createdAt', 'desc')),
  );
  const posts = postsSnap.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate().toISOString() || null,
    };
  });

  const usersSnap = await getDocs(collection(db, 'users'));
  const users = usersSnap.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate().toISOString() || null,
    };
  });

  return posts.map((post: any) => ({
    ...post,
    user: users.find((u: any) => u.id === post.userId) || null,
  }));
});

const postsSlice = createSlice({
  name: 'posts',
  initialState: {
    posts: [] as any[],
    loading: false,
    error: null as string | null,
  },
  reducers: {
    addPost: (state, action) => {
      state.posts.unshift(action.payload);
    },
    clearError: (state) => {
      state.error = null;
    },
    toggleLike: (state, action) => {
      const { postId, userId } = action.payload;
      const post = state.posts.find((p: any) => p.id === postId);
      if (post) {
        const alreadyLiked = post.likes.includes(userId);
        post.likes = alreadyLiked
          ? post.likes.filter((id: string) => id !== userId)
          : [...post.likes, userId];
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPosts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.posts = action.payload;
        state.loading = false;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to load posts';
      });
  },
});

export const { addPost, toggleLike, clearError } = postsSlice.actions;
export default postsSlice.reducer;
