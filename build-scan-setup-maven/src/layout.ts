import path from 'path'
import * as core from '@actions/core'

import * as glob from '@actions/glob'
import * as io from '../../build-scan-shared/src/io'
import * as sharedInput from '../../build-scan-shared/src/input'

const ENV_KEY_MAVEN_HOME = 'MAVEN_HOME'
const MAVEN_BUILD_SCAN_CAPTURE_EXTENSION = 'maven-build-scan-capture-extension'
const MAVEN_BUILD_SCAN_CAPTURE_EXTENSION_JAR = `${MAVEN_BUILD_SCAN_CAPTURE_EXTENSION}.jar`
const MAVEN_LIB_EXT = '/lib/ext/'

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
    const mavenHome = await getBuildToolHome(getMavenHomeSearchPatterns())

    // Retrieve $MAVEN_HOME/lib/ext
    const mavenHomeLibExtDir = `${mavenHome}${MAVEN_LIB_EXT}`

    // Create folder if missing
    if(!io.existsSync(mavenHomeLibExtDir)) {
        core.info(`Creating ${mavenHomeLibExtDir}`)
        io.mkdirSync(mavenHomeLibExtDir)
    }

    return `${mavenHomeLibExtDir}${MAVEN_BUILD_SCAN_CAPTURE_EXTENSION_JAR}`
}

async function getBuildToolHome(mavenHomeSearchPatterns: string): Promise<string> {
    const mavenHome = process.env[ENV_KEY_MAVEN_HOME]

    if (mavenHome) {
        core.info(`Using MAVEN_HOME=${mavenHome}`)
        return `${mavenHome}`
    } else {
        core.info(`Searching maven home in ${mavenHomeSearchPatterns}`)
        const globber = await glob.create(mavenHomeSearchPatterns.replaceAll(',', '\n'))
        const mavenHomeGlob = await globber.glob()
        if (mavenHomeGlob && mavenHomeGlob.at(0)) {
            core.info(`Found maven home in ${mavenHomeGlob.at(0)}`)
            return mavenHomeGlob.at(0)!
        }
    }

    throw new Error(`Maven home not found`)
}

function getMavenHomeSearchPatterns(): string {
    return sharedInput.getInput('maven-home-search-patterns')
}
