import * as glob from '@actions/glob'
import * as exec from '@actions/exec'

process.env['RUNNER_TEMP'] = '/tmp';

import * as commonBuildTool from '../../src/buildTool/common'
import * as github from '@actions/github'
import * as gradle from '../../src/buildTool/gradle'
import * as io from '../../src/io'

const buildTool = gradle.gradleBuildTool

describe('publish', () => {
    let execMock: any
    let createPublisherProjectMock: any
    let createPluginDescriptorMock: any

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
        createPublisherProjectMock = jest.spyOn(commonBuildTool.BuildTool.prototype, 'createPublisherProjectStructure').mockReturnValue()
        createPluginDescriptorMock = jest.spyOn(commonBuildTool.BuildTool.prototype, 'createPluginDescriptorFileWithCurrentVersion').mockReturnValue()
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('Publish build scan succeeds', async () => {
        // given
        jest.spyOn(io, 'existsSync').mockReturnValue(true)
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
        await buildTool.buildScanPublish()

        // then
        expect(createPublisherProjectMock).toHaveBeenCalledTimes(1)
        expect(createPluginDescriptorMock).toHaveBeenCalledTimes(2)
        expect(execMock).toHaveBeenCalledTimes(4)
    })

    it('Publish build scan does nothing when java command fails', async () => {
        // given
        execMock = jest
            .spyOn(exec, 'getExecOutput')
            .mockReturnValueOnce(Promise.resolve({stderr: 'java not found', exitCode: 1, stdout: ''}))

        // when / then
        await expect(async () => buildTool.buildScanPublish()).rejects.toThrow(Error)
    })

    it('Publish build scan does nothing when maven version command fails', async () => {
        // given
        execMock = jest
            .spyOn(exec, 'getExecOutput')
            .mockReturnValueOnce(Promise.resolve({stderr: '', exitCode: 0, stdout: 'Java 1.0'}))
            .mockReturnValueOnce(Promise.resolve({stderr: 'mvn not found', exitCode: 1, stdout: ''}))

        // when / then
        await expect(async () => buildTool.buildScanPublish()).rejects.toThrow(Error)
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
        await buildTool.buildScanPublish()
    })
})
