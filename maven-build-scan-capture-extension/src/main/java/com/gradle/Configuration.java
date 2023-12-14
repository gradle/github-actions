package com.gradle;

interface Configuration {

    String getWorkflowName();

    String getJobName();

    String getPrNumber();

    String getBuildId();

    boolean isBuildScanCaptureUnpublishedEnabled(boolean isBuildFailure);

    boolean isBuildScanCaptureLinkEnabled(boolean isBuildFailure);

    String getBuildScanDataDir();

    String getBuildScanDataCopyDir();

    String getBuildScanLinkFile();

    String getBuildScanMetadataFilename();

}
