import { Wand2, CalendarX2, CheckCircle2, XCircle } from 'lucide-react';
import { getSuggestion, REASON_TEXT } from '../../utils/formatDiagnostic';
import type { CourseDiagnostic } from '../../types';

interface ScheduleFeedbackProps {
    onFix: () => void;
    onDismiss: () => void;
    diagnostics: CourseDiagnostic[];
}

function ScheduleFeedback({ onFix, onDismiss, diagnostics }: ScheduleFeedbackProps) {
    const failingCourses = diagnostics.filter((diagnostic) => diagnostic.reason !== 'ok');

    // Show the fix button only when there are actionable filter adjustments
    const hasFixableCourses = failingCourses.some(
        (diagnostic) =>
            (diagnostic.reason === 'noDays' && diagnostic.availableDays.length > 0) ||
            (diagnostic.reason === 'noTime' && diagnostic.earliestStart !== null),
    );

    return (
        <div
            onClick={onDismiss}
            className="animate-in fade-in absolute inset-0 z-40 flex cursor-pointer items-center justify-center duration-200"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="dot-pattern mx-4 flex w-full max-w-sm cursor-default flex-col items-center gap-4 rounded-2xl border-2 border-slate-200 bg-white px-6 py-8 shadow-sm select-none sm:mx-0 sm:max-w-lg sm:px-16 sm:py-12"
            >
                <CalendarX2 size={40} className="text-slate-300" />
                <div className="text-center">
                    <p className="text-base font-semibold tracking-tight text-slate-400">
                        No valid schedules found
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                        {failingCourses.every((diagnostic) => diagnostic.reason === 'conflict')
                            ? 'Try reducing the minimum gap or removing a course'
                            : "Some courses don't fit your current filters"}
                    </p>
                </div>
                <div className="flex flex-wrap justify-center gap-x-3 gap-y-1">
                    {diagnostics.map((diagnostic) => (
                        <div key={diagnostic.courseId} className="flex items-center gap-1">
                            {diagnostic.reason === 'ok' ? (
                                <CheckCircle2 size={11} className="text-green-700" />
                            ) : (
                                <XCircle size={11} className="text-red-600" />
                            )}
                            <span className="font-space text-[10px] font-bold tracking-tight text-slate-500 uppercase">
                                {diagnostic.courseCode}
                            </span>
                        </div>
                    ))}
                </div>
                {failingCourses.length > 0 && (
                    <div className="flex flex-col items-center gap-1">
                        {failingCourses.map((diagnostic) => {
                            const suggestion = getSuggestion(diagnostic);
                            return (
                                <div key={diagnostic.courseId} className="text-center text-[10px]">
                                    <span className="font-bold text-slate-500">
                                        {diagnostic.courseCode}
                                    </span>
                                    <span className="text-slate-400">
                                        {' — '} {REASON_TEXT[diagnostic.reason]}
                                    </span>
                                    {suggestion && (
                                        <p className="font-medium text-emerald-600">
                                            {' → '} {suggestion}
                                        </p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
                {hasFixableCourses && (
                    <button
                        type="button"
                        onClick={onFix}
                        className="bg-theme-blue flex cursor-pointer items-center gap-1.5 rounded-lg px-5 py-2.5 text-[10px] font-black tracking-widest text-white uppercase shadow-sm transition-all hover:shadow-md active:scale-95"
                    >
                        <Wand2 size={12} />
                        Fix Filters
                    </button>
                )}
            </div>
        </div>
    );
}

export default ScheduleFeedback;
