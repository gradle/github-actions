import * as core from '@actions/core'
import * as exec from '@actions/exec'
import * as glob from '@actions/glob'

import * as io from '../utils/io'
import * as input from '../utils/input'
import * as layout from '../utils/layout'

const PROJECT_DIR = 'maven-build-scan-publisher'
const MAVEN_DIR = `${PROJECT_DIR}/.mvn`
const REPLACE_ME_TOKEN = `REPLACE_ME`
const SCAN_FILENAME = `scan.scan`

export async function publishBuildScan(): Promise<void> {
    createMavenProjectStructure()

    return await publishBuildScans()
}

function createMavenProjectStructure(): void {
    // Create Maven directory
    if (!io.existsSync(MAVEN_DIR)) {
        core.debug(`Creating ${MAVEN_DIR}`)
        io.mkdirSync(MAVEN_DIR, {recursive: true})
    }

    createFile(`${PROJECT_DIR}/pom.xml`, getPomContent())
    createFile(`${MAVEN_DIR}/gradle-enterprise.xml`, getGradleEnterpriseConfigurationContent())
}

function createFile(filename: string, content: string): void {
    io.writeContentToFileSync(filename, content)
}

function getPomContent(): string {
    return `
        <project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/maven-v4_0_0.xsd">
            <modelVersion>4.0.0</modelVersion>
            <groupId>com.gradle</groupId>
            <artifactId>${PROJECT_DIR}</artifactId>
            <version>1.0</version>
            <name>Maven Build Scan Publisher</name>
        </project>
    `.replace(/  +/g, '')
}

function getExtensionsContent(): string {
    return `
        <?xml version="1.0" encoding="UTF-8"?>
        <extensions>
            <extension>
                <groupId>com.gradle</groupId>
                <artifactId>gradle-enterprise-maven-extension</artifactId>
                <version>${REPLACE_ME_TOKEN}</version>
            </extension>
        </extensions>
    `.replace(/  +/g, '')
}

function getGradleEnterpriseConfigurationContent(): string {
    return `
        <?xml version="1.0" encoding="UTF-8" standalone="yes" ?>
        <gradleEnterprise
            xmlns="https://www.gradle.com/gradle-enterprise-maven" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="https://www.gradle.com/gradle-enterprise-maven https://www.gradle.com/schema/gradle-enterprise-maven.xsd">
            <server>
                <url>${input.getDevelocityUrl()}</url>
                <allowUntrusted>${input.isDevelocityAllowUntrusted()}</allowUntrusted>
            </server>
        </gradleEnterprise>
    `.replace(/  +/g, '')
}

async function publishBuildScans(): Promise<void> {
    // Display Java version
    let res = await exec.getExecOutput('java', ['-version'], {cwd: PROJECT_DIR})
    if (res.stderr !== '' && res.exitCode) {
        throw new Error(`Java execution failed: ${res.stderr}`)
    }

    // Display Maven version
    res = await exec.getExecOutput('mvn', ['-version'], {cwd: PROJECT_DIR})
    if (res.stderr !== '' && res.exitCode) {
        throw new Error(`Maven execution failed: ${res.stderr}`)
    }

    const globber = await glob.create(`${layout.mavenBuildScanData()}/**/${SCAN_FILENAME}`)
    const scanFiles = await globber.glob()

    // Iterate file in reverse order to match build-scan-publish-previous sort
    for (const scanFile of scanFiles.sort().reverse()) {
        // parse current version
        core.info(`Publishing ${scanFile}`)

        try {
            const scanFileData = layout.parseScanDumpPath(scanFile)

            // replace version in template
            createFile(
                `${MAVEN_DIR}/extensions.xml`,
                getExtensionsContent().replace(REPLACE_ME_TOKEN, scanFileData.version)
            )

            // Run Maven build
            res = await exec.getExecOutput('mvn', ['gradle-enterprise:build-scan-publish-previous'], {
                cwd: PROJECT_DIR,
                env: {
                    GRADLE_ENTERPRISE_ACCESS_KEY: input.getDevelocityAccessKey(),
                    BUILD_ID: scanFileData.buildId
                }
            })
            if (res.stderr !== '' && res.exitCode) {
                core.warning(`Maven publication job failed for build id ${scanFileData.buildId}: ${res.stderr}`)
            }
        } catch (error) {
            core.warning(`Could not trigger Maven publication job: ${error}`)
        }
    }
}
