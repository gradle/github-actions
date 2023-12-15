import * as core from '@actions/core'
import * as glob from '@actions/glob'
import PropertiesReader from 'properties-reader'

import * as githubUtils from '../utils/github'
import * as layout from '../utils/layout'
import * as props from '../utils/properties'

const BUILD_SCAN_METADATA_FILENAME = 'build-scan-metadata.properties'

export interface BuildArtifact {
    prNumber: number
    artifactId: number
    builds: BuildMetadata[]
}

export interface BuildMetadata {
    workflowName: string
    jobName: string
    mavenVersion: string
    mavenGoals: string
    buildId: string
    buildFailure: boolean
    buildScanLink?: string
}

export async function loadBuildScanData(): Promise<BuildArtifact | null> {
    const artifactId = await githubUtils.getArtifactIdForWorkflowRun()
    if (artifactId) {
        const mavenBuildScanData = layout.mavenBuildScanData()

        // Download artifact
        if (await githubUtils.extractArtifactToDirectory(artifactId, mavenBuildScanData)) {
            // Collect build scan metadata
            const globber = await glob.create(`${layout.mavenBuildScanData()}/**/${BUILD_SCAN_METADATA_FILENAME}`)
            const metadataFiles = await globber.glob()
            if (!metadataFiles || metadataFiles.length === 0) {
                throw new Error(`Build Scan metadata not found`)
            }

            let prNumber = 0
            const builds: BuildMetadata[] = []
            for (const metadataFile of metadataFiles) {
                const currentMetadata = toMetadataObject(metadataFile)
                builds.push(currentMetadata.buildMetadata)
                prNumber = currentMetadata.prNumber
            }

            return {
                prNumber,
                artifactId,
                builds
            }
        }
    }

    return null
}

function toMetadataObject(metadataFile: string): {buildMetadata: BuildMetadata; prNumber: number} {
    const buildId = layout.parseScanDumpPath(metadataFile).buildId
    const metadataReader = props.create(metadataFile)
    const prNumber = Number((metadataReader as PropertiesReader.Reader).get('PR_NUMBER'))
    const workflowName = (metadataReader as PropertiesReader.Reader).get('WORKFLOW_NAME') as string
    const jobName = (metadataReader as PropertiesReader.Reader).get('JOB_NAME') as string
    const mavenVersion = (metadataReader as PropertiesReader.Reader).get('MAVEN_VERSION') as string
    const mavenGoals = (metadataReader as PropertiesReader.Reader).get('GOAL') as string
    const buildFailure = (metadataReader as PropertiesReader.Reader).get('BUILD_FAILURE')?.valueOf() as boolean
    if (!prNumber || !workflowName || !jobName || !mavenGoals) {
        core.info(`Unexpected Build Scan metadata content [${prNumber},${workflowName},${jobName},${mavenGoals}]`)
    }

    return {
        buildMetadata: {
            workflowName,
            jobName,
            mavenVersion,
            mavenGoals,
            buildId,
            buildFailure
        },
        prNumber
    }
}
