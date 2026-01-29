import { useState, useRef, useCallback, useEffect } from 'react';

export interface CapturedPhoto {
  id: string;
  dataUrl: string;
  timestamp: Date;
  type: 'photo';
}

export interface CapturedVideo {
  id: string;
  blobUrl: string;
  timestamp: Date;
  type: 'video';
  duration: number;
}

export type CapturedMedia = CapturedPhoto | CapturedVideo;

interface UseCameraOptions {
  facingMode?: 'user' | 'environment';
}

export function useCamera(options: UseCameraOptions = {}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordingStartTimeRef = useRef<number>(0);

  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>(
    options.facingMode || 'environment'
  );
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [hasFlash, setHasFlash] = useState(false);
  const [media, setMedia] = useState<CapturedMedia[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      setIsReady(false);

      // Stop any existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: true, // Enable audio for video recording
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsReady(true);

        // Check for flash/torch capability
        const track = stream.getVideoTracks()[0];
        const capabilities = track.getCapabilities?.();
        setHasFlash(!!(capabilities as any)?.torch);
      }
    } catch (err) {
      console.error('Camera error:', err);
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          setError('Camera access denied. Please allow camera and microphone permissions.');
        } else if (err.name === 'NotFoundError') {
          setError('No camera found on this device.');
        } else {
          setError('Failed to access camera. Please try again.');
        }
      }
    }
  }, [facingMode]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsReady(false);
  }, []);

  const switchCamera = useCallback(() => {
    if (isRecording) return; // Don't switch while recording
    setFacingMode(prev => (prev === 'user' ? 'environment' : 'user'));
  }, [isRecording]);

  const toggleFlash = useCallback(async () => {
    if (!streamRef.current || !hasFlash) return;

    const track = streamRef.current.getVideoTracks()[0];
    const newFlashState = !flashEnabled;

    try {
      await track.applyConstraints({
        advanced: [{ torch: newFlashState } as any],
      });
      setFlashEnabled(newFlashState);
    } catch (err) {
      console.error('Flash toggle failed:', err);
    }
  }, [flashEnabled, hasFlash]);

  const capturePhoto = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !isReady || isRecording) return null;

    setIsCapturing(true);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return null;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Flip horizontally if using front camera
    if (facingMode === 'user') {
      context.translate(canvas.width, 0);
      context.scale(-1, 1);
    }

    context.drawImage(video, 0, 0);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
    const newPhoto: CapturedPhoto = {
      id: Date.now().toString(),
      dataUrl,
      timestamp: new Date(),
      type: 'photo',
    };

    setMedia(prev => [newPhoto, ...prev]);

    // Reset capturing state after animation
    setTimeout(() => setIsCapturing(false), 200);

    return newPhoto;
  }, [isReady, facingMode, isRecording]);

  const startRecording = useCallback(() => {
    if (!streamRef.current || !isReady || isRecording) return;

    recordedChunksRef.current = [];
    recordingStartTimeRef.current = Date.now();

    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
      ? 'video/webm;codecs=vp9'
      : MediaRecorder.isTypeSupported('video/webm')
        ? 'video/webm'
        : 'video/mp4';

    const mediaRecorder = new MediaRecorder(streamRef.current, {
      mimeType,
      videoBitsPerSecond: 2500000,
    });

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunksRef.current.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const duration = Math.round((Date.now() - recordingStartTimeRef.current) / 1000);
      const blob = new Blob(recordedChunksRef.current, { type: mimeType });
      const blobUrl = URL.createObjectURL(blob);

      const newVideo: CapturedVideo = {
        id: Date.now().toString(),
        blobUrl,
        timestamp: new Date(),
        type: 'video',
        duration,
      };

      setMedia(prev => [newVideo, ...prev]);
      setRecordingDuration(0);
    };

    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start(1000); // Collect data every second
    setIsRecording(true);
  }, [isReady, isRecording]);

  const stopRecording = useCallback(() => {
    if (!mediaRecorderRef.current || !isRecording) return;

    mediaRecorderRef.current.stop();
    mediaRecorderRef.current = null;
    setIsRecording(false);
  }, [isRecording]);

  // Update recording duration
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingDuration(Math.round((Date.now() - recordingStartTimeRef.current) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const deleteMedia = useCallback((id: string) => {
    setMedia(prev => {
      const item = prev.find(m => m.id === id);
      if (item?.type === 'video') {
        URL.revokeObjectURL((item as CapturedVideo).blobUrl);
      }
      return prev.filter(m => m.id !== id);
    });
  }, []);

  const downloadMedia = useCallback((item: CapturedMedia) => {
    const link = document.createElement('a');
    if (item.type === 'photo') {
      link.href = item.dataUrl;
      link.download = `photo-${item.timestamp.getTime()}.jpg`;
    } else {
      link.href = item.blobUrl;
      link.download = `video-${item.timestamp.getTime()}.webm`;
    }
    link.click();
  }, []);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [facingMode]);

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      media.forEach(item => {
        if (item.type === 'video') {
          URL.revokeObjectURL((item as CapturedVideo).blobUrl);
        }
      });
    };
  }, []);

  return {
    videoRef,
    canvasRef,
    isReady,
    error,
    facingMode,
    flashEnabled,
    hasFlash,
    media,
    isCapturing,
    isRecording,
    recordingDuration,
    startCamera,
    stopCamera,
    switchCamera,
    toggleFlash,
    capturePhoto,
    startRecording,
    stopRecording,
    deleteMedia,
    downloadMedia,
  };
}
