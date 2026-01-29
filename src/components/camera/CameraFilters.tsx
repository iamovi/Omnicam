import { Sliders } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

interface CameraFiltersProps {
    filter: string;
    setFilter: (filter: string) => void;
}

export function CameraFilters({
    filter,
    setFilter,
}: CameraFiltersProps) {
    const filters = [
        { id: 'none', name: 'Normal', class: 'grayscale-0' },
        { id: 'grayscale', name: 'B&W Standard', class: 'grayscale' },
        { id: 'high-contrast', name: 'Noir', class: 'grayscale contrast-125 brightness-90' },
        { id: 'sepia', name: 'Sepia', class: 'sepia' },
        { id: 'vintage', name: 'Vintage', class: 'sepia-[.5] contrast-125' },
    ];

    return (
        <Dialog>
            <DialogTrigger asChild>
                <button
                    className="p-2 rounded-full bg-black/20 text-white backdrop-blur-sm hover:bg-black/40 transition-colors"
                    aria-label="Open filters"
                >
                    <Sliders className="w-6 h-6" />
                </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[300px]">
                <DialogHeader>
                    <DialogTitle>Filters</DialogTitle>
                </DialogHeader>
                <div className="grid gap-3 py-4">
                    {filters.map((f) => (
                        <button
                            key={f.id}
                            onClick={() => setFilter(f.class)}
                            className={`flex items-center justify-between p-3 rounded-lg border transition-all ${filter === f.class
                                    ? 'border-primary bg-primary/10'
                                    : 'border-transparent hover:bg-secondary'
                                }`}
                        >
                            <span className="text-sm font-medium">{f.name}</span>
                            <div className={`w-6 h-6 rounded-full bg-gradient-to-br from-white to-black border ${f.class}`} />
                        </button>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
}
