# Hold My Beverage, Dear

A blind witnessing service that digitally signs cryptographic hashes to
establish proof that your data existed at a specific point in time.

## Table of Contents

- [Background](#background)
- [Security](#security)
- [Install](#install)
- [Usage](#usage)
- [Contribute](#contribute)
- [Commercial Support](#commercial-support)
- [License](#license)

## Background

Are you about to do something epic, possibly ill-advised, and need a witness?
Well, `hmbd` is here for you.

Just like your friend that's tried to talk you out of it, but you're going to go
ahead and do it anyway — `hmbd` will stand aside, close its eyes, and be there
for the time you did that thing that you really wanted to do. `hmbd` doesn't
judge, it just witnesses your actions in their full glory.

Proving that you jumped a motorbike over a chasm last Monday? Establishing a
date for your last will and testament? Or just rotating a public cryptographic
key in your decentralized identifier document? Like a hopelessly loyal friend,
`hmbd` has your back, no matter what you do.

Be glorious.

### What is `hmbd`, really?

`hmbd` is a blind witnessing service. You send it a cryptographic hash of some
data, and it digitally signs that it saw that cryptographic hash at a particular
point in time.

Blind witnesses are a privacy-respecting way to prove that something happened at
a certain point in time without revealing the details of the event. Blind
witness proofs, which are digital signatures over a cryptographic hash, are used
by systems that need to time-order a series of events. These proofs demonstrate
to a verifier that the events happened in a particular order without the
verifier having to trust you to prove the order. There can be many blind
witnesses per event.

For example, to prove the edit history of a document, you could blind-witness
its cryptographic hash after each change. A verifier reviewing a document change
event just needs to trust at least one witness per change to verify the
document's contents at that point in time. More witnesses means higher
confidence. This is also useful for things like tracking the ownership history
of a property like a car or a home. It can also be used to track the change
history of something like a decentralized identifier document.

### Alternate Names

You are encouraged to call this service other things, like:

* The Hold My Beer Daemon
* Her Majesty's Best Diva
* Hold My Brewski, Dude
* Hold My Bellini, Donna (said in a thick Italian accent)
* Harbor Me Boilermaker, Dawg (Brooklyn accent, naturally)

... and so on; as long as it's funny.

## Security

As with most security- and cryptography-related tools, the overall security of
your system will largely depend on your design decisions.

Witness proofs are only as trustworthy as the witness. Use multiple independent
witnesses to increase confidence. The service signs a hash, not the data itself,
so it cannot verify the content of what it is witnessing.

## Install

- Node.js 24+ is required.

To install locally (for development):

```
git clone https://github.com/digitalbazaar/hmbd.git
cd hmbd
npm install
```

### Generating signing keys

Before starting the service for the first time, generate a signing key pair:

```
npm run generate-signing-keys
```

This prints ECDSA P-256 and ML-DSA-44 key values to stdout. Copy the output
into `configs/secrets.js` (for development) or supply the values via a secrets
manager in your deployment configuration.

### Running in development mode

The service uses [Bedrock](https://github.com/digitalbazaar/bedrock) and starts
an HTTPS server on `localhost:22443` by default. To start it:

```
npm start
```

The development server configuration lives in `configs/` and `dev.js`. The
relevant defaults are:

| Setting | Value |
|---|---|
| HTTPS port | `22443` |
| Domain | `localhost` |
| Witness endpoint | `https://localhost:22443/witness` |


### Configuration

Signing keys are loaded from `configs/secrets.js` at startup. The file sets
four values on the `config.hmbd` object:

| Key | Description |
|---|---|
| `config.hmbd.ecdsa.publicKeyMultibase` | ECDSA P-256 public key (base58btc multibase) |
| `config.hmbd.ecdsa.secretKeyMultibase` | ECDSA P-256 secret key (base58btc multibase) |
| `config.hmbd.mldsa.publicKeyMultibase` | ML-DSA-44 public key (base64url multibase) |
| `config.hmbd.mldsa.secretKeyMultibase` | ML-DSA-44 secret key (base64url multibase) |

Keys are loaded in-process at startup — no external key management service is
required. In production, supply the key values via a secrets manager rather
than committing them to `configs/secrets.js`.

## Usage

### Computing a `digestMultibase` on the client side

The witness endpoint accepts a `digestMultibase`: a base58btc-encoded
sha2-256 multihash of the data you want to witness. The hash must be computed
using the same canonicalization algorithm as the requested cryptosuite — JCS
for `*-jcs-*` suites and RDFC-1.0 for `*-rdfc-*` suites.

#### JCS cryptosuites (`ecdsa-jcs-2019`, `mldsa44-jcs-2024`)

```js
import crypto from 'node:crypto';
import {encode as base58Encode} from 'base58-universal';
import canonicalize from 'canonicalize';

// sha2-256 multihash header: function code 0x12, digest size 32 (0x20)
const SHA2_256_HEADER = new Uint8Array([0x12, 0x20]);

async function computeDigestMultibaseJcs(document) {
  // JCS-canonicalize, then SHA-256 hash
  const bytes = new TextEncoder().encode(canonicalize(document));
  const hashBytes = new Uint8Array(
    crypto.createHash('sha256').update(bytes).digest());

  // prepend the sha2-256 multihash header
  const mhBytes = new Uint8Array(SHA2_256_HEADER.length + hashBytes.length);
  mhBytes.set(SHA2_256_HEADER, 0);
  mhBytes.set(hashBytes, SHA2_256_HEADER.length);

  // encode as base58btc multibase (leading 'z')
  return 'z' + base58Encode(mhBytes);
}
```

#### RDFC cryptosuites (`ecdsa-rdfc-2019`, `mldsa44-rdfc-2024`)

```js
import crypto from 'node:crypto';
import {encode as base58Encode} from 'base58-universal';
import jsonld from 'jsonld';
import rdfCanonize from 'rdf-canonize';

// sha2-256 multihash header: function code 0x12, digest size 32 (0x20)
const SHA2_256_HEADER = new Uint8Array([0x12, 0x20]);

async function computeDigestMultibaseRdfc(document) {
  // RDFC-1.0-canonicalize to n-quads, then SHA-256 hash
  const dataset = await jsonld.toRDF(document, {
    algorithm: 'RDFC-1.0', base: null, safe: true
  });
  const nquads = await rdfCanonize.canonize(dataset, {
    algorithm: 'RDFC-1.0', format: 'application/n-quads'
  });
  const bytes = new TextEncoder().encode(nquads);
  const hashBytes = new Uint8Array(
    crypto.createHash('sha256').update(bytes).digest());

  // prepend the sha2-256 multihash header
  const mhBytes = new Uint8Array(SHA2_256_HEADER.length + hashBytes.length);
  mhBytes.set(SHA2_256_HEADER, 0);
  mhBytes.set(hashBytes, SHA2_256_HEADER.length);

  // encode as base58btc multibase (leading 'z')
  return 'z' + base58Encode(mhBytes);
}
```

### Calling the witness service with `curl`

The service exposes a single `POST` endpoint.

#### Using the default cryptosuite (`ecdsa-jcs-2019`)

```bash
curl --json '{
  "digestMultibase": "zQmYGx7Wzqe5prvEsTSzYBQN8xViYUM9qsWJSF5EENLcNmM"
}' https://localhost:22443/witness --insecure
```

#### Requesting `ecdsa-rdfc-2019`

```bash
curl --json '{
  "digestMultibase": "zQmYGx7Wzqe5prvEsTSzYBQN8xViYUM9qsWJSF5EENLcNmM",
  "options": {"cryptosuite": "ecdsa-rdfc-2019"}
}' https://localhost:22443/witness --insecure
```

#### Requesting `mldsa44-jcs-2024` (quantum-resistant)

```bash
curl --json '{
  "digestMultibase": "zQmYGx7Wzqe5prvEsTSzYBQN8xViYUM9qsWJSF5EENLcNmM",
  "options": {"cryptosuite": "mldsa44-jcs-2024"}
}' https://localhost:22443/witness --insecure
```

#### Requesting `mldsa44-rdfc-2024` (quantum-resistant)

```bash
curl --json '{
  "digestMultibase": "zQmYGx7Wzqe5prvEsTSzYBQN8xViYUM9qsWJSF5EENLcNmM",
  "options": {"cryptosuite": "mldsa44-rdfc-2024"}
}' https://localhost:22443/witness --insecure
```

All requests return a `DataIntegrityProof` in the response body.

```json
{
  "proof": {
    "type": "DataIntegrityProof",
    "cryptosuite": "ecdsa-jcs-2019",
    "proofPurpose": "assertionMethod",
    "verificationMethod": "did:key:zDnae...#vm",
    "created": "2026-04-26T16:00:00Z",
    "proofValue": "zDnae..."
  }
}
```

### Supported cryptosuites

| Cryptosuite | Algorithm | Canonicalization |
|---|---|---|
| `ecdsa-jcs-2019` (default) | ECDSA P-256 | JCS (RFC 8785) |
| `ecdsa-rdfc-2019` | ECDSA P-256 | RDFC-1.0 |
| `mldsa44-jcs-2024` | ML-DSA-44 | JCS (RFC 8785) |
| `mldsa44-rdfc-2024` | ML-DSA-44 | RDFC-1.0 |

The ML-DSA-44 cryptosuites (`mldsa44-jcs-2024` and `mldsa44-rdfc-2024`) use a
quantum-resistant digital signature algorithm standardized in FIPS 204.

### Running the tests

```
npm test
```

## Contribute

See [the contribute file](https://github.com/digitalbazaar/bedrock/blob/master/CONTRIBUTING.md)!

PRs accepted.

If editing the README, please conform to the
[standard-readme](https://github.com/RichardLitt/standard-readme) specification.

## Commercial Support

Commercial support for this service is available upon request from
Digital Bazaar: support@digitalbazaar.com
