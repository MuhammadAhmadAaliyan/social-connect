import {
  collection,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';

const postComments = {
  '176LeUcFdnQ6VrHAIl9W': [
    { userId: 'Cc4AA7eND6hSxRxlxPdy', commentText: 'This is amazing! 😍' },
    { userId: 'W8gkW7R0Pc2GmaKYjN5c', commentText: 'Really inspiring post 🔥' },
    { userId: 'ggonfUWz6xf8cqQvF2Fqb3MyfGf1', commentText: 'Love this! ❤️' },
  ],
  '3EL6OLwgBjrbWhKZlBjb': [
    {
      userId: 'ADzl0b7wDyo2pw6xvuiy',
      commentText: "So true! Couldn't agree more 👏",
    },
    { userId: 'CywXfi8wy6Fkn7CKgFn8', commentText: 'This made my day 😊' },
    { userId: 'LT2ugIs3bA4qLAuom8XO', commentText: 'Absolutely wonderful! ✨' },
  ],
  '4iuhzNIi3q0ch6d0bOjp': [
    {
      userId: 'ggonfUWz6xf8cqQvF2Fqb3MyfGf1',
      commentText: 'Great perspective! 💯',
    },
    { userId: 'ADzl0b7wDyo2pw6xvuiy', commentText: 'Well said brother 👍' },
    {
      userId: 'Cc4AA7eND6hSxRxlxPdy',
      commentText: 'Keep posting more like this!',
    },
  ],
  vX0XEv1T1vCB5PMd4AkX: [
    { userId: 'CywXfi8wy6Fkn7CKgFn8', commentText: 'This is everything 🙌' },
    {
      userId: 'W8gkW7R0Pc2GmaKYjN5c',
      commentText: 'Needed to see this today 💪',
    },
  ],
  wWvxapBfNPeRMhMa5W8u: [
    { userId: 'LT2ugIs3bA4qLAuom8XO', commentText: 'Such a vibe! 😎' },
    { userId: 'ggonfUWz6xf8cqQvF2Fqb3MyfGf1', commentText: 'Facts! 🔥' },
    { userId: 'ADzl0b7wDyo2pw6xvuiy', commentText: 'This is gold 🏆' },
  ],
  yEGZbnVQGgQnuBwHg0SX: [
    {
      userId: 'Cc4AA7eND6hSxRxlxPdy',
      commentText: 'Obsessed with this post 😍',
    },
    {
      userId: 'CywXfi8wy6Fkn7CKgFn8',
      commentText: 'Coffee ☕ and good vibes only!',
    },
    {
      userId: 'LT2ugIs3bA4qLAuom8XO',
      commentText: 'You always post the best stuff 💫',
    },
  ],
};

export const seedDummyComments = async () => {
  console.log('Seeding started...');

  for (const postId in postComments) {
    console.log('Adding comments to post:', postId);
    for (const comment of postComments[postId]) {
      await addDoc(collection(db, 'posts', postId, 'comments'), {
        userId: comment.userId,
        commentText: comment.commentText,
        createdAt: serverTimestamp(),
      });
    }

    await updateDoc(doc(db, 'posts', postId), {
      commentsCount: postComments[postId].length,
    });
  }

  console.log('Dummy comments seeded ✅');
};
