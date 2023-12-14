import path from 'path'
import * as core from '@actions/core'
import * as github from '@actions/github'

import * as commonBuildTool from '../buildTool/common'
import * as sharedInput from '../input'

function getWorkflowName(): string {
    return sharedInput.getInput('workflow-name')
}

function getJobName(): string {
    return sharedInput.getInput('job-name')
}

function getBuildScanCaptureStrategy(): string {
    return sharedInput.getInput('build-scan-capture-strategy')
}

function getBuildScanCaptureUnpublishedEnabled(): string {
    return sharedInput.getInput('build-scan-capture-unpublished-enabled')
}

function getBuildScanCaptureLinkEnabled(): string {
    return sharedInput.getInput('build-scan-capture-link-enabled')
}

export function exportVariables(buildTool: commonBuildTool.BuildTool): void {
    core.exportVariable('INPUT_BUILD_SCAN_CAPTURE_STRATEGY', getBuildScanCaptureStrategy())
    core.exportVariable('INPUT_BUILD_SCAN_CAPTURE_UNPUBLISHED_ENABLED', getBuildScanCaptureUnpublishedEnabled())
    core.exportVariable('INPUT_BUILD_SCAN_CAPTURE_LINK_ENABLED', getBuildScanCaptureLinkEnabled())
    core.exportVariable('INPUT_WORKFLOW_NAME', getWorkflowName())
    core.exportVariable('INPUT_JOB_NAME', getJobName())
    core.exportVariable('PR_NUMBER', github.context.issue.number)
    core.exportVariable('BUILD_SCAN_DATA_DIR', buildTool.getBuildScanDataDir())
    core.exportVariable('BUILD_SCAN_DATA_COPY_DIR', buildTool.getBuildScanDataCopyDir())
    core.exportVariable(
        'BUILD_SCAN_LINK_FILE',
        path.resolve(buildTool.getBuildScanWorkDir(), sharedInput.BUILD_SCAN_LINK_FILE)
    )
    core.exportVariable('BUILD_SCAN_METADATA_FILENAME', sharedInput.BUILD_SCAN_METADATA_FILE)
}
