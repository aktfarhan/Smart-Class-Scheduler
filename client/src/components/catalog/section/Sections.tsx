import SectionRow from './SectionRow';
import type { ApiSectionWithRelations } from '../../../types';

interface SectionProps {
    sections: ApiSectionWithRelations[];
}

function Sections({ sections }: SectionProps) {
    return (
        <div className="w-full">
            <div className="border-gray-200 rounded-b-sm bg-white shadow-inner overflow-hidden">
                <div className="hidden lg:grid grid-cols-[4rem_2fr_15rem_1.7fr_1fr] gap-2 px-6 py-2 bg-gray-50/80 border-b border-gray-100 text-[10px] font-bold text-gray-400 text-center uppercase tracking-widest">
                    <span>Section</span>
                    <span>Instructor</span>
                    <span>Days & Time</span>
                    <span>Location</span>
                    <span>Term</span>
                </div>
                <div className="divide-y divide-gray-100">
                    {sections.map((section) => (
                        <SectionRow key={section.id} section={section} />
                    ))}
                </div>
            </div>
        </div>
    );
}
export default Sections;
