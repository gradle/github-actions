import * as core from '@actions/core'

import * as cleaner from './data/clean'
import * as commonBuildTool from '../buildTool/common'
import * as githubUtils from './utils/github'
import * as loader from './data/load'
import * as summary from './summary/dump'

export async function publish(buildTool: commonBuildTool.BuildTool): Promise<void> {
    if (githubUtils.isPublicationAllowed()) {
        const buildArtifact = await loader.loadBuildScanData(
            buildTool.getArtifactName(),
            buildTool.getBuildScanDataDir()
        )
        if (buildArtifact) {
            await buildTool.buildScanPublish()

            await summary.dump(buildArtifact, buildTool.getBuildScanWorkDir())

            await cleaner.deleteWorkflowArtifacts(buildArtifact.artifactId)
        } else {
            core.info('Skipping the publication: No artifact found')
        }
    } else {
        core.info('Skipping the publication: Unsupported event trigger')
    }
}
