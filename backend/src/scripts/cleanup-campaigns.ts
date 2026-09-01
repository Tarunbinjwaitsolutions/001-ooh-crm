import mongoose from 'mongoose';

import { config } from '../config/index.js';
import {
  identifyInvalidSites,
  repairInvalidSites,
} from '../modules/campaigns/campaign.service.js';

/**
 * CLEANUP SCRIPT: Remove invalid site references from campaigns.
 *
 * Usage:
 *   npm run cleanup:campaigns           # Identify invalid references
 *   npm run cleanup:campaigns -- --fix  # Fix them
 *
 * This script:
 * 1. Finds all campaigns
 * 2. Checks if all referenced sites exist
 * 3. Reports campaigns with missing sites
 * 4. Optionally removes the invalid site IDs (use --fix flag)
 */

async function cleanup(fix: boolean = false) {
  await mongoose.connect(config.mongoUri);

  try {
    console.log(
      '\n📋 Scanning campaigns for invalid site references...\n',
    );

    if (fix) {
      console.log('🔧 Repairing campaigns...\n');

      const repaired = await repairInvalidSites();

      if (repaired.length === 0) {
        console.log(
          '✅ No campaigns needed repair.',
        );
      } else {
        for (const item of repaired) {
          console.log(
            `✅ ${item.campaignCode}: Removed ${item.removed} invalid site(s)`,
          );
        }

        console.log(
          `\n🎉 Repaired ${repaired.length} campaign(s)`,
        );
      }
    } else {
      const invalid =
        await identifyInvalidSites();

      if (invalid.length === 0) {
        console.log(
          '✅ All campaigns have valid site references.',
        );
      } else {
        for (const item of invalid) {
          console.log(
            `⚠️  ${item.campaignCode}: Missing sites: ${item.invalidSites.join(", ")}`,
          );
        }

        console.log(
          `\n💡 Found issues in ${invalid.length} campaign(s)`,
        );
        console.log(
          `\nTo fix these issues, run:`,
        );
        console.log(
          `   npm run cleanup:campaigns -- --fix\n`,
        );
      }
    }
  } finally {
    await mongoose.connection.close();
  }
}

const fix = process.argv.includes('--fix');
cleanup(fix).catch((err) => {
  console.error('Cleanup failed:', err);
  process.exit(1);
});
