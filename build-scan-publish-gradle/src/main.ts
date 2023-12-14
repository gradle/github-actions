import * as core from '@actions/core'

import * as errorHandler from '../../build-scan-shared/src/error'
import * as gradle from '../../build-scan-shared/src/buildTool/gradle'
import * as publisher from '../../build-scan-shared/src/publish/main'

/**
 * Main entrypoint for the action
 */
export async function run(): Promise<void> {
    try {
        core.info(`Starting Publish Gradle Build Scans action`)

        await publisher.publish(gradle.gradleBuildTool)
    } catch (error) {
        errorHandler.handle(error)
    }
}

run()
