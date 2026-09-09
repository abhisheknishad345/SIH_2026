import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import api from '../api';

export default function WorkerListScreen({ route, navigation }) {
  const { skill, label } = route.params;
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    navigation.setOptions({ title: `${label}s near you` });
    load();
  }, []);

  const load = async () => {
    try {
      // Mock customer location (Gurugram) for distance sorting demo
      const { data } = await api.get('/workers', { params: { skill, lat: 28.4595, lng: 77.0266 } });
      setWorkers(data);
    } catch (e) {
      // no-op for prototype
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color="#1B5E3C" />;

  return (
    <FlatList
      style={styles.container}
      data={workers}
      keyExtractor={(item) => String(item.id)}
      ListEmptyComponent={<Text style={styles.empty}>No {label.toLowerCase()}s available right now.</Text>}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.meta}>⭐ {item.avg_rating ? item.avg_rating.toFixed(1) : 'New'} ({item.total_ratings} ratings) · {item.experience_years} yrs exp</Text>
            <Text style={styles.meta}>₹{item.hourly_rate}/hr {item.distance_km != null ? `· ${item.distance_km.toFixed(1)} km away` : ''}</Text>
          </View>
          <TouchableOpacity
            style={styles.bookBtn}
            onPress={() => navigation.navigate('Booking', { workerId: item.id, workerName: item.name, serviceType: skill })}
          >
            <Text style={styles.bookText}>Book</Text>
          </TouchableOpacity>
        </View>
      )}
      contentContainerStyle={{ padding: 16 }}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F6F8F7' },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#E4E9E6' },
  name: { fontSize: 16, fontWeight: '700', color: '#222' },
  meta: { color: '#6B7A72', marginTop: 2, fontSize: 13 },
  bookBtn: { backgroundColor: '#1B5E3C', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8 },
  bookText: { color: '#fff', fontWeight: '700' },
  empty: { textAlign: 'center', marginTop: 40, color: '#6B7A72' },
});
