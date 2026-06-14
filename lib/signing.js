/*!
 * Copyright (c) 2024-2026 Digital Bazaar, Inc.
 */
import * as bedrock from '@bedrock/core';
import * as EcdsaMultikey from '@digitalbazaar/ecdsa-multikey';
import * as MldsaMultikey from '@digitalbazaar/mldsa-multikey';

export let ecdsaSigner;
export let mldsaSigner;

// load signing keys from config at startup
bedrock.events.on('bedrock.started', async () => {
  const cfg = bedrock.config.hmbd;
  const {ecdsa, mldsa} = cfg.secrets;

  if(!ecdsa?.publicKeyMultibase || !ecdsa?.secretKeyMultibase) {
    console.error(
      'Error: ECDSA signing key not configured. ' +
      'Set hmbd.secrets.ecdsa.publicKeyMultibase and ' +
      'hmbd.secrets.ecdsa.secretKeyMultibase.\n' +
      'Hint: run "npm run generate-signing-keys" to generate key values.');
    process.exit(1);
  }
  if(!mldsa?.publicKeyMultibase || !mldsa?.secretKeyMultibase) {
    console.error(
      'Error: ML-DSA-44 signing key not configured. ' +
      'Set hmbd.secrets.mldsa.publicKeyMultibase and ' +
      'hmbd.secrets.mldsa.secretKeyMultibase.\n' +
      'Hint: run "npm run generate-signing-keys" to generate key values.');
    process.exit(1);
  }

  const ecdsaKeyPair = await EcdsaMultikey.from({
    type: 'Multikey',
    publicKeyMultibase: ecdsa.publicKeyMultibase,
    secretKeyMultibase: ecdsa.secretKeyMultibase
  });
  ecdsaSigner = ecdsaKeyPair.signer();
  ecdsa.id = `did:key:${ecdsaKeyPair.publicKeyMultibase}#vm`;

  const mldsaKeyPair = await MldsaMultikey.from({
    key: {
      type: 'Multikey',
      publicKeyMultibase: mldsa.publicKeyMultibase,
      secretKeyMultibase: mldsa.secretKeyMultibase
    }
  });
  mldsaSigner = mldsaKeyPair.signer();
  mldsa.id = `did:key:${mldsaKeyPair.publicKeyMultibase}#vm`;
});
