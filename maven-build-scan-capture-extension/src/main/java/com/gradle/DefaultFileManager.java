package com.gradle;

import org.apache.commons.io.FileUtils;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.nio.file.attribute.BasicFileAttributes;
import java.util.function.BiPredicate;
import java.util.stream.Stream;

class DefaultFileManager implements FileManager {

    @Override
    public void writeContent(Path filePath, String content) throws IOException {
        Files.write(filePath, content.getBytes(), StandardOpenOption.CREATE, StandardOpenOption.APPEND);
    }

    @Override
    public void copyDirectory(File buildScanDirectory, File destinationDirectory) throws IOException {
        FileUtils.copyDirectory(buildScanDirectory, destinationDirectory);
    }

    @Override
    public Stream<Path> find(Path start,
                             int maxDepth,
                             BiPredicate<Path, BasicFileAttributes> matcher) throws IOException {
        return Files.find(start, maxDepth, matcher);
    }
}
