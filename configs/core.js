/*!
 * Copyright (c) 2023-2026 Digital Bazaar, Inc.
 */
import {config} from '@bedrock/core';
import {projectName} from './project.js';

// core configuration
config.core.workers = 1;
config.core.primary.title = projectName;
config.core.worker.title = projectName + '-worker';
config.core.worker.restart = false;
