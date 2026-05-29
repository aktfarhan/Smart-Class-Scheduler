import { useCallback } from 'react';
import { FILTER_CATEGORIES } from '../constants';
import type { Dispatch, SetStateAction } from 'react';
import type { FilterType, LookupData } from '../types';

interface UseFilterLogicParams {
    lookupData: LookupData;
    setCurrentPage: (page: number) => void;
    setSearchQuery: Dispatch<SetStateAction<string>>;
}

export function useFilterLogic({
    lookupData,
    setSearchQuery,
    setCurrentPage,
}: UseFilterLogicParams) {
    const handleSidebarFilter = useCallback(
        (type: FilterType, value: string) => {
            const trimmed = value.trim();

            if (type === 'clear') {
                setSearchQuery('');
                setCurrentPage(1);
                return;
            }

            setSearchQuery((prev) => {
                const currentTokens = prev
                    .split(',')
                    .map((token) => token.trim())
                    .filter(Boolean);

                if (currentTokens.includes(trimmed)) {
                    return currentTokens.filter((token) => token !== trimmed).join(', ');
                }

                const filtered =
                    type === 'day'
                        ? currentTokens
                        : currentTokens.filter((token) => {
                              switch (type) {
                                  case 'term':
                                      return !lookupData.termsSet.has(token);
                                  case 'sectionType':
                                      return !(FILTER_CATEGORIES.TYPES as Set<string>).has(token);
                                  case 'timeRange':
                                      return !(FILTER_CATEGORIES.TIMES as Set<string>).has(token);
                                  case 'departmentCode':
                                      return !lookupData.departmentMap.has(token.toUpperCase());
                                  default:
                                      return true;
                              }
                          });
                return [...filtered, trimmed].join(', ');
            });
            setCurrentPage(1);
        },
        [lookupData, setSearchQuery, setCurrentPage],
    );

    return { handleSidebarFilter };
}
