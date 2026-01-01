# Audio-Based Interview Implementation Guide

## Overview
Audio-based interviews are voice-driven interviews where the AI presents questions via text-to-speech and the candidate responds verbally. Responses are analyzed for quality and content.

---

## Backend Integration Requirements

### 1. Interview Type Determination

**Endpoint:** `GET /interviews/public/validate/:token`

**Response Update - Add `interviewType` field:**
```json
{
  "success": true,
  "data": {
    "interviewId": "uuid",
    "interviewToken": "token",
    "candidateName": "John Doe",
    "candidateEmail": "john@example.com",
    "jobTitle": "Senior Frontend Developer",
    "interviewType": "audio",  // NEW: "text" | "audio" | "video"
    "company": "Acme Corp"
  }
}
```

**Field Mapping:**
- `interviewType: "audio"` → Loads audio-based interview UI
- `interviewType: "text"` → Loads existing text-based chat UI
- `interviewType: "video"` → Loads video-based interview UI (future)

---

### 2. Questions Endpoint - Audio-Specific Format

**Endpoint:** `GET /interviews/public/questions/:token`

**Response Format:**
```json
{
  "success": true,
  "data": {
    "data": {
      "questions": [
        {
          "id": "q1",
          "question": {
            "text": "Can you tell me about yourself and your experience in frontend development?"
          },
          "maxAnswerTime": 120,
          "questionType": "open-ended"
        },
        {
          "id": "q2",
          "question": {
            "text": "Describe a challenging project you've worked on recently and how you overcame the challenges.",
            "audioUrl": "https://cdn.example.com/audio/q2.mp3"  // OPTIONAL: Pre-recorded audio
          },
          "maxAnswerTime": 180,
          "questionType": "behavioral"
        },
        {
          "id": "q3",
          "question": {
            "text": "How do you handle state management in large-scale React applications?"
          },
          "maxAnswerTime": 120,
          "questionType": "technical"
        }
      ]
    }
  }
}
```

**Question Fields:**
- `id` - Unique question identifier
- `question.text` - Question text (displayed in UI, can be read aloud)
- `question.audioUrl` - OPTIONAL: Pre-recorded audio for question
- `maxAnswerTime` - Maximum seconds for candidate to answer (120-300)
- `questionType` - Category for analytics (open-ended, behavioral, technical, etc.)

---

### 3. Interview Submission - Audio Format

**Endpoint:** `POST /interviews/public/submit/:token`

**Request Body:**
```json
{
  "sessionToken": "uuid-session-token",
  "answers": {
    "0": "My name is John and I have 5 years of experience in frontend development...",
    "1": "One challenging project was building a real-time collaboration tool...",
    "2": "For state management, I prefer Redux for large applications because..."
  },
  "completedAt": "2025-12-31T12:45:00Z",
  "timeSpent": 1260,
  "sessionType": "audio-interview",  // IMPORTANT: Distinguish from "text-interview"
  "monitoring": {
    "tabSwitchCount": 0,
    "faceMissingCount": 0,
    "faceMissingDuration": 0,
    "audioSilenceDuration": 120
  }
}
```

**Key Differences from Text Interview:**
- `sessionType: "audio-interview"` - Identifies this as voice-based
- `answers` - Contains verbatim text transcriptions of candidate's voice responses
- Silence duration tracking (candidates speaking continuously)

---

### 4. Answer Analysis - Voice Quality Metrics

**Store with Interview Record:**
```javascript
{
  interviewId: "uuid",
  answers: {
    "0": {
      text: "My name is John...",
      duration: 45,  // seconds of recording
      audioQuality: 0.85,  // 0-1 score
      silencePercentage: 5,  // % of answer that was silence
      speech_rate: 130,  // words per minute
      confidence: 0.92  // AI confidence in transcription
    },
    // ... more answers
  }
}
```

---

### 5. Interview Model Updates

**Add to Interview Schema:**
```javascript
{
  // ... existing fields
  interviewType: "audio",  // or "text", "video"
  answerAnalysis: {
    "0": {
      duration: 45,  // seconds spoken
      audioQuality: 0.85,
      silencePercentage: 5,
      speech_rate: 130,
      confidence: 0.92,
      sentiment: "positive",  // optional
      keywords: ["frontend", "React", "JavaScript"]  // extracted
    }
  },
  audioRecording: {
    stored: true,
    duration: 1200,  // total interview audio
    location: "s3://bucket/interviews/uuid/audio.wav"
  }
}
```

---

### 6. Frontend Logic Flow

#### Interview Type Check (in start page):
```javascript
// 1. Validate interview token
const interview = await validateToken(interviewToken);

// 2. Check interview type
if (interview.interviewType === "audio") {
  // Load audio interview component
  return <AudioInterviewPage />;
} else if (interview.interviewType === "text") {
  // Load text interview component
  return <InterviewStartPage />;
} else {
  // Show unsupported type error
  return <UnsupportedInterviewType />;
}
```

---

### 7. Recording and Transcription

**Note:** This implementation assumes:
- Candidate's speech is transcribed via:
  - Browser Speech Recognition API (client-side)
  - OR sent to backend for transcription via service (Google Cloud Speech-to-Text, AWS Transcribe, etc.)

**Transcription Flow:**
```
1. Candidate speaks (mic captures audio)
2. Frontend sends audio to transcription service
   OR Uses Web Speech API for real-time transcription
3. Transcribed text stored as answer
4. Answer submitted with other interview data
```

**Recommended Transcription Service:**
- **Browser-based**: `Web Speech API` (native, no backend needed)
- **Cloud-based**: `Google Cloud Speech-to-Text` or `AWS Transcribe`
- **Open-source**: `OpenAI Whisper` API

---

### 8. Monitoring Events for Audio Interviews

**Special Events to Track:**
```javascript
{
  sessionToken: "...",
  eventType: "audio_silence",  // Candidate not speaking
  severity: "warning",
  details: {
    duration: 120  // seconds of silence
  }
}
```

**Audio-Specific Metrics:**
- Silence duration (important for voice interviews)
- Audio input level (microphone working?)
- Speech rate (words per minute)
- Answer completeness (did they fully answer?)

---

### 9. Validation Rules

**Answer Validation:**
```javascript
// For audio interviews
const isValidAnswer = (answer) => {
  return (
    answer.text && answer.text.length > 10 &&  // Minimum content
    answer.duration >= 10 &&  // Minimum 10 seconds
    answer.audioQuality >= 0.5  // Minimum audio quality
  );
};
```

**Interview Submission Validation:**
```javascript
const isValidAudioSubmission = (submission) => {
  // At least 50% of questions answered
  const answersCount = Object.keys(submission.answers).length;
  const minRequired = Math.ceil(totalQuestions * 0.5);
  
  return (
    submission.sessionType === "audio-interview" &&
    answersCount >= minRequired &&
    submission.timeSpent >= minInterviewTime &&
    submission.monitoring  // Monitoring data included
  );
};
```

---

### 10. Response Storage Schema

**Recommended Database Fields:**
```javascript
Interview {
  // Core fields
  id: UUID,
  jobId: UUID,
  candidateId: UUID,
  interviewToken: STRING,
  
  // Type and format
  interviewType: ENUM["text", "audio", "video"],
  sessionType: ENUM["text-interview", "audio-interview"],
  
  // Answers
  answers: {
    "0": STRING,  // Answer text
    "1": STRING,
    // ... etc
  },
  
  // Audio-specific
  answerAnalysis: {
    "0": {
      duration: INTEGER,  // seconds
      audioQuality: FLOAT,  // 0-1
      silencePercentage: FLOAT,
      speech_rate: INTEGER,  // WPM
      confidence: FLOAT,  // 0-1
      sentiment: STRING,  // positive/neutral/negative
    }
  },
  
  // Monitoring
  monitoring: {
    tabSwitchCount: INTEGER,
    faceMissingCount: INTEGER,
    faceMissingDuration: INTEGER,
    audioSilenceDuration: INTEGER,
  },
  
  // Metadata
  completedAt: DATETIME,
  timeSpent: INTEGER,  // seconds
  status: ENUM["in_progress", "completed", "flagged"],
  createdAt: DATETIME,
  updatedAt: DATETIME,
}
```

---

### 11. Audio Interview Submission Flow

```
Frontend                          Backend
   |                                |
   |-- POST /submit/:token -------->|
   |   (answers, monitoring)        |
   |                                |
   |                       ✓ Validate session
   |                       ✓ Validate answers
   |                       ✓ Analyze audio quality
   |                       ✓ Save to database
   |                       ✓ Trigger evaluation
   |                                |
   |<------ Response (success) ------|
   |                                |
   |-- Navigate to /complete ------>|
   |                                |
```

---

### 12. Configuration / Settings

**Interview Configuration Endpoint:**
```javascript
// Retrieve interview settings during setup
GET /interviews/public/config/:token
```

**Response:**
```json
{
  "interviewType": "audio",
  "duration": 30,  // minutes
  "questionCount": 5,
  "features": {
    "video": true,  // require video on
    "audio": true,  // require audio
    "monitoring": true,  // enable security monitoring
    "transcription": "browser"  // or "server"
  }
}
```

---

### 13. Error Handling

**Errors Specific to Audio Interviews:**

```javascript
{
  code: "AUDIO_QUALITY_LOW",
  message: "Audio quality is too low. Please check your microphone.",
  action: "RETRY_MIC_TEST"
}

{
  code: "EXCESSIVE_SILENCE",
  message: "No audio detected for 30 seconds. Please check your microphone.",
  action: "CHECK_PERMISSIONS"
}

{
  code: "TRANSCRIPTION_FAILED",
  message: "Could not transcribe your response. Please try again.",
  action: "RERECORD_ANSWER"
}

{
  code: "INCOMPLETE_ANSWERS",
  message: "You must answer at least 3 of 5 questions.",
  action: "CONTINUE_INTERVIEW"
}
```

---

## Implementation Checklist

- [ ] Add `interviewType` field to Interview model
- [ ] Update `/validate/:token` endpoint to return interview type
- [ ] Update `/questions/:token` to return audio-specific question format
- [ ] Add `answerAnalysis` tracking to Interview schema
- [ ] Implement transcription pipeline (Web Speech API or cloud service)
- [ ] Update `/submit/:token` to accept `audio-interview` session type
- [ ] Add validation for audio submission format
- [ ] Store audio quality metrics with answers
- [ ] Create recruiter dashboard view for audio interviews
- [ ] Implement audio playback for review
- [ ] Add speech-to-text confidence scoring
- [ ] Create analytics for audio interview performance

---

## Testing Checklist

- [ ] Audio interview loads when `interviewType: "audio"`
- [ ] Text interview loads when `interviewType: "text"`
- [ ] Questions load correctly with max answer times
- [ ] Candidate can answer and submit
- [ ] Monitoring events recorded (silence, face, etc.)
- [ ] Answers submitted with correct structure
- [ ] Transcription accuracy verified
- [ ] Audio quality metrics captured
- [ ] Submission redirects to completion page
- [ ] Monitoring summary included in payload

---

## Migration Guide (Text to Audio)

To convert an existing text interview to audio:

1. Update interview record:
   ```javascript
   interview.interviewType = "audio";
   interview.sessionType = "audio-interview";
   ```

2. No changes needed to questions - they auto-adapt

3. Submission handler automatically processes as audio

4. Analytics dashboard shows both types side-by-side

