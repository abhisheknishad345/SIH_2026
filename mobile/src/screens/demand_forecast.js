import React, { useState, useMemo } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert,
  KeyboardAvoidingView, Platform, ScrollView, SafeAreaView,
} from 'react-native';

// ============================================================================
// THEME (inline — no external font/color packages needed)
// ============================================================================
const colors = {
  paper: '#EFEAE0',
  paperRaised: '#F6F2E8',
  ink: '#1F3A34',
  inkSoft: '#3E5A53',
  text: '#2B2723',
  textMute: '#6B655B',
  line: '#C9C0AE',
  accent: '#C97B2E',
  heat: ['#F6F2E8', '#D9E4DE', '#AFC9BE', '#6B8F84', '#3E5A53', '#1F3A34'],
  crisis: '#B5493B',
  live: '#4C7A5D',
};

function heatColorFor(bookings, maxBookings) {
  const ratio = maxBookings > 0 ? bookings / maxBookings : 0;
  let index = 0;
  if (ratio >= 0.9) index = 5;
  else if (ratio >= 0.75) index = 4;
  else if (ratio >= 0.55) index = 3;
  else if (ratio >= 0.35) index = 2;
  else if (ratio >= 0.15) index = 1;
  return { bg: colors.heat[index], fg: index >= 3 ? '#FFFFFF' : colors.text };
}

// ============================================================================
// API HELPERS
// ============================================================================
const NGROK_HEADERS = { 'ngrok-skip-browser-warning': 'true' };

function normalizeBase(base) {
  return base.trim().replace(/\/$/, '');
}

async function fetchHeatmap(base, { dayOfWeek, month, tempC, rainfallMm }) {
  const url =
    `${normalizeBase(base)}/heatmap?` +
    `day_of_week=${dayOfWeek}&month=${month}&temp_c=${tempC}&rainfall_mm=${rainfallMm}`;
  const res = await fetch(url, { headers: NGROK_HEADERS });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function fetchPredict(base, { locality, serviceType, dayOfWeek, month, tempC, rainfallMm }) {
  const res = await fetch(`${normalizeBase(base)}/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...NGROK_HEADERS },
    body: JSON.stringify({
      locality, service_type: serviceType, day_of_week: dayOfWeek,
      month, temp_c: tempC, rainfall_mm: rainfallMm,
    }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// ============================================================================
// STATIC OPTIONS
// ============================================================================
const DAYS = [
  { label: 'Mon', value: 0 }, { label: 'Tue', value: 1 }, { label: 'Wed', value: 2 },
  { label: 'Thu', value: 3 }, { label: 'Fri', value: 4 }, { label: 'Sat', value: 5 },
  { label: 'Sun', value: 6 },
];
const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
].map((label, i) => ({ label, value: i + 1 }));

const EMPTY_HINT =
  "Enter your API URL above and tap \"Load register\" to pull today's forecast. " +
  "Get the URL by running the Kaggle notebook — it prints something like https://xxxx.ngrok-free.app.";

// ============================================================================
// SCREEN
// ============================================================================
export default function Demand_forecast() {
  const [apiUrl, setApiUrl] = useState('https://scorch-citric-denial.ngrok-free.dev/');
  const [dayOfWeek, setDayOfWeek] = useState(5);
  const [month, setMonth] = useState(7);
  const [tempC, setTempC] = useState('32');
  const [rainfallMm, setRainfallMm] = useState('20');

  const [status, setStatus] = useState('idle'); // idle | connecting | live | error
  const [heatmapData, setHeatmapData] = useState(null);
  const [loading, setLoading] = useState(false);

  const [selectedLoc, setSelectedLoc] = useState('');
  const [selectedSvc, setSelectedSvc] = useState('');
  const [result, setResult] = useState(null);

  const { localities, services, lookup, maxBookings } = useMemo(() => {
    if (!heatmapData) return { localities: [], services: [], lookup: {}, maxBookings: 0 };
    const locs = [...new Set(heatmapData.results.map((r) => r.locality))];
    const svcs = [...new Set(heatmapData.results.map((r) => r.service_type))];
    const map = {};
    let max = 0;
    heatmapData.results.forEach((r) => {
      map[`${r.locality}__${r.service_type}`] = r;
      if (r.predicted_bookings > max) max = r.predicted_bookings;
    });
    return { localities: locs, services: svcs, lookup: map, maxBookings: max };
  }, [heatmapData]);

  const handleLoad = async () => {
    if (!apiUrl.trim()) {
      Alert.alert('Missing URL', 'Enter the API URL from your Kaggle/ngrok notebook first.');
      return;
    }
    setLoading(true);
    setStatus('connecting');
    try {
      const data = await fetchHeatmap(apiUrl, {
        dayOfWeek, month, tempC: Number(tempC), rainfallMm: Number(rainfallMm),
      });
      setHeatmapData(data);
      setStatus('live');
      setSelectedLoc(data.results[0]?.locality ?? '');
      setSelectedSvc(data.results[0]?.service_type ?? '');
      setResult(null);
    } catch (err) {
      setStatus('error');
      Alert.alert(
        'Could not reach API',
        `Check: the notebook cell is still running · the URL was copied exactly ` +
        `(include https://, no trailing slash) · and if this is a fresh ngrok URL, ` +
        `open it in a browser tab once and tap "Visit Site" to clear ngrok's warning page.\n\n${err.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCellPress = (loc, svc, bookings, workers) => {
    setSelectedLoc(loc);
    setSelectedSvc(svc);
    setResult({ locality: loc, serviceType: svc, bookings, workers });
  };

  const handlePredict = async () => {
    if (!apiUrl.trim() || !selectedLoc || !selectedSvc) return;
    try {
      const data = await fetchPredict(apiUrl, {
        locality: selectedLoc, serviceType: selectedSvc,
        dayOfWeek, month, tempC: Number(tempC), rainfallMm: Number(rainfallMm),
      });
      if (data.error) { Alert.alert('Error', data.error); return; }
      setResult({
        locality: data.locality,
        serviceType: data.service_type,
        bookings: data.predicted_bookings,
        workers: data.recommended_workers,
      });
    } catch (err) {
      Alert.alert('Prediction failed', err.message);
    }
  };

  const isLive = status === 'live';
  const statusLabel =
    status === 'live' ? 'Connected' :
    status === 'connecting' ? 'Connecting…' :
    status === 'error' ? 'Could not reach API' :
    'Not connected';
  const hasOptions = localities.length > 0 && services.length > 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>

          {/* ---------- Masthead ---------- */}
          <View style={styles.masthead}>
            <Text style={styles.title}>Sahakar Seva — Demand Register</Text>
            <Text style={styles.subtitle}>
              Daily forecast of household & community service bookings across cooperative zones.
            </Text>
            <View style={styles.statusRow}>
              {/* <View style={[styles.dot, isLive && { backgroundColor: colors.live }]} />
              <Text style={styles.statusText}>{statusLabel}</Text> */}
            </View>
          </View>

          {/* ---------- API URL ---------- */}
          {/* <View style={styles.field}>
            <Text style={styles.label}>Model API base URL (from your ngrok tunnel)</Text>
            <TextInput
              style={styles.input}
              value={apiUrl}
              onChangeText={setApiUrl}
              placeholder="https://xxxx-xx-xx-xx-xx.ngrok-free.app"
              placeholderTextColor={colors.textMute}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View> */}

          {/* ---------- Day chips ---------- */}
          <View style={styles.field}>
            <Text style={styles.label}>Day</Text>
            <View style={styles.chipRow}>
              {DAYS.map((d) => (
                <Chip
                  key={d.value}
                  label={d.label}
                  active={dayOfWeek === d.value}
                  onPress={() => setDayOfWeek(d.value)}
                />
              ))}
            </View>
          </View>

          {/* ---------- Month chips ---------- */}
          <View style={styles.field}>
            <Text style={styles.label}>Month</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.chipRow}>
                {MONTHS.map((m) => (
                  <Chip
                    key={m.value}
                    label={m.label}
                    active={month === m.value}
                    onPress={() => setMonth(m.value)}
                  />
                ))}
              </View>
            </ScrollView>
          </View>

          {/* ---------- Weather inputs ---------- */}
          <View style={styles.row}>
            <View style={[styles.field, { flex: 1, marginRight: 10 }]}>
              <Text style={styles.label}>Temp (°C)</Text>
              <TextInput
                style={styles.input}
                value={String(tempC)}
                onChangeText={setTempC}
                keyboardType="numeric"
              />
            </View>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={styles.label}>Rainfall (mm)</Text>
              <TextInput
                style={styles.input}
                value={String(rainfallMm)}
                onChangeText={setRainfallMm}
                keyboardType="numeric"
              />
            </View>
          </View>

          <TouchableOpacity style={styles.button} onPress={handleLoad} disabled={loading}>
            <Text style={styles.buttonText}>{loading ? 'Loading…' : 'Load register'}</Text>
          </TouchableOpacity>

          {/* ---------- Register ---------- */}
          <View style={styles.section}>
            <Text style={styles.panelTitle}>Zone × service forecast</Text>
            <Text style={styles.panelSub}>Tap a cell to send it to the duty slip below.</Text>

            {!heatmapData ? (
              <View style={styles.empty}>
                <Text style={styles.emptyText}>{EMPTY_HINT}</Text>
              </View>
            ) : (
              localities.map((loc) => (
                <View key={loc} style={styles.localityBlock}>
                  <Text style={styles.localityLabel}>{loc}</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.chipRow}>
                      {services.map((svc) => {
                        const r = lookup[`${loc}__${svc}`];
                        const { bg, fg } = heatColorFor(r.predicted_bookings, maxBookings);
                        return (
                          <TouchableOpacity
                            key={svc}
                            style={[styles.cell, { backgroundColor: bg }]}
                            onPress={() => handleCellPress(loc, svc, r.predicted_bookings, r.recommended_workers)}
                          >
                            <Text style={[styles.cellSvc, { color: fg }]}>{svc}</Text>
                            <Text style={[styles.cellNumber, { color: fg }]}>{r.predicted_bookings}</Text>
                            <Text style={[styles.cellWorkers, { color: fg }]}>{r.recommended_workers}w</Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </ScrollView>
                </View>
              ))
            )}

            {heatmapData && (
              <View style={styles.legend}>
                <Text style={styles.legendLabel}>Low</Text>
                <View style={{ flexDirection: 'row' }}>
                  {colors.heat.map((c) => (
                    <View key={c} style={[styles.swatch, { backgroundColor: c }]} />
                  ))}
                </View>
                <Text style={styles.legendLabel}>High demand</Text>
              </View>
            )}
          </View>

          {/* ---------- Duty slip ---------- */}
          <View style={styles.slipCard}>
            <Text style={styles.panelTitle}>Duty slip</Text>
            <Text style={styles.panelSub}>Single lookup for one zone and service.</Text>

            <View style={styles.field}>
              <Text style={styles.label}>Zone</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.chipRow}>
                  {hasOptions ? localities.map((l) => (
                    <Chip key={l} label={l} active={selectedLoc === l} onPress={() => setSelectedLoc(l)} />
                  )) : <Text style={styles.emptyText}>Load the register first</Text>}
                </View>
              </ScrollView>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Service</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.chipRow}>
                  {hasOptions ? services.map((s) => (
                    <Chip key={s} label={s} active={selectedSvc === s} onPress={() => setSelectedSvc(s)} />
                  )) : null}
                </View>
              </ScrollView>
            </View>

            <TouchableOpacity style={styles.button} onPress={handlePredict} disabled={!hasOptions}>
              <Text style={styles.buttonText}>Predict</Text>
            </TouchableOpacity>

            {result && (
              <View style={styles.result}>
                <Text style={styles.big}>{result.bookings} <Text style={styles.bigUnit}>jobs / day</Text></Text>
                <View style={styles.resultLine}>
                  <Text style={styles.resultKey}>Zone</Text>
                  <Text style={styles.resultValue}>{result.locality}</Text>
                </View>
                <View style={styles.resultLine}>
                  <Text style={styles.resultKey}>Service</Text>
                  <Text style={styles.resultValue}>{result.serviceType}</Text>
                </View>
                <View style={[styles.resultLine, { borderBottomWidth: 0 }]}>
                  <Text style={styles.resultKey}>Workers to deploy</Text>
                  <Text style={styles.resultValue}>{result.workers}</Text>
                </View>
              </View>
            )}
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}> Cooperative Gig Services Platform · Ministry of Cooperation</Text>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Chip({ label, active, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.chip, active && styles.chipActive]}
      onPress={onPress}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

// ============================================================================
// STYLES
// ============================================================================
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.paper },
  scrollContent: { padding: 20, paddingBottom: 60 },

  masthead: { borderBottomWidth: 3, borderBottomColor: colors.ink, paddingBottom: 16, marginBottom: 20 },
  title: { fontSize: 24, fontWeight: '700', color: colors.ink },
  subtitle: { fontSize: 13, color: colors.textMute, marginTop: 6 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 },
  dot: { width: 9, height: 9, borderRadius: 5, backgroundColor: colors.crisis },
  statusText: { fontSize: 12, color: colors.textMute },

  field: { marginBottom: 14 },
  label: { fontSize: 12, color: colors.textMute, marginBottom: 6 },
  input: {
    fontSize: 14, paddingVertical: 10, paddingHorizontal: 12,
    borderWidth: 1, borderColor: colors.line, borderRadius: 4,
    backgroundColor: colors.paperRaised, color: colors.text,
  },
  row: { flexDirection: 'row' },

  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingVertical: 7, paddingHorizontal: 12, borderRadius: 16,
    borderWidth: 1, borderColor: colors.line, backgroundColor: colors.paperRaised,
  },
  chipActive: { backgroundColor: colors.ink, borderColor: colors.ink },
  chipText: { fontSize: 12, color: colors.text },
  chipTextActive: { color: colors.paperRaised, fontWeight: '600' },

  button: {
    backgroundColor: colors.ink, borderRadius: 4, paddingVertical: 12,
    alignItems: 'center', marginTop: 4, marginBottom: 8,
  },
  buttonText: { color: colors.paperRaised, fontSize: 14, fontWeight: '600' },

  section: { marginTop: 20 },
  panelTitle: { fontSize: 18, fontWeight: '700', color: colors.ink, marginBottom: 4 },
  panelSub: { fontSize: 12, color: colors.textMute, marginBottom: 12 },

  empty: {
    borderWidth: 1, borderStyle: 'dashed', borderColor: colors.line,
    backgroundColor: colors.paperRaised, padding: 20,
  },
  emptyText: { fontSize: 13, color: colors.textMute, lineHeight: 19 },

  localityBlock: { marginBottom: 14 },
  localityLabel: { fontSize: 13, fontWeight: '600', color: colors.ink, marginBottom: 6 },
  cell: {
    borderWidth: 1, borderColor: colors.line, borderRadius: 4,
    paddingVertical: 8, paddingHorizontal: 10, marginRight: 8, minWidth: 90, alignItems: 'center',
  },
  cellSvc: { fontSize: 10, marginBottom: 2, textAlign: 'center' },
  cellNumber: { fontSize: 15, fontWeight: '700' },
  cellWorkers: { fontSize: 10, opacity: 0.85, marginTop: 1 },

  legend: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 },
  legendLabel: { fontSize: 11, color: colors.textMute },
  swatch: { width: 18, height: 12, borderWidth: 1, borderColor: colors.line },

  slipCard: {
    backgroundColor: colors.paperRaised, borderWidth: 1, borderColor: colors.line,
    borderTopWidth: 3, borderTopColor: colors.accent, borderRadius: 4, padding: 16, marginTop: 24,
  },
  result: { marginTop: 16, paddingTop: 14, borderTopWidth: 1, borderTopColor: colors.line, borderStyle: 'dashed' },
  big: { fontSize: 28, fontWeight: '700', color: colors.ink },
  bigUnit: { fontSize: 13, fontWeight: '400', color: colors.textMute },
  resultLine: {
    flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6,
    borderBottomWidth: 1, borderBottomColor: colors.line, marginTop: 4,
  },
  resultKey: { fontSize: 13, color: colors.textMute },
  resultValue: { fontSize: 13, color: colors.text, fontWeight: '600' },

  footer: { marginTop: 30, paddingTop: 14, borderTopWidth: 1, borderTopColor: colors.line },
  footerText: { fontSize: 11, color: colors.textMute, textAlign: 'center' },
});