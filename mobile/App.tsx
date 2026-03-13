import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { CameraType, CameraView, type CameraCapturedPicture, useCameraPermissions } from 'expo-camera';
import {
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/manrope';

import { checkApiHealth, predictLeaf, type HealthResponse, type PredictionResponse } from './src/api';
import { DEFAULT_API_URL, diseaseThemes, palette } from './src/theme';


function StatusPill({
  label,
  tone = 'neutral',
}: {
  label: string;
  tone?: 'success' | 'warning' | 'neutral';
}) {
  const toneStyles = {
    success: {
      backgroundColor: 'rgba(125, 186, 93, 0.18)',
      borderColor: 'rgba(171, 232, 120, 0.32)',
      textColor: '#F4FFE8',
    },
    warning: {
      backgroundColor: 'rgba(244, 179, 80, 0.18)',
      borderColor: 'rgba(255, 219, 142, 0.34)',
      textColor: '#FFF6E1',
    },
    neutral: {
      backgroundColor: 'rgba(255, 255, 255, 0.12)',
      borderColor: 'rgba(255, 255, 255, 0.18)',
      textColor: '#F7F4EE',
    },
  }[tone];

  return (
    <View
      style={[
        styles.statusPill,
        {
          backgroundColor: toneStyles.backgroundColor,
          borderColor: toneStyles.borderColor,
        },
      ]}
    >
      <Text style={[styles.statusPillText, { color: toneStyles.textColor }]}>{label}</Text>
    </View>
  );
}


function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}


function ScoreBar({ label, value, accentColor }: { label: string; value: number; accentColor: string }) {
  const width = `${Math.max(8, Math.round(value * 100))}%` as const;

  return (
    <View style={styles.scoreRow}>
      <View style={styles.scoreHeader}>
        <Text style={styles.scoreLabel}>{label}</Text>
        <Text style={styles.scoreValue}>{Math.round(value * 100)}%</Text>
      </View>
      <View style={styles.scoreTrack}>
        <View style={[styles.scoreFill, { width, backgroundColor: accentColor }]} />
      </View>
    </View>
  );
}


function ProtocolStep({
  step,
  title,
  detail,
}: {
  step: string;
  title: string;
  detail: string;
}) {
  return (
    <View style={styles.protocolCard}>
      <Text style={styles.protocolStep}>{step}</Text>
      <Text style={styles.protocolTitle}>{title}</Text>
      <Text style={styles.protocolDetail}>{detail}</Text>
    </View>
  );
}


export default function App() {
  const [fontsLoaded] = useFonts({
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
  });
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const cameraRef = useRef<CameraView | null>(null);
  const [photo, setPhoto] = useState<CameraCapturedPicture | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [healthInfo, setHealthInfo] = useState<HealthResponse | null>(null);
  const [apiStatus, setApiStatus] = useState('Verification du backend...');
  const [apiHealthy, setApiHealthy] = useState<boolean | null>(null);
  const [result, setResult] = useState<PredictionResponse | null>(null);
  const [isTestingApi, setIsTestingApi] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const apiUrl = DEFAULT_API_URL;

  const resultTone = result ? diseaseThemes[result.predicted_class] ?? diseaseThemes.default : diseaseThemes.default;
  const sortedScores = result
    ? Object.entries(result.scores).sort((left, right) => right[1] - left[1])
    : [];

  useEffect(() => {
    if (!fontsLoaded) {
      return;
    }

    void runHealthCheck(true);
  }, [fontsLoaded]);

  const handleFlipCamera = () => {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  };

  const ensureCameraPermission = async () => {
    const response = await requestPermission();
    if (!response.granted) {
      Alert.alert('Permission requise', "L'application doit acceder a la camera pour fonctionner.");
      return false;
    }
    return true;
  };

  const openCamera = async () => {
    if (permission?.granted) {
      setCameraOpen(true);
      return;
    }

    const granted = await ensureCameraPermission();
    if (granted) {
      setCameraOpen(true);
    }
  };

  const handleRequestPermission = async () => {
    await ensureCameraPermission();
  };

  const runHealthCheck = async (silent = false) => {
    try {
      if (!silent) {
        setIsTestingApi(true);
      }

      const health = await checkApiHealth(apiUrl);
      setHealthInfo(health);
      setApiHealthy(true);
      setApiStatus(
        health.cohere_enabled
          ? `Backend en ligne - ${health.classes.length} classes - Cohere actif`
          : `Backend en ligne - ${health.classes.length} classes`
      );
    } catch (error) {
      setHealthInfo(null);
      setApiHealthy(false);
      setApiStatus(error instanceof Error ? error.message : 'Connexion impossible');
    } finally {
      if (!silent) {
        setIsTestingApi(false);
      }
    }
  };

  const handleTakePhoto = async () => {
    if (!cameraRef.current) {
      return;
    }

    try {
      setIsCapturing(true);
      setResult(null);

      const captured = await cameraRef.current.takePictureAsync({
        quality: 0.9,
      });

      setPhoto(captured);
      setCameraOpen(false);
    } catch (error) {
      Alert.alert('Capture impossible', "La photo n'a pas pu etre prise.");
    } finally {
      setIsCapturing(false);
    }
  };

  const handleRetake = () => {
    setPhoto(null);
    setResult(null);
    void openCamera();
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

  const renderCapturePreview = () => {
    if (!permission) {
      return (
        <View style={styles.centerState}>
          <ActivityIndicator color={palette.leafBright} size="large" />
          <Text style={styles.stateText}>Preparation de la camera...</Text>
        </View>
      );
    }

    if (photo?.uri) {
      return <Image source={{ uri: photo.uri }} style={styles.cameraPreview} resizeMode="cover" />;
    }

    if (!permission.granted) {
      return (
        <LinearGradient colors={palette.cameraGradient} style={styles.centerState}>
          <Text style={styles.stateTitle}>Camera non autorisee</Text>
          <Text style={styles.stateText}>
            Autorisez la camera pour photographier une feuille, puis ouvrez la capture en plein ecran.
          </Text>
          <Pressable style={styles.permissionButton} onPress={handleRequestPermission}>
            <Text style={styles.permissionButtonText}>Autoriser la camera</Text>
          </Pressable>
        </LinearGradient>
      );
    }

    return (
      <LinearGradient colors={palette.cameraGradient} style={styles.centerState}>
        <Text style={styles.stateTitle}>Camera prete</Text>
        <Text style={styles.stateText}>
          Ouvrez la camera en plein ecran pour prendre une photo sans bloquer les boutons.
        </Text>
      </LinearGradient>
    );
  };

  if (!fontsLoaded) {
    return (
      <SafeAreaView style={styles.loadingScreen}>
        <ActivityIndicator color={palette.leafDark} size="large" />
      </SafeAreaView>
    );
  }

  return (
    <LinearGradient colors={palette.screenGradient} style={styles.screenGradient}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="dark" />
        <KeyboardAvoidingView
          style={styles.screen}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <LinearGradient colors={palette.heroGradient} style={styles.heroCard}>
              <View style={styles.heroHeader}>
                <View style={styles.brandBlock}>
                  <Text style={styles.kicker}>AgriSmart Vision</Text>
                  <Text style={styles.title}>Analyse feuille</Text>
                </View>
                <View style={styles.heroStamp}>
                  <Text style={styles.heroStampText}>Mobile ready</Text>
                </View>
              </View>

              <Text style={styles.subtitle}>
                Une interface mobile moderne pour capturer une feuille de mais, lancer le modele
                final et restituer un diagnostic clair avec commentaire IA.
              </Text>

              <View style={styles.heroPills}>
                <StatusPill
                  label={
                    apiHealthy === null
                      ? 'Connexion en cours'
                      : apiHealthy
                        ? 'Backend en ligne'
                        : 'Backend indisponible'
                  }
                  tone={apiHealthy === false ? 'warning' : apiHealthy ? 'success' : 'neutral'}
                />
                <StatusPill
                  label={healthInfo?.cohere_enabled ? 'Commentaire Cohere' : 'Commentaire local'}
                  tone={healthInfo?.cohere_enabled ? 'success' : 'neutral'}
                />
              </View>

              <Text style={styles.heroFootnote}>{apiStatus}</Text>
            </LinearGradient>

            <View style={styles.protocolRow}>
              <ProtocolStep
                step="01"
                title="Capturer"
                detail="Cadrez une seule feuille dans la zone guidee pour une lecture plus stable."
              />
              <ProtocolStep
                step="02"
                title="Predire"
                detail="Le modele TFLite estime la classe et le niveau de confiance."
              />
              <ProtocolStep
                step="03"
                title="Commenter"
                detail="Le backend ajoute un commentaire local ou Cohere selon la configuration."
              />
            </View>

            {apiHealthy === false ? (
              <View style={styles.supportCard}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionTitle}>Assistance backend</Text>
                  <Pressable style={styles.inlineAction} onPress={() => void runHealthCheck()}>
                    <Text style={styles.inlineActionText}>
                      {isTestingApi ? 'Verification...' : 'Retester'}
                    </Text>
                  </Pressable>
                </View>

                <Text style={styles.helperText}>
                  Le backend public ne repond pas encore. L application reste deja pointee vers
                  l URL finale, sans saisie manuelle cote utilisateur.
                </Text>

                <View style={styles.supportUrlBox}>
                  <Text style={styles.supportUrlLabel}>URL backend</Text>
                  <Text style={styles.supportUrlText}>{apiUrl}</Text>
                </View>
              </View>
            ) : null}

            <View style={styles.cameraCard}>
              <View style={styles.sectionHeaderRow}>
                <View>
                  <Text style={styles.sectionEyebrow}>Capture</Text>
                  <Text style={styles.sectionTitle}>Photo de la feuille</Text>
                </View>
                <Pressable style={styles.inlineGhost} onPress={photo ? handleRetake : openCamera}>
                  <Text style={styles.inlineGhostText}>{photo ? 'Reprendre' : 'Ouvrir'}</Text>
                </Pressable>
              </View>

              <View style={styles.cameraShell}>
                {renderCapturePreview()}
                <View pointerEvents="none" style={styles.focusFrame} />
              </View>

              <Text style={styles.captureHelper}>
                {photo
                  ? 'La photo est prete. Vous pouvez relancer la camera ou analyser directement.'
                  : 'La camera s ouvre maintenant en plein ecran pour une prise de vue plus fiable sur Android.'}
              </Text>

              <View style={styles.captureRow}>
                <Pressable
                  style={styles.minorButton}
                  onPress={photo ? handleRetake : openCamera}
                >
                  <Text style={styles.minorButtonText}>{photo ? 'Nouvelle photo' : 'Ouvrir la camera'}</Text>
                </Pressable>

                <Pressable
                  style={[styles.minorButton, (!photo || isAnalyzing) && styles.buttonDisabled]}
                  onPress={handleAnalyze}
                  disabled={!photo || isAnalyzing}
                >
                  <Text style={styles.minorButtonText}>{isAnalyzing ? 'Analyse...' : 'Analyser'}</Text>
                </Pressable>
              </View>

              <Pressable
                style={[styles.primaryAction, isCapturing && styles.buttonDisabled]}
                onPress={openCamera}
                disabled={isCapturing}
              >
                <LinearGradient colors={palette.primaryButtonGradient} style={styles.primaryActionFill}>
                  <Text style={styles.primaryActionText}>
                    {photo ? 'Reprendre une photo' : 'Ouvrir la camera en plein ecran'}
                  </Text>
                </LinearGradient>
              </Pressable>
            </View>

            <Modal
              visible={cameraOpen}
              animationType="slide"
              presentationStyle="fullScreen"
              onRequestClose={() => setCameraOpen(false)}
            >
              <View style={styles.modalScreen}>
                <View style={styles.modalHeader}>
                  <Pressable style={styles.modalChip} onPress={() => setCameraOpen(false)}>
                    <Text style={styles.modalChipText}>Fermer</Text>
                  </Pressable>
                  <Pressable style={styles.modalChip} onPress={handleFlipCamera}>
                    <Text style={styles.modalChipText}>Tourner</Text>
                  </Pressable>
                </View>

                <View style={styles.modalPreviewShell}>
                  {permission?.granted ? (
                    <CameraView ref={cameraRef} style={styles.modalPreview} facing={facing} mute />
                  ) : (
                    <LinearGradient colors={palette.cameraGradient} style={styles.centerState}>
                      <Text style={styles.stateTitle}>Camera indisponible</Text>
                      <Text style={styles.stateText}>
                        Autorisez la camera pour continuer la capture.
                      </Text>
                      <Pressable style={styles.permissionButton} onPress={handleRequestPermission}>
                        <Text style={styles.permissionButtonText}>Autoriser la camera</Text>
                      </Pressable>
                    </LinearGradient>
                  )}
                  <View pointerEvents="none" style={styles.modalFocusFrame} />
                </View>

                <View style={styles.modalFooter}>
                  <Text style={styles.modalHint}>
                    Cadrez une seule feuille bien visible, puis appuyez sur le bouton central.
                  </Text>

                  <Pressable
                    style={[styles.modalCaptureButton, isCapturing && styles.buttonDisabled]}
                    onPress={handleTakePhoto}
                    disabled={isCapturing}
                  >
                    <View style={styles.modalCaptureButtonInner}>
                      <Text style={styles.captureButtonText}>{isCapturing ? '...' : 'Prendre'}</Text>
                    </View>
                  </Pressable>
                </View>
              </View>
            </Modal>

            {result ? (
              <View style={styles.resultStack}>
                <View style={[styles.resultHero, { backgroundColor: resultTone.surface, borderColor: resultTone.border }]}>
                  <View style={styles.resultHeroTop}>
                    <View style={[styles.resultBadge, { backgroundColor: resultTone.badge }]}>
                      <Text style={[styles.resultBadgeText, { color: resultTone.accent }]}>
                        {resultTone.tag}
                      </Text>
                    </View>
                    <View style={[styles.resultSourceChip, { borderColor: resultTone.border }]}>
                      <Text style={styles.resultSourceText}>
                        {result.commentary_source === 'cohere' ? 'Cohere' : 'Local'}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.resultTitle}>{result.predicted_label}</Text>
                  <Text style={styles.resultSubtitle}>
                    La prediction finale est structuree pour une lecture immediate et une decision
                    plus claire pendant la demonstration.
                  </Text>

                  <View style={styles.metricRow}>
                    <MetricCard label="Confiance" value={`${Math.round(result.confidence * 100)}%`} />
                    <MetricCard label="Inference" value={`${result.inference_time_ms} ms`} />
                    <MetricCard
                      label="Commentaire"
                      value={result.commentary_source === 'cohere' ? 'Cohere' : 'Local'}
                    />
                  </View>
                </View>

                <View style={styles.cardGrid}>
                  <View style={styles.detailCard}>
                    <Text style={styles.detailCardTitle}>Commentaire intelligent</Text>
                    <Text style={styles.detailCardText}>{result.commentary}</Text>
                  </View>

                  <View style={styles.detailCard}>
                    <Text style={styles.detailCardTitle}>Action terrain</Text>
                    <Text style={styles.detailCardText}>{result.advice}</Text>
                  </View>
                </View>

                <View style={styles.scoresCard}>
                  <Text style={styles.detailCardTitle}>Probabilites par classe</Text>
                  <Text style={styles.scoresIntro}>
                    Le diagnostic montre aussi la repartition complete des scores du modele.
                  </Text>
                  {sortedScores.map(([label, value]) => (
                    <ScoreBar key={label} label={label} value={value} accentColor={resultTone.accent} />
                  ))}
                </View>
              </View>
            ) : (
              <View style={styles.placeholderCard}>
                <Text style={styles.placeholderTitle}>Pret pour la demonstration</Text>
                <Text style={styles.placeholderText}>
                  Prenez une photo nette, lancez le diagnostic, puis presentez la confiance, le
                  commentaire et la recommandation terrain.
                </Text>
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}


const styles = StyleSheet.create({
  screenGradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  screen: {
    flex: 1,
  },
  loadingScreen: {
    flex: 1,
    backgroundColor: palette.loadingBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 18,
    gap: 18,
    paddingBottom: 42,
  },
  heroCard: {
    borderRadius: 30,
    padding: 24,
    gap: 14,
    shadowColor: '#0A1410',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 7,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  brandBlock: {
    flex: 1,
    gap: 4,
  },
  kicker: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: palette.kicker,
  },
  title: {
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 34,
    color: palette.heroTitle,
  },
  subtitle: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 15,
    lineHeight: 23,
    color: palette.heroText,
  },
  heroPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  heroFootnote: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 13,
    lineHeight: 18,
    color: palette.heroSubtle,
  },
  statusPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  statusPillText: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 12,
  },
  heroStamp: {
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  heroStampText: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 12,
    color: palette.heroTitle,
  },
  protocolRow: {
    gap: 12,
  },
  protocolCard: {
    backgroundColor: palette.protocolCard,
    borderRadius: 24,
    padding: 18,
    gap: 8,
    borderWidth: 1,
    borderColor: palette.protocolBorder,
  },
  protocolStep: {
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: palette.protocolStep,
  },
  protocolTitle: {
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 20,
    color: palette.text,
  },
  protocolDetail: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 14,
    lineHeight: 21,
    color: palette.subtleText,
  },
  supportCard: {
    backgroundColor: palette.supportSurface,
    borderRadius: 24,
    padding: 18,
    gap: 12,
    borderWidth: 1,
    borderColor: palette.supportBorder,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  sectionEyebrow: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1.1,
    color: palette.sectionEyebrow,
  },
  sectionTitle: {
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 22,
    color: palette.text,
  },
  helperText: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 14,
    lineHeight: 21,
    color: palette.subtleText,
  },
  supportUrlBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.52)',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 4,
  },
  supportUrlLabel: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: palette.supportAccent,
  },
  supportUrlText: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 14,
    lineHeight: 21,
    color: palette.text,
  },
  inlineAction: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: palette.actionPale,
  },
  inlineActionText: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 12,
    color: palette.leafDark,
  },
  inlineGhost: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: palette.darkShellBorder,
  },
  inlineGhostText: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 12,
    color: palette.card,
  },
  cameraCard: {
    backgroundColor: palette.darkShell,
    borderRadius: 30,
    padding: 18,
    gap: 14,
    shadowColor: '#09120F',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.22,
    shadowRadius: 24,
    elevation: 8,
  },
  cameraShell: {
    height: 430,
    overflow: 'hidden',
    borderRadius: 26,
    position: 'relative',
    backgroundColor: '#0B1310',
  },
  cameraPreview: {
    flex: 1,
  },
  captureHelper: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 14,
    lineHeight: 21,
    color: '#D7DBD4',
  },
  focusFrame: {
    position: 'absolute',
    top: '18%',
    left: '12%',
    right: '12%',
    bottom: '20%',
    borderRadius: 28,
    borderWidth: 2,
    borderColor: palette.guideBorder,
    backgroundColor: palette.guideFill,
  },
  cameraOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    padding: 16,
  },
  cameraOverlayTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  cameraOverlayBottom: {
    alignItems: 'center',
  },
  cameraHint: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 13,
    color: '#F2F0E8',
    textAlign: 'center',
    backgroundColor: 'rgba(5, 10, 8, 0.34)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 26,
    gap: 14,
  },
  stateTitle: {
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 22,
    color: '#F9F6F0',
    textAlign: 'center',
  },
  stateText: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 14,
    lineHeight: 21,
    color: '#D7DBD4',
    textAlign: 'center',
  },
  permissionButton: {
    backgroundColor: '#F0E7D5',
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  permissionButtonText: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 14,
    color: palette.darkShell,
  },
  captureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  minorButton: {
    flex: 1,
    minHeight: 54,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: palette.darkShellBorder,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  minorButtonText: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 14,
    color: '#F5F2EA',
  },
  captureButton: {
    width: 88,
    height: 88,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F2E8D8',
  },
  captureButtonInner: {
    width: 68,
    height: 68,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.captureInner,
  },
  captureButtonText: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 12,
    color: '#FFF8F0',
  },
  modalScreen: {
    flex: 1,
    backgroundColor: palette.darkShell,
    paddingTop: 18,
    paddingHorizontal: 18,
    paddingBottom: 24,
    gap: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  modalChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: palette.darkShellBorder,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  modalChipText: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 13,
    color: '#F5F2EA',
  },
  modalPreviewShell: {
    flex: 1,
    borderRadius: 30,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#0B1310',
  },
  modalPreview: {
    flex: 1,
  },
  modalFocusFrame: {
    position: 'absolute',
    top: '16%',
    left: '10%',
    right: '10%',
    bottom: '18%',
    borderRadius: 30,
    borderWidth: 2,
    borderColor: palette.guideBorder,
    backgroundColor: palette.guideFill,
  },
  modalFooter: {
    alignItems: 'center',
    gap: 16,
    paddingBottom: Platform.OS === 'ios' ? 12 : 0,
  },
  modalHint: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    color: '#D7DBD4',
  },
  modalCaptureButton: {
    width: 104,
    height: 104,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F2E8D8',
  },
  modalCaptureButtonInner: {
    width: 78,
    height: 78,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.captureInner,
  },
  primaryAction: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  primaryActionFill: {
    minHeight: 58,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    paddingHorizontal: 18,
  },
  primaryActionText: {
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  resultStack: {
    gap: 14,
  },
  resultHero: {
    borderRadius: 28,
    padding: 20,
    borderWidth: 1,
    gap: 14,
  },
  resultHeroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  resultBadge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  resultBadgeText: {
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  resultSourceChip: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
  },
  resultSourceText: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 12,
    color: palette.text,
  },
  resultTitle: {
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 30,
    color: palette.text,
  },
  resultSubtitle: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 14,
    lineHeight: 21,
    color: palette.subtleText,
  },
  metricRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metricCard: {
    flexGrow: 1,
    minWidth: 92,
    backgroundColor: palette.metricCard,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 4,
  },
  metricValue: {
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 20,
    color: palette.text,
  },
  metricLabel: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 12,
    color: palette.subtleText,
  },
  cardGrid: {
    gap: 14,
  },
  detailCard: {
    backgroundColor: palette.card,
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: palette.border,
    gap: 10,
  },
  detailCardTitle: {
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 18,
    color: palette.text,
  },
  detailCardText: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 15,
    lineHeight: 23,
    color: palette.subtleText,
  },
  scoresCard: {
    backgroundColor: palette.card,
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: palette.border,
    gap: 12,
  },
  scoresIntro: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 14,
    lineHeight: 21,
    color: palette.subtleText,
  },
  scoreRow: {
    gap: 6,
  },
  scoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  scoreLabel: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 14,
    color: palette.text,
  },
  scoreValue: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 14,
    color: palette.subtleText,
  },
  scoreTrack: {
    height: 10,
    borderRadius: 999,
    backgroundColor: palette.track,
    overflow: 'hidden',
  },
  scoreFill: {
    height: '100%',
    borderRadius: 999,
  },
  placeholderCard: {
    backgroundColor: palette.card,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: palette.border,
    gap: 10,
  },
  placeholderTitle: {
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 20,
    color: palette.text,
  },
  placeholderText: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 15,
    lineHeight: 22,
    color: palette.subtleText,
  },
});
