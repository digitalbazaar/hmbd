/*!
 * Copyright (c) 2023-2026 Digital Bazaar, Inc.
 */
import {config} from '@bedrock/core';
import {fileURLToPath} from 'node:url';
import os from 'node:os';
import path from 'node:path';
import {projectName} from './project.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// common paths
config.paths.cache = path.join(__dirname, '..', '.cache');
config.paths.log = path.join(os.tmpdir(), 'localhost-' + projectName);
