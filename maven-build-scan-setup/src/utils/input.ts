import * as core from '@actions/core'

export function getWorkflowName(): string {
    return core.getInput('workflow-name')
}

export function getJobName(): string {
    return core.getInput('job-name')
}

export function getMavenHomeSearchPatterns(): string {
    return core.getInput('maven-home-search-patterns')
}

export function getBuildScanCaptureStrategy(): string {
    return core.getInput('build-scan-capture-strategy')
}

export function getBuildScanCaptureUnpublishedEnabled(): string {
    return core.getInput('build-scan-capture-unpublished-enabled')
}

export function getBuildScanCaptureLinkEnabled(): string {
    return core.getInput('build-scan-capture-link-enabled')
}

export function isWrapperInit(): boolean {
    return getBooleanInput('wrapper-init')
}

export function getWrapperPath(): string {
    return core.getInput('wrapper-path')
}

function getBooleanInput(paramName: string, paramDefault = false): boolean {
    const paramValue = core.getInput(paramName)
    switch (paramValue.toLowerCase().trim()) {
        case '':
            return paramDefault
        case 'false':
            return false
        case 'true':
            return true
    }
    throw TypeError(`The value '${paramValue} is not valid for '${paramName}. Valid values are: [true, false]`)
}
