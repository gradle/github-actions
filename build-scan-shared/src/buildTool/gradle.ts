import path from 'path'
import * as core from '@actions/core'

import * as commonBuildTool from './common'
import * as input from '../publish/input'

class GradleBuildTool extends commonBuildTool.BuildTool {
    private readonly BUILD_SCAN_ARTIFACT_NAME = 'gradle-build-scan-data'
    private readonly BUILD_SCAN_DATA_DIR = 'build-scan-data/'
    private readonly COMMAND = 'gradle'
    private readonly PUBLISH_TASK = 'buildScanPublishPrevious'
    private readonly PLUGIN_DESCRIPTOR_FILENAME = 'settings.gradle'

    constructor() {
        super(commonBuildTool.BuildToolType.GRADLE)
    }

    getBuildToolHome(): string {
        return path.resolve(this.getHome(), '.gradle')
    }

    getArtifactName(): string {
        return this.BUILD_SCAN_ARTIFACT_NAME
    }

    getBuildScanDataDir(): string {
        return path.resolve(this.getBuildToolHome(), this.BUILD_SCAN_DATA_DIR)
    }

    getCommand(): string {
        return this.COMMAND
    }

    getPluginDescriptorFileName(): string {
        return path.resolve(this.getPublisherProjectDir(), this.PLUGIN_DESCRIPTOR_FILENAME)
    }

    getPluginDescriptorTemplate(): string {
        return `
            plugins {
                id 'com.gradle.enterprise' version '${this.REPLACE_ME_TOKEN}'
            }
    
            gradleEnterprise {
                server = '${input.getDevelocityUrl()}'
                allowUntrustedServer = ${input.isDevelocityAllowUntrusted()}
            }
        `.replace(/  +/g, '')
    }

    getPublishTask(): string[] {
        const args = [this.PUBLISH_TASK]
        if (core.isDebug()) {
            args.push('--debug')
        }
        return args
    }
}

export const gradleBuildTool = new GradleBuildTool()
