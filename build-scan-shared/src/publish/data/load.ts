import * as core from '@actions/core'
import * as glob from '@actions/glob'
import PropertiesReader from 'properties-reader'

import * as commonBuildTool from '../../buildTool/common'
import * as githubUtils from '../utils/github'
import * as props from './properties'
import * as sharedInput from '../../input'

export interface BuildArtifact {
    prNumber: number
    artifactId: number
    builds: BuildMetadata[]
}

export interface BuildMetadata {
    workflowName: string
    jobName: string
    buildToolVersion: string
    requestedTasks: string
    buildId: string
    buildFailure: boolean
    buildScanLink?: string
}

export async function loadBuildScanData(artifactName: string, buildScanDataDir: string): Promise<BuildArtifact | null> {
    const artifactId = await githubUtils.getArtifactIdForWorkflowRun(artifactName)
    if (artifactId) {
        // Download artifact
        if (await githubUtils.extractArtifactToDirectory(artifactName, artifactId, buildScanDataDir)) {
            // Collect build scan metadata
            const globber = await glob.create(`${buildScanDataDir}/**/${sharedInput.BUILD_SCAN_METADATA_FILE}`)
            const metadataFiles = await globber.glob()
            if (!metadataFiles || metadataFiles.length === 0) {
                throw new Error(`Build Scan metadata not found`)
            }

            let prNumber = 0
            const builds: BuildMetadata[] = []
            for (const metadataFile of metadataFiles) {
                const currentMetadata = toBuildMetadata(metadataFile)
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

function toBuildMetadata(metadataFile: string): {buildMetadata: BuildMetadata; prNumber: number} {
    const buildId = commonBuildTool.parseScanDumpPath(metadataFile).buildId
    const metadataReader = props.create(metadataFile)
    const prNumber = Number((metadataReader as PropertiesReader.Reader).get('PR_NUMBER'))
    const workflowName = (metadataReader as PropertiesReader.Reader).get('WORKFLOW_NAME') as string
    const jobName = (metadataReader as PropertiesReader.Reader).get('JOB_NAME') as string
    const buildToolVersion = (metadataReader as PropertiesReader.Reader).get('BUILD_TOOL_VERSION') as string
    const requestedTasks = (metadataReader as PropertiesReader.Reader).get('REQUESTED_TASKS') as string
    const buildFailure = (metadataReader as PropertiesReader.Reader).get('BUILD_FAILURE')?.valueOf() as boolean
    if (!prNumber || !workflowName || !jobName || !requestedTasks) {
        core.info(`Unexpected Build Scan metadata content [${prNumber},${workflowName},${jobName},${requestedTasks}]`)
    }

    return {
        buildMetadata: {
            workflowName,
            jobName,
            buildToolVersion,
            requestedTasks,
            buildId,
            buildFailure
        },
        prNumber
    }
}
