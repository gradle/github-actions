import * as main from '../src/main'
import * as githubUtils from '../src/utils/github'
import * as loader from '../src/data/load'
import * as buildScan from '../src/build-scan/publish'
import * as output from '../src/build-summary/dump'
import * as cleaner from '../src/data/cleanup'

const runMock = jest.spyOn(main, 'run')

describe('main', () => {
    afterEach(() => {
        jest.clearAllMocks()
    })

    it('Publish build scan succeeds', async () => {
        // Given
        jest.spyOn(githubUtils, 'isPublicationAllowed').mockReturnValue(true)
        jest.spyOn(loader, 'loadBuildScanData').mockReturnValue(
            Promise.resolve(
        {artifactId: 4242, builds: [{jobName:'foo',buildFailure:false,mavenGoals:'clean package',workflowName:'bar', buildId:'foo', mavenVersion:'3.9'}], prNumber:42}
            )
        )
        const publishMock = jest.spyOn(buildScan, 'publishBuildScan').mockReturnValue(Promise.resolve())
        const outputMock = jest
            .spyOn(output, 'dump')
            .mockReturnValue(Promise.resolve())
        const cleanerMock = jest.spyOn(cleaner, 'deleteWorkflowArtifacts').mockReturnValue(Promise.resolve())

        // when
        await main.run()

        // then
        expect(runMock).toHaveReturned()
        expect(publishMock).toHaveBeenCalled()
        expect(outputMock).toHaveBeenCalled()
        expect(cleanerMock).toHaveBeenCalled()
    })

    it('Publish on non workflow_run event does nothing', async () => {
        // Given
        jest.spyOn(githubUtils, 'isPublicationAllowed').mockReturnValue(false)
        jest.spyOn(loader, 'loadBuildScanData').mockReturnValue(Promise.resolve(null))
        const publishMock = jest.spyOn(buildScan, 'publishBuildScan').mockReturnValue(Promise.resolve())
        const outputMock = jest
            .spyOn(output, 'dump')
            .mockReturnValue(Promise.resolve())
        const cleanerMock = jest.spyOn(cleaner, 'deleteWorkflowArtifacts').mockReturnValue(Promise.resolve())

        // when
        await main.run()

        // then
        expect(runMock).toHaveReturned()
        expect(publishMock).not.toHaveBeenCalled()
        expect(outputMock).not.toHaveBeenCalled()
        expect(cleanerMock).not.toHaveBeenCalled()
    })

    it('Publish without build scan does nothing', async () => {
        // Given
        jest.spyOn(githubUtils, 'isPublicationAllowed').mockReturnValue(true)
        jest.spyOn(loader, 'loadBuildScanData').mockReturnValue(Promise.resolve(null))
        const publishMock = jest.spyOn(buildScan, 'publishBuildScan').mockReturnValue(Promise.resolve())
        const outputMock = jest
            .spyOn(output, 'dump')
            .mockReturnValue(Promise.resolve())
        const cleanerMock = jest.spyOn(cleaner, 'deleteWorkflowArtifacts').mockReturnValue(Promise.resolve())

        // when
        await main.run()

        // then
        expect(runMock).toHaveReturned()
        expect(publishMock).not.toHaveBeenCalled()
        expect(outputMock).not.toHaveBeenCalled()
        expect(cleanerMock).not.toHaveBeenCalled()
    })
})
