import * as github from '@actions/github'
import {GitHub} from '@actions/github/lib/utils'
import {OctokitResponse} from '@octokit/types' // eslint-disable-line import/named
import * as core from '@actions/core'

import * as input from '../input'
import * as io from '../../io'

const ZIP_EXTENSION = 'zip'

const COMMENT_SIGNATURE = '###### Generated by gradle/github-actions'

export function getOctokit(): InstanceType<typeof GitHub> {
    return github.getOctokit(input.getGithubToken())
}

export function isPublicationAllowed(): boolean {
    return isEventSupported() && isUserAuthorized()
}
function isEventSupported(): boolean {
    return github.context.eventName === 'workflow_run'
}

function isUserAuthorized(): boolean {
    const authorizedList = input.getAuthorizedList().trim()
    const prSubmitter = github.context.payload.workflow_run.actor.login

    core.debug(`prSubmitter = ${prSubmitter}`)
    if (authorizedList && !authorizedList.split(',').includes(prSubmitter)) {
        core.info(`user ${prSubmitter} not authorized to publish Build Scans`)
        return false
    }

    return true
}

export async function extractArtifactToDirectory(artifactName: string, artifactId: number, folderName: string): Promise<boolean> {
    let isDownLoadArtifactToFile = false
    try {
        const archiveName = `${artifactName}.${ZIP_EXTENSION}`

        // Download the Build Scan artifact
        core.debug(`Downloading artifact ${artifactId}`)
        const download = await getOctokit().rest.actions.downloadArtifact({
            owner: github.context.repo.owner,
            repo: github.context.repo.repo,
            artifact_id: artifactId,
            archive_format: ZIP_EXTENSION
        })
        if (download && download.data) {
            // Create Build Scan directory
            if (!io.existsSync(folderName)) {
                core.debug(`Creating ${folderName}`)
                io.mkdirSync(folderName)
            }

            // Write artifact
            core.debug(`Writing data to ${archiveName}`)
            io.writeFileSync(folderName, archiveName, download.data as ArrayBuffer)

            // Expand archive
            core.debug(`Extracting to ${folderName}`)
            const extracted = await io.extractZip(archiveName, folderName)
            if (core.isDebug()) {
                core.debug(`Extracted Build Scan artifact to ${extracted}: ${io.readdirSync(extracted)}`)
            }

            isDownLoadArtifactToFile = true
        } else {
            core.warning(`Unable to download artifact ${artifactId}`)
        }
    } catch (error) {
        const typedError = error as OctokitResponse<unknown>
        if (typedError && typedError.status === 410) {
            core.debug(`Artifact deleted or expired`)
        } else {
            throw error
        }
    }

    return isDownLoadArtifactToFile
}

export async function getArtifactIdForWorkflowRun(artifactName: string): Promise<undefined | number> {
    const runId = github.context.payload.workflow_run.id

    // Find the workflow run artifacts named 'maven-build-scan-data'
    const artifacts = await getOctokit().rest.actions.listWorkflowRunArtifacts({
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        run_id: runId
    })

    const matchArtifact = getBuildScanArtifact(artifactName, artifacts)

    return matchArtifact?.id
}

function getBuildScanArtifact(artifactName: string, artifacts: any): any {
    return artifacts.data.artifacts.find((candidate: any) => {
        return candidate.name === artifactName
    })
}

export async function deleteWorkflowArtifacts(artifactId: number): Promise<void> {
    core.debug(`Deleting artifact with id ${artifactId}`)
    await getOctokit().rest.actions.deleteArtifact({
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        artifact_id: artifactId
    })
}

export async function commentPullRequest(prNumber: number, htmlSummary: string): Promise<void> {
    const comment = `
${htmlSummary}

${COMMENT_SIGNATURE}
`

    const commentId = await getSummaryComment(prNumber)
    if (commentId) {
        core.debug(`Updating comment`)
        await getOctokit().rest.issues.updateComment({
            owner: github.context.repo.owner,
            repo: github.context.repo.repo,
            comment_id: commentId,
            body: comment
        })
    } else {
        core.debug(`Creating comment`)
        await getOctokit().rest.issues.createComment({
            owner: github.context.repo.owner,
            repo: github.context.repo.repo,
            issue_number: prNumber,
            body: comment
        })
    }
}

async function getSummaryComment(prNumber: number): Promise<number | undefined> {
    try {
        const response = await getOctokit().rest.issues.listComments({
            owner: github.context.repo.owner,
            repo: github.context.repo.repo,
            issue_number: prNumber
        })

        const matchingComment = response.data.find(
            comment => comment && comment.body && comment.body.includes(COMMENT_SIGNATURE)
        )

        return matchingComment?.id
    } catch (error) {
        throw new Error(`Error retrieving comments from PR ${prNumber}: ${error}`)
    }
}

export async function addSummary(title: string, summary: string): Promise<void> {
    core.summary.addHeading(title, 3)
    core.summary.addRaw(summary)
    await core.summary.write()
}
