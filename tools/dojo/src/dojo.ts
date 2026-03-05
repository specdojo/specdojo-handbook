#!/usr/bin/env node
import { Command } from 'commander'
import { registerExecCommands } from './exec.js'

const program = new Command()

program.name('dojo').description('SpecDojo helper CLI').version('0.1.0')

registerExecCommands(program)

program.parse(process.argv)
