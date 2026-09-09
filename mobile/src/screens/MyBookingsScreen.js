import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Modal, TextInput, Alert, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../api';

const STATUS_COLORS = { pending: '#B8860B', accepted: '#1B5E3C', rejected: '#B23A3A', completed: '#3A5FB2', cancelled: '#888' };

export default function MyBookingsScreen() {
  const [bookings, setBookings] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [rateModal, setRateModal] = useState(null); // booking id
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');

  const load = async () => {
    try {
      const { data } = await api.get('/bookings/mine');
      setBookings(data);
    } catch (e) {
      // no-op
    }
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const submitRating = async () => {
    try {
      await api.post('/ratings', { bookingId: rateModal, rating, review });
      setRateModal(null);
      setReview('');
      setRating(5);
      load();
    } catch (e) {
      Alert.alert('Could not submit rating', e?.response?.data?.error || 'Try again');
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={bookings}
        keyExtractor={(item) => String(item.id)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={<Text style={styles.empty}>No bookings yet. Book a service from Home.</Text>}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.rowBetween}>
              <Text style={styles.worker}>{item.worker_name} · {item.skill}</Text>
              <Text style={[styles.status, { color: STATUS_COLORS[item.status] || '#333' }]}>{item.status.toUpperCase()}</Text>
            </View>
            <Text style={styles.meta}>📍 {item.address}</Text>
            <Text style={styles.meta}>🕒 {item.scheduled_time}</Text>
            {item.notes ? <Text style={styles.meta}>📝 {item.notes}</Text> : null}

            {item.status === 'completed' && !item.rating && (
              <TouchableOpacity style={styles.rateBtn} onPress={() => setRateModal(item.id)}>
                <Text style={styles.rateBtnText}>Rate this service</Text>
              </TouchableOpacity>
            )}
            {item.rating && (
              <Text style={styles.meta}>Your rating: {'⭐'.repeat(item.rating.rating)}</Text>
            )}
          </View>
        )}
      />

      <Modal visible={!!rateModal} transparent animationType="fade">
        <View style={styles.modalBg}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Rate your service</Text>
            <View style={styles.starRow}>
              {[1, 2, 3, 4, 5].map((n) => (
                <TouchableOpacity key={n} onPress={() => setRating(n)}>
                  <Text style={{ fontSize: 30 }}>{n <= rating ? '⭐' : '☆'}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput style={styles.input} placeholder="Leave a review (optional)" value={review} onChangeText={setReview} />
            <View style={styles.rowBetween}>
              <TouchableOpacity onPress={() => setRateModal(null)}><Text style={styles.cancel}>Cancel</Text></TouchableOpacity>
              <TouchableOpacity style={styles.submitBtn} onPress={submitRating}><Text style={styles.rateBtnText}>Submit</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F6F8F7' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#E4E9E6' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  worker: { fontWeight: '700', fontSize: 15, textTransform: 'capitalize' },
  status: { fontWeight: '700', fontSize: 12 },
  meta: { color: '#6B7A72', marginTop: 2, fontSize: 13 },
  empty: { textAlign: 'center', marginTop: 40, color: '#6B7A72' },
  rateBtn: { backgroundColor: '#1B5E3C', borderRadius: 8, padding: 8, alignItems: 'center', marginTop: 10 },
  rateBtnText: { color: '#fff', fontWeight: '700' },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 24 },
  modalBox: { backgroundColor: '#fff', borderRadius: 14, padding: 20 },
  modalTitle: { fontSize: 17, fontWeight: '700', marginBottom: 12 },
  starRow: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginBottom: 12 },
  input: { backgroundColor: '#F6F8F7', borderRadius: 10, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: '#DCE3DF' },
  cancel: { color: '#B23A3A', fontWeight: '600', padding: 10 },
  submitBtn: { backgroundColor: '#1B5E3C', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 18 },
});
