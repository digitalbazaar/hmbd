/*!
 * Copyright (c) 2024-2026 Digital Bazaar, Inc.
 */
import * as base64url from 'base64url-universal';
import * as bedrock from '@bedrock/core';
import {decode as base58Decode, encode as base58Encode} from 'base58-universal';
import {
  DATA_INTEGRITY_CONTEXT_V2_URL,
  contexts as diContexts
} from '@digitalbazaar/data-integrity-context';
import {invocationSigner, kmsClient} from './signing.js';
import {asyncHandler} from '@bedrock/express';
import {createSignCryptosuite as createEcdsaJcs2019Cryptosuite} from
  '@digitalbazaar/ecdsa-jcs-2019-cryptosuite';
import {createSignCryptosuite as createMldsa44Jcs2024Cryptosuite} from
  '@digitalbazaar/mldsa44-jcs-2024-cryptosuite';
import {cryptosuite as ecdsaRdfc2019Cryptosuite} from
  '@digitalbazaar/ecdsa-rdfc-2019-cryptosuite';
import {logger} from './logger.js';
import {createValidateMiddleware as validate} from '@bedrock/validation';
import {witnessBody} from '../schemas/witness.js';

import canonicalize from 'canonicalize';
import cors from 'cors';
import crypto from 'node:crypto';
import jsonld from 'jsonld';
import rdfCanonize from 'rdf-canonize';

// sha2-256 multihash header: function code 0x12, digest size 32 (0x20)
const SHA2_256_HEADER = new Uint8Array([0x12, 0x20]);
const BASE58BTC_PREFIX = 'z';

const CRYPTOSUITE_FACTORIES = new Map([
  ['ecdsa-jcs-2019', createEcdsaJcs2019Cryptosuite],
  ['ecdsa-rdfc-2019', () => ecdsaRdfc2019Cryptosuite],
  ['mldsa44-jcs-2024', createMldsa44Jcs2024Cryptosuite]
]);

// document loader with the Data Integrity v2 context for RDFC canonicalization
function _buildDocumentLoader() {
  return async url => {
    const doc = diContexts.get(url);
    if(doc) {
      return {contextUrl: null, documentUrl: url, document: doc, tag: 'static'};
    }
    throw new Error(`Document not found: ${url}`);
  };
}

// JCS-canonicalize a proof options object and return the JSON string
function _canonicalizeJcs(proof) {
  return canonicalize(proof);
}

// RDFC-1.0 canonicalize a proof options object and return the n-quads string
async function _canonicalizeRdfc(proof) {
  const documentLoader = _buildDocumentLoader();
  const proofOptions = {
    '@context': DATA_INTEGRITY_CONTEXT_V2_URL,
    ...proof
  };
  // jsonld.toRDF must not receive `format` — it returns a dataset object when
  // format is absent; rdfCanonize.canonize then receives the dataset object
  // along with `format` to produce the n-quads string output
  const toRdfOpts = {
    documentLoader,
    algorithm: 'RDFC-1.0',
    base: null,
    safe: true,
    rdfDirection: 'i18n-datatype',
    produceGeneralizedRdf: false
  };
  const canonizeOpts = {
    algorithm: 'RDFC-1.0',
    format: 'application/n-quads'
  };
  const dataset = await jsonld.toRDF(proofOptions, toRdfOpts);
  return rdfCanonize.canonize(dataset, canonizeOpts);
}

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
        const isMLDSA = cryptosuiteName === 'mldsa44-jcs-2024';
        const signingKeyId = isMLDSA ?
          cfg.signing.mldsaKeyId : cfg.signing.keyId;
        const verificationMethod = isMLDSA ?
          cfg.signing.mldsaVerificationMethod :
          cfg.signing.verificationMethod;
        const cryptosuite = CRYPTOSUITE_FACTORIES.get(cryptosuiteName)();
        const proof = {
          type: 'DataIntegrityProof',
          cryptosuite: cryptosuite.name,
          proofPurpose: 'assertionMethod',
          verificationMethod,
          created: new Date().toISOString().replace(/\.\d+Z$/, 'Z')
        };

        // canonicalize and SHA-256 hash the proof options (no proofValue);
        // ecdsa-jcs-2019 uses JCS, ecdsa-rdfc-2019 uses RDFC-1.0
        let c14nProof;
        if(cryptosuiteName === 'ecdsa-rdfc-2019') {
          c14nProof = await _canonicalizeRdfc(proof);
        } else {
          c14nProof = _canonicalizeJcs(proof);
        }
        const proofHash = new Uint8Array(
          crypto.createHash('sha256').update(c14nProof).digest());

        // verifyData = SHA-256(c14n(proofOptions)) || rawHash
        // rawHash substitutes SHA-256(c14n(document)) for blind witnessing
        const verifyData = new Uint8Array(
          proofHash.length + rawHash.length);
        verifyData.set(proofHash, 0);
        verifyData.set(rawHash, proofHash.length);

        // sign via KMS HTTP
        const sigBytes = await kmsClient.sign({
          keyId: signingKeyId,
          data: verifyData,
          invocationSigner
        });

        // ML-DSA uses base64url multibase (u prefix);
        // ECDSA uses base58btc (z prefix)
        proof.proofValue = isMLDSA ?
          'u' + base64url.encode(sigBytes) :
          BASE58BTC_PREFIX + base58Encode(sigBytes);

        res.json({proof});
      } catch(error) {
        logger.error(error.message, {error});
        throw error;
      }
    }));
}
