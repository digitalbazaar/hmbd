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

* Hold My Beer, Daemon
* Hold My Brewski, Dude
* Hold My Bellini, Diva
* Harbor Me Boilermaker, Dawg

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

### Running in development mode

The service uses [Bedrock](https://github.com/digitalbazaar/bedrock) and starts
an HTTPS server on `localhost:22443` by default. To start it:

```
npm start
```

On first start the service will automatically create a WebKMS keystore and
generate a P-256 signing key.

The development server configuration lives in `configs/` and `dev.js`. The
relevant defaults are:

| Setting | Value |
|---|---|
| HTTPS port | `22443` |
| Domain | `localhost` |
| KMS base URL | `https://localhost:22443/kms` |
| Witness endpoint | `https://localhost:22443/witnesses/:localId/witness` |

`:localId` is any identifier you want to use for now. In the future, it might
be a permissioned endpoint to rate limit calls to the service.

## Usage

### Computing a `digestMultibase` on the client side

The witness endpoint accepts a `digestMultibase`: a base58btc-encoded
sha2-256 multihash of the data you want to witness. To compute one in
JavaScript:

```js
import crypto from 'node:crypto';
import {encode as base58Encode} from 'base58-universal';

// sha2-256 multihash header: function code 0x12, digest size 32 (0x20)
const SHA2_256_HEADER = new Uint8Array([0x12, 0x20]);

async function computeDigestMultibase(data) {
  // serialize and hash the data
  const bytes = new TextEncoder().encode(JSON.stringify(data));
  const hashBytes = new Uint8Array(
    crypto.createHash('sha256').update(bytes).digest());

  // prepend the sha2-256 multihash header
  const mhBytes = new Uint8Array(SHA2_256_HEADER.length + hashBytes.length);
  mhBytes.set(SHA2_256_HEADER, 0);
  mhBytes.set(hashBytes, SHA2_256_HEADER.length);

  // encode as base58btc multibase (leading 'z')
  return 'z' + base58Encode(mhBytes);
}

const digestMultibase = await computeDigestMultibase({hello: 'world'});
// -> "zQmYtUc4iTCbbfVsNwkJAbdjLR5LHGNiFWdQQWpALFdwkY"
```

### Calling the witness service with `curl`

The service exposes a single `POST` endpoint. The `localId` path segment
identifies the witness instance (use `test` in development).

#### Using the default cryptosuite (`ecdsa-jcs-2019`)

```bash
curl --json '{
  "digestMultibase": "zQmYtUc4iTCbbfVsNwkJAbdjLR5LHGNiFWdQQWpALFdwkY"
}' https://localhost:22443/witnesses/test/witness --insecure
```

#### Explicitly requesting `ecdsa-jcs-2019`

```bash
curl --json '{
  "digestMultibase": "zQmYtUc4iTCbbfVsNwkJAbdjLR5LHGNiFWdQQWpALFdwkY",
  "options": {"cryptosuite": "ecdsa-jcs-2019"}
}' https://localhost:22443/witnesses/test/witness --insecure
```

#### Requesting `ecdsa-rdfc-2019`

```bash
curl --json '{
  "digestMultibase": "zQmYtUc4iTCbbfVsNwkJAbdjLR5LHGNiFWdQQWpALFdwkY",
  "options": {"cryptosuite": "ecdsa-rdfc-2019"}
}' https://localhost:22443/witnesses/test/witness --insecure
```

All three requests return a `DataIntegrityProof` in the response body:

```json
{
  "proof": {
    "type": "DataIntegrityProof",
    "cryptosuite": "ecdsa-jcs-2019",
    "proofPurpose": "assertionMethod",
    "verificationMethod": "did:key:zDnae...#public-key",
    "created": "2026-04-26T16:00:00Z",
    "proofValue": "zDnae..."
  }
}
```

The `cryptosuite` field reflects whichever suite was requested.
`ecdsa-jcs-2019` uses JCS (JSON Canonicalization Scheme) to hash the proof
options, while `ecdsa-rdfc-2019` uses RDFC-1.0 (RDF Dataset Canonicalization).

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

## License

[GNU Affero General Public License (AGPL)](LICENSE) © 2024-2026 Digital Bazaar
