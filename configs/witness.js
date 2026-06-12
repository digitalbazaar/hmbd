/*!
 * Copyright (c) 2024-2026 Digital Bazaar, Inc.
 */
import {config, util} from '@bedrock/core';

config.hmbd.kms = {};
config.hmbd.signing = {};
const cfg = config.hmbd;

// use computed configuration values
const c = util.config.main;
const cc = c.computer();

cc({
  'hmbd.kms.baseUrl': 'https://${server.host}/kms',
  'hmbd.kms.meterId':
    'https://${server.host}/meters/z19ygjQcNmQ9AbG7hCF39Kizs',
  'hmbd.signing.keystoreId':
    '${hmbd.kms.baseUrl}/keystores/hmbd-witness-keystore-v1',
  'hmbd.signing.ecdsaKeyId':
    '${hmbd.signing.keystoreId}/keys/hmbd-witness-ecdsa-signing-key-v1',
  'hmbd.signing.mldsaKeyId':
    '${hmbd.signing.keystoreId}/keys/hmbd-witness-mldsa-signing-key-v1'
});

cfg.kms.ipAllowList = ['127.0.0.1/32', '::1/128'];
