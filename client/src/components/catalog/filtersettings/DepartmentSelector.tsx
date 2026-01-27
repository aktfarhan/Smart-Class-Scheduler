import clsx from 'clsx';
import { useState, useMemo } from 'react';
import { Search, LibraryBig } from 'lucide-react';
import type { ApiDepartmentWithRelations } from '../../../types';

interface DepartmentSelectorProps {
    departmentMap: Map<string, ApiDepartmentWithRelations>;
    selectedDeptCode: string | undefined | null;
    onSelect: (code: string) => void;
}

function DepartmentSelector({
    departmentMap,
    selectedDeptCode,
    onSelect,
}: DepartmentSelectorProps) {
    const [departmentSearch, setDepartmentSearch] = useState('');

    const filteredDepts = useMemo(() => {
        const departments = Array.from(departmentMap.values());
        const query = departmentSearch.toLowerCase();
        const filtered = departments.filter(
            (d) => d.title.toLowerCase().includes(query) || d.code.toLowerCase().includes(query),
        );
        return filtered.sort((a, b) => a.title.localeCompare(b.title));
    }, [departmentMap, departmentSearch]);

    return (
        <div className="flex flex-col">
            <div className="mb-4 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-[10px] leading-0 font-bold tracking-widest uppercase">
                    <LibraryBig size={14} /> Departments
                </h3>
                <span className="text-theme-blue border-theme-blue/10 bg-theme-blue/5 rounded-md border px-2 py-0.5 text-[11px] font-bold">
                    {filteredDepts.length}
                </span>
            </div>
            <div className="relative mb-3 flex items-center">
                <Search className="pointer-events-none absolute left-3 text-gray-500" size={14} />
                <input
                    type="text"
                    spellCheck="false"
                    placeholder="Quick search..."
                    value={departmentSearch}
                    onChange={(e) => setDepartmentSearch(e.target.value)}
                    className="focus:border-theme-blue h-10 w-full rounded-lg border-2 border-gray-300 bg-gray-50 pr-3 pl-9 text-left text-xs font-semibold transition-all outline-none"
                />
            </div>
            <div className="h-60 overflow-y-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {filteredDepts.map((dept) => {
                    const isSelected = selectedDeptCode === dept.code;
                    return (
                        <button
                            key={dept.code}
                            onClick={() => onSelect(dept.code)}
                            className={clsx(
                                'mb-1.5 flex w-full cursor-pointer items-start gap-3 rounded-lg border-2 px-3 py-2 text-left transition-all',
                                isSelected
                                    ? 'border-theme-blue bg-theme-blue/5 text-theme-blue'
                                    : 'border-gray-100 bg-white text-gray-500 hover:border-gray-200',
                            )}
                        >
                            <span
                                className={clsx(
                                    'min-w-11.25 pt-0.5 text-[10px] font-black tracking-tight uppercase',
                                    isSelected ? 'text-theme-blue' : 'text-gray-600',
                                )}
                            >
                                {dept.code}
                            </span>
                            <span className="text-[11px] leading-normal font-semibold wrap-break-word">
                                {dept.title}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

export default DepartmentSelector;
