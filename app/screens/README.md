# Screen Implementations

## RecordingScreen

### Required Dependencies

To use the RecordingScreen, you need to install the following packages:

```bash
npm install react-native-vision-camera react-native-reanimated react-native-safe-area-context
```

### Additional Setup

**For react-native-vision-camera:**
- Follow the [setup instructions](https://react-native-vision-camera.com/docs/guides) for iOS and Android
- iOS: Add camera permissions to `Info.plist`
- Android: Add camera permissions to `AndroidManifest.xml`

**For react-native-reanimated:**
- Follow the [setup instructions](https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/getting-started/)
- Make sure to configure Babel plugin if needed

### Features Implemented

- ✅ Camera preview with fullscreen support
- ✅ Vertical (9:16), horizontal (16:9), and square (1:1) aspect ratios
- ✅ Real-time audio waveform visualization
- ✅ Rule of thirds grid overlay (toggleable)
- ✅ Recording controls with elapsed time
- ✅ Multi-clip recording support
- ✅ Filmstrip display of recorded clips
- ✅ Delete clip functionality
- ✅ Permissions handling with fallback UI
- ✅ State management with Zustand (projectStore)

### Usage

The RecordingScreen integrates with the projectStore to manage recording sessions. Recorded clips are stored in the store and can be accessed by other screens (e.g., EditingScreen).

---

## EditingScreen

### Required Dependencies

The EditingScreen uses the same dependencies as RecordingScreen, plus:

```bash
npm install react-native-gesture-handler
```

Make sure `react-native-gesture-handler` is properly configured (usually requires wrapping the app with `GestureHandlerRootView` in the root component).

### Features Implemented

- ✅ Timeline view with horizontal scrollable thumbnails (filmstrip style)
- ✅ Tap to select clip with visual highlighting
- ✅ Trimming controls with drag handles (start/end)
- ✅ Clip splitting at playhead position
- ✅ Drag-and-drop reordering with smooth animations
- ✅ Transitions & Effects modal:
  - Fade in/out
  - Cross dissolve
  - Speed changes (0.5x, 1.0x, 1.5x, 2.0x)
- ✅ Playback controls (play/pause button)
- ✅ Playhead indicator showing current position
- ✅ Time display (current time / total duration)
- ✅ Dark theme UI with responsive layout
- ✅ SafeAreaView for proper layout on all devices

### Usage

1. **Initialization**: The EditingScreen automatically initializes an editing session from the recording session when clips are available.

2. **Selecting Clips**: Tap any clip thumbnail in the timeline to select it. Selected clips show red borders and trim handles.

3. **Trimming**: When a clip is selected, drag the red handles on the left (start) or right (end) to trim the clip.

4. **Splitting**: Position the playhead where you want to split, then tap the "Split" button.

5. **Reordering**: Long-press and drag any clip to reorder it in the timeline.

6. **Effects**: Select a clip and tap "Effects" to open the modal. Apply transitions or speed changes, or remove effects.

### State Management

All editing operations update the `editingSession` in the projectStore:
- Clip trimming (startTime, endTime, trimmedDuration)
- Clip splitting (creates two new clips)
- Clip reordering (updates clip indices)
- Transitions and speed (stored per clip)

The edited clips can then be passed to the ExportScreen for final rendering.

---

## ExportScreen

### Required Dependencies

The ExportScreen uses the same dependencies as RecordingScreen and EditingScreen. No additional packages are required.

### Features Implemented

- ✅ Format selector (MP4/MOV) with toggle buttons
- ✅ Resolution selector (720p/1080p/4K) with radio buttons
- ✅ Token usage calculation based on resolution:
  - 720p: 5 tokens
  - 1080p: 10 tokens
  - 4K: 20 tokens
- ✅ Token balance display with insufficient token warnings
- ✅ Export button with validation:
  - Validates format and resolution selection
  - Checks token availability before export
  - Validates clips exist
- ✅ Loading states during export
- ✅ Success modal on successful export
- ✅ Error handling with user-friendly messages
- ✅ Dark theme UI with responsive layout
- ✅ SafeAreaView for proper layout on all devices

### Usage

1. **Format Selection**: Tap MP4 or MOV buttons to select export format (default: MP4).

2. **Resolution Selection**: Tap any resolution option (720p, 1080p, or 4K) to select. The selected option shows a red radio button indicator (default: 1080p).

3. **Token Check**: The screen displays:
   - Estimated token cost based on selected resolution
   - Current token balance
   - Warning message if tokens are insufficient

4. **Export**: Tap "Start Export" button to begin export. The button:
   - Validates all settings
   - Checks token availability
   - Calls `videoService.exportVideo()` with project data
   - Shows loading spinner during export
   - Displays success modal on completion
   - Shows error alerts if export fails

### State Management

Export settings are stored in `projectStore.exportSettings`:
- `format`: 'mp4' | 'mov'
- `resolution`: '720p' | '1080p' | '4K'

Token balance is read from `tokenStore.tokens` for validation.

### Export Process

When export is triggered:
1. Validates format and resolution are selected
2. Checks if user has enough tokens
3. Validates clips exist
4. Calls `videoService.exportVideo(projectId, options)`
5. Shows loading state
6. On success: Shows success modal and allows navigation back
7. On error: Shows error alert with details

---

## ClipReviewScreen

### Required Dependencies

The ClipReviewScreen requires an additional package:

```bash
npm install react-native-video
```

**Note**: `react-native-video` requires native setup. Follow the [setup instructions](https://github.com/TheWidlarzGroup/react-native-video#readme) for iOS and Android.

### Features Implemented

- ✅ Video preview using react-native-video
- ✅ Play/pause controls
- ✅ Seekbar with timestamp display
- ✅ Horizontal scrollable thumbnail strip
- ✅ Active clip highlighting (red border + indicator)
- ✅ Tap thumbnail to jump to clip segment
- ✅ Long-press thumbnail to delete clip
- ✅ Delete confirmation modal
- ✅ Re-record button to navigate to RecordingScreen
- ✅ Automatic redirect to RecordingScreen when no clips remain
- ✅ Playhead tracking to sync thumbnail highlighting
- ✅ Dark theme UI with responsive layout
- ✅ SafeAreaView for proper layout on all devices

### Usage

1. **Video Preview**: The main video preview shows the currently selected clip. Use the play/pause button to control playback.

2. **Seekbar**: The seekbar at the bottom shows playback progress. Tap anywhere on the seekbar to seek (in production, implement drag gesture for precise seeking).

3. **Thumbnail Strip**: 
   - Horizontal scrollable list of all clips
   - Active clip is highlighted with a red border and red indicator dot
   - Tap any thumbnail to jump to that clip's start time
   - Long-press a thumbnail (500ms) to delete the clip

4. **Delete Clip**: 
   - Long-press a thumbnail to open delete confirmation modal
   - Confirm deletion to remove the clip
   - If all clips are deleted, automatically redirects to RecordingScreen with a notice

5. **Re-record**: Tap the "Re-record" button to navigate to RecordingScreen to add more clips.

### State Management

The ClipReviewScreen uses:
- `editingSession.clips` (primary) or `recordingSession.clips` (fallback) for clip data
- `removeClip()` action to delete clips from editing session
- `selectClip()` action to update selected clip
- `clearRecordingSession()` action when all clips are removed

### Playhead Tracking

The screen automatically tracks the current playback position and updates the active clip highlight in the thumbnail strip. The active clip is determined by finding which clip's time range contains the current playback time.

### Navigation Flow

- **Normal flow**: EditingScreen → ClipReviewScreen → ExportScreen
- **When no clips**: ClipReviewScreen → (redirects to) RecordingScreen
- **Re-record**: ClipReviewScreen → RecordingScreen

### Video Source

The preview uses the first clip by default, or the currently selected clip. In production, you may want to implement video stitching/concatenation to show a continuous preview of all clips together.
