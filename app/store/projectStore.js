import { create } from 'zustand';

const useProjectStore = create((set) => ({
  projects: [],
  setProjects: (projects) => set({ projects }),

  // Recording session state
  recordingSession: {
    clips: [],
    currentAspectRatio: 'vertical', // 'vertical' | 'horizontal' | 'square'
    isRecording: false,
    recordingStartTime: null,
  },

  // Recording session actions
  setAspectRatio: (ratio) =>
    set((state) => ({
      recordingSession: {
        ...state.recordingSession,
        currentAspectRatio: ratio,
      },
    })),

  addClip: (clip) =>
    set((state) => ({
      recordingSession: {
        ...state.recordingSession,
        clips: [...state.recordingSession.clips, clip],
      },
    })),

  removeClip: (clipId) =>
    set((state) => ({
      recordingSession: {
        ...state.recordingSession,
        clips: state.recordingSession.clips.filter((c) => c.id !== clipId),
      },
    })),

  setRecordingState: (isRecording, startTime = null) =>
    set((state) => ({
      recordingSession: {
        ...state.recordingSession,
        isRecording,
        recordingStartTime: startTime,
      },
    })),

  clearRecordingSession: () =>
    set((state) => ({
      recordingSession: {
        clips: [],
        currentAspectRatio: 'vertical',
        isRecording: false,
        recordingStartTime: null,
      },
    })),

  // Editing session state
  editingSession: {
    clips: [], // Clips with editing metadata (trim points, effects, etc.)
    selectedClipId: null,
    playheadPosition: 0, // Current playhead position in seconds
    isPlaying: false,
  },

  // Initialize editing session from recording session
  initializeEditingSession: () =>
    set((state) => ({
      editingSession: {
        clips: state.recordingSession.clips.map((clip, index) => ({
          ...clip,
          startTime: 0, // Trim start point (seconds)
          endTime: clip.duration, // Trim end point (seconds)
          trimmedDuration: clip.duration, // Actual duration after trimming
          transition: null, // { type: 'fade' | 'dissolve' | null, duration: number }
          speed: 1.0, // Playback speed multiplier
          effects: [], // Array of effect objects
        })),
        selectedClipId: state.recordingSession.clips[0]?.id || null,
        playheadPosition: 0,
        isPlaying: false,
      },
    })),

  // Editing actions
  selectClip: (clipId) =>
    set((state) => ({
      editingSession: {
        ...state.editingSession,
        selectedClipId: clipId,
      },
    })),

  updateClipTrim: (clipId, startTime, endTime) =>
    set((state) => ({
      editingSession: {
        ...state.editingSession,
        clips: state.editingSession.clips.map((clip) => {
          if (clip.id === clipId) {
            const maxDuration = clip.duration;
            const trimmedStart = Math.max(0, Math.min(startTime, maxDuration));
            const trimmedEnd = Math.max(trimmedStart, Math.min(endTime, maxDuration));
            return {
              ...clip,
              startTime: trimmedStart,
              endTime: trimmedEnd,
              trimmedDuration: trimmedEnd - trimmedStart,
            };
          }
          return clip;
        }),
      },
    })),

  splitClip: (clipId, splitTime) =>
    set((state) => {
      const clipIndex = state.editingSession.clips.findIndex((c) => c.id === clipId);
      if (clipIndex === -1) return state;

      const clip = state.editingSession.clips[clipIndex];
      const relativeSplitTime = clip.startTime + splitTime;

      if (relativeSplitTime <= clip.startTime || relativeSplitTime >= clip.endTime) {
        return state; // Invalid split point
      }

      const firstClip = {
        ...clip,
        id: `${clip.id}_part1`,
        endTime: relativeSplitTime,
        trimmedDuration: relativeSplitTime - clip.startTime,
      };

      const secondClip = {
        ...clip,
        id: `${clip.id}_part2`,
        startTime: relativeSplitTime,
        trimmedDuration: clip.endTime - relativeSplitTime,
      };

      const newClips = [...state.editingSession.clips];
      newClips.splice(clipIndex, 1, firstClip, secondClip);

      // Update indices
      newClips.forEach((c, idx) => {
        c.index = idx;
      });

      return {
        editingSession: {
          ...state.editingSession,
          clips: newClips,
          selectedClipId: firstClip.id,
        },
      };
    }),

  reorderClips: (fromIndex, toIndex) =>
    set((state) => {
      const newClips = [...state.editingSession.clips];
      const [removed] = newClips.splice(fromIndex, 1);
      newClips.splice(toIndex, 0, removed);

      // Update indices
      newClips.forEach((clip, index) => {
        clip.index = index;
      });

      return {
        editingSession: {
          ...state.editingSession,
          clips: newClips,
        },
      };
    }),

  updateClipTransition: (clipId, transition) =>
    set((state) => ({
      editingSession: {
        ...state.editingSession,
        clips: state.editingSession.clips.map((clip) =>
          clip.id === clipId ? { ...clip, transition } : clip
        ),
      },
    })),

  updateClipSpeed: (clipId, speed) =>
    set((state) => ({
      editingSession: {
        ...state.editingSession,
        clips: state.editingSession.clips.map((clip) =>
          clip.id === clipId ? { ...clip, speed } : clip
        ),
      },
    })),

  removeClip: (clipId) =>
    set((state) => {
      const newClips = state.editingSession.clips.filter((c) => c.id !== clipId);
      // Update indices
      newClips.forEach((clip, index) => {
        clip.index = index;
      });

      return {
        editingSession: {
          ...state.editingSession,
          clips: newClips,
          selectedClipId: newClips[0]?.id || null,
        },
      };
    }),

  setPlayheadPosition: (position) =>
    set((state) => ({
      editingSession: {
        ...state.editingSession,
        playheadPosition: position,
      },
    })),

  setIsPlaying: (isPlaying) =>
    set((state) => ({
      editingSession: {
        ...state.editingSession,
        isPlaying,
      },
    })),

  // Export settings
  exportSettings: {
    format: 'mp4', // 'mp4' | 'mov'
    resolution: '1080p', // '720p' | '1080p' | '4K'
  },

  setExportFormat: (format) =>
    set((state) => ({
      exportSettings: {
        ...state.exportSettings,
        format,
      },
    })),

  setExportResolution: (resolution) =>
    set((state) => ({
      exportSettings: {
        ...state.exportSettings,
        resolution,
      },
    })),
}));

export default useProjectStore;
