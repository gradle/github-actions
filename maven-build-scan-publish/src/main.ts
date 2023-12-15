import * as core from '@actions/core'

import * as githubUtils from './utils/github'
import * as loader from './data/load'
import * as buildScan from './build-scan/publish'
import * as buildSummary from './build-summary/dump'
import * as cleaner from './data/cleanup'
import * as errorHandler from './utils/error'

/**
 * Main entrypoint for the action
 */
export async function run(): Promise<void> {
    try {
        if (githubUtils.isPublicationAllowed()) {
            core.info(`Starting Publish Maven Build Scans action`)

            const buildArtifact = await loader.loadBuildScanData()
            if (buildArtifact) {
                await buildScan.publishBuildScan()

                await buildSummary.dump(buildArtifact)

                await cleaner.deleteWorkflowArtifacts(buildArtifact.artifactId)
            } else {
                core.info('Skipping the publication: No artifact found')
            }
        } else {
            core.info('Skipping the publication: Unsupported event trigger')
        }
    } catch (error) {
        errorHandler.handle(error)
    }
}

run()
