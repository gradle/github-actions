package com.gradle;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.io.File;
import java.nio.file.Path;
import java.util.Arrays;
import java.util.function.BiPredicate;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class MavenBuildScanCaptureListenerTest {

    private final MavenBuildScanCaptureListener underTest = new MavenBuildScanCaptureListener();

    @Mock
    private Configuration configurationMock;
    @Mock
    private FileManager fileManagerMock;

    @Test
    void captureUnpublishedBuildScan_success() throws Exception {
        // given
        when(configurationMock.isBuildScanCaptureUnpublishedEnabled(anyBoolean())).thenReturn(true);
        when(configurationMock.getBuildScanDataCopyDir()).thenReturn("copyDir");
        when(configurationMock.getBuildScanDataDir()).thenReturn("dataDir");
        when(configurationMock.getBuildScanMetadataFilename()).thenReturn("metadataFile");
        Path[] paths = {Path.of("foo", "bar"), Path.of("bar", "baz")};
        when(fileManagerMock.find(any(Path.class),anyInt(),any(BiPredicate.class))).thenReturn(Arrays.stream(paths));
        underTest.setConfiguration(configurationMock);
        underTest.setFileManager(fileManagerMock);

        // when
        underTest.captureUnpublishedBuildScan();

        // then
        verify(fileManagerMock, times(1)).copyDirectory(any(File.class),any(File.class));
    }

    @Test
    void captureUnpublishedBuildScan_withCaptureDisabled_doesNothing() throws Exception {
        // given
        when(configurationMock.isBuildScanCaptureUnpublishedEnabled(anyBoolean())).thenReturn(false);
        underTest.setFileManager(fileManagerMock);
        underTest.setConfiguration(configurationMock);

        // when
        underTest.captureUnpublishedBuildScan();

        // then
        verify(fileManagerMock, never()).copyDirectory(any(File.class),any(File.class));
    }

    @Test
    void captureUnpublishedBuildScan_withoutScanDump_doesNothing() throws Exception {
        // given
        when(configurationMock.isBuildScanCaptureUnpublishedEnabled(anyBoolean())).thenReturn(true);
        when(configurationMock.getBuildScanDataDir()).thenReturn("dataDir");
        when(fileManagerMock.find(any(Path.class),anyInt(),any(BiPredicate.class))).thenReturn(Arrays.stream(new Path[]{}));
        underTest.setFileManager(fileManagerMock);
        underTest.setConfiguration(configurationMock);

        // when
        underTest.captureUnpublishedBuildScan();

        // then
        verify(fileManagerMock, never()).copyDirectory(any(File.class),any(File.class));
    }

    @Test
    void captureBuildScanLink_success() throws Exception {
        // given
        when(configurationMock.isBuildScanCaptureLinkEnabled(anyBoolean())).thenReturn(true);
        when(configurationMock.getBuildScanLinkFile()).thenReturn("linkFile");
        underTest.setConfiguration(configurationMock);
        underTest.setFileManager(fileManagerMock);

        // when
        underTest.captureBuildScanLink("https://foo.bar");

        // then
        verify(fileManagerMock, times(1)).writeContent(any(Path.class),anyString());
    }

    @Test
    void captureBuildScanLink_withCaptureDisabled_doesNothing() throws Exception {
        // given
        when(configurationMock.isBuildScanCaptureLinkEnabled(anyBoolean())).thenReturn(false);
        underTest.setConfiguration(configurationMock);
        underTest.setFileManager(fileManagerMock);

        // when
        underTest.captureBuildScanLink("https://foo.bar");

        // then
        verify(fileManagerMock, never()).writeContent(any(Path.class),anyString());
    }

}
