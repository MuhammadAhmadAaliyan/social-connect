import { addDoc, serverTimestamp, collection } from 'firebase/firestore';
import { db } from '../firebase';

const users = [
  {
    username: 'Emma Wilson',
    email: 'emma@gmail.com',
    userImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
    bio: 'Coffee ☕ | Coding 💻',
  },
  {
    username: 'James Carter',
    email: 'james@gmail.com',
    userImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
    bio: 'Explorer 🌄',
  },
  {
    username: 'Sophia Lee',
    email: 'sophia@gmail.com',
    userImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80',
    bio: 'Travel lover ✈️',
  },
  {
    username: 'Michael Brown',
    email: 'michael@gmail.com',
    userImage: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d',
    bio: 'Reader 📚',
  },
  {
    username: 'Olivia Johnson',
    email: 'olivia@gmail.com',
    userImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2',
    bio: 'Sunset chaser 🌅',
  },
];

export const uploadUsers = async () => {
  for (const user of users) {
    await addDoc(collection(db, 'users'), {
      username: user.username,
      email: user.email,
      userImage: user.userImage,
      bio: user.bio,
      createdAt: serverTimestamp(),
    });
  }

  console.log('Users uploaded successfully!');
};
