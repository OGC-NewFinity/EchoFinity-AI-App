import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Modal,
  Image,
  Alert,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView, PanGestureHandler } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  useAnimatedGestureHandler,
  runOnJS,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import useProjectStore from '../store/projectStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TIMELINE_HEIGHT = 120;
const CLIP_THUMBNAIL_HEIGHT = 80;
const CLIP_MIN_WIDTH = 60;

const EditingScreen = () => {
  const [showEffectsModal, setShowEffectsModal] = useState(false);
  const [selectedClipForEffects, setSelectedClipForEffects] = useState(null);
  const timelineScrollRef = useRef(null);
  const playheadPosition = useSharedValue(0);
  const draggingClipIndex = useSharedValue(-1);

  const {
    recordingSession,
    editingSession,
    initializeEditingSession,
    selectClip,
    updateClipTrim,
    splitClip,
    reorderClips,
    updateClipTransition,
    updateClipSpeed,
    removeClip,
    setPlayheadPosition,
    setIsPlaying,
  } = useProjectStore();

  // Initialize editing session when component mounts
  useEffect(() => {
    if (recordingSession.clips.length > 0 && editingSession.clips.length === 0) {
      initializeEditingSession();
    }
  }, []);

  const clips = editingSession.clips.length > 0
    ? editingSession.clips
    : recordingSession.clips.map((clip, index) => ({
      ...clip,
      startTime: 0,
      endTime: clip.duration,
      trimmedDuration: clip.duration,
      transition: null,
      speed: 1.0,
      effects: [],
    }));

  const selectedClip = clips.find((c) => c.id === editingSession.selectedClipId || clips[0]?.id);

  // Calculate total timeline duration
  const totalDuration = clips.reduce((sum, clip) => sum + (clip.trimmedDuration || clip.duration), 0);

  // Calculate clip positions on timeline
  const getClipTimelineData = () => {
    const timelineWidth = SCREEN_WIDTH - 40;
    let currentTime = 0;
    return clips.map((clip) => {
      const duration = clip.trimmedDuration || clip.duration;
      const width = (duration / totalDuration) * timelineWidth;
      const position = (currentTime / totalDuration) * timelineWidth;
      currentTime += duration;
      return {
        ...clip,
        timelinePosition: position,
        timelineWidth: Math.max(width, CLIP_MIN_WIDTH),
        timelineDuration: duration,
        timelineStartTime: currentTime - duration,
      };
    });
  };

  const timelineData = getClipTimelineData();

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleClipSelect = (clipId) => {
    selectClip(clipId);
  };

  const handleSplitClip = (clipId) => {
    const clip = clips.find((c) => c.id === clipId);
    if (!clip) return;

    const currentPlayhead = editingSession.playheadPosition || 0;
    const timelineItem = timelineData.find((c) => c.id === clipId);
    if (!timelineItem) return;

    const clipStartTime = timelineItem.timelineStartTime || 0;
    const splitTime = currentPlayhead - clipStartTime;
    const clipDuration = clip.trimmedDuration || clip.duration;

    if (splitTime > 0.5 && splitTime < clipDuration - 0.5) {
      splitClip(clipId, splitTime);
    } else {
      Alert.alert(
        'Invalid Split',
        `Please position the playhead within the clip (minimum 0.5s from edges). Current position: ${formatTime(currentPlayhead)}`
      );
    }
  };

  const handleApplyTransition = (transitionType) => {
    if (!selectedClipForEffects) return;

    const transition = {
      type: transitionType,
      duration: 0.5, // Default 0.5 seconds
    };

    updateClipTransition(selectedClipForEffects.id, transition);
    setShowEffectsModal(false);
    setSelectedClipForEffects(null);
  };

  const handleApplySpeed = (speed) => {
    if (!selectedClipForEffects) return;
    updateClipSpeed(selectedClipForEffects.id, speed);
    setShowEffectsModal(false);
    setSelectedClipForEffects(null);
  };

  const handleDeleteClip = (clipId) => {
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

  const handlePlayPause = () => {
    setIsPlaying(!editingSession.isPlaying);
  };

  const handleTrimDrag = React.useCallback((clipId, side, deltaTime) => {
    const currentClips = editingSession.clips.length > 0
      ? editingSession.clips
      : recordingSession.clips;
    const clip = currentClips.find((c) => c.id === clipId);
    if (!clip) return;

    const currentStart = clip.startTime || 0;
    const currentEnd = clip.endTime || clip.duration;
    const maxDuration = clip.duration;

    if (side === 'start') {
      const newStart = Math.max(0, Math.min(currentStart + deltaTime, currentEnd - 0.5));
      updateClipTrim(clipId, newStart, currentEnd);
    } else {
      const newEnd = Math.min(maxDuration, Math.max(currentStart + 0.5, currentEnd + deltaTime));
      updateClipTrim(clipId, currentStart, newEnd);
    }
  }, [editingSession.clips, recordingSession.clips, updateClipTrim]);

  // Trimming handlers
  const TrimHandle = ({ clipId, side }) => {
    const translateX = useSharedValue(0);
    const startX = useSharedValue(0);

    const gestureHandler = useAnimatedGestureHandler({
      onStart: () => {
        startX.value = translateX.value;
      },
      onActive: (event) => {
        translateX.value = startX.value + event.translationX;
        const timelineWidth = SCREEN_WIDTH - 40;
        const scale = totalDuration / timelineWidth;
        const deltaTime = event.translationX * scale;

        runOnJS(handleTrimDrag)(clipId, side, deltaTime);
      },
      onEnd: () => {
        translateX.value = withSpring(0);
        startX.value = 0;
      },
    });

    const style = useAnimatedStyle(() => ({
      transform: [{ translateX: translateX.value }],
    }));

    return (
      <PanGestureHandler onGestureEvent={gestureHandler}>
        <Animated.View
          style={[
            styles.trimHandle,
            side === 'start' ? styles.trimHandleStart : styles.trimHandleEnd,
            style,
          ]}
        />
      </PanGestureHandler>
    );
  };

  // Drag and drop for reordering
  const DraggableClip = ({ clip, index, timelineItem }) => {
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const scale = useSharedValue(1);
    const startX = useSharedValue(0);

    const gestureHandler = useAnimatedGestureHandler({
      onStart: () => {
        draggingClipIndex.value = index;
        scale.value = withSpring(1.1);
        startX.value = timelineItem.timelinePosition;
      },
      onActive: (event) => {
        translateX.value = event.translationX;
        translateY.value = event.translationY;
      },
      onEnd: () => {
        const timelineWidth = SCREEN_WIDTH - 40;
        const newPosition = startX.value + translateX.value;
        const avgClipWidth = timelineWidth / clips.length;
        const targetIndex = Math.round(newPosition / avgClipWidth);
        const validIndex = Math.max(0, Math.min(clips.length - 1, targetIndex));

        if (validIndex !== index) {
          runOnJS(reorderClips)(index, validIndex);
        }

        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        scale.value = withSpring(1);
        draggingClipIndex.value = -1;
      },
    });

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
      ],
      zIndex: draggingClipIndex.value === index ? 1000 : 1,
    }));

    const isSelected = editingSession.selectedClipId === clip.id;

    return (
      <PanGestureHandler onGestureEvent={gestureHandler}>
        <Animated.View
          style={[
            styles.clipThumbnail,
            {
              width: timelineItem.timelineWidth,
              left: timelineItem.timelinePosition,
            },
            isSelected && styles.clipThumbnailSelected,
            animatedStyle,
          ]}
        >
          <TouchableOpacity
            style={styles.clipThumbnailTouch}
            onPress={() => handleClipSelect(clip.id)}
            activeOpacity={0.8}
          >
            <Image
              source={{ uri: `file://${clip.thumbnail || clip.path}` }}
              style={styles.clipThumbnailImage}
            />
            <View style={styles.clipOverlay}>
              <Text style={styles.clipDurationText}>
                {formatTime(clip.trimmedDuration || clip.duration)}
              </Text>
            </View>
          </TouchableOpacity>

          {isSelected && (
            <>
              <TrimHandle clipId={clip.id} side="start" />
              <TrimHandle clipId={clip.id} side="end" />
            </>
          )}
        </Animated.View>
      </PanGestureHandler>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <GestureHandlerRootView style={styles.container}>
        {/* Video Preview Area */}
        <View style={styles.previewContainer}>
          {selectedClip ? (
            <Image
              source={{ uri: `file://${selectedClip.thumbnail || selectedClip.path}` }}
              style={styles.previewImage}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.previewPlaceholder}>
              <Text style={styles.previewPlaceholderText}>No clip selected</Text>
            </View>
          )}
        </View>

        {/* Playback Controls */}
        <View style={styles.playbackControls}>
          <TouchableOpacity
            style={styles.playButton}
            onPress={handlePlayPause}
          >
            <Text style={styles.playButtonText}>
              {editingSession.isPlaying ? '⏸' : '▶'}
            </Text>
          </TouchableOpacity>
          <Text style={styles.timeDisplay}>
            {formatTime(editingSession.playheadPosition || 0)} / {formatTime(totalDuration)}
          </Text>
          <TouchableOpacity
            style={styles.effectsButton}
            onPress={() => {
              if (selectedClip) {
                setSelectedClipForEffects(selectedClip);
                setShowEffectsModal(true);
              }
            }}
          >
            <Text style={styles.effectsButtonText}>Effects</Text>
          </TouchableOpacity>
        </View>

        {/* Timeline */}
        <View style={styles.timelineContainer}>
          <View style={styles.timelineHeader}>
            <Text style={styles.timelineTitle}>Timeline</Text>
            <TouchableOpacity
              style={styles.splitButton}
              onPress={() => {
                if (selectedClip) {
                  handleSplitClip(selectedClip.id);
                }
              }}
            >
              <Text style={styles.splitButtonText}>Split</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            ref={timelineScrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.timelineScroll}
            contentContainerStyle={styles.timelineContent}
          >
            <View style={styles.timelineTrack}>
              {timelineData.map((timelineItem, index) => {
                const clip = clips.find((c) => c.id === timelineItem.id);
                if (!clip) return null;
                return (
                  <DraggableClip
                    key={clip.id}
                    clip={clip}
                    index={index}
                    timelineItem={timelineItem}
                  />
                );
              })}
            </View>

            {/* Playhead */}
            {totalDuration > 0 && (
              <View
                style={[
                  styles.playhead,
                  {
                    left: Math.min(
                      ((editingSession.playheadPosition || 0) / totalDuration) * (SCREEN_WIDTH - 40),
                      SCREEN_WIDTH - 42
                    ),
                  },
                ]}
              />
            )}
          </ScrollView>
        </View>

        {/* Effects Modal */}
        <Modal
          visible={showEffectsModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowEffectsModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Transitions & Effects</Text>
                <TouchableOpacity
                  onPress={() => setShowEffectsModal(false)}
                  style={styles.modalCloseButton}
                >
                  <Text style={styles.modalCloseText}>✕</Text>
                </TouchableOpacity>
              </View>

              {/* Transitions */}
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Transitions</Text>
                <View style={styles.effectButtons}>
                  <TouchableOpacity
                    style={styles.effectButton}
                    onPress={() => handleApplyTransition('fadeIn')}
                  >
                    <Text style={styles.effectButtonText}>Fade In</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.effectButton}
                    onPress={() => handleApplyTransition('fadeOut')}
                  >
                    <Text style={styles.effectButtonText}>Fade Out</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.effectButton}
                    onPress={() => handleApplyTransition('crossDissolve')}
                  >
                    <Text style={styles.effectButtonText}>Cross Dissolve</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Speed */}
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Playback Speed</Text>
                <View style={styles.effectButtons}>
                  <TouchableOpacity
                    style={styles.effectButton}
                    onPress={() => handleApplySpeed(0.5)}
                  >
                    <Text style={styles.effectButtonText}>0.5x (Slow)</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.effectButton}
                    onPress={() => handleApplySpeed(1.0)}
                  >
                    <Text style={styles.effectButtonText}>1.0x (Normal)</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.effectButton}
                    onPress={() => handleApplySpeed(1.5)}
                  >
                    <Text style={styles.effectButtonText}>1.5x (Fast)</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.effectButton}
                    onPress={() => handleApplySpeed(2.0)}
                  >
                    <Text style={styles.effectButtonText}>2.0x (Very Fast)</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Remove Effect */}
              <TouchableOpacity
                style={styles.removeEffectButton}
                onPress={() => {
                  if (selectedClipForEffects) {
                    updateClipTransition(selectedClipForEffects.id, null);
                    updateClipSpeed(selectedClipForEffects.id, 1.0);
                    setShowEffectsModal(false);
                    setSelectedClipForEffects(null);
                  }
                }}
              >
                <Text style={styles.removeEffectButtonText}>Remove Effects</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </GestureHandlerRootView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  previewContainer: {
    height: 300,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  previewPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewPlaceholderText: {
    color: '#666666',
    fontSize: 16,
  },
  playbackControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#1A1A1A',
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  playButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FF0000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
  },
  timeDisplay: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  effectsButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#333333',
  },
  effectsButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  timelineContainer: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  timelineTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  splitButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#FF0000',
  },
  splitButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  timelineScroll: {
    flex: 1,
  },
  timelineContent: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    minWidth: SCREEN_WIDTH,
  },
  timelineTrack: {
    height: CLIP_THUMBNAIL_HEIGHT,
    position: 'relative',
  },
  clipThumbnail: {
    position: 'absolute',
    height: CLIP_THUMBNAIL_HEIGHT,
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: '#333333',
  },
  clipThumbnailSelected: {
    borderWidth: 2,
    borderColor: '#FF0000',
  },
  clipThumbnailTouch: {
    width: '100%',
    height: '100%',
  },
  clipThumbnailImage: {
    width: '100%',
    height: '100%',
  },
  clipOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  clipDurationText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  trimHandle: {
    position: 'absolute',
    width: 20,
    height: '100%',
    backgroundColor: '#FF0000',
    opacity: 0.8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trimHandleStart: {
    left: 0,
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
  },
  trimHandleEnd: {
    right: 0,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
  playhead: {
    position: 'absolute',
    width: 2,
    height: CLIP_THUMBNAIL_HEIGHT,
    backgroundColor: '#00FF00',
    top: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1A1A1A',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#333333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalSection: {
    marginBottom: 24,
  },
  modalSectionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  effectButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  effectButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#333333',
    minWidth: 100,
  },
  effectButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  removeEffectButton: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#FF0000',
    marginTop: 8,
  },
  removeEffectButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default EditingScreen;
