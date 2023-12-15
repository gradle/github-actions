import path from 'path'

import * as core from '@actions/core'
import * as glob from '@actions/glob'

import * as params from './input'
import * as io from './io'

const ENV_KEY_HOME = 'HOME'
const ENV_KEY_MAVEN_HOME = 'MAVEN_HOME'
const ENV_KEY_RUNNER_TMP = 'RUNNER_TEMP'

const BUILD_SCAN_DIR_ORIGINAL = '.m2/.gradle-enterprise/build-scan-data/'
const BUILD_SCAN_DIR_COPY = 'build-scan-data-copy'
const MAVEN_BUILD_SCAN_CAPTURE_EXTENSION = 'maven-build-scan-capture-extension'
const MAVEN_BUILD_SCAN_CAPTURE_EXTENSION_JAR = `${MAVEN_BUILD_SCAN_CAPTURE_EXTENSION}.jar`
const LIB_EXT = '/lib/ext/'

function home(): string {
    return process.env[ENV_KEY_HOME] || ''
}

export function mavenBuildScanCaptureExtensionSource(): string {
    return path.resolve(
        __dirname,
        '..',
        '..',
        '..',
        MAVEN_BUILD_SCAN_CAPTURE_EXTENSION,
        'dist',
        MAVEN_BUILD_SCAN_CAPTURE_EXTENSION_JAR
    )
}

export async function mavenBuildScanCaptureExtensionTarget(): Promise<string> {
    const mavenHome = process.env[ENV_KEY_MAVEN_HOME]

    if (mavenHome) {
        core.info(`Using MAVEN_HOME=${mavenHome}`)

        const libExtDir = `${mavenHome}${LIB_EXT}`

        // Create folder if missing
        core.info(`Creating ${libExtDir}`)
        io.mkdirSync(libExtDir)

        return `${libExtDir}${MAVEN_BUILD_SCAN_CAPTURE_EXTENSION_JAR}`
    } else {
        core.info(`Searching maven home in ${params.getMavenHomeSearchPatterns()}`)
        const globber = await glob.create(params.getMavenHomeSearchPatterns().replaceAll(',', '\n'))
        const mavenHomeGlob = await globber.glob()
        if (mavenHomeGlob && mavenHomeGlob.at(0)) {
            core.info(`Found maven home in ${mavenHomeGlob.at(0)}`)
            return path.resolve(`${mavenHomeGlob.at(0)}${LIB_EXT}`, MAVEN_BUILD_SCAN_CAPTURE_EXTENSION_JAR)
        }
    }

    throw new Error(`Maven home not found`)
}

export function mavenBuildScanDataOriginal(): string {
    return path.resolve(home(), BUILD_SCAN_DIR_ORIGINAL)
}

export function mavenBuildScanDataCopy(): string {
    const tmpDir = process.env[ENV_KEY_RUNNER_TMP]
    if (!tmpDir) {
        throw new Error(`tmp directory not found`)
    }

    return path.resolve(tmpDir, BUILD_SCAN_DIR_COPY)
}
