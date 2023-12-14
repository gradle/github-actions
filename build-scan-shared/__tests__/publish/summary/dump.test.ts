process.env['RUNNER_TEMP'] = '/tmp';

import * as githubUtils from '../../../src/publish/utils/github'
import * as input from '../../../src/publish/input'
import * as io from '../../../src/io'
import * as output from '../../../src/publish/summary/dump'

const outputMock = jest.spyOn(output, 'dump')

describe('dump', () => {
    afterEach(() => {
        jest.clearAllMocks()
    })

    it('Dump triggers pull request comment and summary', async () => {
        // Given
        jest.spyOn(input, 'isSkipComment').mockReturnValue(false)
        jest.spyOn(input, 'isSkipSummary').mockReturnValue(false)
        const githubCommentMock = jest
            .spyOn(githubUtils, 'commentPullRequest')
            .mockReturnValue(Promise.resolve(undefined))
        const githubSummaryMock = jest
            .spyOn(githubUtils, 'addSummary')
            .mockReturnValue(Promise.resolve(undefined))
        const ioReadMock = jest.spyOn(io, 'readFileSync').mockReturnValue('foo=https://foo.bar/s/1234')
        const ioWriteMock = jest.spyOn(io, 'writeContentToFileSync').mockReturnValue()

        // when
        await output.dump({
            artifactId: 0,
            builds: [
                {jobName: 'foo', buildFailure: false, requestedTasks: 'clean package', workflowName: 'bar', buildId: 'foo', buildToolVersion:'3.9'}
            ],
            prNumber: 42
        }, '')

        // then
        expect(outputMock).toHaveReturned()
        expect(ioReadMock).toHaveBeenCalled()
        expect(githubCommentMock).toHaveBeenCalled()
        expect(githubSummaryMock).toHaveBeenCalled()
        expect(ioWriteMock).not.toHaveBeenCalled()
    })

    it('Dump with skip-comment dumps output to file', async () => {
        // Given
        jest.spyOn(input, 'isSkipComment').mockReturnValue(true)
        jest.spyOn(input, 'isSkipSummary').mockReturnValue(false)
        const githubCommentMock = jest
            .spyOn(githubUtils, 'commentPullRequest')
            .mockReturnValue(Promise.resolve(undefined))
        const githubSummaryMock = jest
            .spyOn(githubUtils, 'addSummary')
            .mockReturnValue(Promise.resolve(undefined))
        const ioReadMock = jest.spyOn(io, 'readFileSync').mockReturnValue('foo=https://foo.bar/s/1234')
        const ioWriteMock = jest.spyOn(io, 'writeContentToFileSync').mockReturnValue()

        // when
        await output.dump({
            artifactId: 0,
            builds: [
                {jobName: 'foo', buildFailure: false, requestedTasks: 'clean package', workflowName: 'bar', buildId: 'foo', buildToolVersion:'3.9'}
            ],
            prNumber: 42
        }, '')

        // then
        expect(outputMock).toHaveReturned()
        expect(ioReadMock).toHaveBeenCalled()
        expect(githubCommentMock).not.toHaveBeenCalled()
        expect(ioWriteMock).toHaveBeenCalled()
    })

    it('Dump with skip-summary does not add summary', async () => {
        // Given
        jest.spyOn(input, 'isSkipComment').mockReturnValue(true)
        jest.spyOn(input, 'isSkipSummary').mockReturnValue(true)
        const githubSummaryMock = jest
            .spyOn(githubUtils, 'addSummary')
            .mockReturnValue(Promise.resolve(undefined))
        const ioReadMock = jest.spyOn(io, 'readFileSync').mockReturnValue('foo=https://foo.bar/s/1234')
        const ioWriteMock = jest.spyOn(io, 'writeContentToFileSync').mockReturnValue()

        // when
        await output.dump({
            artifactId: 0,
            builds: [
                {jobName: 'foo', buildFailure: false, requestedTasks: 'clean package', workflowName: 'bar', buildId: 'foo', buildToolVersion:'3.9'}
            ],
            prNumber: 42
        }, '')

        // then
        expect(outputMock).toHaveReturned()
        expect(ioReadMock).toHaveBeenCalled()
        expect(githubSummaryMock).not.toHaveBeenCalled()
        expect(ioWriteMock).toHaveBeenCalled()
    })

    it('Dump without build scan does nothing', async () => {
        // Given
        jest.spyOn(input, 'isSkipComment').mockReturnValue(false)
        const githubCommentMock = jest
            .spyOn(githubUtils, 'commentPullRequest')
            .mockReturnValue(Promise.resolve(undefined))
        const githubSummaryMock = jest
            .spyOn(githubUtils, 'addSummary')
            .mockReturnValue(Promise.resolve(undefined))
        const ioReadMock = jest.spyOn(io, 'readFileSync').mockReturnValue('foo=https://foo.bar/s/1234')
        const ioWriteMock = jest.spyOn(io, 'writeContentToFileSync').mockReturnValue()

        // when
        await output.dump({artifactId: 0, builds: [], prNumber: 42}, '')

        // then
        expect(outputMock).toHaveReturned()
        expect(ioReadMock).toHaveBeenCalled()
        expect(githubCommentMock).not.toHaveBeenCalled()
        expect(githubSummaryMock).not.toHaveBeenCalled()
        expect(ioWriteMock).not.toHaveBeenCalled()
    })

    it('Dump with skip-comment and without build scan does nothing', async () => {
        // Given
        jest.spyOn(input, 'isSkipComment').mockReturnValue(false)
        const githubCommentMock = jest
            .spyOn(githubUtils, 'commentPullRequest')
            .mockReturnValue(Promise.resolve(undefined))
        const githubSummaryMock = jest
            .spyOn(githubUtils, 'addSummary')
            .mockReturnValue(Promise.resolve(undefined))
        const ioReadMock = jest.spyOn(io, 'readFileSync').mockReturnValue('foo=https://foo.bar/s/1234')
        const ioWriteMock = jest.spyOn(io, 'writeContentToFileSync').mockReturnValue()

        // when
        await output.dump({artifactId: 0, builds: [], prNumber: 42}, '')

        // then
        expect(outputMock).toHaveReturned()
        expect(ioReadMock).toHaveBeenCalled()
        expect(githubCommentMock).not.toHaveBeenCalled()
        expect(githubSummaryMock).not.toHaveBeenCalled()
        expect(ioWriteMock).not.toHaveBeenCalled()
    })
})
