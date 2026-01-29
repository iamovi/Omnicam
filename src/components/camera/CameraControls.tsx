import { SwitchCamera, Zap, ZapOff, Maximize, Minimize } from 'lucide-react';
import { CapturedMedia } from '@/hooks/useCamera';
import { useState } from 'react';

interface CameraControlsProps {
  onCapture: () => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onSwitchCamera: () => void;
  onToggleFlash: () => void;
  flashEnabled: boolean;
  hasFlash: boolean;
  isReady: boolean;
  isRecording: boolean;
  recordingDuration: number;
  lastMedia?: CapturedMedia;
  onOpenGallery: () => void;
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function CameraControls({
  onCapture,
  onStartRecording,
  onStopRecording,
  onSwitchCamera,
  onToggleFlash,
  flashEnabled,
  hasFlash,
  isReady,
  isRecording,
  recordingDuration,
  lastMedia,
  onOpenGallery,
}: CameraControlsProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleCapturePress = () => {
    if (isRecording) {
      onStopRecording();
    } else {
      onCapture();
    }
  };

  const handleCaptureLongPress = () => {
    if (!isRecording) {
      onStartRecording();
    }
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 pb-8 pt-16 px-6 bg-gradient-to-t from-background via-background/80 to-transparent">
      {/* Recording Duration */}
      {isRecording && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 rounded-full bg-destructive/90 text-destructive-foreground animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
          <span className="font-mono text-sm font-medium">{formatDuration(recordingDuration)}</span>
        </div>
      )}

      <div className="flex items-center justify-between max-w-md mx-auto">
        {/* Gallery Thumbnail */}
        <button
          onClick={onOpenGallery}
          className="camera-control w-14 h-14 overflow-hidden"
          disabled={!lastMedia || isRecording}
          aria-label="Open gallery"
        >
          {lastMedia ? (
            lastMedia.type === 'photo' ? (
              <img
                src={lastMedia.dataUrl}
                alt="Last photo"
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <div className="w-full h-full rounded-full bg-secondary flex items-center justify-center">
                <span className="text-xs font-medium">VID</span>
              </div>
            )
          ) : (
            <div className="w-full h-full rounded-full bg-secondary" />
          )}
        </button>

        {/* Capture Button */}
        <button
          onClick={handleCapturePress}
          onMouseDown={() => {
            const timeout = setTimeout(handleCaptureLongPress, 500);
            const cleanup = () => {
              clearTimeout(timeout);
              window.removeEventListener('mouseup', cleanup);
            };
            window.addEventListener('mouseup', cleanup);
          }}
          onTouchStart={() => {
            const timeout = setTimeout(handleCaptureLongPress, 500);
            const cleanup = () => {
              clearTimeout(timeout);
              window.removeEventListener('touchend', cleanup);
            };
            window.addEventListener('touchend', cleanup);
          }}
          disabled={!isReady}
          className={`capture-button disabled:opacity-50 disabled:cursor-not-allowed ${isRecording ? 'recording-pulse' : ''}`}
          aria-label={isRecording ? 'Stop recording' : 'Capture photo (hold for video)'}
        >
          <div 
            className={`transition-all duration-150 ${
              isRecording 
                ? 'w-8 h-8 rounded-md bg-destructive' 
                : 'capture-button-inner'
            }`} 
          />
        </button>

        {/* Switch Camera */}
        <button
          onClick={onSwitchCamera}
          disabled={!isReady || isRecording}
          className="camera-control w-14 h-14 text-foreground disabled:opacity-50"
          aria-label="Switch camera"
        >
          <SwitchCamera className="w-6 h-6" />
        </button>
      </div>

      {/* Mode Hint */}
      {!isRecording && (
        <p className="text-center text-muted-foreground text-xs mt-4 animate-fade-in">
          Tap for photo • Hold for video
        </p>
      )}

      {/* Secondary Controls */}
      <div className="flex items-center justify-center gap-4 mt-4">
        {/* Flash Toggle */}
        <button
          onClick={onToggleFlash}
          disabled={!hasFlash || isRecording}
          className={`camera-control w-10 h-10 disabled:opacity-30 ${
            flashEnabled ? 'flash-active' : 'text-foreground'
          }`}
          aria-label={flashEnabled ? 'Disable flash' : 'Enable flash'}
        >
          {flashEnabled ? (
            <Zap className="w-5 h-5" />
          ) : (
            <ZapOff className="w-5 h-5" />
          )}
        </button>

        {/* Fullscreen Toggle */}
        <button
          onClick={toggleFullscreen}
          className="camera-control w-10 h-10 text-foreground"
          aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
        >
          {isFullscreen ? (
            <Minimize className="w-5 h-5" />
          ) : (
            <Maximize className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  );
}
