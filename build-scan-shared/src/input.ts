import * as core from '@actions/core'
import {InputOptions} from "@actions/core";

export const BUILD_SCAN_LINK_FILE = 'build-scan-links.properties'
export const BUILD_SCAN_METADATA_FILE = 'build-scan-metadata.properties'

export function getInput(key: string, options?: InputOptions): string {
    return core.getInput(key, options)
}

export function getBooleanInput(paramName: string, paramDefault = false): boolean {
    const paramValue = core.getInput(paramName)
    switch (paramValue.toLowerCase().trim()) {
        case '':
            return paramDefault
        case 'false':
            return false
        case 'true':
            return true
    }
    throw TypeError(`The value '${paramValue} is not valid for '${paramName}. Valid values are: [true, false]`)
}
