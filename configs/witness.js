/*!
 * Copyright (c) 2024-2026 Digital Bazaar, Inc.
 */
import {config} from '@bedrock/core';

config.hmbd.kms = {};
config.hmbd.signing = {};
const cfg = config.hmbd;

cfg.kms.baseUrl = `https://localhost:22443/kms`;
cfg.kms.ipAllowList = ['127.0.0.1/32', '::1/128'];
// meter ID to use to create keystores (mock dev meter for WebKMS)
cfg.kms.meterId =
  'https://localhost:22443/meters/z19ygjQcNmQ9AbG7hCF39Kizs';

// stable IDs for the witness signing keystore and key
cfg.signing.keystoreId =
  `${cfg.kms.baseUrl}/keystores/hmbd-witness-keystore-v1`;
cfg.signing.keyId =
  `${cfg.signing.keystoreId}/keys/hmbd-witness-signing-key-v1`;
cfg.signing.mldsaKeyId =
  `${cfg.signing.keystoreId}/keys/hmbd-witness-mldsa-signing-key-v1`;
