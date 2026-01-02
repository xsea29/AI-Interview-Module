/**
 * Resume Parsing Configuration
 * Feature flags and settings for resume parsing
 */

export const RESUME_PARSING_CONFIG = {
  // Enable/disable resume parsing feature
  enabled: process.env.NEXT_PUBLIC_RESUME_PARSING_ENABLED !== 'false',

  // Supported file types
  supportedFormats: ['.pdf', '.docx', '.doc'],
  supportedMimeTypes: [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
  ],

  // File size limits (in MB)
  maxFileSizeMB: 10,

  // UI Configuration
  ui: {
    showParsingLoader: true,
    autoParseOnUpload: true,
    updatePersonalInfoByDefault: true,
    showSkillsExtracted: true,
    showExperienceExtracted: true,
    showEducationExtracted: true,
  },

  // Error messages
  messages: {
    disabled: 'Resume parsing is currently disabled. Please contact your administrator.',
    unsupportedFormat: 'Unsupported file format. Supported formats: PDF, DOCX, DOC',
    fileTooLarge: 'File size exceeds the maximum allowed size (10MB)',
    parsingFailed: 'Failed to parse resume. Please try again or upload a different file.',
    emptyResume: 'Could not extract sufficient text from the resume file.',
    invalidFile: 'The selected file is not a valid resume document.',
    networkError: 'Network error. Please check your connection and try again.',
  },
};

/**
 * Validate file for resume parsing
 */
export const validateResumeFile = (file) => {
  if (!RESUME_PARSING_CONFIG.enabled) {
    return {
      valid: false,
      error: RESUME_PARSING_CONFIG.messages.disabled,
    };
  }

  if (!file) {
    return {
      valid: false,
      error: 'No file selected',
    };
  }

  // Check file type
  const fileExt = `.${file.name.split('.').pop().toLowerCase()}`;
  if (!RESUME_PARSING_CONFIG.supportedFormats.includes(fileExt)) {
    return {
      valid: false,
      error: RESUME_PARSING_CONFIG.messages.unsupportedFormat,
    };
  }

  // Check MIME type
  if (!RESUME_PARSING_CONFIG.supportedMimeTypes.includes(file.type)) {
    return {
      valid: false,
      error: RESUME_PARSING_CONFIG.messages.invalidFile,
    };
  }

  // Check file size
  const fileSizeMB = file.size / (1024 * 1024);
  if (fileSizeMB > RESUME_PARSING_CONFIG.maxFileSizeMB) {
    return {
      valid: false,
      error: RESUME_PARSING_CONFIG.messages.fileTooLarge,
    };
  }

  return {
    valid: true,
    error: null,
  };
};

/**
 * Get file icon based on type
 */
export const getFileIcon = (filename) => {
  const ext = filename.split('.').pop().toLowerCase();
  const icons = {
    pdf: '📄',
    docx: '📝',
    doc: '📝',
  };
  return icons[ext] || '📎';
};
