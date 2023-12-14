import path from 'path'
import * as core from '@actions/core'

import {BuildArtifact, BuildMetadata} from '../data/load'
import * as githubUtils from '../utils/github'
import * as input from '../input'
import * as io from '../../io'
import * as sharedInput from '../../input'

const DUMP_FILENAME = 'build-metadata.json'

export async function dump(buildArtifact: BuildArtifact, buildScanWorkDir: string): Promise<void> {
    updateBuildScanLinks(buildArtifact.builds, buildScanWorkDir)

    if (buildArtifact.builds.length > 0) {
        const htmlSummary = getHtmlSummary(buildArtifact.builds)

        if (input.isSkipComment()) {
            dumpToFile(buildArtifact, buildScanWorkDir)
        } else {
            await dumpToPullRequestComment(buildArtifact.prNumber, htmlSummary)
        }

        if (!input.isSkipSummary()) {
            await dumpToWorkflowSummary(htmlSummary)
        }
    }
}

function updateBuildScanLinks(buildMetadata: BuildMetadata[], buildScanWorkDir: string): void {
    const buildScanLinks = io.readFileSync(path.resolve(buildScanWorkDir, sharedInput.BUILD_SCAN_LINK_FILE))
    if (buildScanLinks) {
        for (const buildScanLinksLine of buildScanLinks.split('\n')) {
            const buildScanLinkData = buildScanLinksLine.split('=')
            if (buildScanLinkData && buildScanLinkData.length === 2) {
                const buildId = buildScanLinkData[0]
                const buildScanLink = buildScanLinkData[1]
                const match = buildMetadata.find(element => element.buildId === buildId)
                if (match) {
                    match.buildScanLink = buildScanLink
                }
            }
        }
    } else {
        core.warning(`Build scan link file not found, build summary will not be dumped`)
    }
}

function dumpToFile(buildArtifact: BuildArtifact, buildScanWorkDir: string): void {
    io.writeContentToFileSync(path.resolve(buildScanWorkDir, DUMP_FILENAME), JSON.stringify(buildArtifact))
}

function getHtmlSummary(builds: BuildMetadata[]): string {
    return `
<table>
    <tr>
        <th>Project</th>
        <th>Requested Tasks</th>
        <th>Build Tool Version</th>
        <th>Build Outcome</th>
        <th>Build Scan®</th>
    </tr>${builds.map(build => renderBuildResultRow(build)).join('')}
</table>
    `
}

function renderBuildResultRow(build: BuildMetadata): string {
    return `
    <tr>
        <td>${build.jobName}</td>
        <td>${build.requestedTasks}</td>
        <td align='center'>${build.buildToolVersion}</td>
        <td align='center'>${renderOutcome(build)}</td>
        <td>${renderBuildScan(build)}</td>
    </tr>`
}

function renderOutcome(build: BuildMetadata): string {
    return build.buildFailure ? ':x:' : ':white_check_mark:'
}

function renderBuildScan(build: BuildMetadata): string {
    if (build.buildScanLink) {
        return renderBuildScanBadge('PUBLISHED', '06A0CE', build.buildScanLink)
    }
    return renderBuildScanBadge('NOT_PUBLISHED', 'lightgrey', 'https://scans.gradle.com')
}

function renderBuildScanBadge(outcomeText: string, outcomeColor: string, targetUrl: string): string {
    const badgeUrl = `https://img.shields.io/badge/Build%20Scan%C2%AE-${outcomeText}-${outcomeColor}?logo=Gradle`
    const badgeHtml = `<img src="${badgeUrl}" alt="Build Scan ${outcomeText}" />`
    return `<a href="${targetUrl}" rel="nofollow">${badgeHtml}</a>`
}

async function dumpToPullRequestComment(prNumber: number, htmlSummary: string): Promise<void> {
    await githubUtils.commentPullRequest(prNumber, htmlSummary)
}

async function dumpToWorkflowSummary(htmlSummary: string): Promise<void> {
    await githubUtils.addSummary('Builds', htmlSummary)
}
