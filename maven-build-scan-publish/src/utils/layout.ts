const BUILD_SCAN_DIR = '.m2/.gradle-enterprise/build-scan-data'
const HOME = 'HOME'

export function home(): string {
    return process.env[HOME] || ''
}

export function mavenBuildScanData(): string {
    return `${home()}/${BUILD_SCAN_DIR}`
}

export function parseScanDumpPath(scanDumpPath: string): {version: string; buildId: string} {
    // capture extension version and buildId assuming scan name is ${HOME}/.m2/build-scan-data/<version>/previous/<buildId>/scan.scan
    const scanDumpPathMatch = scanDumpPath.match(/^.*\/build-scan-data\/(.*)\/previous\/(.*)\/.*$/)
    const version = scanDumpPathMatch?.at(1)
    const buildId = scanDumpPathMatch?.at(2)
    if (!version || !buildId) {
        throw new Error(`Could not parse scan dump path : ${scanDumpPath}`)
    }

    return {
        version,
        buildId
    }
}
