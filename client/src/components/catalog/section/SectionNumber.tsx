interface SectionNumberProps {
    sectionNumber: string;
}

function SectionNumber({ sectionNumber }: SectionNumberProps) {
    return (
        <div className="flex flex-row items-center lg:flex-col lg:justify-center gap-2">
            <span className="lg:hidden w-24 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Section
            </span>
            <span className="lg:ml-2 font-bold text-gray-600 group-hover/row:text-theme-blue duration-200 transition-colors">
                {sectionNumber}
            </span>
        </div>
    );
}

export default SectionNumber;
