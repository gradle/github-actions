import * as github from '@actions/github'
import * as exec from '@actions/exec'

process.env['GITHUB_REPOSITORY'] = 'foo/bar'
process.env['MAVEN_HOME'] = '/tmp'
process.env['RUNNER_TEMP'] = '/tmp'

import * as io from '../../build-scan-shared/src/io'
import * as layout from '../src/layout'
import * as main from '../src/main'
import * as sharedInput from '../../build-scan-shared/src/input'

const runMock = jest.spyOn(main, 'run')

describe('Main Setup Maven', () => {
    beforeEach(() => {
        Object.defineProperty(github, 'context', {
            value: {
                repo: {
                    owner: 'foo',
                    repo: 'bar'
                },
                issue: {
                    number: 42
                }
            }
        })
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('Setup build scan action succeeds', async () => {
        // Given
        const layoutSourceMock = jest
            .spyOn(layout, 'mavenBuildScanCaptureExtensionSource')
            .mockReturnValue('sourceFileName')
        const layoutTargetMock = jest
            .spyOn(layout, 'mavenBuildScanCaptureExtensionTarget')
            .mockReturnValue(Promise.resolve('targetFileName'))
        const ioMock = jest.spyOn(io, 'copyFileSync').mockReturnValue()

        // when
        await main.run()

        // then
        expect(runMock).toHaveReturned()
        expect(layoutSourceMock).toHaveBeenCalled()
        expect(layoutTargetMock).toHaveBeenCalled()
        expect(ioMock).toHaveBeenCalled()
    })

    it('Setup when Maven home is not found fails', async () => {
        // Given
        const errorMsg = 'Maven home not found'
        const layoutTargetMock = jest.spyOn(layout, 'mavenBuildScanCaptureExtensionTarget').mockRejectedValue(errorMsg)
        const ioMock = jest.spyOn(io, 'copyFileSync').mockReturnValue()

        // when
        await main.run()

        // then
        expect(runMock).toHaveReturned()
        await expect(layoutTargetMock).rejects.toEqual(errorMsg)
        expect(ioMock).not.toHaveBeenCalled()
    })

    it('Setup when Maven wrapper init is set succeeds', async () => {
        // Given
        jest.spyOn(sharedInput, 'getBooleanInput').mockReturnValue(true)
        const execMock = jest
            .spyOn(exec, 'getExecOutput')
            .mockReturnValueOnce(Promise.resolve({stderr: '', exitCode: 0, stdout: 'Maven wrapper executed'}))
        const layoutSourceMock = jest
            .spyOn(layout, 'mavenBuildScanCaptureExtensionSource')
            .mockReturnValue('sourceFileName')
        const layoutTargetMock = jest
            .spyOn(layout, 'mavenBuildScanCaptureExtensionTarget')
            .mockReturnValue(Promise.resolve('targetFileName'))
        const ioMock = jest.spyOn(io, 'copyFileSync').mockReturnValue()

        // when
        await main.run()

        // then
        expect(runMock).toHaveReturned()
        expect(execMock).toHaveBeenCalledTimes(1)
        expect(layoutSourceMock).toHaveBeenCalled()
        expect(layoutTargetMock).toHaveBeenCalled()
        expect(ioMock).toHaveBeenCalled()
    })
})
