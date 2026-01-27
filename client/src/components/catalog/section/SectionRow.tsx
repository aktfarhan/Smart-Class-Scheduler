import { useCallback, useState } from 'react';
import SectionTerm from './SectionTerm';
import SectionNumber from './SectionNumber';
import SectionDaysTime from './SectionDaysTime';
import SectionLocation from './SectionLocation';
import SectionInstructors from './SectionInstructors';
import type { ApiSectionWithRelations } from '../../../types';

interface SectionRowProps {
    section: ApiSectionWithRelations;
}

function SectionRow({ section }: SectionRowProps) {
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const handleCopy = useCallback((email: string | null | undefined, id: string) => {
        if (!email) return;
        navigator.clipboard
            .writeText(email)
            .then(() => {
                setCopiedId(id);
                setTimeout(() => setCopiedId(null), 2000);
            })
            .catch((err) => {
                console.error('Failed to copy email: ', err);
            });
    }, []);

    const location = section.meetings[0]?.location ?? 'TBA';

    return (
        <div className="flex flex-col lg:grid lg:grid-cols-[4rem_2fr_15rem_1.7fr_1fr] relative gap-y-4 lg:gap-2 px-5 py-5 lg:py-3 border-t border-gray-100 text-sm transition-colors hover:bg-slate-50/50 group/row">
            <SectionNumber sectionNumber={section.sectionNumber} />
            <SectionInstructors
                instructors={section.instructors}
                copiedId={copiedId}
                onCopy={handleCopy}
            />
            <SectionDaysTime meetings={section.meetings} />
            <SectionLocation location={location} />
            <SectionTerm term={section.term} />
        </div>
    );
}

export default SectionRow;
