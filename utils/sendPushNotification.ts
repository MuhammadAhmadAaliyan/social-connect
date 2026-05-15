import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

export const sendPushNotification = async (
  toUserId: string,
  title: string,
  body: string,
) => {
  const userDoc = await getDoc(doc(db, 'users', toUserId));
  const pushToken = userDoc.data()?.pushToken;

  if (!pushToken) return;

  await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      to: pushToken,
      title,
      body,
      sound: 'default',
      data: { toUserId },
    }),
  });
};
