#!/usr/bin/env node
/*!
 * Copyright (c) 2024-2026 Digital Bazaar, Inc.
 */

/**
 * Generates a fresh ECDSA P-256 and ML-DSA-44 key pair and prints the
 * configuration values to copy into configs/secrets.js.
 *
 * Usage: node bin/generate-signing-keys.js.
 */
import * as EcdsaMultikey from '@digitalbazaar/ecdsa-multikey';
import * as MldsaMultikey from '@digitalbazaar/mldsa-multikey';

const ecdsaKp = await EcdsaMultikey.generate({curve: 'P-256'});
const ecdsaExport = await ecdsaKp.export({publicKey: true, secretKey: true});

const mldsaKp = await MldsaMultikey.generate();
const mldsaExport = await mldsaKp.export({publicKey: true, secretKey: true});

console.log(`
// Place these values into config/secrets.js or your deployment secrets manager
import {config} from '@bedrock/core';

config.hmbd.secrets.ecdsa.publicKeyMultibase =
  '${ecdsaExport.publicKeyMultibase}';
config.hmbd.secrets.ecdsa.secretKeyMultibase =
  '${ecdsaExport.secretKeyMultibase}';
config.hmbd.secrets.mldsa.publicKeyMultibase =
  '${mldsaExport.publicKeyMultibase}';
config.hmbd.secrets.mldsa.secretKeyMultibase =
  '${mldsaExport.secretKeyMultibase}';
`);
