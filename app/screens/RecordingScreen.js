import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
  Platform,
  PermissionsAndroid,
  FlatList,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useProjectStore from '../store/projectStore';
import { Camera, useCameraDevice, useCameraPermission, useMicrophonePermission } from 'react-native-vision-camera';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  interpolate,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const ASPECT_RATIOS = {
  vertical: { ratio: 9 / 16, label: '9:16' },
  horizontal: { ratio: 16 / 9, label: '16:9' },
  square: { ratio: 1, label: '1:1' },
};

// Audio Waveform Bar Component
const AudioWaveformBar = ({ audioLevel, index }) => {
  const animatedStyle = useAnimatedStyle(() => {
    const baseHeight = 8;
    const maxHeight = 40 + (index % 3) * 10;
    const height = interpolate(
      audioLevel.value,
      [0, 1],
      [baseHeight, maxHeight],
    );
    
    return {
      height: height,
      opacity: audioLevel.value > 0 ? 0.8 + (Math.sin(index) * 0.2) : 0.3,
    };
  });

  return <Animated.View style={[styles.audioWaveformBar, animatedStyle]} />;
};

const RecordingScreen = () => {
  const camera = useRef(null);
  const device = useCameraDevice('back');
  const { hasPermission: hasCameraPermission, requestPermission: requestCameraPermission } = useCameraPermission();
  const { hasPermission: hasMicrophonePermission, requestPermission: requestMicrophonePermission } = useMicrophonePermission();
  
  const [isInitialized, setIsInitialized] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showGrid, setShowGrid] = useState(true);
  const [audioLevel, setAudioLevel] = useState(0);
  const [currentClipPath, setCurrentClipPath] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const audioLevelAnimation = useSharedValue(0);
  const timerIntervalRef = useRef(null);
  
  const {
    recordingSession,
    setAspectRatio,
    addClip,
    removeClip,
    setRecordingState,
  } = useProjectStore();

  // Request permissions on mount
  useEffect(() => {
    const requestPermissions = async () => {
      if (!hasCameraPermission) {
        await requestCameraPermission();
      }
      if (!hasMicrophonePermission) {
        await requestMicrophonePermission();
      }
      setIsInitialized(true);
    };
    
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    if (!hasCameraPermission) {
      await requestCameraPermission();
    }
    if (!hasMicrophonePermission) {
      await requestMicrophonePermission();
    }
  };

  // Update audio level animation
  useEffect(() => {
    audioLevelAnimation.value = isRecording ? audioLevel / 100 : 0;
  }, [audioLevel, isRecording]);

  // Simulate audio level monitoring (in production, use actual audio level from recorder)
  useEffect(() => {
    if (!isRecording) {
      setAudioLevel(0);
      return;
    }

    const interval = setInterval(() => {
      // Simulate audio level (0-100) - in production, get from audio recorder
      const simulatedLevel = Math.random() * 60 + 20;
      setAudioLevel(simulatedLevel);
    }, 100);

    return () => clearInterval(interval);
  }, [isRecording]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = async () => {
    try {
      if (!camera.current) {
        Alert.alert('Error', 'Camera not initialized');
        return;
      }

      setIsRecording(true);
      setElapsedTime(0);
      setRecordingState(true, Date.now());

      // Start timer
      timerIntervalRef.current = setInterval(() => {
        setElapsedTime((prev) => prev + 0.1);
      }, 100);

      // Start video recording with react-native-vision-camera API
      await camera.current.startRecording({
        flash: 'off',
        onRecordingFinished: (video) => {
          console.log('Recording finished:', video);
          // Handle recording finished
          setIsRecording(false);
          setRecordingState(false, null);
          
          if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = null;
          }
          
          // Add clip to session
          if (video && video.path) {
            const clip = {
              id: Date.now().toString(),
              path: video.path,
              duration: elapsedTime,
              aspectRatio: recordingSession.currentAspectRatio,
              thumbnail: video.path, // In production, generate thumbnail from video
              timestamp: Date.now(),
              index: recordingSession.clips.length,
            };
            
            addClip(clip);
            setElapsedTime(0);
          }
        },
        onRecordingError: (error) => {
          console.error('Recording error:', error);
          Alert.alert('Recording Error', error.message || 'Recording failed');
          setIsRecording(false);
          setRecordingState(false, null);
          
          if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = null;
          }
          setElapsedTime(0);
        },
      });
    } catch (error) {
      console.error('Error starting recording:', error);
      Alert.alert('Error', 'Failed to start recording');
      setIsRecording(false);
      setRecordingState(false, null);
      
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }
  };

  const stopRecording = async () => {
    try {
      if (!camera.current || !isRecording) return;

      setIsProcessing(true);
      
      await camera.current.stopRecording();
      setIsProcessing(false);
    } catch (error) {
      console.error('Error stopping recording:', error);
      Alert.alert('Error', 'Failed to stop recording');
      setIsProcessing(false);
      setIsRecording(false);
      setRecordingState(false, null);
      
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      setElapsedTime(0);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const deleteClip = (clipId) => {
    Alert.alert(
      'Delete Clip',
      'Are you sure you want to delete this clip?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => removeClip(clipId),
        },
      ]
    );
  };

  const getAspectRatioDimensions = () => {
    const ratio = ASPECT_RATIOS[recordingSession.currentAspectRatio].ratio;
    const containerWidth = SCREEN_WIDTH;
    const containerHeight = SCREEN_HEIGHT - 200; // Account for controls
    
    let previewWidth = containerWidth;
    let previewHeight = containerWidth / ratio;

    if (previewHeight > containerHeight) {
      previewHeight = containerHeight;
      previewWidth = containerHeight * ratio;
    }

    return { width: previewWidth, height: previewHeight };
  };

  // Calculate camera preview dimensions based on aspect ratio
  const previewDimensions = getAspectRatioDimensions();

  if (!isInitialized) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.loadingText}>Initializing...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!device) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.loadingText}>Loading camera...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!hasCameraPermission || !hasMicrophonePermission) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionTitle}>Permissions Required</Text>
          <Text style={styles.permissionText}>
            EchoFinity needs access to your camera and microphone to record videos.
          </Text>
          {!hasCameraPermission && (
            <Text style={styles.permissionItem}>• Camera access is required</Text>
          )}
          {!hasMicrophonePermission && (
            <Text style={styles.permissionItem}>• Microphone access is required</Text>
          )}
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={requestPermissions}
          >
            <Text style={styles.permissionButtonText}>Grant Permissions</Text>
          </TouchableOpacity>
          <Text style={styles.permissionHint}>
            Please enable permissions in your device settings if you've previously denied them.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Camera Preview */}
      <View style={styles.cameraContainer}>
        {device && (
          <Camera
            ref={camera}
            style={[styles.camera, previewDimensions]}
            device={device}
            isActive={hasCameraPermission && hasMicrophonePermission}
            video={true}
            audio={true}
          />
        )}

        {/* Grid Overlay (Rule of Thirds) */}
        {showGrid && (
          <View style={[styles.gridOverlay, previewDimensions]} pointerEvents="none">
            {/* Horizontal lines */}
            <View style={[styles.gridLine, { top: '33.33%' }]} />
            <View style={[styles.gridLine, { top: '66.66%' }]} />
            {/* Vertical lines */}
            <View style={[styles.gridLineVertical, { left: '33.33%' }]} />
            <View style={[styles.gridLineVertical, { left: '66.66%' }]} />
          </View>
        )}

        {/* Audio Waveform Indicator */}
        {isRecording && (
          <View style={styles.audioIndicatorContainer}>
            {[...Array(15)].map((_, index) => (
              <AudioWaveformBar
                key={index}
                audioLevel={audioLevelAnimation}
                index={index}
              />
            ))}
          </View>
        )}

        {/* Top Controls */}
        <View style={styles.topControls}>
          {/* Aspect Ratio Selector */}
          <View style={styles.aspectRatioSelector}>
            {Object.keys(ASPECT_RATIOS).map((ratio) => (
              <TouchableOpacity
                key={ratio}
                style={[
                  styles.aspectRatioButton,
                  recordingSession.currentAspectRatio === ratio &&
                    styles.aspectRatioButtonActive,
                ]}
                onPress={() => setAspectRatio(ratio)}
                disabled={isRecording}
              >
                <Text
                  style={[
                    styles.aspectRatioButtonText,
                    recordingSession.currentAspectRatio === ratio &&
                      styles.aspectRatioButtonTextActive,
                  ]}
                >
                  {ASPECT_RATIOS[ratio].label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Grid Toggle */}
          <TouchableOpacity
            style={styles.gridToggle}
            onPress={() => setShowGrid(!showGrid)}
          >
            <Text style={styles.gridToggleText}>
              {showGrid ? 'Grid: On' : 'Grid: Off'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Recording Timer */}
        {isRecording && (
          <View style={styles.timerContainer}>
            <View style={styles.recordingDot} />
            <Text style={styles.timerText}>{formatTime(elapsedTime)}</Text>
          </View>
        )}
      </View>

      {/* Clips Filmstrip */}
      {recordingSession.clips.length > 0 && (
        <View style={styles.clipsContainer}>
          <Text style={styles.clipsTitle}>
            Clips ({recordingSession.clips.length})
          </Text>
          <FlatList
            horizontal
            data={recordingSession.clips}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.clipItem}>
                <Image
                  source={{ uri: `file://${item.thumbnail || item.path}` }}
                  style={styles.clipThumbnail}
                />
                <TouchableOpacity
                  style={styles.clipDeleteButton}
                  onPress={() => deleteClip(item.id)}
                >
                  <Text style={styles.clipDeleteText}>×</Text>
                </TouchableOpacity>
                <Text style={styles.clipDuration}>
                  {formatTime(item.duration)}
                </Text>
              </View>
            )}
            contentContainerStyle={styles.clipsList}
            showsHorizontalScrollIndicator={false}
          />
        </View>
      )}

      {/* Bottom Controls */}
      <View style={styles.bottomControls}>
        {/* Delete Last Clip Button */}
        {recordingSession.clips.length > 0 && !isRecording && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => {
              const lastClip = recordingSession.clips[recordingSession.clips.length - 1];
              if (lastClip) deleteClip(lastClip.id);
            }}
          >
            <Text style={styles.deleteButtonText}>Delete Last</Text>
          </TouchableOpacity>
        )}

        {/* Record Button */}
        <TouchableOpacity
          style={[
            styles.recordButton,
            isRecording && styles.recordButtonRecording,
            isProcessing && styles.recordButtonDisabled,
          ]}
          onPress={toggleRecording}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <View
              style={[
                styles.recordButtonInner,
                isRecording && styles.recordButtonInnerRecording,
              ]}
            />
          )}
        </TouchableOpacity>

        {/* Placeholder for balance */}
        <View style={styles.placeholder} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    marginTop: 16,
    fontSize: 16,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  permissionTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  permissionText: {
    color: '#CCCCCC',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  permissionItem: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 8,
  },
  permissionButton: {
    backgroundColor: '#FF0000',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
    marginTop: 24,
  },
  permissionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  permissionHint: {
    color: '#888888',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 16,
    fontStyle: 'italic',
  },
  cameraContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  camera: {
    width: '100%',
    height: '100%',
  },
  gridOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0.6,
  },
  gridLine: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    width: '100%',
    height: 1,
    left: 0,
  },
  gridLineVertical: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    width: 1,
    height: '100%',
    top: 0,
  },
  audioIndicatorContainer: {
    position: 'absolute',
    bottom: 100,
    left: '50%',
    transform: [{ translateX: -75 }],
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    height: 60,
    gap: 3,
  },
  audioWaveformBar: {
    width: 3,
    backgroundColor: '#00FF00',
    borderRadius: 1.5,
    minHeight: 8,
    maxHeight: 60,
  },
  topControls: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 8,
  },
  aspectRatioSelector: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 8,
    padding: 4,
  },
  aspectRatioButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  aspectRatioButtonActive: {
    backgroundColor: '#FF0000',
  },
  aspectRatioButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  aspectRatioButtonTextActive: {
    fontWeight: 'bold',
  },
  gridToggle: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  gridToggleText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  timerContainer: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF0000',
    marginRight: 8,
  },
  timerText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  clipsContainer: {
    height: 120,
    backgroundColor: '#1A1A1A',
    paddingVertical: 12,
  },
  clipsTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  clipsList: {
    paddingHorizontal: 16,
  },
  clipItem: {
    marginRight: 12,
    alignItems: 'center',
  },
  clipThumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#333333',
  },
  clipDeleteButton: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FF0000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  clipDeleteText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    lineHeight: 20,
  },
  clipDuration: {
    color: '#FFFFFF',
    fontSize: 10,
    marginTop: 4,
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 32,
    backgroundColor: '#000000',
  },
  deleteButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 0, 0, 0.2)',
    borderWidth: 1,
    borderColor: '#FF0000',
  },
  deleteButtonText: {
    color: '#FF0000',
    fontSize: 14,
    fontWeight: '600',
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FF0000',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 32,
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  recordButtonRecording: {
    backgroundColor: '#333333',
  },
  recordButtonDisabled: {
    opacity: 0.5,
  },
  recordButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
  },
  recordButtonInnerRecording: {
    width: 30,
    height: 30,
    borderRadius: 4,
  },
  placeholder: {
    width: 80,
  },
});

export default RecordingScreen;
