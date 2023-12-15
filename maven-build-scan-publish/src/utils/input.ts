import * as core from '@actions/core'

export function isDevelocityAllowUntrusted(): boolean {
    return getBooleanInput('develocity-allow-untrusted')
}

export function getDevelocityUrl(): string {
    return core.getInput('develocity-url')
}

export function getDevelocityAccessKey(): string {
    return core.getInput('develocity-access-key')
}

export function isSkipComment(): boolean {
    return getBooleanInput('skip-comment')
}

export function isSkipSummary(): boolean {
    return getBooleanInput('skip-summary')
}

export function getAuthorizedList(): string {
    return core.getInput('authorized-list')
}

// Internal parameters
export function getGithubToken(): string {
    return core.getInput('github-token', {required: true})
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
