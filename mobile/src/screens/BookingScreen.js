import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import api from '../api';

export default function BookingScreen({ route, navigation }) {
  const { workerId, workerName, serviceType } = route.params;
  const [address, setAddress] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!address || !scheduledTime) return Alert.alert('Missing info', 'Enter address and preferred time');
    setBusy(true);
    try {
      await api.post('/bookings', { workerId, serviceType, address, scheduledTime, notes });
      Alert.alert('Booking sent!', `${workerName} will confirm shortly.`, [
        { text: 'View my bookings', onPress: () => navigation.navigate('MyBookings') },
      ]);
    } catch (e) {
      Alert.alert('Booking failed', e?.response?.data?.error || 'Please try again');
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Book {workerName}</Text>
      <Text style={styles.subtitle}>Service: {serviceType}</Text>

      <TextInput style={styles.input} placeholder="Service address" value={address} onChangeText={setAddress} multiline />
      <TextInput style={styles.input} placeholder="Preferred date & time (e.g. 10 Sep, 4:00 PM)" value={scheduledTime} onChangeText={setScheduledTime} />
      <TextInput style={styles.input} placeholder="Notes for the worker (optional)" value={notes} onChangeText={setNotes} multiline />

      <TouchableOpacity style={styles.button} onPress={submit} disabled={busy}>
        <Text style={styles.buttonText}>{busy ? 'Booking...' : 'Confirm Booking'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#F6F8F7', flexGrow: 1 },
  title: { fontSize: 20, fontWeight: '700', color: '#1B5E3C' },
  subtitle: { color: '#6B7A72', marginBottom: 16, textTransform: 'capitalize' },
  input: { backgroundColor: '#fff', borderRadius: 10, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#DCE3DF', minHeight: 48 },
  button: { backgroundColor: '#1B5E3C', borderRadius: 10, padding: 15, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
