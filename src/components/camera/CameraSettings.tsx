import { Settings } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface CameraSettingsProps {
    showGrid: boolean;
    setShowGrid: (show: boolean) => void;
    autoSave: boolean;
    setAutoSave: (enabled: boolean) => void;
}

export function CameraSettings({
    showGrid,
    setShowGrid,
    autoSave,
    setAutoSave,
}: CameraSettingsProps) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <button
                    className="p-2 rounded-full bg-black/20 text-white backdrop-blur-sm hover:bg-black/40 transition-colors"
                    aria-label="Open settings"
                >
                    <Settings className="w-6 h-6" />
                </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[300px]">
                <DialogHeader>
                    <DialogTitle>Settings</DialogTitle>
                </DialogHeader>
                <div className="grid gap-6 py-4">
                    <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="grid-mode" className="flex-1">Grid Lines</Label>
                        <Switch
                            id="grid-mode"
                            checked={showGrid}
                            onCheckedChange={setShowGrid}
                        />
                    </div>

                    <div className="space-y-3 pt-2 border-t">
                        <div className="flex items-center justify-between space-x-2">
                            <Label htmlFor="auto-save" className="flex-1">Auto-Save to Device</Label>
                            <Switch
                                id="auto-save"
                                checked={autoSave}
                                onCheckedChange={setAutoSave}
                            />
                        </div>
                        {autoSave && (
                            <p className="text-xs text-muted-foreground bg-secondary/50 p-2 rounded-md">
                                Photos and videos will be saved to your browser&apos;s default download location.
                            </p>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
