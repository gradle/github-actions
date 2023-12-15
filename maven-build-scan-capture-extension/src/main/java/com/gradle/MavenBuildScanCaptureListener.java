package com.gradle;

import com.gradle.maven.extension.api.GradleEnterpriseApi;
import com.gradle.maven.extension.api.GradleEnterpriseListener;
import org.apache.maven.execution.MavenSession;
import org.apache.maven.rtinfo.internal.DefaultRuntimeInformation;
import org.codehaus.plexus.component.annotations.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.io.IOException;
import java.lang.reflect.InvocationTargetException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Optional;
import java.util.stream.Stream;

@SuppressWarnings("unused")
@Component(
        role = GradleEnterpriseListener.class,
        hint = "maven-build-scan-capture-extension",
        description = "Maven Build Scan capture extension"
)
public final class MavenBuildScanCaptureListener implements GradleEnterpriseListener {

    private static final Logger LOGGER = LoggerFactory.getLogger(MavenBuildScanCaptureListener.class);
    private static final String USER_HOME_SYSTEM_PROPERTY = "user.home";
    private static final String BUILD_SCAN_DATA_ORIGINAL_DIR = ".m2/.gradle-enterprise/build-scan-data/";
    private static final String SCAN_DUMP_REGEX = ".*/build-scan-data/.*/previous/.*/scan.scan";
    private static final String BUILD_SCAN_METADATA_FILENAME = "build-scan-metadata.properties";
    private static final String BUILD_SCAN_LINK_FILENAME = "build-scan-links.properties";

    private final BuildState buildState = new BuildState();
    private Configuration configuration = DefaultConfiguration.get();
    private FileManager fileManager = new DefaultFileManager();

    public void setConfiguration(Configuration configuration) {
        this.configuration = configuration;
    }
    public void setFileManager(FileManager fileManager) {
        this.fileManager = fileManager;
    }

    @Override
    public void configure(GradleEnterpriseApi gradleEnterpriseApi, MavenSession session) {
        LOGGER.info("Configuring extension: " + getClass().getSimpleName());
        LOGGER.debug(configuration.toString());

        // Set Maven goals
        buildState.setMavenVersion(getMavenVersion());
        buildState.setMavenGoals(String.join(" ", session.getRequest().getGoals()));

        // Capture build result
        gradleEnterpriseApi.getBuildScan().buildFinished(buildResult -> {
            if(!buildResult.getFailures().isEmpty()) {
                LOGGER.debug("Marking build failure");
                buildState.setBuildFailure();
            }
        });

        // Capture build scan link
        gradleEnterpriseApi.getBuildScan().buildScanPublished(buildScan -> {
            captureBuildScanLink(buildScan.getBuildScanUri().toString());
        });

        // Capture unpublished build scan with a shutdown hook
        // The gradleEnterpriseApi.getBuildScan().buildFinished callback is called too early to collect the previous build scan
        Runtime.getRuntime().addShutdownHook(new Thread(this::captureUnpublishedBuildScan));
    }

    private static String getMavenVersion() {
        try {
            // trying to fetch Maven version from internal class
            Class<?> rtInfoClass = Class.forName("org.apache.maven.rtinfo.internal.DefaultRuntimeInformation", true, MavenBuildScanCaptureListener.class.getClassLoader());
            DefaultRuntimeInformation rtInfo = (DefaultRuntimeInformation) rtInfoClass.getDeclaredConstructor().newInstance();
            return rtInfo.getMavenVersion();
        } catch (ClassNotFoundException | NoSuchMethodException | InstantiationException | IllegalAccessException |
                 InvocationTargetException e) {
            LOGGER.info("Unable to fetch Maven version " + e.getMessage());
        }

        return "unknown";
    }

    private String getUserHome() {
        return System.getProperty(USER_HOME_SYSTEM_PROPERTY);
    }

    void captureUnpublishedBuildScan() {
      if(configuration.isBuildScanCaptureUnpublishedEnabled(buildState.isBuildFailure())) {
          LOGGER.info("Configuring unpublished Build Scan capture");

          File buildScanDirectory = new File(getUserHome(), BUILD_SCAN_DATA_ORIGINAL_DIR);

          try (Stream<Path> pathStream = fileManager.find(Paths.get(getUserHome(), BUILD_SCAN_DATA_ORIGINAL_DIR),
                  Integer.MAX_VALUE,
                  (filePath, fileAttr) -> filePath.toString().replace("\\","/").matches(SCAN_DUMP_REGEX) && fileAttr.isRegularFile())) {
              Optional<Path> scanDumpPath = pathStream.findFirst();
              if (scanDumpPath.isPresent()) {
                  LOGGER.debug("Capturing Build Scan metadata for " + scanDumpPath.get());
                  captureBuildScanMetadata(scanDumpPath.get().getParent().toString());

                  File destinationDirectory = new File(configuration.getBuildScanDataCopyDir());
                  LOGGER.debug("Saving unpublished build scan to " + destinationDirectory.getAbsolutePath());
                  fileManager.copyDirectory(buildScanDirectory, destinationDirectory);
              } else {
                  LOGGER.debug("No unpublished build scan found");
              }
          } catch (IOException e) {
              LOGGER.warn("Could not capture unpublished build scan link", e);
          }
      } else {
          LOGGER.debug("Build scan capture disabled");
      }
    }

    void captureBuildScanMetadata(String scanDumpDir) {
        try {
            LOGGER.debug("Capturing [" + buildState.getMavenGoals() + "] in " + scanDumpDir);

            String summary =
                    String.format("PR_NUMBER=%s\nWORKFLOW_NAME=%s\nJOB_NAME=%s\nMAVEN_VERSION=%s\nGOAL=%s\nBUILD_FAILURE=%s\n",
                        configuration.getPrNumber(),
                        configuration.getWorkflowName(),
                        configuration.getJobName(),
                        buildState.getMavenVersion(),
                        buildState.getMavenGoals(),
                        buildState.isBuildFailure()
                    );
            fileManager.writeContent(Paths.get(scanDumpDir, BUILD_SCAN_METADATA_FILENAME), summary);
        } catch (IOException e) {
            LOGGER.warn("Could not create build metadata file", e);
        }
    }

    void captureBuildScanLink(String buildScanLink) {
        if(configuration.isBuildScanCaptureLinkEnabled(buildState.isBuildFailure())) {
            LOGGER.info("Capturing Build Scan link");
            buildState.setBuildScanLink(buildScanLink);

            try {
                LOGGER.debug("Adding to Build Scan link file " + configuration.getBuildId() + "=" + buildState.getBuildScanLink());
                String content = String.format("%s=%s\n", configuration.getBuildId(), buildState.getBuildScanLink());
                fileManager.writeContent(Paths.get(getUserHome(), BUILD_SCAN_LINK_FILENAME), content);
            } catch (IOException e) {
                LOGGER.warn("Could not add build scan link to build summary", e);
            }
        } else {
            LOGGER.debug("Build scan link capture disabled");
        }
    }

}
