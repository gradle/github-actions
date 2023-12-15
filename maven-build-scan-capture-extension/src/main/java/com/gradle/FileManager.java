package com.gradle;

import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.attribute.BasicFileAttributes;
import java.util.function.BiPredicate;
import java.util.stream.Stream;

interface FileManager {

    void writeContent(Path filePath, String content) throws IOException;

    void copyDirectory(File buildScanDirectory, File destinationDirectory) throws IOException;

    Stream<Path> find(Path start, int maxDepth, BiPredicate<Path, BasicFileAttributes> matcher) throws IOException;

}
