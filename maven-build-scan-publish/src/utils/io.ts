import fs from 'fs'
import path from 'path'
import * as toolCache from '@actions/tool-cache'

export function existsSync(fileName: string): boolean {
    return fs.existsSync(fileName)
}

export async function extractZip(zipFileName: string, extractDir: string): Promise<string> {
    return await toolCache.extractZip(zipFileName, extractDir)
}

export function mkdirSync(dirName: string, options: any): string | undefined {
    return fs.mkdirSync(dirName, options)
}

export function readdirSync(dirName: string): string[] {
    return fs.readdirSync(path.resolve(dirName))
}
export function readFileSync(fileName: string): string {
    return fs.readFileSync(path.resolve(fileName), 'utf-8')
}

export function writeFileSync(dirName: string, fileName: string, downloadBuffer: ArrayBuffer): void {
    fs.writeFileSync(path.resolve(dirName, fileName), Buffer.from(downloadBuffer))
}

export function writeContentToFileSync(fileName: string, content: string): void {
    fs.writeFileSync(fileName, content)
}
