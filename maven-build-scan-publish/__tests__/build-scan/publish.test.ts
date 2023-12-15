import * as glob from '@actions/glob'
import * as exec from '@actions/exec'

import * as publish from '../../src/build-scan/publish'
import * as io from '../../src/utils/io'

const runMock = jest.spyOn(publish, 'publishBuildScan')

describe('publish', () => {
    let createFileMock: any
    let execMock: any

    beforeEach(() => {
        jest.spyOn(io, 'existsSync').mockReturnValue(true)
        createFileMock = jest.spyOn(io, 'writeContentToFileSync').mockReturnValue()
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('Publish build scan succeeds', async () => {
        // given
        execMock = jest
            .spyOn(exec, 'getExecOutput')
            .mockReturnValueOnce(Promise.resolve({stderr: '', exitCode: 0, stdout: 'Java 1.0'}))
            .mockReturnValueOnce(Promise.resolve({stderr: '', exitCode: 0, stdout: 'Maven 1.0'}))
            .mockReturnValueOnce(Promise.resolve({stderr: '', exitCode: 0, stdout: 'Build Successful'}))
            .mockReturnValueOnce(Promise.resolve({stderr: '', exitCode: 0, stdout: 'Build Successful'}))

        jest.spyOn(glob, 'create').mockReturnValue(
            Promise.resolve({
                // @ts-ignore
                glob() {
                    return [
                        '/home/foo/.m2/build-scan-data/1.42/previous/abcdef/scan.scan',
                        '/home/foo/.m2/build-scan-data/1.42/previous/ghijkl/scan.scan'
                    ]
                }
            })
        )

        // when
        await publish.publishBuildScan()

        // then
        expect(runMock).toHaveReturned()
        expect(createFileMock).toHaveBeenCalledTimes(4)
        expect(execMock).toHaveBeenCalledTimes(4)
    })

    it('Publish build scan does nothing when java command fails', async () => {
        // given
        execMock = jest
            .spyOn(exec, 'getExecOutput')
            .mockReturnValueOnce(Promise.resolve({stderr: 'java not found', exitCode: 1, stdout: ''}))

        // when / then
        expect(async () => await publish.publishBuildScan()).rejects.toThrow(Error)
    })

    it('Publish build scan does nothing when maven version command fails', async () => {
        // given
        execMock = jest
            .spyOn(exec, 'getExecOutput')
            .mockReturnValueOnce(Promise.resolve({stderr: '', exitCode: 0, stdout: 'Java 1.0'}))
            .mockReturnValueOnce(Promise.resolve({stderr: 'mvn not found', exitCode: 1, stdout: ''}))

        // when / then
        expect(async () => await publish.publishBuildScan()).rejects.toThrow(Error)
    })

    it('Publish build scan does nothing when maven publish command fails', async () => {
        // given
        execMock = jest
            .spyOn(exec, 'getExecOutput')
            .mockReturnValueOnce(Promise.resolve({stderr: '', exitCode: 0, stdout: 'Java 1.0'}))
            .mockReturnValueOnce(Promise.resolve({stderr: '', exitCode: 0, stdout: 'Maven 1.0'}))
            .mockReturnValueOnce(Promise.resolve({stderr: 'mvn publication failed', exitCode: 1, stdout: ''}))

        // @ts-ignore
        jest.spyOn(glob, 'create').mockReturnValue(
            Promise.resolve({
                // @ts-ignore
                glob() {
                    return [
                        '/home/foo/.m2/build-scan-data/1.42/previous/abcdef/scan.scan',
                        '/home/foo/.m2/build-scan-data/1.42/previous/ghijkl/scan.scan'
                    ]
                }
            })
        )

        // when / then
        await publish.publishBuildScan()
    })
})
