import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useProjectStore from '../store/projectStore';
import useTokenStore from '../store/tokenStore';
import { exportVideo } from '../services/videoService';

const ExportScreen = ({ navigation }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [exportError, setExportError] = useState(null);

  const {
    editingSession,
    exportSettings,
    setExportFormat,
    setExportResolution,
  } = useProjectStore();

  const { tokens } = useTokenStore();

  // Get clips from editing session (fallback to recording session if needed)
  const clips = editingSession.clips.length > 0
    ? editingSession.clips
    : [];

  // Calculate estimated token cost
  const calculateTokenCost = () => {
    const resolutionCosts = {
      '720p': 5,
      '1080p': 10,
      '4K': 20,
    };
    return resolutionCosts[exportSettings.resolution] || 10;
  };

  const estimatedCost = calculateTokenCost();
  const hasEnoughTokens = tokens >= estimatedCost;

  // Generate a project ID (in production, this would come from the actual project)
  const getProjectId = () => {
    // Use a combination of clip IDs or generate a new ID
    if (clips.length > 0) {
      return `project_${clips[0].id}`;
    }
    return `project_${Date.now()}`;
  };

  const handleFormatSelect = (format) => {
    setExportFormat(format);
  };

  const handleResolutionSelect = (resolution) => {
    setExportResolution(resolution);
  };

  const handleExport = async () => {
    // Validate settings
    if (!exportSettings.format || !exportSettings.resolution) {
      Alert.alert('Invalid Settings', 'Please select both format and resolution.');
      return;
    }

    // Validate token availability
    if (!hasEnoughTokens) {
      Alert.alert(
        'Insufficient Tokens',
        `You need ${estimatedCost} tokens to export at ${exportSettings.resolution}, but you only have ${tokens} tokens. Please purchase more tokens or select a lower resolution.`
      );
      return;
    }

    // Validate clips exist
    if (clips.length === 0) {
      Alert.alert('No Clips', 'No clips available to export. Please record or add clips first.');
      return;
    }

    setIsExporting(true);
    setExportError(null);

    try {
      const projectId = getProjectId();
      const options = {
        format: exportSettings.format,
        resolution: exportSettings.resolution,
        clips: clips,
      };

      const result = await exportVideo(projectId, options);

      if (result.success) {
        setShowSuccessModal(true);
      } else {
        setExportError(result.error || 'Export failed. Please try again.');
        Alert.alert('Export Failed', result.error || 'Export failed. Please try again.');
      }
    } catch (error) {
      console.error('Export error:', error);
      setExportError(error.message || 'An error occurred during export.');
      Alert.alert('Export Error', error.message || 'An error occurred during export.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    // Navigate back or to library screen
    if (navigation) {
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Export Video</Text>
          <Text style={styles.subtitle}>
            Configure export settings and preview token cost
          </Text>
        </View>

        {/* Format Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Format</Text>
          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={[
                styles.formatButton,
                exportSettings.format === 'mp4' && styles.formatButtonActive,
              ]}
              onPress={() => handleFormatSelect('mp4')}
              disabled={isExporting}
            >
              <Text
                style={[
                  styles.formatButtonText,
                  exportSettings.format === 'mp4' && styles.formatButtonTextActive,
                ]}
              >
                MP4
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.formatButton,
                exportSettings.format === 'mov' && styles.formatButtonActive,
              ]}
              onPress={() => handleFormatSelect('mov')}
              disabled={isExporting}
            >
              <Text
                style={[
                  styles.formatButtonText,
                  exportSettings.format === 'mov' && styles.formatButtonTextActive,
                ]}
              >
                MOV
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Resolution Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resolution</Text>
          <View style={styles.resolutionGroup}>
            <TouchableOpacity
              style={[
                styles.resolutionButton,
                exportSettings.resolution === '720p' && styles.resolutionButtonActive,
              ]}
              onPress={() => handleResolutionSelect('720p')}
              disabled={isExporting}
            >
              <View style={styles.radioButton}>
                {exportSettings.resolution === '720p' && (
                  <View style={styles.radioButtonInner} />
                )}
              </View>
              <Text
                style={[
                  styles.resolutionButtonText,
                  exportSettings.resolution === '720p' && styles.resolutionButtonTextActive,
                ]}
              >
                720p HD
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.resolutionButton,
                exportSettings.resolution === '1080p' && styles.resolutionButtonActive,
              ]}
              onPress={() => handleResolutionSelect('1080p')}
              disabled={isExporting}
            >
              <View style={styles.radioButton}>
                {exportSettings.resolution === '1080p' && (
                  <View style={styles.radioButtonInner} />
                )}
              </View>
              <Text
                style={[
                  styles.resolutionButtonText,
                  exportSettings.resolution === '1080p' && styles.resolutionButtonTextActive,
                ]}
              >
                1080p Full HD
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.resolutionButton,
                exportSettings.resolution === '4K' && styles.resolutionButtonActive,
              ]}
              onPress={() => handleResolutionSelect('4K')}
              disabled={isExporting}
            >
              <View style={styles.radioButton}>
                {exportSettings.resolution === '4K' && (
                  <View style={styles.radioButtonInner} />
                )}
              </View>
              <Text
                style={[
                  styles.resolutionButtonText,
                  exportSettings.resolution === '4K' && styles.resolutionButtonTextActive,
                ]}
              >
                4K Ultra HD
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Token Usage Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Token Usage</Text>
          <View style={styles.tokenSummary}>
            <View style={styles.tokenRow}>
              <Text style={styles.tokenLabel}>Estimated Cost:</Text>
              <Text style={styles.tokenValue}>{estimatedCost} tokens</Text>
            </View>
            <View style={styles.tokenRow}>
              <Text style={styles.tokenLabel}>Your Balance:</Text>
              <Text
                style={[
                  styles.tokenValue,
                  !hasEnoughTokens && styles.tokenValueInsufficient,
                ]}
              >
                {tokens} tokens
              </Text>
            </View>
            {!hasEnoughTokens && (
              <View style={styles.insufficientWarning}>
                <Text style={styles.insufficientWarningText}>
                  ⚠️ Insufficient tokens. Please purchase more or select a lower resolution.
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Export Button */}
        <TouchableOpacity
          style={[
            styles.exportButton,
            (!hasEnoughTokens || isExporting || clips.length === 0) &&
            styles.exportButtonDisabled,
          ]}
          onPress={handleExport}
          disabled={!hasEnoughTokens || isExporting || clips.length === 0}
        >
          {isExporting ? (
            <View style={styles.exportButtonContent}>
              <ActivityIndicator size="small" color="#FFFFFF" style={styles.exportSpinner} />
              <Text style={styles.exportButtonText}>Exporting...</Text>
            </View>
          ) : (
            <Text style={styles.exportButtonText}>Start Export</Text>
          )}
        </TouchableOpacity>

        {/* Error Message */}
        {exportError && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{exportError}</Text>
          </View>
        )}
      </ScrollView>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
        onRequestClose={handleSuccessModalClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Export Successful! 🎉</Text>
            <Text style={styles.modalMessage}>
              Your video has been exported successfully at {exportSettings.resolution} resolution.
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={handleSuccessModalClose}
            >
              <Text style={styles.modalButtonText}>Done</Text>
            </TouchableOpacity>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 32,
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
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 12,
  },
  formatButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: '#1A1A1A',
    borderWidth: 2,
    borderColor: '#333333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  formatButtonActive: {
    backgroundColor: '#FF0000',
    borderColor: '#FF0000',
  },
  formatButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  formatButtonTextActive: {
    fontWeight: 'bold',
  },
  resolutionGroup: {
    gap: 12,
  },
  resolutionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#1A1A1A',
    borderWidth: 2,
    borderColor: '#333333',
  },
  resolutionButtonActive: {
    backgroundColor: '#1A1A1A',
    borderColor: '#FF0000',
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#666666',
    marginRight: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF0000',
  },
  resolutionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  resolutionButtonTextActive: {
    fontWeight: '600',
    color: '#FFFFFF',
  },
  tokenSummary: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333333',
  },
  tokenRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  tokenLabel: {
    color: '#CCCCCC',
    fontSize: 16,
  },
  tokenValue: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  tokenValueInsufficient: {
    color: '#FF4444',
  },
  insufficientWarning: {
    marginTop: 12,
    padding: 12,
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FF4444',
  },
  insufficientWarningText: {
    color: '#FFAAAA',
    fontSize: 14,
    lineHeight: 20,
  },
  exportButton: {
    backgroundColor: '#FF0000',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  exportButtonDisabled: {
    backgroundColor: '#333333',
    opacity: 0.5,
  },
  exportButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  exportSpinner: {
    marginRight: 12,
  },
  exportButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FF4444',
  },
  errorText: {
    color: '#FFAAAA',
    fontSize: 14,
    lineHeight: 20,
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
    padding: 32,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333333',
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalMessage: {
    color: '#CCCCCC',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 32,
  },
  modalButton: {
    backgroundColor: '#FF0000',
    paddingVertical: 14,
    paddingHorizontal: 48,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ExportScreen;
