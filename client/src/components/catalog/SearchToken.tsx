import { clsx } from 'clsx';
import { LABEL_MAP } from '../../constants';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import type { Token } from '../../types';

interface SearchTokenProps {
    token: Token;
}

function SearchToken({ token }: SearchTokenProps) {
    const { type, text, isRecognized } = token;
    const displayLabel = LABEL_MAP[type];

    return (
        <div
            className={clsx(
                'flex items-center gap-1.5 rounded-md border px-3 py-1 text-[10px] font-bold tracking-wider uppercase transition-all',
                isRecognized && 'border-green-200 bg-green-50 text-green-700',
                !isRecognized && 'border-red-200 bg-red-50 text-red-600',
            )}
        >
            {isRecognized ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
            <span className="opacity-70">{displayLabel}:</span>
            <span>{text}</span>
        </div>
    );
}

export default SearchToken;
