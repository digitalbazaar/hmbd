/*!
 * Copyright (c) 2024-2026 Digital Bazaar, Inc.
 */
import * as helpers from './helpers.js';
import {mockData} from './mock-data.js';

describe('witness API', () => {
  it('witness a valid digestMultibase value (ecdsa-jcs-2019 default)',
    async () => {
      let err;
      let result;

      try {
        result = await helpers.witness({document: mockData.document});
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
          document: mockData.document,
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
        document: mockData.document,
        options: {cryptosuite: 'ecdsa-rdfc-2019'}
      });
    } catch(e) {
      err = e;
    }
    assertNoError(err);
    should.exist(result);
    helpers.assertProof(result.proof, {cryptosuite: 'ecdsa-rdfc-2019'});
  });

  it('witness a valid digestMultibase value (mldsa44-jcs-2024)', async () => {
    let err;
    let result;

    try {
      result = await helpers.witness({
        document: mockData.document,
        options: {cryptosuite: 'mldsa44-jcs-2024'}
      });
    } catch(e) {
      err = e;
    }
    assertNoError(err);
    should.exist(result);
    helpers.assertProof(result.proof, {cryptosuite: 'mldsa44-jcs-2024'});
  });

  it('witness a valid digestMultibase value (mldsa44-rdfc-2024)', async () => {
    let err;
    let result;

    try {
      result = await helpers.witness({
        document: mockData.document,
        options: {cryptosuite: 'mldsa44-rdfc-2024'}
      });
    } catch(e) {
      err = e;
    }
    assertNoError(err);
    should.exist(result);
    helpers.assertProof(result.proof, {cryptosuite: 'mldsa44-rdfc-2024'});
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

  it('all cryptosuites produce unique proofValues for the same document',
    async () => {
      let err;
      let results;

      try {
        // use same document so only the cryptosuite differs
        const document = mockData.document;
        const suites = [
          'ecdsa-jcs-2019',
          'ecdsa-rdfc-2019',
          'mldsa44-jcs-2024',
          'mldsa44-rdfc-2024'
        ];
        const witnesses = await Promise.all(suites.map(
          cryptosuite => helpers.witness({document, options: {cryptosuite}})));
        results = Object.fromEntries(
          suites.map((suite, i) => [suite, witnesses[i]]));
      } catch(e) {
        err = e;
      }
      assertNoError(err);

      // each proof must name its own cryptosuite
      for(const [suite, result] of Object.entries(results)) {
        result.proof.cryptosuite.should.equal(suite);
      }

      // ECDSA suites encode proofValue as base58btc (z prefix)
      results['ecdsa-jcs-2019'].proof.proofValue.should.match(/^z/);
      results['ecdsa-rdfc-2019'].proof.proofValue.should.match(/^z/);

      // ML-DSA suites encode proofValue as base64url (u prefix)
      results['mldsa44-jcs-2024'].proof.proofValue.should.match(/^u/);
      results['mldsa44-rdfc-2024'].proof.proofValue.should.match(/^u/);

      // all four proofValues must be distinct
      const proofValues = Object.values(results).map(r => r.proof.proofValue);
      const unique = new Set(proofValues);
      unique.size.should.equal(proofValues.length);
    });
});
