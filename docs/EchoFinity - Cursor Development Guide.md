---
title: EchoFinity - Cursor Development Guide
version: 1.0
updated: 2025
status: active
---

# EchoFinity - Cursor Development Guide

**Application**: EchoFinity - AI-Powered Video Creation & Editing Platform  
**Developer**: OGC NewFinity  
**IDE**: Cursor (AI-Assisted Code Editor)  
**Primary Language**: JavaScript

---

## Introduction to Cursor for EchoFinity Development

Cursor is an AI-powered code editor built on top of VS Code that dramatically accelerates development through intelligent code generation, completion, and refactoring. For EchoFinity development, Cursor serves as your AI pair programmer, helping you write code faster while maintaining quality and consistency.

This guide provides specific workflows, prompt templates, and best practices for using Cursor to build EchoFinity efficiently.

---

## Part 1: Cursor Fundamentals for EchoFinity

### Setting Up Cursor for EchoFinity

**Installation & Configuration**

1. Download Cursor from https://cursor.sh/
2. Install the EchoFinity project structure
3. Configure Cursor settings for JavaScript development:
   - Enable ESLint integration
   - Set up Prettier for code formatting
   - Configure hot reload for React Native

**Cursor Settings (.cursor/settings.json)**

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "javascript.validate.enable": true,
  "javascript.updateImportsOnFileMove.enabled": "always",
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

### Key Cursor Features for Development

**1. Cmd+K (Mac) / Ctrl+K (Windows) - Code Generation**

Use this to generate entire functions, components, or files from natural language descriptions.

**2. Cmd+Shift+L (Mac) / Ctrl+Shift+L (Windows) - Multi-Line Editing**

Select multiple lines and edit them simultaneously, perfect for refactoring patterns across files.

**3. Cmd+I (Mac) / Ctrl+I (Windows) - Inline Chat**

Ask questions or request code changes without leaving your editor.

**4. Tab Autocomplete**

Cursor suggests code completions based on context. Press Tab to accept.

**5. @-mentions for Context**

Reference specific files or functions using @filename or @functionName to provide context to the AI.

---

## Part 2: Workflow Patterns for EchoFinity Development

### Workflow 1: Building a New Feature from Scratch

**Scenario**: You need to build the video recording screen for EchoFinity.

**Step 1: Create the Component File**

Create a new file: `app/screens/RecordingScreen.js`

**Step 2: Use Cursor to Generate the Component**

Open the file and use Cmd+K to generate the component:

```
Generate a React Native component for video recording with the following features:
- Real-time camera preview
- Record button (red, large, centered)
- Audio level indicator (visual waveform)
- Elapsed time counter
- Pause/resume functionality
- Gallery button to import photos/clips
- Permission handling for camera and microphone

Use react-native-camera for camera access and react-native-reanimated for smooth animations.
Include proper error handling and user feedback.
```

Cursor will generate a complete, production-ready component with all requested features.

**Step 3: Refine with Inline Chat**

Use Cmd+I to ask follow-up questions:

```
Add a grid overlay to the camera preview to help with composition. 
Make it semi-transparent and only show when recording.
```

**Step 4: Test and Iterate**

Use Cmd+K again to generate test cases:

```
Generate Jest tests for the RecordingScreen component.
Test that:
1. Camera preview displays correctly
2. Recording starts and stops on button press
3. Audio levels are displayed
4. Elapsed time updates correctly
5. Permissions are requested properly
```

### Workflow 2: Building an API Endpoint

**Scenario**: You need to create an API endpoint for exporting videos.

**Step 1: Create the Route File**

Create: `backend/src/routes/export.js`

**Step 2: Generate the Route Handler**

Use Cmd+K:

```
Generate an Express route for video export with the following:
- POST /api/videos/export
- Accept projectId, quality (720p/1080p/4K), and format (mp4/mov/webm)
- Authenticate using JWT middleware
- Validate input using express-validator
- Check user's token balance before processing
- Deduct tokens from user's account
- Queue the video for processing using Bull
- Return job ID and estimated processing time
- Handle errors gracefully with appropriate HTTP status codes

Use the videoService for video processing and tokenService for token management.
```

**Step 3: Generate the Service Layer**

Create: `backend/src/services/exportService.js`

Use Cmd+K:

```
Generate a service for video export with functions:
- validateExportRequest(projectId, quality, userId)
- checkTokenBalance(userId, quality)
- deductTokens(userId, tokensUsed)
- queueVideoForExport(projectId, quality, format)
- getExportStatus(jobId)

Include proper error handling and logging using Winston logger.
```

**Step 4: Generate Tests**

Use Cmd+K:

```
Generate comprehensive Jest tests for the export endpoint.
Test successful exports, token validation, error cases, and edge cases.
Mock the videoService and tokenService.
```

### Workflow 3: Refactoring Existing Code

**Scenario**: You have a large component that needs to be split into smaller, reusable components.

**Step 1: Select the Code**

Select the component code you want to refactor.

**Step 2: Use Cursor's Refactoring**

Use Cmd+I:

```
This component is too large and does too many things. 
Extract the following into separate components:
1. VideoPreview - handles video playback
2. TimelineControls - handles timeline navigation
3. EffectsPanel - handles effect selection and application

Keep the parent component as a container that manages state and passes props.
```

Cursor will generate the extracted components with proper prop passing and state management.

**Step 3: Update Imports**

Use Cmd+K:

```
Update all imports in the parent component to use the new extracted components.
Ensure all props are passed correctly.
```

### Workflow 4: Implementing Complex Logic

**Scenario**: You need to implement the token system for EchoFinity.

**Step 1: Create the Token Service**

Create: `backend/src/services/tokenService.js`

**Step 2: Generate the Token Logic**

Use Cmd+K:

```
Generate a comprehensive token service with:
- calculateTokenCost(operation, parameters) - returns token cost for different operations
- getUserDailyTokens(userId) - gets user's remaining tokens for the day
- deductTokens(userId, amount) - deducts tokens from user's account
- refreshDailyTokens() - resets tokens at midnight for all users
- recordTokenUsage(userId, operation, tokensUsed) - logs token usage for analytics
- getTokenUsageHistory(userId, days) - returns token usage for the past N days

Token costs:
- Video recording: 20 tokens per minute
- AI editing: 30-50 tokens depending on complexity
- 720p export: 5 tokens
- 1080p export: 10 tokens
- 4K export: 20 tokens
- Cloud storage: 1 token per GB per month

Include proper error handling and database transactions.
```

**Step 3: Generate the Cron Job**

Create: `backend/src/jobs/tokenRefresh.js`

Use Cmd+K:

```
Generate a Bull job that runs daily at midnight to refresh user tokens.
- Query all users with free or pro tier subscriptions
- Reset their daily tokens based on their subscription tier
- Log the operation for auditing
- Handle errors gracefully
- Send notifications to users when tokens are refreshed

Use the User model and logger service.
```

---

## Part 3: Prompt Templates for EchoFinity Development

### Template 1: React Native Component Generation

```
Generate a React Native component for [COMPONENT_NAME] with the following features:
- [Feature 1]
- [Feature 2]
- [Feature 3]

Use [LIBRARY] for [PURPOSE].
Include:
- Proper TypeScript/JavaScript types
- Error handling
- Loading states
- Accessibility features
- Comments explaining complex logic

Style using [STYLING_APPROACH] with [COLOR_SCHEME].
```

**Example**:
```
Generate a React Native component for the timeline editor with the following features:
- Horizontal scrollable timeline showing video clips
- Tap to select clips
- Drag to reorder clips
- Pinch to zoom in/out
- Show duration of each clip

Use react-native-reanimated for smooth animations.
Include proper error handling and loading states.
Style using Tailwind CSS with the EchoFinity blue/purple color scheme.
```

### Template 2: Express API Endpoint Generation

```
Generate an Express endpoint for [ENDPOINT_NAME]:
- Method: [GET/POST/PUT/DELETE]
- Path: [/api/path]
- Authentication: [JWT/API_KEY/NONE]
- Request body: [FIELDS]
- Response: [RESPONSE_STRUCTURE]
- Error cases: [ERROR_CASES]

Include:
- Input validation using express-validator
- Proper HTTP status codes
- Error handling
- Logging
- Database operations using [ORM]
```

**Example**:
```
Generate an Express endpoint for creating a new video project:
- Method: POST
- Path: /api/projects
- Authentication: JWT
- Request body: { title, description, format }
- Response: { projectId, createdAt, status }
- Error cases: Missing fields, unauthorized, database error

Include input validation, proper HTTP status codes, error handling, and logging.
Use Sequelize for database operations.
```

### Template 3: Service Layer Generation

```
Generate a service for [SERVICE_NAME] with the following functions:
- [Function 1]: [Description]
- [Function 2]: [Description]
- [Function 3]: [Description]

Include:
- Proper error handling
- Input validation
- Logging using Winston
- Database operations using [ORM]
- External API calls with retry logic
```

**Example**:
```
Generate a service for video processing with functions:
- analyzeVideo(videoPath): Analyzes video for BPM, scenes, and optimal cuts
- generateAIEdits(videoAnalysis): Generates AI editing suggestions
- applyEdits(videoPath, edits): Applies edits to video
- exportVideo(videoPath, quality): Exports video at specified quality

Include proper error handling, input validation, logging, and database operations.
```

### Template 4: Testing Generation

```
Generate comprehensive Jest tests for [MODULE_NAME]:
- Test [Feature 1]
- Test [Feature 2]
- Test error cases
- Test edge cases

Mock [DEPENDENCIES].
Use [TESTING_LIBRARY] for component testing.
Include setup and teardown functions.
Aim for [COVERAGE]% code coverage.
```

**Example**:
```
Generate comprehensive Jest tests for the video export endpoint:
- Test successful export with valid parameters
- Test token deduction
- Test error handling for insufficient tokens
- Test authentication
- Test input validation

Mock the videoService and tokenService.
Use Supertest for HTTP testing.
Include setup and teardown functions.
Aim for 90% code coverage.
```

---

## Part 4: Advanced Cursor Techniques

### Technique 1: Using @-mentions for Context

When asking Cursor to generate code, reference specific files or functions to provide context:

```
@videoService @tokenService
Generate a controller function for video export that:
1. Validates the export request using the videoService
2. Checks token balance using the tokenService
3. Deducts tokens from the user
4. Queues the video for processing
5. Returns the job ID
```

This helps Cursor understand your existing code structure and generate code that's consistent with your codebase.

### Technique 2: Multi-File Refactoring

Select multiple files and use Cursor to refactor them together:

1. Open the file explorer
2. Select multiple files (Cmd+Click)
3. Use Cmd+K to generate refactoring instructions:

```
These files are part of the video processing pipeline.
Refactor them to use a consistent error handling pattern.
Extract common error handling logic into a shared utility.
Update all files to use the new error handling approach.
```

### Technique 3: Code Review with Cursor

Use Cmd+I to ask Cursor to review code for issues:

```
Review this code for:
- Security vulnerabilities
- Performance issues
- Best practices violations
- Potential bugs
- Code style inconsistencies

Suggest improvements.
```

### Technique 4: Documentation Generation

Use Cmd+K to generate comprehensive documentation:

```
Generate JSDoc comments for all functions in this file.
Include parameter descriptions, return types, and usage examples.
```

Or:

```
Generate API documentation in OpenAPI 3.0 format for these endpoints:
- POST /api/projects
- POST /api/videos/export
- GET /api/videos/:videoId

Include request/response examples and error codes.
```

---

## Part 5: Best Practices for Cursor Development

### 1. Provide Clear, Specific Prompts

**Bad**: "Generate a video component"

**Good**: "Generate a React Native component for video playback with play/pause buttons, progress bar, and full-screen mode. Use react-native-video for playback and react-native-reanimated for smooth animations."

### 2. Iterate and Refine

Don't expect perfect code on the first try. Use Cmd+I to ask follow-up questions and refine the generated code:

```
First prompt: Generate a video player component
Follow-up: Add a loading spinner while the video is buffering
Follow-up: Add keyboard shortcuts for play/pause and seeking
Follow-up: Add subtitles support
```

### 3. Review Generated Code

Always review code generated by Cursor before committing. Look for:
- Correct logic
- Proper error handling
- Performance issues
- Security vulnerabilities
- Code style consistency

### 4. Use Cursor for Boilerplate

Cursor excels at generating boilerplate code. Use it for:
- API endpoints
- Database models
- Test files
- Configuration files
- Documentation

### 5. Maintain Your Own Style

Cursor adapts to your codebase's style. Establish consistent patterns early, and Cursor will follow them in generated code.

### 6. Leverage Keyboard Shortcuts

Learn and use Cursor's keyboard shortcuts to work faster:
- Cmd+K: Generate code
- Cmd+I: Inline chat
- Cmd+L: Select line
- Cmd+Shift+L: Multi-line edit
- Cmd+/: Toggle comment

---

## Part 6: EchoFinity-Specific Prompt Library

### Recording Feature Prompts

```
Generate a React Native component for video recording that:
- Shows real-time camera preview
- Displays audio level indicator
- Shows elapsed time
- Has record/pause/stop buttons
- Handles permissions for camera and microphone
- Allows importing photos from gallery
- Shows error messages for permission denials

Use react-native-camera and react-native-reanimated.
Include proper error handling and user feedback.
```

### Editing Feature Prompts

```
Generate a React Native timeline component for video editing that:
- Shows video clips in a horizontal scrollable timeline
- Allows selecting clips by tapping
- Allows reordering clips by dragging
- Shows clip durations
- Allows trimming clips by dragging edges
- Shows transitions between clips
- Supports pinch-to-zoom

Use react-native-gesture-handler and react-native-reanimated.
Include smooth animations and proper performance optimization.
```

### Export Feature Prompts

```
Generate an Express endpoint for video export that:
- Accepts projectId, quality, and format parameters
- Authenticates using JWT
- Validates input parameters
- Checks user's token balance
- Deducts tokens from user's account
- Queues video for processing using Bull
- Returns job ID and estimated processing time
- Handles errors gracefully

Use the videoService for processing and tokenService for token management.
Include comprehensive error handling and logging.
```

### Token System Prompts

```
Generate a token service that:
- Calculates token costs for different operations
- Manages user daily token limits
- Deducts tokens when operations are performed
- Refreshes tokens daily at midnight
- Records token usage for analytics
- Provides token usage history

Include proper error handling, database transactions, and logging.
```

---

## Part 7: Troubleshooting Cursor Development

### Issue 1: Generated Code Doesn't Match Your Style

**Solution**: Provide more specific style guidance in your prompts:

```
Generate this function following these style guidelines:
- Use arrow functions
- Use destructuring for parameters
- Use async/await instead of promises
- Include JSDoc comments
- Follow the naming convention: camelCase for functions
```

### Issue 2: Generated Code Has Security Issues

**Solution**: Ask Cursor to review for security:

```
Review this code for security vulnerabilities.
Specifically check for:
- SQL injection risks
- XSS vulnerabilities
- Authentication/authorization issues
- Sensitive data exposure
```

### Issue 3: Generated Code Is Incomplete

**Solution**: Use follow-up prompts to complete the code:

```
This function is incomplete. Add:
- Error handling for database failures
- Input validation
- Logging
- Return value documentation
```

### Issue 4: Cursor Suggestions Are Off-Topic

**Solution**: Provide more context:

```
@userService @projectService
Generate a function that creates a new project for a user.
Use the userService to validate the user exists.
Use the projectService to create the project in the database.
```

---

## Part 8: Cursor Workflow for EchoFinity MVP

### Week 1-2: Project Setup & Core Components

**Day 1-2**: Set up project structure
```
Generate the complete React Native project structure for EchoFinity.
Include folders for screens, components, services, store, and utils.
Generate package.json with all necessary dependencies.
```

**Day 3-4**: Generate recording screen
```
Generate the RecordingScreen component with full functionality.
Include camera preview, recording controls, and permission handling.
```

**Day 5**: Generate editing screen
```
Generate the EditingScreen component with timeline and editing controls.
```

### Week 3-4: Backend API

**Day 1-2**: Generate Express server setup
```
Generate a complete Express server setup with:
- Database connection using Sequelize
- JWT authentication middleware
- Error handling middleware
- CORS configuration
- Environment variable setup
```

**Day 3-4**: Generate API endpoints
```
Generate all API endpoints for projects, videos, and exports.
Include proper authentication, validation, and error handling.
```

**Day 5**: Generate services
```
Generate services for video processing, token management, and user management.
```

### Week 5-6: AI Integration & Testing

**Day 1-2**: Generate AI integration
```
Generate services for integrating with Runway/Kling APIs.
Include error handling and retry logic.
```

**Day 3-4**: Generate comprehensive tests
```
Generate Jest tests for all components, endpoints, and services.
Aim for 80%+ code coverage.
```

**Day 5**: Integration testing
```
Generate integration tests that test the complete workflow.
```

---

## Conclusion

Cursor dramatically accelerates EchoFinity development by automating boilerplate generation, code refactoring, and documentation. By following these workflows and best practices, you can build EchoFinity faster while maintaining code quality and consistency.

Key takeaways:

1. **Use Cursor for boilerplate**: API endpoints, components, tests, documentation
2. **Provide specific prompts**: The more detail, the better the generated code
3. **Iterate and refine**: Use follow-up prompts to improve generated code
4. **Review generated code**: Always check for correctness, security, and performance
5. **Maintain consistency**: Establish patterns early so Cursor follows them
6. **Leverage keyboard shortcuts**: Work faster by using Cursor's shortcuts

With Cursor as your AI pair programmer, you can build EchoFinity's MVP in weeks instead of months, while maintaining professional code quality.
