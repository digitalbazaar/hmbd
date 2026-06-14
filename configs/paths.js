/*!
 * Copyright (c) 2023-2026 Digital Bazaar, Inc.
 */
import {config} from '@bedrock/core';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

config.paths.config = path.join(__dirname);
