import path from 'path'
import * as core from '@actions/core'
import * as github from '@actions/github'

import * as commonBuildTool from '../buildTool/common'
import * as sharedInput from '../input'

export function getWorkflowName(): string {
    return sharedInput.getInput('workflow-name')
}

export function getJobName(): string {
    return sharedInput.getInput('job-name')
}

function getCaptureStrategy(): string {
    return sharedInput.getInput('capture-strategy')
}

function getCaptureUnpublishedBuildScans(): string {
    return sharedInput.getInput('capture-unpublished-build-scans')
}

function getCaptureBuildScanLinks(): string {
    return sharedInput.getInput('capture-build-scan-links')
}

export function exportVariables(buildTool: commonBuildTool.BuildTool): void {
    core.exportVariable('INPUT_CAPTURE_STRATEGY', getCaptureStrategy())
    core.exportVariable('INPUT_CAPTURE_UNPUBLISHED_BUILD_SCANS', getCaptureUnpublishedBuildScans())
    core.exportVariable('INPUT_CAPTURE_BUILD_SCAN_LINKS', getCaptureBuildScanLinks())
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
