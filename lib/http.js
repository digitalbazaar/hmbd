/*!
 * Copyright (c) 2024 Digital Bazaar, Inc. All rights reserved.
 */
import * as bedrock from '@bedrock/core';
import * as helpers from './helpers.js';
import {
  witnessBody
} from '../schemas/witness.js';
import {metering, middleware} from '@bedrock/service-core';
import {asyncHandler} from '@bedrock/express';
import canonicalize from 'canonicalize';
import cors from 'cors';
import crypto from 'node:crypto';
import {encode} from 'base58-universal';
import {logger} from './logger.js';
import {createValidateMiddleware as validate} from '@bedrock/validation';

export async function addRoutes({app, service} = {}) {
  const {routePrefix} = service;

  const cfg = bedrock.config['hmbd'];
  const baseUrl = `${routePrefix}/:localId`;
  const routes = {
    witness: `${baseUrl}${cfg.routes.witness}`
  };

  const getConfigMiddleware = middleware.createGetConfigMiddleware({service});

  /* Note: CORS is used on all endpoints. This is safe because authorization
  uses HTTP signatures + capabilities or OAuth2, not cookies; CSRF is not
  possible. */

  // witness a given cryptographic hash
  app.options(routes.witness, cors());
  app.post(
    routes.witness,
    cors(),
    validate({bodySchema: witnessBody}),
    getConfigMiddleware,
    middleware.authorizeServiceObjectRequest(),
    asyncHandler(async (req, res) => {
      try {
        const {config} = req.serviceObject;
        const {document} = req.body;

         res.json({implementMe: 'TBD'});
      } catch(error) {
        logger.error(error.message, {error});
        throw error;
      }

      // meter operation usage
      metering.reportOperationUsage({req});
    }));
}
