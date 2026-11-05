/**
 * Barrel file for the GitHub Action.
 *
 * The entrypoint for the action.
 * This file simply imports and runs the main logic of the action.
 *
 * @packageDocumentation
 */

import { run } from './main.js'

// Re-export the run function for external usage
export { run }

/* istanbul ignore next */
run()
