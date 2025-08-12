#!/usr/bin/env node
import React from 'react';
import {render} from 'ink';
import {join} from 'path';
import meow from 'meow';
import App from './app.js';
import {existsSync} from 'fs';

const cli = meow(
	`
	Usage
	  $ omnes-git

	Options
		--name  Your name

	Examples
	  $ omnes-git --name=Jane
	  Hello, Jane
`,
	{
		importMeta: import.meta,
		flags: {
			name: {
				type: 'string',
			},
			dir: {
				type: 'string',
				shortFlag: 'd',
				default: process.cwd(),
			},
		},
	},
);

const gitDir = join(cli.flags.dir, '.git');
if (!existsSync(gitDir)) { 
	console.error('❌ Not a Git Repository');
	process.exit(1);
}

render(<App repoPath={cli.flags.dir} />);
