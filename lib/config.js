/*!
 * Copyright (c) 2023-2026 Digital Bazaar, Inc.
 */
import * as bedrock from '@bedrock/core';
import path from 'node:path';

const {config} = bedrock;

config.hmbd = {
  routes: {
    witness: '/witness'
  }
};

// FIXME: remove comments below and `initialMeters`, for demo purposes only
// meter controller info:
// DID: did:key:z6MknzKfRYj5GMpr5Ufkk82msquny1Hezoqym1Vv2RTihPF3
// seed: z1Ab9aktDWtQF8JqsGwoSRJyYvvR5LHtEGh2JqmuYhNePTA
config.meter.initialMeters = [
  {
    id: 'z19sPzzJWk4PSgrL1yU8Ne4hT',
    controller: 'did:key:z6MknzKfRYj5GMpr5Ufkk82msquny1Hezoqym1Vv2RTihPF3',
    product: {id: 'urn:uuid:cfb3fed8-d54c-4bd2-ada9-810ec1271f0d'},
    serviceId: 'did:key:z6MkpLAeP33tTCfKmAfwbQ4za5F73x5nUn2PheWMG5tXdwgE'
  }
];

config['app-identity'].seeds.services['blind-witness'] = {
  id: 'did:key:z6MkpLAeP33tTCfKmAfwbQ4za5F73x5nUn2PheWMG5tXdwgE',
  seedMultibase: 'z1AmKo4rrLRiKmPCpmbwnTZY4ohbwwSKFdtYMgSC7J11Kaw',
  serviceType: 'blind-witness'
};

bedrock.events.on('bedrock-cli.parsed', async () => {
  await import(path.join(config.paths.config, 'paths.js'));
  await import(path.join(config.paths.config, 'core.js'));
});

bedrock.events.on('bedrock.configure', async () => {
  await import(path.join(config.paths.config, 'server.js'));
  await import(path.join(config.paths.config, 'express.js'));
  await import(path.join(config.paths.config, 'database.js'));
  await import(path.join(config.paths.config, 'https-agent.js'));
  await import(path.join(config.paths.config, 'meter-http.js'));
  await import(path.join(config.paths.config, 'meter-usage-reporter.js'));
  await import(path.join(config.paths.config, 'witness.js'));
  await import(path.join(config.paths.config, 'veres-meter.js'));
});
