/*
Project Structure:
flowledger/
  frontend/
    src/
      store/
        friendStore.js
*/

import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'flowledger_friends';

export async function getFriends() {
  const data = await AsyncStorage.getItem(KEY);
  return data ? JSON.parse(data) : [];
}

export async function addFriend(friend) {
  const friends = await getFriends();
  const exists = friends.find(f => f.upi === friend.upi || f.name.toLowerCase() === friend.name.toLowerCase());
  if (exists) throw new Error('Friend already exists');
  const newFriend = {
    ...friend,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  };
  friends.unshift(newFriend);
  await AsyncStorage.setItem(KEY, JSON.stringify(friends));
  return newFriend;
}

export async function deleteFriend(id) {
  const friends = await getFriends();
  const filtered = friends.filter(f => f.id !== id);
  await AsyncStorage.setItem(KEY, JSON.stringify(filtered));
}