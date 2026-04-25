/*!
 * Copyright (c) 2024 Digital Bazaar, Inc. All rights reserved.
 */
import {config} from '@bedrock/core';

config.hmbd.kms = {};
const cfg = config.hmbd;

cfg.kms.baseUrl = `https://localhost:22443/kms`;
cfg.kms.ipAllowList = ['127.0.0.1/32', '::1/128'];
// meter ID to use to create keystores (mock dev meter for WebKMS)
cfg.kms.meterId =
  'https://localhost:22443/meters/z19ygjQcNmQ9AbG7hCF39Kizs';
