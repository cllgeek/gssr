#!/usr/bin/env node

const server = require('../index')
const pkg = require('../package.json')
const color = require('colors-cli')
const yargs = require('yargs')

let argv = yargs
	.usage('\n\nThis is simple server!\n\nUsage: $0 [options] powerby geekjc')
	.help('help').alias('help', 'h')
	.version('\n => '+pkg.version+'\n').alias('version', ['V','v'])
	.options({
		port: {
				alias: 'p',
				// required: true,
				// requiresArg: true,
				describe: "Set the port!",
				type: "number"
		},
		cors: {
				alias: 'c',
				// required: true,
				// requiresArg: true,
				describe: "allows cross origin access serving",
				type: "boolean"
		},
		proxy: {
				describe: "Local data mock",
				type: "string"
		}
	})
	.requiresArg('port')
	.locale('en')
	.epilog('  copyright 2018 \n')
	.argv;

if(argv.cors || argv.port){
	if(argv.port&&isNaN(argv.port) || argv.port === true) return console.log(color.red('\n "Port parameter is not of type number.\n"'))
	if(argv.port < 1029) return console.log(color.red('\n "port" number must be greater than the 1299.\n'))

	server(argv)
}else{
	server(argv)
}
