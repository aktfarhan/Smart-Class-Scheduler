import { ScrapeData } from './services/scraper/scraper';
import { data, instructorInfo } from '../data';
import { writeNormalizedJSON } from './services/writeNormalizedJSON';
import { writeJSONToFile } from './utils';
import { scrapeInstructorInfo } from './services/scraper/instructorInfoScraper';
import path from 'path';
import { runIngest } from './services/ingest/ingest';
import { removeAccents } from './utils/removeAccents';
import { matchMapInfo } from './services/matchMapInfo';
import type { InstructorInfo, RawDepartment } from './types';

async function main() {
    // const instructorInfoMap: Map<string, InstructorInfo> = new Map(
    //     instructorInfo.map(({ firstName, lastName, title, email, phone }) => [
    //         `${firstName} ${lastName}`,
    //         { title, email, phone },
    //     ])
    // );
    // const a = writeNormalizedJSON(data, instructorInfoMap);
    // const outputFilePath = path.resolve(__dirname, '../data/norm.json');
    // await writeJSONToFile(outputFilePath, a);
    runIngest();
}

main();
