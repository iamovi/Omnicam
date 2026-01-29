import { Camera, RefreshCw } from 'lucide-react';

interface CameraErrorProps {
  error: string;
  onRetry: () => void;
}

export function CameraError({ error, onRetry }: CameraErrorProps) {
  return (
    <div className="h-full flex flex-col items-center justify-center gap-6 p-8 text-center animate-fade-in">
      <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center">
        <Camera className="w-10 h-10 text-muted-foreground" />
      </div>
      
      <div className="space-y-2">
        <h2 className="text-xl font-medium">Camera Unavailable</h2>
        <p className="text-muted-foreground text-sm max-w-xs">{error}</p>
      </div>

      <button
        onClick={onRetry}
        className="flex items-center gap-2 px-6 py-3 bg-foreground text-background rounded-full font-medium transition-transform active:scale-95"
      >
        <RefreshCw className="w-4 h-4" />
        Try Again
      </button>
    </div>
  );
}
