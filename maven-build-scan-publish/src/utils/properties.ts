import PropertiesReader from 'properties-reader'

// Using Partial type to ease mocking
export function create(propertiesFile: string): Partial<PropertiesReader.Reader> {
    return PropertiesReader(propertiesFile)
}
