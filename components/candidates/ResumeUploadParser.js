import { useState, useCallback } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import {
  validateResumeFile,
  RESUME_PARSING_CONFIG,
  getFileIcon,
} from '@/lib/resumeParsingConfig';
import resumeParserApi from '@/lib/resumeParserApi';
import candidateService from '@/services/candidate.service';

export const ResumeUploadParser = ({ candidateId, onParsingComplete, onError }) => {
  const { toast } = useToast();
  const [file, setFile] = useState(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parseProgress, setParseProgress] = useState(0);
  const [parsedData, setParsedData] = useState(null);
  const [updatePersonalInfo, setUpdatePersonalInfo] = useState(
    RESUME_PARSING_CONFIG.ui.updatePersonalInfoByDefault
  );
  const [isParsingEnabled, setIsParsingEnabled] = useState(true);

  // Check if parsing is enabled on mount
  useState(() => {
    checkParsingStatus();
  }, []);

  const checkParsingStatus = async () => {
    try {
      const enabled = await resumeParserApi.isParsingEnabled();
      setIsParsingEnabled(enabled);
    } catch (error) {
      console.warn('Could not check parsing status:', error.message);
      setIsParsingEnabled(false);
    }
  };

  const handleFileSelect = useCallback((e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const validation = validateResumeFile(selectedFile);
    if (!validation.valid) {
      toast({
        title: 'Invalid File',
        description: validation.error,
        variant: 'destructive',
      });
      return;
    }

    setFile(selectedFile);
    setParsedData(null);
  }, [toast]);

  const handleParse = useCallback(async () => {
    if (!file || !candidateId) {
      toast({
        title: 'Error',
        description: 'Please select a file and ensure candidate ID is set',
        variant: 'destructive',
      });
      return;
    }

    if (!isParsingEnabled) {
      toast({
        title: 'Parsing Disabled',
        description: RESUME_PARSING_CONFIG.messages.disabled,
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsParsing(true);
      setParseProgress(0);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setParseProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + Math.random() * 30;
        });
      }, 500);

      // Call resume parser API
      const result = await candidateService.uploadAndParseResume(
        candidateId,
        file,
        updatePersonalInfo
      );

      clearInterval(progressInterval);
      setParseProgress(100);

      if (result && result.parseResult?.success) {
        setParsedData(result.parseResult);
        toast({
          title: 'Success',
          description: `Resume parsed successfully! ${result.parseResult.skillsExtracted || 0} skills extracted.`,
        });

        if (onParsingComplete) {
          onParsingComplete(result);
        }
      } else {
        throw new Error('Parsing returned invalid result');
      }
    } catch (error) {
      console.error('Resume parsing error:', error);
      toast({
        title: 'Parsing Failed',
        description: error.message || RESUME_PARSING_CONFIG.messages.parsingFailed,
        variant: 'destructive',
      });

      if (onError) {
        onError(error);
      }
    } finally {
      setIsParsing(false);
      setParseProgress(0);
    }
  }, [file, candidateId, updatePersonalInfo, isParsingEnabled, toast, onParsingComplete, onError]);

  const handleClear = useCallback(() => {
    setFile(null);
    setParsedData(null);
  }, []);

  if (!isParsingEnabled) {
    return (
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <p className="text-sm text-yellow-700">{RESUME_PARSING_CONFIG.messages.disabled}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Resume Upload & Parser
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* File Upload Area */}
        {!file && !isParsing && (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-accent transition-colors">
            <input
              type="file"
              accept=".pdf,.docx,.doc"
              onChange={handleFileSelect}
              className="hidden"
              id="resume-upload"
              disabled={isParsing}
            />
            <label htmlFor="resume-upload" className="cursor-pointer">
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-8 w-8 text-muted-foreground" />
                <p className="font-medium">Drag and drop your resume here</p>
                <p className="text-sm text-muted-foreground">or click to browse (PDF, DOCX, DOC)</p>
                <p className="text-xs text-muted-foreground mt-2">Maximum file size: {RESUME_PARSING_CONFIG.maxFileSizeMB}MB</p>
              </div>
            </label>
          </div>
        )}

        {/* File Selected */}
        {file && !isParsing && (
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{getFileIcon(file.name)}</span>
                <div>
                  <p className="font-medium">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              </div>
              <button
                onClick={handleClear}
                className="text-muted-foreground hover:text-destructive"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Parsing Progress */}
        {isParsing && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-accent" />
              <p className="font-medium">Parsing resume...</p>
            </div>
            <Progress value={parseProgress} className="h-2" />
            <p className="text-xs text-muted-foreground">{Math.round(parseProgress)}% complete</p>
          </div>
        )}

        {/* Parsed Data Display */}
        {parsedData && !isParsing && (
          <div className="space-y-4 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <p className="font-medium text-green-700">Resume Parsed Successfully</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              {RESUME_PARSING_CONFIG.ui.showSkillsExtracted && (
                <div>
                  <p className="text-muted-foreground">Skills Extracted</p>
                  <p className="font-medium">{parsedData.skillsExtracted || 0}</p>
                </div>
              )}
              {RESUME_PARSING_CONFIG.ui.showExperienceExtracted && (
                <div>
                  <p className="text-muted-foreground">Experience Entries</p>
                  <p className="font-medium">{parsedData.experienceEntries || 0}</p>
                </div>
              )}
              {RESUME_PARSING_CONFIG.ui.showEducationExtracted && (
                <div>
                  <p className="text-muted-foreground">Education Entries</p>
                  <p className="font-medium">{parsedData.educationEntries || 0}</p>
                </div>
              )}
              <div>
                <p className="text-muted-foreground">Match Score</p>
                <p className="font-medium">{parsedData.matchScore || 0}%</p>
              </div>
            </div>

            <Button onClick={handleClear} variant="outline" size="sm" className="w-full">
              Upload Another Resume
            </Button>
          </div>
        )}

        {/* Update Personal Info Checkbox */}
        {file && !isParsing && !parsedData && (
          <div className="flex items-center gap-2">
            <Checkbox
              id="update-info"
              checked={updatePersonalInfo}
              onCheckedChange={setUpdatePersonalInfo}
            />
            <label
              htmlFor="update-info"
              className="text-sm cursor-pointer select-none"
            >
              Update candidate's personal information from resume
            </label>
          </div>
        )}

        {/* Parse Button */}
        {file && !isParsing && !parsedData && (
          <Button
            onClick={handleParse}
            className="w-full"
            disabled={isParsing}
          >
            <FileText className="h-4 w-4 mr-2" />
            Parse Resume
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default ResumeUploadParser;
