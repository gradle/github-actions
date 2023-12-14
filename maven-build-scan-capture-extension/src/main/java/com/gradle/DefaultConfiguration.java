package com.gradle;

import java.util.HashMap;
import java.util.Map;

class DefaultConfiguration implements Configuration {

    private enum CaptureStrategy {
        ALWAYS, ON_FAILURE, ON_DEMAND
    }

    static final String CONFIG_KEY_BUILD_SCAN_CAPTURE_STRATEGY = "INPUT_BUILD_SCAN_CAPTURE_STRATEGY";
    static final String CONFIG_KEY_BUILD_SCAN_CAPTURE_CURRENT_ENABLED = "CAPTURE_BUILD_SCAN";
    static final String CONFIG_KEY_BUILD_SCAN_CAPTURE_UNPUBLISHED_ENABLED = "INPUT_BUILD_SCAN_CAPTURE_UNPUBLISHED_ENABLED";
    static final String CONFIG_KEY_BUILD_SCAN_CAPTURE_LINK_ENABLED = "INPUT_BUILD_SCAN_CAPTURE_LINK_ENABLED";
    static final String CONFIG_KEY_BUILD_SCAN_DATA_DIR = "BUILD_SCAN_DATA_DIR";
    static final String CONFIG_KEY_BUILD_SCAN_DATA_COPY_DIR = "BUILD_SCAN_DATA_COPY_DIR";
    static final String BUILD_SCAN_LINK_FILE = "BUILD_SCAN_LINK_FILE";
    static final String BUILD_SCAN_METADATA_FILENAME = "BUILD_SCAN_METADATA_FILENAME";
    static final String CONFIG_KEY_JOB_NAME = "INPUT_JOB_NAME";
    static final String CONFIG_KEY_WORKFLOW_NAME = "INPUT_WORKFLOW_NAME";
    static final String CONFIG_KEY_PR_NUMBER = "PR_NUMBER";
    static final String CONFIG_KEY_BUILD_ID = "BUILD_ID";

    final Map<String,String> configuration = new HashMap<>();

    private DefaultConfiguration() {}

    static DefaultConfiguration get() {
        DefaultConfiguration instance = new DefaultConfiguration();

        instance.configuration.put(CONFIG_KEY_WORKFLOW_NAME, getEnvOrDefault(CONFIG_KEY_WORKFLOW_NAME, "unknown workflow name"));
        instance.configuration.put(CONFIG_KEY_JOB_NAME, getEnvOrDefault(CONFIG_KEY_JOB_NAME, "unknown job name"));
        instance.configuration.put(CONFIG_KEY_PR_NUMBER, getEnvOrDefault(CONFIG_KEY_PR_NUMBER, "0"));
        instance.configuration.put(CONFIG_KEY_BUILD_ID, getEnvOrDefault(CONFIG_KEY_BUILD_ID, "0"));
        instance.configuration.put(CONFIG_KEY_BUILD_SCAN_CAPTURE_STRATEGY, getEnvOrDefault(CONFIG_KEY_BUILD_SCAN_CAPTURE_STRATEGY, CaptureStrategy.ALWAYS.name()));
        instance.configuration.put(CONFIG_KEY_BUILD_SCAN_CAPTURE_UNPUBLISHED_ENABLED, getEnvOrDefault(CONFIG_KEY_BUILD_SCAN_CAPTURE_UNPUBLISHED_ENABLED, String.valueOf(true)));
        instance.configuration.put(CONFIG_KEY_BUILD_SCAN_CAPTURE_LINK_ENABLED, getEnvOrDefault(CONFIG_KEY_BUILD_SCAN_CAPTURE_LINK_ENABLED, String.valueOf(true)));
        instance.configuration.put(CONFIG_KEY_BUILD_SCAN_CAPTURE_CURRENT_ENABLED, getEnvOrDefault(CONFIG_KEY_BUILD_SCAN_CAPTURE_CURRENT_ENABLED, String.valueOf(false)));
        instance.configuration.put(CONFIG_KEY_BUILD_SCAN_DATA_DIR, getEnv(CONFIG_KEY_BUILD_SCAN_DATA_DIR));
        instance.configuration.put(CONFIG_KEY_BUILD_SCAN_DATA_COPY_DIR, getEnv(CONFIG_KEY_BUILD_SCAN_DATA_COPY_DIR));
        instance.configuration.put(BUILD_SCAN_LINK_FILE, getEnv(BUILD_SCAN_LINK_FILE));
        instance.configuration.put(BUILD_SCAN_METADATA_FILENAME, getEnv(BUILD_SCAN_METADATA_FILENAME));

        return instance;
    }

    private static String getEnvOrDefault(String key, String defaultValue) {
        String value = getEnv(key);
        return value != null ? value : defaultValue;
    }

    private static String getEnv(String key) {
        return System.getenv(key);
    }

    private CaptureStrategy getCaptureStrategy() {
        return CaptureStrategy.valueOf(configuration.get(CONFIG_KEY_BUILD_SCAN_CAPTURE_STRATEGY));
    }

    public String getWorkflowName() {
        return configuration.get(CONFIG_KEY_WORKFLOW_NAME);
    }

    public String getJobName() {
        return configuration.get(CONFIG_KEY_JOB_NAME);
    }

    public String getPrNumber() {
        return configuration.get(CONFIG_KEY_PR_NUMBER);
    }

    public String getBuildId() {
        return configuration.get(CONFIG_KEY_BUILD_ID);
    }

    public boolean isBuildScanCaptureUnpublishedEnabled(boolean isBuildFailure) {
        return Boolean.parseBoolean(configuration.get(CONFIG_KEY_BUILD_SCAN_CAPTURE_UNPUBLISHED_ENABLED)) && isCaptureRequired(isBuildFailure);
    }

    public boolean isBuildScanCaptureLinkEnabled(boolean isBuildFailure) {
        return Boolean.parseBoolean(configuration.get(CONFIG_KEY_BUILD_SCAN_CAPTURE_LINK_ENABLED)) && isCaptureRequired(isBuildFailure);
    }

    private boolean isCaptureRequired(boolean isBuildFailure) {
        return getCaptureStrategy().equals(CaptureStrategy.ALWAYS)
                || (isBuildFailure && getCaptureStrategy().equals(CaptureStrategy.ON_FAILURE))
                || (Boolean.parseBoolean(configuration.get(CONFIG_KEY_BUILD_SCAN_CAPTURE_CURRENT_ENABLED)) && getCaptureStrategy().equals(CaptureStrategy.ON_DEMAND));
    }

    public String getBuildScanDataDir() {
        return configuration.get(CONFIG_KEY_BUILD_SCAN_DATA_DIR);
    }

    public String getBuildScanDataCopyDir() {
        return configuration.get(CONFIG_KEY_BUILD_SCAN_DATA_COPY_DIR);
    }

    public String getBuildScanLinkFile() {
        return configuration.get(BUILD_SCAN_LINK_FILE);
    }

    public String getBuildScanMetadataFilename() {
        return configuration.get(BUILD_SCAN_METADATA_FILENAME);
    }

    @Override
    public String toString() {
        return "Configuration{" +
                "configuration=" + configuration +
                '}';
    }
}
