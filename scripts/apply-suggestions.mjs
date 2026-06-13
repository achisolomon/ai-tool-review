#!/usr/bin/env node
import 'dotenv/config';
import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';

export const FLAGS = (argv) => ({
  dryRun: argv.includes('--dry-run'),
  yes: argv.includes('--yes'),
  unapply: argv.includes('--unapply') ? argv[argv.indexOf('--unapply') + 1] : null,
  stamp: argv.includes('--stamp') ? argv[argv.indexOf('--stamp') + 1] : null,
});

async function confirmEnv(url, flags) {
  if (flags.dryRun || flags.yes) return true;
  const rl = createInterface({ input: stdin, output: stdout });
  const ans = await rl.question(`Apply against ${url} ? [y/N] `);
  rl.close();
  return ans.trim().toLowerCase() === 'y';
}

async function main() {
  const flags = FLAGS(process.argv.slice(2));
  const url = process.env.SUPABASE_URL;
  if (!url || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY (see .env.example).');
    process.exit(1);
  }
  if (!(await confirmEnv(url, flags))) { console.log('Aborted.'); return; }
  // orchestration added in Task 2.5
}

// Only run main when executed directly, so the test file can import pure fns.
if (import.meta.url === `file://${process.argv[1]}`) main();
