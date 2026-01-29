import { RefObject } from 'react';

interface CameraViewfinderProps {
  videoRef: RefObject<HTMLVideoElement>;
  isReady: boolean;
  facingMode: 'user' | 'environment';
  isCapturing: boolean;
  isRecording: boolean;
  showGrid: boolean;
  filter: string;
}

export function CameraViewfinder({
  videoRef,
  isReady,
  facingMode,
  isCapturing,
  isRecording,
  showGrid,
  filter,
}: CameraViewfinderProps) {
  return (
    <div className="relative w-full h-full overflow-hidden bg-background">
      {/* Video Feed */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`absolute inset-0 w-full h-full object-cover transition-all duration-300 ${isReady ? 'opacity-100' : 'opacity-0'
          } ${facingMode === 'user' ? 'scale-x-[-1]' : ''} ${filter}`}
      />

      {/* Loading State */}
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
            <p className="text-muted-foreground text-sm">Starting camera...</p>
          </div>
        </div>
      )}

      {/* Rule of Thirds Grid */}
      {showGrid && isReady && (
        <div className="absolute inset-0 viewfinder-grid pointer-events-none" />
      )}

      {/* Capture Flash Effect */}
      {isCapturing && (
        <div className="absolute inset-0 bg-foreground flash-overlay pointer-events-none" />
      )}

      {/* Recording Border Indicator */}
      {isRecording && (
        <div className="absolute inset-0 border-4 border-destructive pointer-events-none animate-pulse" />
      )}

      {/* Focus Indicator - hide during recording */}
      {!isRecording && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-20 h-20 border border-foreground/30 rounded-lg" />
        </div>
      )}
    </div>
  );
}
