import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { useAuth } from '../context/AuthContext';

const SKILLS = ['plumber', 'electrician', 'cleaner'];

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer');
  const [skill, setSkill] = useState('plumber');
  const [rate, setRate] = useState('');
  const [experience, setExperience] = useState('');
  const [busy, setBusy] = useState(false);

  const onRegister = async () => {
    if (!name || !phone || !password) return Alert.alert('Missing info', 'Fill in all required fields');
    setBusy(true);
    try {
      await register({
        name: name.trim(),
        phone: phone.trim(),
        password,
        role,
        skill: role === 'worker' ? skill : undefined,
        hourly_rate: role === 'worker' ? parseFloat(rate) || 0 : undefined,
        experience_years: role === 'worker' ? parseFloat(experience) || 0 : undefined,
      });
    } catch (e) {
      Alert.alert('Registration failed', e?.response?.data?.error || 'Please try again');
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Create account</Text>

      <TextInput style={styles.input} placeholder="Full name" value={name} onChangeText={setName} />
      <TextInput style={styles.input} placeholder="Phone number" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
      <TextInput style={styles.input} placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />

      <Text style={styles.label}>I am a...</Text>
      <View style={styles.row}>
        {['customer', 'worker'].map((r) => (
          <TouchableOpacity key={r} style={[styles.pill, role === r && styles.pillActive]} onPress={() => setRole(r)}>
            <Text style={[styles.pillText, role === r && styles.pillTextActive]}>{r === 'customer' ? 'Customer' : 'Worker'}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {role === 'worker' && (
        <>
          <Text style={styles.label}>My skill</Text>
          <View style={styles.row}>
            {SKILLS.map((s) => (
              <TouchableOpacity key={s} style={[styles.pill, skill === s && styles.pillActive]} onPress={() => setSkill(s)}>
                <Text style={[styles.pillText, skill === s && styles.pillTextActive]}>{s.charAt(0).toUpperCase() + s.slice(1)}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TextInput style={styles.input} placeholder="Years of experience" keyboardType="numeric" value={experience} onChangeText={setExperience} />
          <TextInput style={styles.input} placeholder="Hourly rate (₹)" keyboardType="numeric" value={rate} onChangeText={setRate} />
        </>
      )}

      <TouchableOpacity style={styles.button} onPress={onRegister} disabled={busy}>
        <Text style={styles.buttonText}>{busy ? 'Creating account...' : 'Create Account'}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.link}>Already have an account? Log in</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, backgroundColor: '#F6F8F7', flexGrow: 1 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 20, color: '#1B5E3C' },
  input: { backgroundColor: '#fff', borderRadius: 10, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#DCE3DF' },
  label: { fontWeight: '600', marginBottom: 8, marginTop: 4, color: '#333' },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  pill: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, borderWidth: 1, borderColor: '#1B5E3C', marginRight: 8, marginBottom: 8 },
  pillActive: { backgroundColor: '#1B5E3C' },
  pillText: { color: '#1B5E3C', fontWeight: '600' },
  pillTextActive: { color: '#fff' },
  button: { backgroundColor: '#1B5E3C', borderRadius: 10, padding: 15, alignItems: 'center', marginTop: 12 },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  link: { textAlign: 'center', color: '#1B5E3C', marginTop: 18, fontWeight: '600' },
});
