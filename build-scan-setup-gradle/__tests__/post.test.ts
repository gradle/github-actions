import * as artifact from '@actions/artifact'
import * as glob from '@actions/glob'
import * as github from '@actions/github'

process.env['RUNNER_TEMP'] = '/tmp';

import * as layout from '../src/layout'
import * as post from '../src/post'

const runMock = jest.spyOn(post, 'run')

describe('Post Setup Gradle', () => {
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

    it('Post-execution with build scan succeeds', async () => {
        // Given
        jest.spyOn(glob, 'create').mockReturnValue(
            Promise.resolve({
                // @ts-ignore
                glob() {
                    return ['foo.scan']
                }
            })
        )
        jest.spyOn(layout, 'gradleBuildScanCaptureInitScriptTarget').mockReturnValue(Promise.resolve('directoryName'))
        const uploadArtifactMock = jest.fn()
        const mockArtifactClient: Partial<artifact.ArtifactClient> = {
            uploadArtifact: uploadArtifactMock
        }
        jest.spyOn(artifact, 'create').mockReturnValue(mockArtifactClient as artifact.ArtifactClient)

        // when
        await post.run()

        // then
        expect(runMock).toHaveReturned()
        expect(uploadArtifactMock).toHaveBeenCalled()
    })

    it('Post-execution without build scan does not upload artifact', async () => {
        // Given
        jest.spyOn(glob, 'create').mockReturnValue(
            Promise.resolve({
                // @ts-ignore
                glob() {
                    return []
                }
            })
        )
        jest.spyOn(layout, 'gradleBuildScanCaptureInitScriptTarget').mockReturnValue(Promise.resolve('directoryName'))
        const uploadArtifactMock = jest.fn()
        const mockArtifactClient: Partial<artifact.ArtifactClient> = {
            uploadArtifact: uploadArtifactMock
        }
        jest.spyOn(artifact, 'create').mockReturnValue(mockArtifactClient as artifact.ArtifactClient)

        // when
        await post.run()

        // then
        expect(runMock).toHaveReturned()
        expect(uploadArtifactMock).not.toHaveBeenCalled()
    })
})
