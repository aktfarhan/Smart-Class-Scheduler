import { CalendarDays } from 'lucide-react';

interface SectionTermProps {
    term: string;
}

function SectionTerm({ term }: SectionTermProps) {
    return (
        <div className="absolute top-5 right-5 lg:static lg:flex lg:items-center lg:justify-center">
            <div className="flex items-center gap-1.5 text-gray-600 font-medium">
                <CalendarDays size={14} className="text-gray-400" />
                <span className="lg:font-medium text-xs lg:text-sm font-semibold truncate">
                    {term}
                </span>
            </div>
        </div>
    );
}

export default SectionTerm;
