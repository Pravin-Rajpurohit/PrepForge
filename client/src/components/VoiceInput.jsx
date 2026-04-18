import { useState, useEffect, useRef } from 'react';

const VoiceInput = ({ onTranscriptChange, disabled }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let finalTranscript = '';
      for (let i = 0; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + ' ';
        }
      }
      
      // Update parent only with final words, you might also want to append interim results
      // Here we just dispatch final transcript when available
      if (finalTranscript) {
        onTranscriptChange(prev => (prev + ' ' + finalTranscript).trim());
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      setIsRecording(false);
    };

    recognition.onend = () => {
      // If we are still supposed to be recording, restart it
      if (isRecording) {
        recognition.start();
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [onTranscriptChange]);

  // Handle manual start/stop
  useEffect(() => {
    if (isRecording && recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (e) {
        // Already started
      }
    } else if (!isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, [isRecording]);

  if (!isSupported) {
    return <div className="text-red-500 text-sm">Voice not supported in this browser. Please use text mode.</div>;
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => setIsRecording(!isRecording)}
      className={`p-3 rounded-full flex items-center justify-center transition-colors ${
        isRecording 
          ? 'bg-red-500 text-white animate-pulse' 
          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      title={isRecording ? "Stop recording" : "Start recording"}
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
      </svg>
    </button>
  );
};

export default VoiceInput;
