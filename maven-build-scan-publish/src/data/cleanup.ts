import * as githubUtils from '../utils/github'

export async function deleteWorkflowArtifacts(artifactId: number): Promise<void> {
    await githubUtils.deleteWorkflowArtifacts(artifactId)
}
