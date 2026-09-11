import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, ActivityIndicator, ScrollView } from 'react-native';

let Voice;
if (Platform.OS !== 'web') {
  try {
    Voice = require('@react-native-voice/voice').default;
  } catch (e) {
    console.warn("Voice module not loaded on web target platform.");
  }
}

// 1. UPDATE THIS CONSTANT TO YOUR LIVE KAGGLE NGROK DOMAIN WHEN RUNNING
// e.g. "https://scorch-citric-denial.ngrok-free.dev"
const NGROK_URL = "https://scorch-citric-denial.ngrok-free.dev";

// 2. Languages available in the picker. `speechCode` is a BCP-47 tag used by
// both the Web Speech API and @react-native-voice/voice. `name` is the plain
// English name sent to the backend so the model knows what to reply in.
const LANGUAGES = [
  { label: 'English', speechCode: 'en-US', name: 'English' },
  { label: 'हिंदी', speechCode: 'hi-IN', name: 'Hindi' },
  { label: 'मराठी', speechCode: 'mr-IN', name: 'Marathi' },
  { label: 'தமிழ்', speechCode: 'ta-IN', name: 'Tamil' },
  { label: 'తెలుగు', speechCode: 'te-IN', name: 'Telugu' },
  { label: 'বাংলা', speechCode: 'bn-IN', name: 'Bengali' },
  { label: 'ગુજરાતી', speechCode: 'gu-IN', name: 'Gujarati' },
  { label: 'ಕನ್ನಡ', speechCode: 'kn-IN', name: 'Kannada' },
];

const NGROK_HEADERS = { 'ngrok-skip-browser-warning': 'true' };

export default function VoiceToTextConverter() {
  const [status, setStatus] = useState('Idle');
  const [userText, setUserText] = useState('Tap "Start Session" to begin...');
  const [aiText, setAiText] = useState('AI response will appear here...');
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState(LANGUAGES[0]);

  const recRef = useRef(null);
  const languageRef = useRef(language); // lets callbacks read the *current* language without re-binding

  useEffect(() => {
    languageRef.current = language;
  }, [language]);

  const askBackend = (promptText, lang) => {
    setStatus('Processing...');
    setIsLoading(true);

    fetch(`${NGROK_URL}/query`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...NGROK_HEADERS },
      body: JSON.stringify({ question: promptText, language: lang.name })
    })
    .then(res => res.json())
    .then(data => {
      setIsLoading(false);
      const answerText = data.answer || "No answer parameter found";
      setAiText(answerText);
      setStatus('Speaking...');

      if (Platform.OS === 'web') {
        if (window.speechSynthesis) {
          window.speechSynthesis.cancel(); // stop anything mid-utterance first
          let speech = new SpeechSynthesisUtterance(answerText);
          speech.lang = lang.speechCode;
          speech.onend = () => setStatus('Ready.');
          window.speechSynthesis.speak(speech);
        } else {
          setStatus('Ready.');
        }
      } else {
        setStatus('Ready.');
      }
    })
    .catch(err => {
      setIsLoading(false);
      setStatus('Server Error!');
      setAiText('Failed to fetch response. Make sure NGROK_URL matches your current live Kaggle instance.');
      console.error(err);
    });
  };

  useEffect(() => {
    if (Platform.OS === 'web') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();

        rec.onresult = (event) => {
          let txt = event.results[0][0].transcript;
          setUserText(txt);
          askBackend(txt, languageRef.current);
        };

        recRef.current = rec;
      }
    } else if (Voice) {
      Voice.onSpeechResults = (event) => {
        if (event.value && event.value.length > 0) {
          let txt = event.value[0];
          setUserText(txt);
          askBackend(txt, languageRef.current);
        }
      };
    }

    return () => {
      if (Platform.OS !== 'web' && Voice) {
        Voice.destroy().then(Voice.removeAllListeners).catch(() => {});
      }
    };
  }, []);

  const start = () => {
    setStatus('Listening...');
    setUserText('Listening to microphone entry input stream...');
    setAiText('Awaiting text transcript processing pipeline...');

    if (Platform.OS === 'web') {
      if (recRef.current) {
        recRef.current.lang = language.speechCode; // set right before starting so language switches take effect
        recRef.current.start();
      }
    } else if (Voice) {
      try { Voice.start(language.speechCode); } catch (e) { console.error(e); }
    }
  };

  const stop = () => {
    if (Platform.OS === 'web') {
      if (recRef.current) {
        recRef.current.abort();
        setStatus('Stopped.');
      }
    } else if (Voice) {
      try {
        Voice.stop();
        setStatus('Stopped.');
      } catch (e) { console.error(e); }
    }
  };

  const getStatusColor = () => {
    if (status === 'Listening...') return '#2563EB';
    if (status === 'Processing...') return '#D97706';
    if (status === 'Speaking...') return '#10B981';
    if (status === 'Server Error!') return '#DC2626';
    return '#6B7280';
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.header}>AI Voice Dashboard</Text>

        {/* Language picker */}
        <Text style={styles.sectionTitle}>Language</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.langScroll}>
          <View style={styles.langRow}>
            {LANGUAGES.map((lng) => (
              <TouchableOpacity
                key={lng.speechCode}
                style={[styles.langChip, language.speechCode === lng.speechCode && styles.langChipActive]}
                onPress={() => setLanguage(lng)}
              >
                <Text style={[styles.langChipText, language.speechCode === lng.speechCode && styles.langChipTextActive]}>
                  {lng.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Dynamic Visual Ring Wrapper Indicator */}
        <View style={styles.avatarContainer}>
          <View style={[styles.pulseRing, { borderColor: getStatusColor(), opacity: status === 'Listening...' ? 1 : 0.4 }]}>
            <View style={[styles.innerCore, { backgroundColor: getStatusColor() }]}>
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.coreText}>AI</Text>
              )}
            </View>
          </View>
          <Text style={[styles.statusBadge, { color: getStatusColor() }]}>{status.toUpperCase()}</Text>
        </View>

        {/* Dynamic Interactive Input Display Panels */}
        <View style={styles.displayGroup}>
          <Text style={styles.sectionTitle}>User Transcript</Text>
          <View style={styles.box}>
            <Text style={styles.bodyText}>{userText}</Text>
          </View>
        </View>

        <View style={styles.displayGroup}>
          <Text style={styles.sectionTitle}>AI Response ({language.label})</Text>
          <View style={[styles.box, styles.aiBox]}>
            <Text style={[styles.bodyText, styles.aiText]}>{aiText}</Text>
          </View>
        </View>

        {/* Clean Fixed Footer Action Layout Bar */}
        <View style={styles.row}>
          <TouchableOpacity style={[styles.btn, styles.startBtn]} onPress={start} activeOpacity={0.8}>
            <Text style={styles.btnText}>Start Session</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.btn, styles.stopBtn]} onPress={stop} activeOpacity={0.8}>
            <Text style={styles.btnText}>Stop Audio</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 440,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 5,
  },
  header: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: -0.5
  },
  langScroll: { marginBottom: 4 },
  langRow: { flexDirection: 'row', gap: 8, paddingVertical: 4 },
  langChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  langChipActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  langChipText: { fontSize: 13, color: '#4B5563', fontWeight: '600' },
  langChipTextActive: { color: '#FFFFFF' },
  avatarContainer: {
    alignItems: 'center',
    marginVertical: 15,
  },
  pulseRing: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 6,
  },
  innerCore: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coreText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 18,
  },
  statusBadge: {
    fontSize: 12,
    fontWeight: '800',
    marginTop: 10,
    letterSpacing: 1.5,
  },
  displayGroup: {
    width: '100%',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 6,
    marginLeft: 4,
  },
  box: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 14,
    borderRadius: 14,
    minHeight: 65,
    justifyContent: 'center'
  },
  aiBox: {
    backgroundColor: '#EEF2FF',
    borderColor: '#E0E7FF',
    minHeight: 90,
  },
  bodyText: {
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 22,
  },
  aiText: {
    color: '#3730A3',
    fontWeight: '500',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12
  },
  btn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  startBtn: {
    backgroundColor: '#2563EB'
  },
  stopBtn: {
    backgroundColor: '#EF4444'
  },
  btnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700'
  },
});