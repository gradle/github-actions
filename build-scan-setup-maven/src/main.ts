import * as core from '@actions/core'

import * as errorHandler from '../../build-scan-shared/src/error'
import * as input from '../../build-scan-shared/src/setup/input'
import * as io from '../../build-scan-shared/src/io'
import * as layout from './layout'
import * as maven from '../../build-scan-shared/src/buildTool/maven'
import * as wrapper from './wrapper'

/**
 * Main entrypoint for the action
 */
export async function run(): Promise<void> {
    try {
        // Init wrapper if needed
        await wrapper.init()

        // Propagate environment variables to subsequent steps
        input.exportVariables(maven.mavenBuildTool)

        // Copy Maven capture extension
        await copyMavenCaptureExtensionToMavenHome()
    } catch (error) {
        errorHandler.handle(error)
    }
}

async function copyMavenCaptureExtensionToMavenHome(): Promise<void> {
    // Retrieve extension source and target
    const captureExtensionFilePath = layout.mavenBuildScanCaptureExtensionSource()
    const mavenHomeLibExtPath = await layout.mavenBuildScanCaptureExtensionTarget()

    // Copy Maven extension in $MAVEN_HOME/lib/ext
    core.debug(`Copy ${captureExtensionFilePath} to ${mavenHomeLibExtPath}`)
    io.copyFileSync(captureExtensionFilePath, mavenHomeLibExtPath)
}

run()
