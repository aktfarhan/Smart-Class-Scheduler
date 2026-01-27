import { useCallback } from 'react';
import type { ApiDepartmentWithRelations, FilterType } from '../types';
import { FILTER_CATEGORIES } from '../constants';

interface UseFilterLogicParams {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    setCurrentPage: (page: number) => void;
    departmentMap: Map<string, ApiDepartmentWithRelations>;
}

export function useFilterLogic({
    searchQuery,
    setSearchQuery,
    setCurrentPage,
    departmentMap,
}: UseFilterLogicParams) {
    const handleSidebarFilter = useCallback(
        (type: FilterType | 'clear', value: string | number) => {
            const valueStr = String(value).trim();

            if (type === 'clear') {
                setSearchQuery('');
                setCurrentPage(1);
                return;
            }

            const currentTokens = searchQuery
                ? searchQuery
                      .split(',')
                      .map((t) => t.trim())
                      .filter(Boolean)
                : [];

            if (currentTokens.includes(valueStr)) {
                setSearchQuery(currentTokens.filter((t) => t !== valueStr).join(', '));
                return;
            }

            let newTokens: string[];

            if (type === 'day') {
                newTokens = [...currentTokens, valueStr];
            } else {
                newTokens = currentTokens.filter((token) => {
                    switch (type) {
                        case 'term':
                            return !(FILTER_CATEGORIES.TERMS as Set<string>).has(token);
                        case 'sectionType':
                            return !(FILTER_CATEGORIES.TYPES as Set<string>).has(token);
                        case 'timeRange':
                            return !(FILTER_CATEGORIES.TIMES as Set<string>).has(token);
                        case 'departmentCode':
                            return !departmentMap.has(token.toUpperCase());
                        default:
                            return true;
                    }
                });
                newTokens.push(valueStr);
            }

            setSearchQuery(newTokens.join(', '));
            setCurrentPage(1);
        },
        [searchQuery, setSearchQuery, setCurrentPage, departmentMap],
    );

    return { handleSidebarFilter };
}
