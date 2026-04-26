/*!
 * Copyright (c) 2024-2026 Digital Bazaar, Inc.
 */
import * as bedrock from '@bedrock/core';
import {fileURLToPath} from 'url';
import path from 'path';
import '@bedrock/https-agent';
import '@bedrock/kms';
import '@bedrock/kms-http';
import '@bedrock/ssm-mongodb';
import '@bedrock/express';
import '@bedrock/mongodb';
import '@bedrock/server';

const {config} = bedrock;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
config.paths.config = path.join(__dirname, 'configs');

import './lib/index.js';

import '@bedrock/test';

bedrock.start();
