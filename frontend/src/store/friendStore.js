// frontend/src/store/friendStore.js

import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../utils/api';
import { withFallback } from '../utils/withFallback';

const KEY = 'flowledger_friends';

async function getLocal() {
  const data = await AsyncStorage.getItem(KEY);
  return data ? JSON.parse(data) : [];
}

async function saveLocal(friends) {
  await AsyncStorage.setItem(KEY, JSON.stringify(friends));
}

export async function getFriends() {
  return withFallback(
    async () => {
      const friends = await api.get('/friends/');
      await saveLocal(friends);
      return friends;
    },
    getLocal
  );
}

export async function addFriend(friend) {
  return withFallback(
    async () => {
      const saved = await api.post('/friends/', friend);
      const local = await getLocal();
      local.unshift(saved);
      await saveLocal(local);
      return saved;
    },
    async () => {
      const local = await getLocal();
      const exists = local.find(f => f.name.toLowerCase() === friend.name.toLowerCase());
      if (exists) throw new Error('Friend already exists');
      const newFriend = { ...friend, id: Date.now().toString(), createdAt: new Date().toISOString() };
      local.unshift(newFriend);
      await saveLocal(local);
      return newFriend;
    }
  );
}

export async function deleteFriend(id) {
  return withFallback(
    async () => {
      await api.del(`/friends/${id}`);
      const local = await getLocal();
      await saveLocal(local.filter(f => f.id != id));
    },
    async () => {
      const local = await getLocal();
      await saveLocal(local.filter(f => f.id != id));
    }
  );
}