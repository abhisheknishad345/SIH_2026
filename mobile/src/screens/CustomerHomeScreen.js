import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useAuth } from '../context/AuthContext';

const SERVICES = [
  { key: 'plumber', label: 'Plumber', emoji: '🔧', desc: 'Leaks, pipes, fittings' },
  { key: 'electrician', label: 'Electrician', emoji: '💡', desc: 'Wiring, switches, repairs' },
  { key: 'cleaner', label: 'Cleaner', emoji: '🧹', desc: 'Home & deep cleaning' },
];

export default function CustomerHomeScreen({ navigation }) {
  const { user, logout } = useAuth();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.hello}>Hi, {user?.name} 👋</Text>
        <TouchableOpacity onPress={logout}><Text style={styles.logout}>Log out</Text></TouchableOpacity>
      </View>
      <Text style={styles.title}>What do you need help with?</Text>

      {SERVICES.map((s) => (
        <TouchableOpacity
          key={s.key}
          style={styles.card}
          onPress={() => navigation.navigate('WorkerList', { skill: s.key, label: s.label })}
        >
          <Text style={styles.emoji}>{s.emoji}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>{s.label}</Text>
            <Text style={styles.cardDesc}>{s.desc}</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
      ))}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F6F8F7', padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  hello: { fontSize: 18, fontWeight: '700', color: '#1B5E3C' },
  logout: { color: '#B23A3A', fontWeight: '600' },
  title: { fontSize: 16, color: '#333', marginBottom: 16 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#E4E9E6' },
  emoji: { fontSize: 32, marginRight: 14 },
  cardTitle: { fontSize: 17, fontWeight: '700', color: '#1B5E3C' },
  cardDesc: { color: '#6B7A72', marginTop: 2 },
  chevron: { fontSize: 22, color: '#B7C2BC' },
});
