import * as core from '@actions/core'

export function handle(error: unknown): void {
    core.warning(`Unhandled error - job will continue: ${error}`)
    if (error instanceof Error && error.stack) {
        core.info(error.stack)
    }
}
