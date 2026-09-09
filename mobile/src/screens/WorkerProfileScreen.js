import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../api';
import { useAuth } from '../context/AuthContext';

export default function WorkerProfileScreen() {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(null);

  const load = async () => {
    try {
      const { data } = await api.get('/workers/me/profile');
      setProfile(data);
    } catch (e) { /* no-op */ }
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  const toggleAvailability = async (val) => {
    setProfile((p) => ({ ...p, is_available: val ? 1 : 0 }));
    try {
      await api.patch('/workers/me/availability', { is_available: val });
    } catch (e) { load(); }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.name}>{user?.name}</Text>
      <Text style={styles.skill}>{profile?.skill?.toUpperCase()}</Text>

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{profile?.avg_rating ? profile.avg_rating.toFixed(1) : '—'}</Text>
          <Text style={styles.statLabel}>Avg Rating</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{profile?.total_ratings ?? 0}</Text>
          <Text style={styles.statLabel}>Total Ratings</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>₹{profile?.hourly_rate ?? 0}</Text>
          <Text style={styles.statLabel}>Hourly Rate</Text>
        </View>
      </View>

      <View style={styles.availRow}>
        <Text style={styles.availLabel}>Available for new bookings</Text>
        <Switch value={!!profile?.is_available} onValueChange={toggleAvailability} trackColor={{ true: '#1B5E3C' }} />
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <Text style={styles.logoutText}>Log out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F6F8F7', padding: 20 },
  name: { fontSize: 22, fontWeight: '700', color: '#1B5E3C' },
  skill: { color: '#6B7A72', fontWeight: '600', marginBottom: 20 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  statBox: { flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 14, marginRight: 8, alignItems: 'center', borderWidth: 1, borderColor: '#E4E9E6' },
  statValue: { fontSize: 18, fontWeight: '700', color: '#1B5E3C' },
  statLabel: { fontSize: 11, color: '#6B7A72', marginTop: 2, textAlign: 'center' },
  availRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#E4E9E6' },
  availLabel: { fontWeight: '600', color: '#333' },
  logoutBtn: { marginTop: 30, alignItems: 'center', padding: 12 },
  logoutText: { color: '#B23A3A', fontWeight: '700' },
});
