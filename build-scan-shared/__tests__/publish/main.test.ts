import * as gradle from '../../src/buildTool/gradle'

process.env['RUNNER_TEMP'] = '/tmp'

import * as commonBuildTool from '../../src/buildTool/common'
import * as cleaner from '../../src/publish/data/clean'
import * as githubUtils from '../../src/publish/utils/github'
import * as loader from '../../src/publish/data/load'
import * as main from '../../src/publish/main'
import * as output from '../../src/publish/summary/dump'

const buildTool = gradle.gradleBuildTool

describe('main', () => {

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('Publish build scan succeeds', async () => {
        // Given
        jest.spyOn(githubUtils, 'isPublicationAllowed').mockReturnValue(true)
        jest.spyOn(loader, 'loadBuildScanData').mockReturnValue(
            Promise.resolve(
        {artifactId: 4242, builds: [{jobName:'foo',buildFailure:false,requestedTasks:'clean package',workflowName:'bar', buildId:'foo', buildToolVersion:'3.9'}], prNumber:42}
            )
        )
        const outputMock = jest
            .spyOn(output, 'dump')
            .mockReturnValue(Promise.resolve())
        const cleanerMock = jest.spyOn(cleaner, 'deleteWorkflowArtifacts').mockReturnValue(Promise.resolve())
        const buildScanPublishMock = jest
            .spyOn(commonBuildTool.BuildTool.prototype, 'buildScanPublish')
            .mockResolvedValue()

        // when
        await main.publish(buildTool)

        // then
        expect(buildScanPublishMock).toHaveBeenCalled()
        expect(outputMock).toHaveBeenCalled()
        expect(cleanerMock).toHaveBeenCalled()
    })

    it('Publish on non workflow_run event does nothing', async () => {
        // Given
        jest.spyOn(githubUtils, 'isPublicationAllowed').mockReturnValue(false)
        jest.spyOn(loader, 'loadBuildScanData').mockReturnValue(Promise.resolve(null))
        const outputMock = jest
            .spyOn(output, 'dump')
            .mockReturnValue(Promise.resolve())
        const cleanerMock = jest.spyOn(cleaner, 'deleteWorkflowArtifacts').mockReturnValue(Promise.resolve())
        const buildScanPublishMock = jest
            .spyOn(commonBuildTool.BuildTool.prototype, 'buildScanPublish')
            .mockResolvedValue()

        // when
        await main.publish(buildTool)

        // then
        expect(buildScanPublishMock).not.toHaveBeenCalled()
        expect(outputMock).not.toHaveBeenCalled()
        expect(cleanerMock).not.toHaveBeenCalled()
    })

    it('Publish without build scan does nothing', async () => {
        // Given
        jest.spyOn(githubUtils, 'isPublicationAllowed').mockReturnValue(true)
        jest.spyOn(loader, 'loadBuildScanData').mockReturnValue(Promise.resolve(null))
        const outputMock = jest
            .spyOn(output, 'dump')
            .mockReturnValue(Promise.resolve())
        const cleanerMock = jest.spyOn(cleaner, 'deleteWorkflowArtifacts').mockReturnValue(Promise.resolve())
        const buildScanPublishMock = jest
            .spyOn(commonBuildTool.BuildTool.prototype, 'buildScanPublish')
            .mockResolvedValue()

        // when
        await main.publish(buildTool)

        // then
        expect(buildScanPublishMock).not.toHaveBeenCalled()
        expect(outputMock).not.toHaveBeenCalled()
        expect(cleanerMock).not.toHaveBeenCalled()
    })
})
