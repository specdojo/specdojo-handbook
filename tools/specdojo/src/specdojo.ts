#!/usr/bin/env node
import { Command } from 'commander'
import { registerConfigCommands, registerProjectCommands } from './specdojo-config.js'
import { registerExecCommands } from './exec.js'

function main(): void {
  const program = new Command()

  program.name('specdojo').description('SpecDojo helper CLI').version('0.4.0')

  registerConfigCommands(program)
  registerProjectCommands(program)
  registerExecCommands(program)

  program.parse(process.argv)
}

main()
