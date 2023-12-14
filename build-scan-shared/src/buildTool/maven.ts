import path from 'path'
import * as core from '@actions/core'

import * as commonBuildTool from './common'
import * as input from '../publish/input'
import * as io from '../io'

class MavenBuildTool extends commonBuildTool.BuildTool {
    private readonly BUILD_SCAN_ARTIFACT_NAME = 'maven-build-scan-data'
    private readonly BUILD_SCAN_DATA_DIR = '.gradle-enterprise/build-scan-data/'
    private readonly COMMAND = 'mvn'
    private readonly PUBLISH_TASK = 'gradle-enterprise:build-scan-publish-previous'
    private readonly PLUGIN_DESCRIPTOR_FILENAME = '.mvn/extensions.xml'

    constructor() {
        super(commonBuildTool.BuildToolType.MAVEN)
    }

    getBuildToolHome(): string {
        return path.resolve(this.getHome(), '.m2')
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

    getPublishTask(): string[] {
        const args: string[] = [this.PUBLISH_TASK]
        if (core.isDebug()) {
            args.push('-X')
        }
        return args
    }

    getPluginDescriptorTemplate(): string {
        return `
            <?xml version="1.0" encoding="UTF-8"?>
            <extensions>
                <extension>
                    <groupId>com.gradle</groupId>
                    <artifactId>gradle-enterprise-maven-extension</artifactId>
                    <version>${this.REPLACE_ME_TOKEN}</version>
                </extension>
            </extensions>
        `.replace(/  +/g, '')
    }

    createPublisherProjectStructure(): void {
        const mvnDir = `${this.getPublisherProjectDir()}/.mvn`

        // Create Maven directory
        if (!io.existsSync(mvnDir)) {
            core.debug(`Creating ${mvnDir}`)
            io.mkdirSync(mvnDir)
        }

        io.writeContentToFileSync(`${this.getPublisherProjectDir()}/pom.xml`, this.getPomContent())
        io.writeContentToFileSync(`${mvnDir}/gradle-enterprise.xml`, this.getGradleEnterpriseConfigurationContent())
    }

    private getPomContent(): string {
        return `
        <project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/maven-v4_0_0.xsd">
            <modelVersion>4.0.0</modelVersion>
            <groupId>com.gradle</groupId>
            <artifactId>${this.BUILD_SCAN_ARTIFACT_NAME}</artifactId>
            <version>1.0</version>
            <name>Maven Build Scan Publisher</name>
        </project>
    `.replace(/  +/g, '')
    }

    private getGradleEnterpriseConfigurationContent(): string {
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
}

export const mavenBuildTool = new MavenBuildTool()
