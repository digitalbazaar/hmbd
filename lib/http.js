/*!
 * Copyright (c) 2024 Digital Bazaar, Inc. All rights reserved.
 */
import * as bedrock from '@bedrock/core';
import {decode as base58Decode, encode as base58Encode} from 'base58-universal';
import {invocationSigner, kmsClient} from './signing.js';
import {asyncHandler} from '@bedrock/express';
import {createSignCryptosuite as createEcdsaJcs2019Cryptosuite} from
  '@digitalbazaar/ecdsa-jcs-2019-cryptosuite';
import {cryptosuite as ecdsaRdfc2019Cryptosuite} from
  '@digitalbazaar/ecdsa-rdfc-2019-cryptosuite';
import {logger} from './logger.js';
import {createValidateMiddleware as validate} from '@bedrock/validation';
import {witnessBody} from '../schemas/witness.js';

import canonicalize from 'canonicalize';
import cors from 'cors';
import crypto from 'node:crypto';

// sha2-256 multihash header: function code 0x12, digest size 32 (0x20)
const SHA2_256_HEADER = new Uint8Array([0x12, 0x20]);
const BASE58BTC_PREFIX = 'z';

const CRYPTOSUITE_FACTORIES = new Map([
  ['ecdsa-jcs-2019', createEcdsaJcs2019Cryptosuite],
  ['ecdsa-rdfc-2019', () => ecdsaRdfc2019Cryptosuite]
]);

export async function addRoutes({app, service} = {}) {
  const {routePrefix} = service;

  const cfg = bedrock.config.hmbd;
  const baseUrl = `${routePrefix}/:localId`;
  const routes = {
    witness: `${baseUrl}${cfg.routes.witness}`
  };

  /* Note: CORS is used on all endpoints. This is safe because authorization
  uses HTTP signatures + capabilities or OAuth2, not cookies; CSRF is not
  possible. */

  // witness a given cryptographic hash
  app.options(routes.witness, cors());
  app.post(
    routes.witness,
    cors(),
    validate({bodySchema: witnessBody}),
    asyncHandler(async (req, res) => {
      try {
        const {
          digestMultibase,
          options: {cryptosuite: cryptosuiteName = 'ecdsa-jcs-2019'} = {}
        } = req.body;

        // validate base58btc multibase encoding (z prefix)
        if(!digestMultibase.startsWith(BASE58BTC_PREFIX)) {
          return res.status(400).json({
            error: 'digestMultibase must use base58btc encoding (z prefix)'
          });
        }

        // decode and validate sha2-256 multihash header
        const mhBytes = base58Decode(digestMultibase.slice(1));
        if(mhBytes.length !== SHA2_256_HEADER.length + 32 ||
          mhBytes[0] !== SHA2_256_HEADER[0] ||
          mhBytes[1] !== SHA2_256_HEADER[1]) {
          return res.status(400).json({
            error: 'digestMultibase must be a base58btc-encoded ' +
              'sha2-256 multihash value'
          });
        }

        // raw 32-byte SHA-256 hash from the multihash value
        const rawHash = mhBytes.slice(SHA2_256_HEADER.length);

        // build proof options using the requested cryptosuite
        const cryptosuite = CRYPTOSUITE_FACTORIES.get(cryptosuiteName)();
        const proof = {
          type: 'DataIntegrityProof',
          cryptosuite: cryptosuite.name,
          proofPurpose: 'assertionMethod',
          verificationMethod: cfg.signing.verificationMethod,
          created: new Date().toISOString().replace(/\.\d+Z$/, 'Z')
        };

        // JCS-canonicalize and SHA-256 hash the proof options (no proofValue)
        const jcsProof = canonicalize(proof);
        const proofHash = new Uint8Array(
          crypto.createHash('sha256').update(jcsProof).digest());

        // verifyData = SHA-256(JCS(proofOptions)) || rawHash
        // rawHash substitutes SHA-256(JCS(document)) for blind witnessing
        const verifyData = new Uint8Array(
          proofHash.length + rawHash.length);
        verifyData.set(proofHash, 0);
        verifyData.set(rawHash, proofHash.length);

        // sign via KMS HTTP
        const sigBytes = await kmsClient.sign({
          keyId: cfg.signing.keyId,
          data: verifyData,
          invocationSigner
        });

        // encode signature as base58btc multibase proofValue
        proof.proofValue = BASE58BTC_PREFIX + base58Encode(sigBytes);

        res.json({proof});
      } catch(error) {
        logger.error(error.message, {error});
        throw error;
      }
    }));
}
