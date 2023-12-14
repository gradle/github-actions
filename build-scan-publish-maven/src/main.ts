import * as core from '@actions/core'

import * as errorHandler from '../../build-scan-shared/src/error'
import * as maven from '../../build-scan-shared/src/buildTool/maven'
import * as publisher from '../../build-scan-shared/src/publish/main'

/**
 * Main entrypoint for the action
 */
export async function run(): Promise<void> {
    try {
        core.info(`Starting Publish Maven Build Scans action`)

        await publisher.publish(maven.mavenBuildTool)
    } catch (error) {
        errorHandler.handle(error)
    }
}

run()
