import * as core from '@actions/core'

import * as errorHandler from '../../build-scan-shared/src/error'
import * as gradle from '../../build-scan-shared/src/buildTool/gradle'
import * as input from '../../build-scan-shared/src/setup/input'
import * as io from '../../build-scan-shared/src/io'
import * as layout from './layout'

/**
 * Main entrypoint for the action
 */
export async function run(): Promise<void> {
    try {
        // Propagate environment variables to subsequent steps
        input.exportVariables(gradle.gradleBuildTool)

        // copy Maven capture extension
        await copyGradleCaptureInitScriptToGradleHome()
    } catch (error) {
        errorHandler.handle(error)
    }
}

async function copyGradleCaptureInitScriptToGradleHome(): Promise<void> {
    // Retrieve init script source and target
    const gradleBuildScanCaptureInitScriptSource = layout.gradleBuildScanCaptureInitScriptSource()
    const gradleBuildScanCaptureInitScriptTarget = await layout.gradleBuildScanCaptureInitScriptTarget()

    // copy init script in $GRADLE_HOME/init.d/
    core.debug(`Copy ${gradleBuildScanCaptureInitScriptSource} to ${gradleBuildScanCaptureInitScriptTarget}`)
    io.copyFileSync(gradleBuildScanCaptureInitScriptSource, gradleBuildScanCaptureInitScriptTarget)
}

run()
