import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { CameraType, CameraView, type CameraCapturedPicture, useCameraPermissions } from 'expo-camera';

import { checkApiHealth, predictLeaf, type PredictionResponse } from './src/api';
import { DEFAULT_API_URL, palette } from './src/theme';


function ScoreBar({ label, value }: { label: string; value: number }) {
  const width = `${Math.max(6, Math.round(value * 100))}%` as const;

  return (
    <View style={styles.scoreRow}>
      <View style={styles.scoreHeader}>
        <Text style={styles.scoreLabel}>{label}</Text>
        <Text style={styles.scoreValue}>{Math.round(value * 100)}%</Text>
      </View>
      <View style={styles.scoreTrack}>
        <View style={[styles.scoreFill, { width }]} />
      </View>
    </View>
  );
}


export default function App() {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const cameraRef = useRef<CameraView | null>(null);
  const [photo, setPhoto] = useState<CameraCapturedPicture | null>(null);
  const [apiUrl, setApiUrl] = useState(DEFAULT_API_URL);
  const [apiStatus, setApiStatus] = useState('API non testee');
  const [result, setResult] = useState<PredictionResponse | null>(null);
  const [isTestingApi, setIsTestingApi] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const sortedScores = result
    ? Object.entries(result.scores).sort((left, right) => right[1] - left[1])
    : [];

  const handleFlipCamera = () => {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  };

  const handleRequestPermission = async () => {
    const response = await requestPermission();
    if (!response.granted) {
      Alert.alert('Permission requise', "L'application doit acceder a la camera pour la demonstration.");
    }
  };

  const handleTakePhoto = async () => {
    if (!cameraRef.current) {
      return;
    }

    try {
      setIsCapturing(true);
      setResult(null);

      // La capture reste simple pour stabiliser la demo sur Expo Go.
      const captured = await cameraRef.current.takePictureAsync({
        quality: 0.8,
      });

      setPhoto(captured);
    } catch (error) {
      Alert.alert('Capture impossible', "La photo n'a pas pu etre prise.");
    } finally {
      setIsCapturing(false);
    }
  };

  const handleRetake = () => {
    setPhoto(null);
    setResult(null);
  };

  const handleCheckApi = async () => {
    try {
      setIsTestingApi(true);
      const health = await checkApiHealth(apiUrl);
      setApiStatus(`API connectee. Classes: ${health.classes.join(', ')}`);
    } catch (error) {
      setApiStatus(error instanceof Error ? error.message : 'Connexion API impossible');
    } finally {
      setIsTestingApi(false);
    }
  };

  const handleAnalyze = async () => {
    if (!photo?.uri) {
      Alert.alert('Photo manquante', "Prenez une photo avant de lancer l'analyse.");
      return;
    }

    try {
      setIsAnalyzing(true);
      const prediction = await predictLeaf(apiUrl, photo.uri);
      setResult(prediction);
    } catch (error) {
      Alert.alert('Analyse impossible', error instanceof Error ? error.message : 'Erreur inconnue');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const renderCameraContent = () => {
    if (!permission) {
      return (
        <View style={styles.centerState}>
          <ActivityIndicator color={palette.leaf} size="large" />
          <Text style={styles.stateText}>Preparation de la camera...</Text>
        </View>
      );
    }

    if (!permission.granted) {
      return (
        <View style={styles.centerState}>
          <Text style={styles.stateTitle}>Camera non autorisee</Text>
          <Text style={styles.stateText}>
            Autorisez la camera pour prendre la photo de la feuille pendant la demonstration.
          </Text>
          <Pressable style={styles.secondaryButton} onPress={handleRequestPermission}>
            <Text style={styles.secondaryButtonText}>Autoriser la camera</Text>
          </Pressable>
        </View>
      );
    }

    if (photo?.uri) {
      return <Image source={{ uri: photo.uri }} style={styles.cameraPreview} resizeMode="cover" />;
    }

    return (
      <CameraView
        ref={cameraRef}
        style={styles.cameraPreview}
        facing={facing}
        mute
      />
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        style={styles.screen}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.heroCard}>
            <Text style={styles.badge}>Prototype mobile</Text>
            <Text style={styles.title}>AgriSmart</Text>
            <Text style={styles.subtitle}>
              Prenez une photo d&apos;une feuille de mais, envoyez-la au modele final et affichez le
              diagnostic en direct.
            </Text>
          </View>

          <View style={styles.panel}>
            <Text style={styles.sectionTitle}>Connexion a l&apos;API</Text>
            <Text style={styles.helperText}>
              Entrez l&apos;adresse du laptop. Avec un hotspot Windows, l&apos;IP est souvent
              `http://192.168.137.1:8010`.
            </Text>
            <TextInput
              value={apiUrl}
              onChangeText={setApiUrl}
              autoCapitalize="none"
              autoCorrect={false}
              style={styles.input}
              placeholder="http://192.168.137.1:8010"
              placeholderTextColor={palette.muted}
            />
            <Pressable
              style={[styles.secondaryButton, isTestingApi && styles.buttonDisabled]}
              onPress={handleCheckApi}
              disabled={isTestingApi}
            >
              <Text style={styles.secondaryButtonText}>
                {isTestingApi ? 'Test en cours...' : "Tester l'API"}
              </Text>
            </Pressable>
            <Text style={styles.statusText}>{apiStatus}</Text>
          </View>

          <View style={styles.panel}>
            <Text style={styles.sectionTitle}>Camera</Text>
            <Text style={styles.helperText}>
              Cadrez bien une seule feuille avant de prendre la photo.
            </Text>

            <View style={styles.cameraShell}>{renderCameraContent()}</View>

            <View style={styles.actionRow}>
              <Pressable
                style={[styles.secondaryButton, styles.actionButton]}
                onPress={photo ? handleRetake : handleFlipCamera}
              >
                <Text style={styles.secondaryButtonText}>
                  {photo ? 'Reprendre' : 'Changer camera'}
                </Text>
              </Pressable>

              <Pressable
                style={[styles.primaryButton, styles.actionButton, isCapturing && styles.buttonDisabled]}
                onPress={handleTakePhoto}
                disabled={isCapturing || Boolean(photo)}
              >
                <Text style={styles.primaryButtonText}>
                  {isCapturing ? 'Capture...' : 'Prendre photo'}
                </Text>
              </Pressable>
            </View>

            <Pressable
              style={[styles.analyzeButton, (!photo || isAnalyzing) && styles.buttonDisabled]}
              onPress={handleAnalyze}
              disabled={!photo || isAnalyzing}
            >
              <Text style={styles.analyzeButtonText}>
                {isAnalyzing ? 'Analyse en cours...' : 'Analyser la feuille'}
              </Text>
            </Pressable>
          </View>

          {result ? (
            <View style={styles.resultCard}>
              <Text style={styles.resultLabel}>Diagnostic</Text>
              <Text style={styles.resultTitle}>{result.predicted_label}</Text>
              <Text style={styles.resultMeta}>
                Confiance: {Math.round(result.confidence * 100)}% | Inference: {result.inference_time_ms}
                ms
              </Text>
              <Text style={styles.adviceTitle}>Conseil rapide</Text>
              <Text style={styles.adviceText}>{result.advice}</Text>

              <Text style={styles.adviceTitle}>Scores par classe</Text>
              {sortedScores.map(([label, value]) => (
                <ScoreBar key={label} label={label} value={value} />
              ))}
            </View>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.background,
  },
  screen: {
    flex: 1,
  },
  content: {
    padding: 18,
    gap: 16,
    paddingBottom: 32,
  },
  heroCard: {
    backgroundColor: palette.card,
    borderRadius: 28,
    padding: 22,
    borderWidth: 1,
    borderColor: palette.border,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: palette.badge,
    color: palette.leafDark,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    fontSize: 12,
    fontWeight: '700',
    overflow: 'hidden',
  },
  title: {
    marginTop: 16,
    fontSize: 34,
    fontWeight: '800',
    color: palette.text,
  },
  subtitle: {
    marginTop: 8,
    fontSize: 15,
    lineHeight: 22,
    color: palette.subtleText,
  },
  panel: {
    backgroundColor: palette.card,
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: palette.border,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: palette.text,
  },
  helperText: {
    fontSize: 14,
    lineHeight: 20,
    color: palette.subtleText,
  },
  input: {
    backgroundColor: palette.input,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: palette.text,
  },
  statusText: {
    fontSize: 13,
    lineHeight: 18,
    color: palette.subtleText,
  },
  cameraShell: {
    height: 360,
    overflow: 'hidden',
    borderRadius: 24,
    backgroundColor: '#1a1a1a',
  },
  cameraPreview: {
    flex: 1,
  },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  stateTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  stateText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#D3D3D3',
    textAlign: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  primaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.leaf,
    borderRadius: 16,
    minHeight: 54,
    paddingHorizontal: 14,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.secondary,
    borderRadius: 16,
    minHeight: 50,
    paddingHorizontal: 14,
  },
  secondaryButtonText: {
    color: palette.text,
    fontSize: 15,
    fontWeight: '700',
  },
  analyzeButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.earth,
    borderRadius: 18,
    minHeight: 56,
    paddingHorizontal: 16,
  },
  analyzeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  resultCard: {
    backgroundColor: palette.resultCard,
    borderRadius: 24,
    padding: 20,
    gap: 10,
    borderWidth: 1,
    borderColor: palette.resultBorder,
  },
  resultLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: palette.leafDark,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  resultTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: palette.text,
  },
  resultMeta: {
    fontSize: 14,
    color: palette.subtleText,
  },
  adviceTitle: {
    marginTop: 6,
    fontSize: 15,
    fontWeight: '700',
    color: palette.text,
  },
  adviceText: {
    fontSize: 15,
    lineHeight: 21,
    color: palette.subtleText,
  },
  scoreRow: {
    gap: 6,
  },
  scoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  scoreLabel: {
    fontSize: 14,
    color: palette.text,
    fontWeight: '600',
  },
  scoreValue: {
    fontSize: 14,
    color: palette.subtleText,
    fontWeight: '700',
  },
  scoreTrack: {
    height: 9,
    borderRadius: 999,
    backgroundColor: palette.track,
    overflow: 'hidden',
  },
  scoreFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: palette.leaf,
  },
});
