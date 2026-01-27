import { MapPin } from 'lucide-react';

interface SectionLocationProps {
    location: string;
}

function SectionLocation({ location }: SectionLocationProps) {
    return (
        <div className="flex flex-row items-center lg:flex-col lg:justify-center gap-2">
            <span className="w-24 lg:hidden text-[10px] font-bold text-gray-400 uppercase shrink-0 tracking-widest">
                Location
            </span>
            <div className="flex items-center gap-1.5 text-gray-600 font-medium">
                <MapPin size={14} className="text-gray-400" />
                <span className="truncate">{location}</span>
            </div>
        </div>
    );
}

export default SectionLocation;
