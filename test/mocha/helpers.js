/*!
 * Copyright (c) 2024-2026 Digital Bazaar, Inc.
 */
import {agent} from '@bedrock/https-agent';
import {encode as base58Encode} from 'base58-universal';
import canonicalize from 'canonicalize';
import {config} from '@bedrock/core';
import crypto from 'node:crypto';
import {httpClient} from '@digitalbazaar/http-client';
import jsonld from 'jsonld';
import rdfCanonize from 'rdf-canonize';

// sha2-256 multihash header: function code 0x12, digest size 32 (0x20)
const SHA2_256_HEADER = new Uint8Array([0x12, 0x20]);

const RDFC_SUITES = new Set(['ecdsa-rdfc-2019', 'mldsa44-rdfc-2024']);

export async function witnessInvalidDigest({digestMultibase, options} = {}) {
  const baseUrl = config.server.baseUri;
  const url = `${baseUrl}/witnesses/test/witness`;
  const body = {digestMultibase, ...(options && {options})};

  return httpClient.post(url, {agent, json: body, throwHttpErrors: false});
}

export function assertProof(proof, {cryptosuite} = {}) {
  proof.should.be.an('object');
  proof.type.should.equal('DataIntegrityProof');
  if(cryptosuite) {
    proof.cryptosuite.should.equal(cryptosuite);
  }
  proof.proofPurpose.should.equal('assertionMethod');
  proof.verificationMethod.should.be.a('string');
  proof.created.should.be.a('string');
  proof.created.should.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
  proof.proofValue.should.be.a('string');
}

export async function witness({document, options} = {}) {
  const cryptosuiteName = options?.cryptosuite ?? 'ecdsa-jcs-2019';

  // canonicalize the document using the same algorithm the server will use
  // for the chosen cryptosuite, then SHA-256 hash the result
  let c14nDoc;
  if(RDFC_SUITES.has(cryptosuiteName)) {
    // RDFC-1.0: expand to RDF dataset and produce canonical n-quads
    const dataset = await jsonld.toRDF(document, {
      algorithm: 'RDFC-1.0',
      base: null,
      safe: true,
      rdfDirection: 'i18n-datatype',
      produceGeneralizedRdf: false
    });
    c14nDoc = await rdfCanonize.canonize(dataset, {
      algorithm: 'RDFC-1.0',
      format: 'application/n-quads'
    });
  } else {
    // JCS: deterministic JSON serialization per RFC 8785
    c14nDoc = canonicalize(document);
  }

  const hashBytes = new Uint8Array(
    crypto.createHash('sha256').update(c14nDoc).digest());
  const mhBytes = new Uint8Array(SHA2_256_HEADER.length + hashBytes.length);
  mhBytes.set(SHA2_256_HEADER, 0);
  mhBytes.set(hashBytes, SHA2_256_HEADER.length);
  const digestMultibase = 'z' + base58Encode(mhBytes);

  const baseUrl = config.server.baseUri;
  const url = `${baseUrl}/witnesses/test/witness`;
  const body = {digestMultibase, ...(options && {options})};

  const response = await httpClient.post(url, {agent, json: body});
  return response.data;
}
