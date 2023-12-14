import * as github from '@actions/github'

process.env['GITHUB_REPOSITORY'] = 'foo/bar'
process.env['RUNNER_TEMP'] = '/tmp'

import * as io from '../../build-scan-shared/src/io'
import * as layout from '../src/layout'
import * as main from '../src/main'

const runMock = jest.spyOn(main, 'run')

describe('Main Setup Gradle', () => {
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
            .spyOn(layout, 'gradleBuildScanCaptureInitScriptSource')
            .mockReturnValue('sourceFileName')
        const layoutTargetMock = jest
            .spyOn(layout, 'gradleBuildScanCaptureInitScriptTarget')
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

})
