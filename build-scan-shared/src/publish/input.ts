import * as sharedInput from '../input'

export function getBuildScanCaptureStrategy(): boolean {
    return sharedInput.getBooleanInput('develocity-allow-untrusted')
}

export function isDevelocityAllowUntrusted(): boolean {
    return sharedInput.getBooleanInput('develocity-allow-untrusted')
}

export function getDevelocityUrl(): string {
    return sharedInput.getInput('develocity-url')
}

export function getDevelocityAccessKey(): string {
    return sharedInput.getInput('develocity-access-key')
}

export function isSkipComment(): boolean {
    return sharedInput.getBooleanInput('skip-comment')
}

export function isSkipSummary(): boolean {
    return sharedInput.getBooleanInput('skip-summary')
}

export function getAuthorizedList(): string {
    return sharedInput.getInput('authorized-list')
}

// Internal parameters
export function getGithubToken(): string {
    return sharedInput.getInput('github-token', {required: true})
}
