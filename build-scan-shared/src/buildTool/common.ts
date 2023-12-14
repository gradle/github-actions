import path from 'path'
import * as exec from '@actions/exec'
import * as glob from '@actions/glob'
import * as core from '@actions/core'

import * as input from '../publish/input'
import * as io from '../io'
import * as sharedInput from '../input'

const ENV_KEY_RUNNER_TMP = 'RUNNER_TEMP'

export enum BuildToolType {
    GRADLE,
    MAVEN
}

export function getWorkDir(): string {
    const tmpDir = process.env[ENV_KEY_RUNNER_TMP]
    if (!tmpDir) {
        throw new Error(`${ENV_KEY_RUNNER_TMP} is not defined in the environment`)
    }

    return path.resolve(tmpDir)
}

export abstract class BuildTool {
    private readonly ENV_KEY_HOME = 'HOME'
    private readonly ENV_KEY_HOMEDRIVE = 'HOMEDRIVE'
    private readonly ENV_KEY_HOMEPATH = 'HOMEPATH'

    private readonly BUILD_SCAN_DATA_COPY_DIR = 'build-scan-data-copy'
    private readonly PUBLISHER_PROJECT_DIR = 'build-scan-publish'

    private readonly SCAN_FILENAME = `scan.scan`

    protected readonly REPLACE_ME_TOKEN = `REPLACE_ME`

    protected type: BuildToolType

    constructor(type: BuildToolType) {
        this.type = type
    }

    protected abstract getCommand(): string

    protected abstract getBuildToolHome(): string

    protected abstract getPluginDescriptorFileName(): string

    protected abstract getPluginDescriptorTemplate(): string

    protected abstract getPublishTask(): string[]

    abstract getArtifactName(): string

    abstract getBuildScanDataDir(): string

    protected getHome(): string {
        return (
            process.env[this.ENV_KEY_HOME] ||
            `${process.env[this.ENV_KEY_HOMEDRIVE]}${process.env[this.ENV_KEY_HOMEPATH]}` ||
            ''
        )
    }

    createPublisherProjectStructure(): void {}

    createPluginDescriptorFileWithCurrentVersion(version: string): void {
        const resolvedContent: string = this.getPluginDescriptorTemplate().replace(this.REPLACE_ME_TOKEN, version)

        io.writeContentToFileSync(this.getPluginDescriptorFileName(), resolvedContent)
    }

    getBuildScanWorkDir(): string {
        return path.resolve(getWorkDir(), this.getArtifactName())
    }

    getBuildScanDataCopyDir(): string {
        return path.resolve(this.getBuildScanWorkDir(), this.BUILD_SCAN_DATA_COPY_DIR)
    }

    protected getPublisherProjectDir(): string {
        return path.resolve(this.getBuildScanWorkDir(), this.PUBLISHER_PROJECT_DIR)
    }

    async buildScanPublish(): Promise<void> {
        const buildToolCmd = this.getCommand()
        const publisherProjectDir = this.getPublisherProjectDir()

        // Create publisher directory
        if (!io.existsSync(publisherProjectDir)) {
            core.debug(`Creating ${publisherProjectDir}`)
            io.mkdirSync(publisherProjectDir)
        }

        // Display Java version
        let res = await exec.getExecOutput('java', ['-version'], {cwd: publisherProjectDir})
        if (res.stderr !== '' && res.exitCode) {
            throw new Error(`Java execution failed: ${res.stderr}`)
        }

        // Display build tool version
        res = await exec.getExecOutput(buildToolCmd, ['-version'], {cwd: publisherProjectDir})
        if (res.stderr !== '' && res.exitCode) {
            throw new Error(`${buildToolCmd} execution failed: ${res.stderr}`)
        }

        const globber = await glob.create(`${this.getBuildScanDataDir()}/**/${this.SCAN_FILENAME}`)
        const scanFiles = await globber.glob()

        this.createPublisherProjectStructure()

        // Iterate file in reverse order to match build-scan-publish-previous sort
        for (const scanFile of scanFiles.sort().reverse()) {
            // Parse current version
            core.info(`Publishing ${scanFile}`)

            try {
                const scanFileData = parseScanDumpPath(scanFile)

                // Create plugin descriptor with current plugin version
                this.createPluginDescriptorFileWithCurrentVersion(scanFileData.version)

                // Run Maven build
                res = await exec.getExecOutput(buildToolCmd, this.getPublishTask(), {
                    cwd: publisherProjectDir,
                    env: {
                        GRADLE_ENTERPRISE_ACCESS_KEY: input.getDevelocityAccessKey(),
                        BUILD_ID: scanFileData.buildId,
                        INPUT_BUILD_SCAN_CAPTURE_UNPUBLISHED_ENABLED: 'false',
                        BUILD_SCAN_LINK_FILE: path.resolve(this.getBuildScanWorkDir(), sharedInput.BUILD_SCAN_LINK_FILE)
                    }
                })
                if (res.stderr !== '' && res.exitCode) {
                    core.warning(`Publication job failed for build id ${scanFileData.buildId}: ${res.stderr}`)
                }
            } catch (error) {
                core.warning(`Could not trigger publication job: ${error}`)
            }
        }
    }
}

export function parseScanDumpPath(scanDumpPath: string): {version: string; buildId: string} {
    // capture extension version and buildId assuming scan name is ${HOME}/.m2/build-scan-data/<version>/previous/<buildId>/scan.scan
    const scanDumpPathMatch = scanDumpPath.match(/^.*\/build-scan-data\/(.*)\/previous\/(.*)\/.*$/)
    const version = scanDumpPathMatch?.at(1)
    const buildId = scanDumpPathMatch?.at(2)
    if (!version || !buildId) {
        throw new Error(`Could not parse scan dump path : ${scanDumpPath}`)
    }

    return {
        version,
        buildId
    }
}
