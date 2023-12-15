import * as glob from '@actions/glob'
import * as PropertiesReader from 'properties-reader'

import * as load from '../../src/data/load'
import * as githubUtils from '../../src/utils/github'
import * as layout from '../../src/utils/layout'
import * as props from '../../src/utils/properties'

const loadMock = jest.spyOn(load, 'loadBuildScanData')

const mockedArtifactId = 42
const mockedPrNumber = 4242

describe('load', () => {
    let octokit: any

    beforeEach(() => {
        // @ts-ignore
        jest.spyOn(glob, 'create').mockReturnValue(
            Promise.resolve({
                // @ts-ignore
                glob() {
                    return ['prNumberFilePath']
                }
            })
        )
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('Load build scan metadata succeeds', async () => {
        // given
        jest.spyOn(githubUtils, 'getArtifactIdForWorkflowRun').mockReturnValue(Promise.resolve(mockedArtifactId))
        jest.spyOn(githubUtils, 'extractArtifactToDirectory').mockReturnValue(Promise.resolve(true))
        const reader: Partial<PropertiesReader.Reader> = {
            get(key: string) {
                switch (key) {
                    case 'PR_NUMBER':
                        return mockedPrNumber
                    default:
                        return `value for ${key}`
                }
            }
        }
        jest.spyOn(props, 'create').mockImplementation(_ => reader)
        jest.spyOn(layout, 'parseScanDumpPath').mockReturnValue({buildId: 'foo', version: '1.42'})

        // when
        const buildScanData = await load.loadBuildScanData()

        // then
        expect(loadMock).toHaveReturned()
        expect(buildScanData?.artifactId).toBe(mockedArtifactId)
        expect(buildScanData?.prNumber).toBe(mockedPrNumber)
    })

    it('Load build scan metadata does nothing when build scan artifact is not found', async () => {
        // given
        jest.spyOn(githubUtils, 'getArtifactIdForWorkflowRun').mockReturnValue(Promise.resolve(undefined))
        jest.spyOn(githubUtils, 'extractArtifactToDirectory').mockReturnValue(Promise.resolve(false))

        // when
        const buildScanData = await load.loadBuildScanData()

        // then
        expect(loadMock).toHaveReturned()
        expect(buildScanData?.artifactId).toBeUndefined()
        expect(buildScanData?.prNumber).toBeUndefined()
    })

    it('Load build scan metadata fails when metadata file is not found', async () => {
        // given
        jest.spyOn(githubUtils, 'getArtifactIdForWorkflowRun').mockReturnValue(Promise.resolve(mockedArtifactId))
        jest.spyOn(githubUtils, 'extractArtifactToDirectory').mockReturnValue(Promise.resolve(true))
        // @ts-ignore
        jest.spyOn(glob, 'create').mockReturnValue(
            Promise.resolve({
                // @ts-ignore
                glob() {
                    return []
                }
            })
        )

        // when / then
        await expect(async () => await load.loadBuildScanData()).rejects.toThrow(Error)
    })
})
