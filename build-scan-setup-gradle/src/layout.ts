import path from 'path'
import * as core from '@actions/core'

import * as gradle from '../../build-scan-shared/src/buildTool/gradle'
import * as io from '../../build-scan-shared/src/io'

const GRADLE_BUILD_SCAN_CAPTURE_INIT_SCRIPT = 'gradle-build-scan-capture.gradle'

export function gradleBuildScanCaptureInitScriptSource(): string {
    return path.resolve(
        __dirname,
        '..',
        '..',
        'init-script',
        GRADLE_BUILD_SCAN_CAPTURE_INIT_SCRIPT
    )
}

export async function gradleBuildScanCaptureInitScriptTarget(): Promise<string> {
    const gradleHome = gradle.gradleBuildTool.getBuildToolHome()
    const initScriptDir = path.resolve(gradleHome, 'init.d');

    // Create folder if missing
    if(!io.existsSync(initScriptDir)) {
        core.info(`Creating ${initScriptDir}`)
        io.mkdirSync(initScriptDir)
    }

    return `${initScriptDir}/${GRADLE_BUILD_SCAN_CAPTURE_INIT_SCRIPT}`
}
