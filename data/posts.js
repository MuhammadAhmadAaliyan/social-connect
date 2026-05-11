import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

const posts = [
  {
    userId: 'CywXfi8wy6Fkn7CKgFn8',
    username: 'Emma Wilson',
    postText: 'Morning coffee and coding session ☕💻',
    postImages: [],
  },
  {
    userId: 'W8gkW7R0Pc2GmaKYjN5c',
    username: 'James Carter',
    postText: 'Exploring the mountains today. Nature feels unreal here.',
    postImages: [
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
    ],
  },
  {
    userId: 'LT2ugIs3bA4qLAuom8XO',
    username: 'Sophia Lee',
    postText: 'Weekend getaway with friends 🌴',
    postImages: [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e',
      'https://images.unsplash.com/photo-1493558103817-58b2924bce98',
      'https://images.unsplash.com/photo-1526772662000-3f88f10405ff',
    ],
  },
  {
    userId: 'ADzl0b7wDyo2pw6xvuiy',
    username: 'Michael Brown',
    postText: 'Just finished reading an amazing book on design systems.',
    postImages: null,
  },
  {
    userId: 'Cc4AA7eND6hSxRxlxPdy',
    username: 'Olivia Johnson',
    postText: 'Sunsets never disappoint 🌅',
    postImages: [
      'https://images.unsplash.com/photo-1470770841072-f978cf4d019e',
    ],
  },
];

export const uploadPosts = async () => {
  for (const post of posts) {
    await addDoc(collection(db, 'posts'), {
      userId: post.userId,
      postText: post.postText,
      postImages:
        Array.isArray(post.postImages) && post.postImages.length > 0
          ? post.postImages
          : [],
      createdAt: serverTimestamp(),
    });
  }

  console.log('Posts uploaded successfully!');
};
