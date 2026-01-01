import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
  Modal,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
// Note: react-native-video needs to be installed: npm install react-native-video
import Video from 'react-native-video';
import useProjectStore from '../store/projectStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const THUMBNAIL_SIZE = 100;
const THUMBNAIL_GAP = 12;

const ClipReviewScreen = ({ navigation }) => {
  const videoRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedClipId, setSelectedClipId] = useState(null);
  const [clipToDelete, setClipToDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [activeClipIndex, setActiveClipIndex] = useState(0);

  const {
    editingSession,
    recordingSession,
    removeClip,
    selectClip,
    clearRecordingSession,
  } = useProjectStore();

  // Get clips from editing session (fallback to recording session)
  const clips = editingSession.clips.length > 0
    ? editingSession.clips
    : recordingSession.clips;

  // Calculate total duration and clip start times
  const getClipTimelineData = () => {
    let currentTime = 0;
    return clips.map((clip) => {
      const clipDuration = clip.trimmedDuration || clip.duration || 0;
      const startTime = currentTime;
      currentTime += clipDuration;
      return {
        ...clip,
        startTime,
        endTime: currentTime,
        duration: clipDuration,
      };
    });
  };

  const timelineData = getClipTimelineData();
  const totalDuration = timelineData.length > 0
    ? timelineData[timelineData.length - 1].endTime
    : 0;

  // Initialize selected clip
  useEffect(() => {
    if (clips.length > 0 && !selectedClipId) {
      const firstClip = clips[0];
      setSelectedClipId(firstClip.id);
      setActiveClipIndex(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clips]);

  // Update active clip index based on current playback time
  useEffect(() => {
    if (timelineData.length > 0 && currentTime > 0) {
      const activeIndex = timelineData.findIndex(
        (item) => currentTime >= item.startTime && currentTime < item.endTime
      );
      if (activeIndex !== -1 && activeIndex !== activeClipIndex) {
        setActiveClipIndex(activeIndex);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTime, timelineData]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleThumbnailPress = (clipId, index) => {
    setSelectedClipId(clipId);
    setActiveClipIndex(index);
    selectClip(clipId);

    // Seek to clip start time
    const clipData = timelineData.find((item) => item.id === clipId);
    if (clipData && videoRef.current) {
      videoRef.current.seek(clipData.startTime);
      setCurrentTime(clipData.startTime);
    }
  };

  const handleThumbnailLongPress = (clipId) => {
    setClipToDelete(clipId);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = () => {
    if (!clipToDelete) return;

    removeClip(clipToDelete);
    setShowDeleteModal(false);
    setClipToDelete(null);

    // Check if no clips remain
    const remainingClips = clips.filter((c) => c.id !== clipToDelete);
    if (remainingClips.length === 0) {
      // Clear recording session and redirect to RecordingScreen
      clearRecordingSession();
      Alert.alert(
        'No Clips Remaining',
        'All clips have been removed. Redirecting to recording screen.',
        [
          {
            text: 'OK',
            onPress: () => {
              if (navigation) {
                navigation.navigate('Recording');
              }
            },
          },
        ]
      );
    } else {
      // Select the first remaining clip
      const firstRemainingClip = remainingClips[0];
      setSelectedClipId(firstRemainingClip.id);
      setActiveClipIndex(0);
      selectClip(firstRemainingClip.id);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setClipToDelete(null);
  };

  const handleReRecord = () => {
    if (navigation) {
      navigation.navigate('Recording');
    }
  };

  const handleVideoProgress = (data) => {
    setCurrentTime(data.currentTime);
  };

  const handleVideoLoad = (data) => {
    setDuration(data.duration);
  };

  const handleSeek = (seekTime) => {
    if (videoRef.current) {
      videoRef.current.seek(seekTime);
      setCurrentTime(seekTime);
    }
  };

  // Get current video source (use first clip for preview, or selected clip)
  const currentClip = clips.find((c) => c.id === selectedClipId) || clips[0];
  const videoSource = currentClip
    ? { uri: `file://${currentClip.path}` }
    : null;

  if (clips.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No Clips Available</Text>
          <Text style={styles.emptyText}>
            You don't have any clips to review. Please record some clips first.
          </Text>
          <TouchableOpacity
            style={styles.reRecordButton}
            onPress={handleReRecord}
          >
            <Text style={styles.reRecordButtonText}>Start Recording</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Review Clips</Text>
        <Text style={styles.subtitle}>
          Preview your video and manage clips
        </Text>
      </View>

      {/* Video Preview */}
      <View style={styles.previewContainer}>
        {videoSource ? (
          <Video
            ref={videoRef}
            source={videoSource}
            style={styles.video}
            paused={!isPlaying}
            onProgress={handleVideoProgress}
            onLoad={handleVideoLoad}
            resizeMode="contain"
            controls={false}
            repeat={false}
          />
        ) : (
          <View style={styles.videoPlaceholder}>
            <Text style={styles.videoPlaceholderText}>No video available</Text>
          </View>
        )}

        {/* Video Controls Overlay */}
        <View style={styles.controlsOverlay}>
          <TouchableOpacity
            style={styles.playPauseButton}
            onPress={handlePlayPause}
          >
            <Text style={styles.playPauseIcon}>
              {isPlaying ? '⏸' : '▶'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Seekbar */}
        <View style={styles.seekbarContainer}>
          <View style={styles.seekbarTrack}>
            <View
              style={[
                styles.seekbarProgress,
                {
                  width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%',
                },
              ]}
            />
            <TouchableOpacity
              style={[
                styles.seekbarThumb,
                {
                  left: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%',
                },
              ]}
              onPress={() => {
                // Allow seeking by tapping on seekbar
                // In production, implement drag gesture for more precise seeking
              }}
            />
          </View>
          <View style={styles.timeContainer}>
            <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
            <Text style={styles.timeText}>{formatTime(duration)}</Text>
          </View>
        </View>
      </View>

      {/* Thumbnail Strip */}
      <View style={styles.thumbnailSection}>
        <Text style={styles.thumbnailSectionTitle}>Clips ({clips.length})</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.thumbnailStrip}
        >
          {clips.map((clip, index) => {
            const isActive = index === activeClipIndex;
            return (
              <TouchableOpacity
                key={clip.id}
                style={[
                  styles.thumbnailContainer,
                  isActive && styles.thumbnailContainerActive,
                ]}
                onPress={() => handleThumbnailPress(clip.id, index)}
                onLongPress={() => handleThumbnailLongPress(clip.id)}
                delayLongPress={500}
              >
                <Image
                  source={{ uri: `file://${clip.thumbnail || clip.path}` }}
                  style={styles.thumbnail}
                />
                <View style={styles.thumbnailOverlay}>
                  <Text style={styles.thumbnailDuration}>
                    {formatTime(clip.trimmedDuration || clip.duration)}
                  </Text>
                </View>
                {isActive && <View style={styles.activeIndicator} />}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
        <Text style={styles.thumbnailHint}>
          Tap to jump • Long-press to delete
        </Text>
      </View>

      {/* Re-record Button */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.reRecordButton}
          onPress={handleReRecord}
        >
          <Text style={styles.reRecordButtonText}>Re-record</Text>
        </TouchableOpacity>
      </View>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={showDeleteModal}
        transparent
        animationType="fade"
        onRequestClose={handleDeleteCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Delete Clip</Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to delete this clip? This action cannot be undone.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={handleDeleteCancel}
              >
                <Text style={styles.modalButtonCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonDelete]}
                onPress={handleDeleteConfirm}
              >
                <Text style={styles.modalButtonDeleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    padding: 20,
    paddingBottom: 16,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    color: '#CCCCCC',
    fontSize: 16,
    lineHeight: 22,
  },
  previewContainer: {
    height: 300,
    backgroundColor: '#1A1A1A',
    marginHorizontal: 20,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
  },
  video: {
    width: '100%',
    height: '100%',
  },
  videoPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoPlaceholderText: {
    color: '#666666',
    fontSize: 16,
  },
  controlsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playPauseButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playPauseIcon: {
    color: '#FFFFFF',
    fontSize: 28,
  },
  seekbarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  seekbarTrack: {
    height: 4,
    backgroundColor: '#333333',
    borderRadius: 2,
    position: 'relative',
    marginBottom: 8,
  },
  seekbarProgress: {
    height: '100%',
    backgroundColor: '#FF0000',
    borderRadius: 2,
  },
  seekbarThumb: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FF0000',
    top: -6,
    marginLeft: -8,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  thumbnailSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  thumbnailSectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  thumbnailStrip: {
    paddingRight: 20,
  },
  thumbnailContainer: {
    width: THUMBNAIL_SIZE,
    height: THUMBNAIL_SIZE,
    marginRight: THUMBNAIL_GAP,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#1A1A1A',
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  thumbnailContainerActive: {
    borderColor: '#FF0000',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  thumbnailOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  thumbnailDuration: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  activeIndicator: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF0000',
    borderWidth: 2,
    borderColor: '#000000',
  },
  thumbnailHint: {
    color: '#888888',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  actionButtons: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  reRecordButton: {
    backgroundColor: '#333333',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#555555',
  },
  reRecordButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  emptyText: {
    color: '#CCCCCC',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 32,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: '#333333',
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalMessage: {
    color: '#CCCCCC',
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: '#333333',
    borderWidth: 1,
    borderColor: '#555555',
  },
  modalButtonDelete: {
    backgroundColor: '#FF0000',
  },
  modalButtonCancelText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalButtonDeleteText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ClipReviewScreen;
