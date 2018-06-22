#!/usr/bin/env node

import yargs from 'yargs';

yargs
  .env('PALANTIR')
  .commandDir('commands')
  .help()
  .wrap(80)
  .parse();
