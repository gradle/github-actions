import * as exec from '@actions/exec'
import * as core from '@actions/core'

import * as input from './input'

export async function initWrapper(): Promise<void> {
    if (input.isWrapperInit()) {
        core.info(`Initialize Maven wrapper`)

        const res = await exec.getExecOutput('./mvnw', ['-version'], {cwd: input.getWrapperPath()})
        if (res.stderr !== '' && res.exitCode) {
            throw new Error(`Maven Wrapper initialization failed: ${res.stderr}`)
        }
    }
}
