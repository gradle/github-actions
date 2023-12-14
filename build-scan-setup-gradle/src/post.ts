import * as errorHandler from '../../build-scan-shared/src/error'
import * as gradle from '../../build-scan-shared/src/buildTool/gradle'
import * as setup from '../../build-scan-shared/src/setup/post'

// Catch and log any unhandled exceptions.
process.on('uncaughtException', e => errorHandler.handle(e))

/**
 * The post-execution entry point for the action, called after completing all steps for the Job
 */
export async function run(): Promise<void> {
    try {
        await setup.uploadBuildScanDataFiles(gradle.gradleBuildTool)
    } catch (error) {
        errorHandler.handle(error)
    }
}

run()
