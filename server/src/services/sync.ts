/**
 * @fileoverview
 * Dumps the local PostgreSQL database and syncs into Railway
 */

import os from 'os';
import { logger } from '../utils/logger';
import { execSync } from 'child_process';
import { writeFileSync, unlinkSync, existsSync } from 'fs';

const localUrl = process.env.DATABASE_URL;
const railwayUrl = process.env.RAILWAY_DB_URL;

// Full path to PostgreSQL binaries
const pgDump = '"C:/Program Files/PostgreSQL/18/bin/pg_dump"';
const psql = '"C:/Program Files/PostgreSQL/18/bin/psql"';

// Temp file lives in OS temp dir
const tmpFile = `${os.tmpdir()}/sync.sql`;

// Truncate all application tables before re-inserting fresh data.
const truncate = [
    'TRUNCATE',
    '"Department","Course","Section","Meeting","Instructor",',
    '"DiscussionGroup","Metadata","_DepartmentInstructors","_SectionInstructors"',
    'CASCADE;\n',
].join(' ');

/**
 * Dumps the local database and syncs it to Railway.
 * @param phaseOffset Added to phase numbers
 * @returns true if synced, false if env vars are missing
 */
export async function syncToRailway(phaseOffset = 0): Promise<boolean> {
    // Caller decides how to handle missing env vars
    if (!localUrl || !railwayUrl) return false;

    try {
        // Dump local database
        logger.phase(1 + phaseOffset, 'Dumping Local Database');
        const dump = execSync(
            `${pgDump} --data-only --disable-triggers --no-owner --exclude-table=_prisma_migrations "${localUrl}"`,
            { encoding: 'utf-8', shell: 'cmd.exe', maxBuffer: 50 * 1024 * 1024 },
        );

        // Prepend TRUNCATE so old data is wiped before new COPY statements run
        writeFileSync(tmpFile, truncate + dump);
        logger.info('Dump saved');

        // psql -1 wraps the entire file in a single transaction
        logger.phase(2 + phaseOffset, 'Syncing to Railway');
        execSync(`${psql} -1 -q "${railwayUrl}" -f "${tmpFile}"`, { shell: 'cmd.exe' });
        logger.info('Data synced');
        return true;
    } finally {
        // Clean the temp file
        if (existsSync(tmpFile)) unlinkSync(tmpFile);
    }
}
