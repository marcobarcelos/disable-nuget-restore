#!/usr/bin/env node
const disableNugetRestore = require('./index');

disableNugetRestore({
	silent: false,
	path: process.argv[2]
});
