/*!
 * Copyright (c) 2024-2026 Digital Bazaar, Inc.
 */
import * as helpers from './helpers.js';

describe('witness API', () => {
  it('witness a valid digestMultibase value (ecdsa-jcs-2019 default)',
    async () => {
      let err;
      let result;

      try {
        result = await helpers.witness({document: {test: '123'}});
      } catch(e) {
        err = e;
      }
      assertNoError(err);
      should.exist(result);
      helpers.assertProof(result.proof, {cryptosuite: 'ecdsa-jcs-2019'});
    });

  it('witness a valid digestMultibase value (ecdsa-jcs-2019 explicit)',
    async () => {
      let err;
      let result;

      try {
        result = await helpers.witness({
          document: {test: '123'},
          options: {cryptosuite: 'ecdsa-jcs-2019'}
        });
      } catch(e) {
        err = e;
      }
      assertNoError(err);
      should.exist(result);
      helpers.assertProof(result.proof, {cryptosuite: 'ecdsa-jcs-2019'});
    });

  it('witness a valid digestMultibase value (ecdsa-rdfc-2019)', async () => {
    let err;
    let result;

    try {
      result = await helpers.witness({
        document: {test: '123'},
        options: {cryptosuite: 'ecdsa-rdfc-2019'}
      });
    } catch(e) {
      err = e;
    }
    assertNoError(err);
    should.exist(result);
    helpers.assertProof(result.proof, {cryptosuite: 'ecdsa-rdfc-2019'});
  });

  it('ecdsa-jcs-2019 and ecdsa-rdfc-2019 produce different proofValues',
    async () => {
      let err;
      let jcsResult;
      let rdfcResult;

      try {
        // use same document so only the canonicalization differs
        const document = {test: 'canonicalization-comparison'};
        [jcsResult, rdfcResult] = await Promise.all([
          helpers.witness({document, options: {cryptosuite: 'ecdsa-jcs-2019'}}),
          helpers.witness({document, options: {cryptosuite: 'ecdsa-rdfc-2019'}})
        ]);
      } catch(e) {
        err = e;
      }
      assertNoError(err);
      jcsResult.proof.cryptosuite.should.equal('ecdsa-jcs-2019');
      rdfcResult.proof.cryptosuite.should.equal('ecdsa-rdfc-2019');
      jcsResult.proof.proofValue.should.not.equal(rdfcResult.proof.proofValue);
    });

  it('witness a valid digestMultibase value (mldsa44-jcs-2024)', async () => {
    let err;
    let result;

    try {
      result = await helpers.witness({
        document: {test: '123'},
        options: {cryptosuite: 'mldsa44-jcs-2024'}
      });
    } catch(e) {
      err = e;
    }
    assertNoError(err);
    should.exist(result);
    helpers.assertProof(result.proof, {cryptosuite: 'mldsa44-jcs-2024'});
  });

  it('mldsa44-jcs-2024 proofValue uses base64url multibase (u prefix)',
    async () => {
      let err;
      let result;

      try {
        result = await helpers.witness({
          document: {test: 'mldsa-encoding'},
          options: {cryptosuite: 'mldsa44-jcs-2024'}
        });
      } catch(e) {
        err = e;
      }
      assertNoError(err);
      result.proof.proofValue.should.match(/^u/);
    });

  it('fail to witness an invalid digestMultibase value', async () => {
    // wrong multibase prefix (not base58btc 'z')
    let result = await helpers.witnessInvalidDigest(
      {digestMultibase: 'uabc123'});
    result.status.should.equal(400);

    // valid base58btc prefix but wrong multihash header (not sha2-256)
    // sha2-512 header: 0x13, 0x40
    const badHeader = new Uint8Array([0x13, 0x40, ...new Uint8Array(64)]);
    const {encode: base58Encode} = await import('base58-universal');
    result = await helpers.witnessInvalidDigest(
      {digestMultibase: 'z' + base58Encode(badHeader)});
    result.status.should.equal(400);

    // valid prefix and header but wrong digest length (not 32 bytes)
    const badLen = new Uint8Array([0x12, 0x20, ...new Uint8Array(16)]);
    result = await helpers.witnessInvalidDigest(
      {digestMultibase: 'z' + base58Encode(badLen)});
    result.status.should.equal(400);
  });
});
