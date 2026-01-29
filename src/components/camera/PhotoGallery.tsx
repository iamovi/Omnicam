import { X, Download, Trash2, ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { CapturedMedia, CapturedVideo } from '@/hooks/useCamera';
import { useState, useRef } from 'react';

interface PhotoGalleryProps {
  media: CapturedMedia[];
  isOpen: boolean;
  onClose: () => void;
  onDelete: (id: string) => void;
  onDownload: (item: CapturedMedia) => void;
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function PhotoGallery({
  media,
  isOpen,
  onClose,
  onDelete,
  onDownload,
}: PhotoGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const videoPlayerRef = useRef<HTMLVideoElement>(null);

  if (!isOpen) return null;

  const selectedItem = selectedIndex !== null ? media[selectedIndex] : null;

  const goToPrevious = () => {
    if (selectedIndex !== null && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    }
  };

  const goToNext = () => {
    if (selectedIndex !== null && selectedIndex < media.length - 1) {
      setSelectedIndex(selectedIndex + 1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') goToPrevious();
    if (e.key === 'ArrowRight') goToNext();
    if (e.key === 'Escape') {
      if (selectedItem) {
        setSelectedIndex(null);
      } else {
        onClose();
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-background animate-fade-in"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-background to-transparent">
        <h2 className="text-lg font-medium">
          {selectedItem ? `${selectedIndex! + 1} / ${media.length}` : `Gallery (${media.length})`}
        </h2>
        <button
          onClick={() => (selectedItem ? setSelectedIndex(null) : onClose())}
          className="camera-control w-10 h-10 text-foreground"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {selectedItem ? (
        /* Full Media View */
        <div className="absolute inset-0 flex items-center justify-center">
          {selectedItem.type === 'photo' ? (
            <img
              src={selectedItem.dataUrl}
              alt="Selected photo"
              className="max-w-full max-h-full object-contain animate-scale-in"
            />
          ) : (
            <video
              ref={videoPlayerRef}
              src={(selectedItem as CapturedVideo).blobUrl}
              controls
              autoPlay
              className="max-w-full max-h-full object-contain animate-scale-in"
            />
          )}

          {/* Navigation */}
          {selectedIndex! > 0 && (
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 camera-control w-12 h-12 text-foreground"
              aria-label="Previous"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}
          {selectedIndex! < media.length - 1 && (
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 camera-control w-12 h-12 text-foreground"
              aria-label="Next"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}

          {/* Actions */}
          <div className="absolute bottom-8 left-0 right-0 flex items-center justify-center gap-4">
            <button
              onClick={() => onDownload(selectedItem)}
              className="camera-control w-14 h-14 text-foreground"
              aria-label="Download"
            >
              <Download className="w-6 h-6" />
            </button>
            <button
              onClick={() => {
                onDelete(selectedItem.id);
                if (media.length === 1) {
                  onClose();
                } else if (selectedIndex! >= media.length - 1) {
                  setSelectedIndex(selectedIndex! - 1);
                }
              }}
              className="camera-control w-14 h-14 text-destructive"
              aria-label="Delete"
            >
              <Trash2 className="w-6 h-6" />
            </button>
          </div>
        </div>
      ) : (
        /* Gallery Grid */
        <div className="absolute inset-0 pt-16 pb-4 px-4 overflow-y-auto">
          {media.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <p className="text-muted-foreground">No photos or videos yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2 animate-slide-up">
              {media.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedIndex(index)}
                  className="gallery-thumbnail aspect-square relative"
                >
                  {item.type === 'photo' ? (
                    <img
                      src={item.dataUrl}
                      alt={`Photo ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <>
                      <div className="w-full h-full bg-secondary flex items-center justify-center">
                        <Play className="w-8 h-8 text-foreground" />
                      </div>
                      <span className="absolute bottom-1 right-1 text-xs bg-background/80 px-1.5 py-0.5 rounded">
                        {formatDuration((item as CapturedVideo).duration)}
                      </span>
                    </>
                  )}
                  {item.type === 'video' && (
                    <div className="absolute top-1 left-1">
                      <span className="text-[10px] font-medium bg-destructive text-destructive-foreground px-1.5 py-0.5 rounded">
                        VIDEO
                      </span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
