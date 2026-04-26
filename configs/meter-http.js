/*!
 * Copyright (c) 2024-2026 Digital Bazaar, Inc.
 */
import {config} from '@bedrock/core';

const cfg = config['meter-http'];

// list of allowed applications that can create meters
cfg.meterCreationAllowList = [
  // root development identity, seed found in
  // .secrets-dev/root-development-seed.txt
  'did:key:z6Mkiv1u2FSoQbahyqSQv8pbyV574mHDyB55p8hZGLB2FP2f'
];
