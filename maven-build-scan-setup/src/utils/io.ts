import fs from 'fs'

export function copyFileSync(source: string, dest: string): void {
    fs.copyFileSync(source, dest)
}

export function mkdirSync(dir: string): void {
    fs.mkdirSync(dir, {recursive: true})
}
