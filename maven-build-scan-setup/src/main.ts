import * as core from '@actions/core'
import * as github from '@actions/github'

import * as input from './utils/input'
import * as layout from './utils/layout'
import * as io from './utils/io'
import * as errorHandler from './utils/error'
import * as maven from './utils/maven'

/**
 * Main entrypoint for the action
 */
export async function run(): Promise<void> {
    try {
        // Propagate environment variables to subsequent steps
        core.exportVariable('INPUT_BUILD_SCAN_CAPTURE_STRATEGY', input.getBuildScanCaptureStrategy())
        core.exportVariable(
            'INPUT_BUILD_SCAN_CAPTURE_UNPUBLISHED_ENABLED',
            input.getBuildScanCaptureUnpublishedEnabled()
        )
        core.exportVariable('INPUT_BUILD_SCAN_CAPTURE_LINK_ENABLED', input.getBuildScanCaptureLinkEnabled())
        core.exportVariable('INPUT_WORKFLOW_NAME', input.getWorkflowName())
        core.exportVariable('INPUT_JOB_NAME', input.getJobName())
        core.exportVariable('PR_NUMBER', github.context.issue.number)
        core.exportVariable('BUILD_SCAN_DATA_COPY_DIR', layout.mavenBuildScanDataCopy() )

        // init wrapper if needed
        await maven.initWrapper()

        // Retrieve extension target filename (in Maven lib/ext folder)
        const mavenBuildScanCaptureExtensionTarget = await layout.mavenBuildScanCaptureExtensionTarget()

        // copy Maven extension in $MAVEN_HOME/lib/ext
        core.debug(`Copy ${layout.mavenBuildScanCaptureExtensionSource()} to ${mavenBuildScanCaptureExtensionTarget}`)
        io.copyFileSync(layout.mavenBuildScanCaptureExtensionSource(), mavenBuildScanCaptureExtensionTarget)
    } catch (error) {
        errorHandler.handle(error)
    }
}

run()
