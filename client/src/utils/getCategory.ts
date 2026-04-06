/**
 * Classify a section by its number suffix.
 *
 * @param sectionNumber - The section identifier (e.g., "01", "01L", "01D").
 * @returns "LAB", "DISC", or "LEC".
 */
export function getCategory(sectionNumber: string) {
    if (sectionNumber.endsWith('L')) return 'LAB';
    if (sectionNumber.endsWith('D')) return 'DISC';
    return 'LEC';
}
