const fs = require('fs');
const path = require('path');
const glob = require('glob');
const pify = require('pify');
const del = require('del');
const chalk = require('chalk');

let config = {};
const defaults = {
	silent: true
};

const encoding = 'utf8';
const regexes = [
	/\n[^<]*<RestorePackages>[\s\S]+?<\/RestorePackages>/g,
	/\n[^<]*<Import\s+Project="\$\(SolutionDir\)\\\.nuget\\nuget\.targets"\s*\/>/g,
	/\n[^<]*<Target\s+Name="EnsureNuGetPackageBuildImports"[^>]*>[\s\S]+?<\/Target>/g
];
let paths = {
	nugetDir: '.nuget',
	projectFiles: '**/*.csproj'
};

function readFile(path) {
	return pify(fs.readFile)(path, encoding);
}

function writeFile(path, data) {
	return pify(fs.writeFile)(path, data);
}

function getFiles(path) {
	return pify(glob)(path);
}

function log(msg) {
	if (!config.silent) {
		console.log(msg);
	}
}

function assignDefaultConfig(cfg) {
	Object.assign(config, defaults, cfg);
}

function processSingleProjectFile(filePath) {
	return readFile(filePath)
		.then(data => {
			log(chalk.blue(`Processing ${filePath}`));

			let content = regexes.reduce((str, regex) => str.replace(regex, ''), data);
			writeFile(filePath, content);
			return filePath;
		});
}

function deleteNugetDirectory() {
	return del(paths.nugetDir)
		.then(files => log(chalk.cyan('Deleted .nuget directory')));
}

function processProjectFiles() {
	return getFiles(paths.projectFiles)
		.then(paths => Promise.all(paths.map(processSingleProjectFile)))
		.then(paths => log(chalk.cyan(`Removed Nuget Package Restore references in ${paths.length} project file${paths.length !== 1 ? 's' : ''}`)))
}

function isSolutionDir() {
	let promises = Object.keys(paths)
		.map(key => getFiles(paths[key]));

	return Promise.all(promises)
		.then(results => [].concat.apply([], results))
		.then(paths => paths.length > 0);
}

function adjustPaths() {
	if (!config.path) {
		return;
	}

	Object.keys(paths).forEach(key => {
		paths[key] = path.resolve(config.path, paths[key]);
	});
}

function execute() {
	log('Executing Disable Nuget Package Restore script...\n');

	adjustPaths();

	return isSolutionDir()
		.then(result => !result && Promise.reject('Not a solution directory (could not find any .nuget or .csproj files)'))
		.then(() => Promise.all([deleteNugetDirectory(), processProjectFiles()]))
		.then(() => log(chalk.yellow('[Done]')))
		.catch(err => console.error(chalk.red('Error:', err)));
}

module.exports = (config) => {
	assignDefaultConfig(config);
	return execute();
};
