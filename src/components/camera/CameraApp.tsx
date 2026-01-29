import { useState, useEffect, useRef } from 'react';
import { useCamera } from '@/hooks/useCamera';
import { CameraViewfinder } from './CameraViewfinder';
import { CameraControls } from './CameraControls';
import { PhotoGallery } from './PhotoGallery';
import { CameraError } from './CameraError';
import { CameraSettings } from './CameraSettings';
import { CameraFilters } from './CameraFilters';

export function CameraApp() {
  const {
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
    switchCamera,
    toggleFlash,
    capturePhoto,
    startRecording,
    stopRecording,
    deleteMedia,
    downloadMedia,
  } = useCamera();

  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [filter, setFilter] = useState('none');
  const [autoSave, setAutoSave] = useState(false);
  const lastMediaIdRef = useRef<string | null>(null);

  const longPressTimeoutRef = useRef<NodeJS.Timeout>();
  const isLongPressRef = useRef(false);

  const handleCapture = async () => {
    await capturePhoto();
  };

  // Auto-save effect
  useEffect(() => {
    if (media.length > 0) {
      const newestMedia = media[0];
      // Only download if auto-save is on and this is a new file we haven't seen yet
      if (lastMediaIdRef.current !== newestMedia.id) {
        if (autoSave && lastMediaIdRef.current !== null) {
          downloadMedia(newestMedia);
        }
        lastMediaIdRef.current = newestMedia.id;
      }
    }
  }, [media, autoSave, downloadMedia]);

  // Initialize ref with initial newest media to prevent downloading historical items on refresh
  useEffect(() => {
    if (media.length > 0 && lastMediaIdRef.current === null) {
      lastMediaIdRef.current = media[0].id;
    } else if (media.length === 0) {
      lastMediaIdRef.current = 'empty';
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if input is focused (though likely none here)
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          if (e.repeat) return;

          isLongPressRef.current = false;
          longPressTimeoutRef.current = setTimeout(() => {
            if (!isRecording) {
              isLongPressRef.current = true;
              startRecording();
            }
          }, 500);
          break;

        case 'KeyS':
          e.preventDefault();
          if (!isRecording) switchCamera();
          break;

        case 'KeyF':
          e.preventDefault();
          if (!isRecording && hasFlash) toggleFlash();
          break;

        case 'Escape':
          if (isGalleryOpen) setIsGalleryOpen(false);
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        clearTimeout(longPressTimeoutRef.current);

        if (isLongPressRef.current) {
          // If was long press, stop recording
          stopRecording();
        } else {
          // If short press, capture photo
          // Only if not already recording/capturing
          if (!isRecording && !isCapturing) {
            handleCapture();
          }
        }
        isLongPressRef.current = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      clearTimeout(longPressTimeoutRef.current);
    };
  }, [isRecording, isCapturing, switchCamera, toggleFlash, hasFlash, isGalleryOpen, startRecording, stopRecording, handleCapture]);

  if (error) {
    return <CameraError error={error} onRetry={startCamera} />;
  }

  return (
    <div className="relative h-full w-full overflow-hidden bg-background">
      {/* Settings Button - Top Right */}
      <div className="absolute top-6 right-6 z-50 flex flex-col gap-4">
        <CameraSettings
          showGrid={showGrid}
          setShowGrid={setShowGrid}
          autoSave={autoSave}
          setAutoSave={setAutoSave}
        />
        <CameraFilters
          filter={filter}
          setFilter={setFilter}
        />
      </div>

      {/* Keyboard Shortcuts Overlay - Desktop Only - Moved to Top Left */}
      <div className="absolute top-6 left-6 z-50 hidden md:block text-left pointer-events-none space-y-1">
        <div className="text-xs text-white/50 uppercase tracking-widest font-mono mb-2">Keyboard Shortcuts</div>
        <div className="text-sm text-white/80 font-mono shadow-sm"><span className="font-bold">Space</span> Capture</div>
        <div className="text-sm text-white/80 font-mono shadow-sm"><span className="font-bold">Hold Space</span> Record</div>
        <div className="text-sm text-white/80 font-mono shadow-sm"><span className="font-bold">S</span> Switch Cam</div>
        {hasFlash && <div className="text-sm text-white/80 font-mono shadow-sm"><span className="font-bold">F</span> Flash</div>}
      </div>

      {/* Hidden canvas for capturing */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Viewfinder */}
      <CameraViewfinder
        videoRef={videoRef}
        isReady={isReady}
        facingMode={facingMode}
        isCapturing={isCapturing}
        isRecording={isRecording}
        showGrid={showGrid}
        filter={filter}
      />

      {/* Controls */}
      <CameraControls
        onCapture={handleCapture}
        onStartRecording={startRecording}
        onStopRecording={stopRecording}
        onSwitchCamera={switchCamera}
        onToggleFlash={toggleFlash}
        flashEnabled={flashEnabled}
        hasFlash={hasFlash}
        isReady={isReady}
        isRecording={isRecording}
        recordingDuration={recordingDuration}
        lastMedia={media[0]}
        onOpenGallery={() => setIsGalleryOpen(true)}
      />

      {/* Gallery */}
      <PhotoGallery
        media={media}
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        onDelete={deleteMedia}
        onDownload={downloadMedia}
      />
    </div>
  );
}
