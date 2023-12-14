import * as core from '@actions/core'
import * as exec from "@actions/exec";

import * as sharedInput from '../../build-scan-shared/src/input'

function isWrapperInit(): boolean {
    return sharedInput.getBooleanInput('wrapper-init')
}

function getWrapperPath(): string {
    return sharedInput.getInput('wrapper-path')
}

export async function init(): Promise<void> {
    if (isWrapperInit()) {
        core.info(`Initialize Maven wrapper`)

        const res = await exec.getExecOutput('./mvnw', ['-version'], {cwd: getWrapperPath()})
        if (res.stderr !== '' && res.exitCode) {
            throw new Error(`Maven Wrapper initialization failed: ${res.stderr}`)
        }
    }
}
