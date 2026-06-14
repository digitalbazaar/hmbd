/*!
 * Copyright (c) 2023-2026 Digital Bazaar, Inc.
 */
import * as bedrock from '@bedrock/core';
import path from 'node:path';

const {config} = bedrock;

config.hmbd = {};

bedrock.events.on('bedrock-cli.parsed', async () => {
  await import(path.join(config.paths.config, 'paths.js'));
  await import(path.join(config.paths.config, 'core.js'));
});

bedrock.events.on('bedrock.configure', async () => {
  await import(path.join(config.paths.config, 'server.js'));
  await import(path.join(config.paths.config, 'express.js'));
  await import(path.join(config.paths.config, 'witness.js'));
  try {
    await import(path.join(config.paths.config, 'secrets.js'));
  } catch(e) {
    if(e.code !== 'ERR_MODULE_NOT_FOUND') {
      throw e;
    }
  }
});
