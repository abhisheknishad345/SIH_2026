import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../api';

const STATUS_COLORS = { pending: '#B8860B', accepted: '#1B5E3C', rejected: '#B23A3A', completed: '#3A5FB2' };

export default function WorkerDashboardScreen() {
  const [bookings, setBookings] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const { data } = await api.get('/bookings/mine');
      setBookings(data);
    } catch (e) { /* no-op */ }
  };

  useFocusEffect(useCallback(() => { load(); }, []));
  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/bookings/${id}/status`, { status });
      load();
    } catch (e) {
      Alert.alert('Could not update', e?.response?.data?.error || 'Try again');
    }
  };

  return (
    <FlatList
      style={styles.container}
      data={bookings}
      keyExtractor={(item) => String(item.id)}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      ListEmptyComponent={<Text style={styles.empty}>No booking requests yet.</Text>}
      contentContainerStyle={{ padding: 16 }}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <Text style={styles.customer}>{item.customer_name}</Text>
            <Text style={[styles.status, { color: STATUS_COLORS[item.status] }]}>{item.status.toUpperCase()}</Text>
          </View>
          <Text style={styles.meta}>📍 {item.address}</Text>
          <Text style={styles.meta}>🕒 {item.scheduled_time}</Text>
          {item.notes ? <Text style={styles.meta}>📝 {item.notes}</Text> : null}

          {item.status === 'pending' && (
            <View style={styles.actionRow}>
              <TouchableOpacity style={[styles.actionBtn, styles.acceptBtn]} onPress={() => updateStatus(item.id, 'accepted')}>
                <Text style={styles.actionText}>Accept</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, styles.rejectBtn]} onPress={() => updateStatus(item.id, 'rejected')}>
                <Text style={styles.actionText}>Reject</Text>
              </TouchableOpacity>
            </View>
          )}
          {item.status === 'accepted' && (
            <TouchableOpacity style={[styles.actionBtn, styles.completeBtn]} onPress={() => updateStatus(item.id, 'completed')}>
              <Text style={styles.actionText}>Mark Job Complete</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F6F8F7' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#E4E9E6' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  customer: { fontWeight: '700', fontSize: 15 },
  status: { fontWeight: '700', fontSize: 12 },
  meta: { color: '#6B7A72', marginTop: 2, fontSize: 13 },
  empty: { textAlign: 'center', marginTop: 40, color: '#6B7A72' },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 10 },
  actionBtn: { flex: 1, borderRadius: 8, paddingVertical: 10, alignItems: 'center' },
  acceptBtn: { backgroundColor: '#1B5E3C' },
  rejectBtn: { backgroundColor: '#B23A3A' },
  completeBtn: { backgroundColor: '#3A5FB2', marginTop: 10 },
  actionText: { color: '#fff', fontWeight: '700' },
});
