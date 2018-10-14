#!/usr/bin/env node

import yargs from 'yargs';

yargs
  .commandDir('commands')
  .help()
  .wrap(80)
  .parse();
