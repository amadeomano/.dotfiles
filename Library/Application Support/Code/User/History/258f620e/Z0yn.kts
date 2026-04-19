import org.springframework.boot.gradle.plugin.SpringBootPlugin

plugins {
    val helmPluginVersion = "2.0.0"
    val kotlinPluginVersion = "2.0.10"
    jacoco
    kotlin("jvm") version kotlinPluginVersion
    kotlin("kapt") version kotlinPluginVersion
    kotlin("plugin.spring") version kotlinPluginVersion
    kotlin("plugin.serialization") version kotlinPluginVersion

    id("org.springframework.boot") version "3.3.3"
    id("org.jlleitschuh.gradle.ktlint") version "12.1.1"
    id("org.unbroken-dome.helm") version helmPluginVersion
    id("org.unbroken-dome.helm-releases") version helmPluginVersion

    // DB
    id("com.revolut.jooq-docker") version "0.3.12"

    // Only apply when pact tests are run
    id("au.com.dius.pact") version "4.6.14"

    // for sonarqube analysis
    id("org.sonarqube") version "5.1.0.4882"

    // For generating openapi yaml
    id("org.springdoc.openapi-gradle-plugin") version "1.9.0"

    id("com.personio.pluginmanager") version "3.1.6"

    // Temporary for manual updating of web routes
    id("com.personio.papi.papi-openapi") version "0.0.3"
}

group = "personio.payroll"
version = "0.0.1-SNAPSHOT"

tasks {
    test {
        systemProperties["pact.verifier.publishResults"] = System.getenv("CI_COMMIT_REF_NAME") == "master"
        disableKotestAutoScan()
        useJUnitPlatform()
        useJUnitPlatform {
            excludeTags("integration")
            excludeTags("component")
        }
        extensions.configure(JacocoTaskExtension::class) {
            excludes = listOf("*/component/*")
        }
    }

    task<Test>("integrationTest") {
        disableKotestAutoScan()
        group = "verification"
        description = "Runs integration tests."
        useJUnitPlatform {
            includeTags("integration")
        }
        shouldRunAfter(test)
    }

    task<Test>("componentTest") {
        disableKotestAutoScan()
        group = "verification"
        description = "Runs component tests."
        useJUnitPlatform {
            includeTags("component")
        }
        shouldRunAfter("integrationTest")
    }

    check {
        dependsOn("integrationTest", "componentTest")
    }

    jacocoTestReport {
        val jacocoDir = "${layout.buildDirectory.get()}/jacoco"
        executionData(files("$jacocoDir/test.exec", "$jacocoDir/integrationTest.exec"))
        reports {
            csv.required = false
            html.required = true
            xml.required = true
            html.outputLocation.set(file("$jacocoDir/html"))
            xml.outputLocation.set(file("${layout.buildDirectory.get()}/test-results/test/xml/jacocoReport.xml"))
        }
        dependsOn(test, "integrationTest", "componentTest")
    }

    bootRun {
        args = listOf("--spring.profiles.active=local")
        environment["ENVIRONMENT"] = "local"
    }

    task<Exec>("startPostgresqlContainer") {
        commandLine(
            "docker",
            "run",
            "-d",
            "--rm",
            "--name=bootRunPostgreSQL",
            "-e",
            "POSTGRES_PASSWORD=password",
            "-e",
            "POSTGRES_USER=personio",
            "-e",
            "POSTGRES_DB=payroll-international-service",
            "-p",
            "5432:5432",
            "postgres:14.4",
        )

        doLast {
            println("Postgresql container started.")
        }
    }

    task<Exec>("stopPostgresqlContainer") {
        doFirst {
            println("Stopping Postgresql container...")
        }
        commandLine("sh", "-c", "docker stop $(docker ps -q --filter ancestor=postgres:14.4)")

        doLast {
            println("Postgresql container stopped.")
        }
    }
    generateOpenApiDocs {
        doNotTrackState("https://github.com/springdoc/springdoc-openapi-gradle-plugin/issues/131")
        apiDocsUrl = "http://localhost:8080/v3/api-docs.yaml"
        outputDir = file("$projectDir")
        outputFileName = "openapi.yaml"
        waitTimeInSeconds = 120
        doLast {
            copy {
                from("$projectDir/openapi.yaml")
                into("$projectDir/papi-contracts/")
            }
        }
    }
}

ktlint {
    version.set("1.0.1")
}

// GRPC - remove if not needed
val grpcSpringBootVersion = "3.1.0.RELEASE"
val authNClientLibraryVersion = "5.1.0"

dependencies {
    implementation(kotlin("stdlib"))

    runtimeOnly("io.netty:netty-resolver-dns-native-macos:4.1.107.Final:osx-aarch_64")

    // Personio Framework
    implementation("com.personio.framework:commons-identifiers:1.4.0")

    // Authentication
    implementation("com.personio:kotlin-multitenancy:4.7.4") {
        exclude("org.springframework.boot", "spring-boot-dependencies")
    }
    implementation("com.personio.platform.kotlin-authentication-client:spring-webmvc:5.1.0")
    implementation("org.springframework.boot:spring-boot-starter-security")
    testImplementation("com.personio.platform.kotlin-authentication-client:spring-testkit:5.1.0")

    // Authorization
    implementation("com.personio.platform.authorisation-service-client:client:4.0.0")

    // Payroll core types
    implementation("com.personio.payroll:core:2.3.0")
    implementation("com.personio.payroll:identity:2.3.0")
    // ulid generation
    implementation("com.github.f4b6a3:ulid-creator:5.2.3")

    // Platform Dependencies
    implementation(platform(SpringBootPlugin.BOM_COORDINATES))
    implementation(platform("com.personio.lf:bom:3.0.4"))
    kapt(platform(SpringBootPlugin.BOM_COORDINATES))
    kapt("org.springframework.boot:spring-boot-configuration-processor")
    implementation("org.springframework.boot:spring-boot-starter-web")
    implementation("org.springframework.boot:spring-boot-starter-actuator")
    implementation("org.springframework.boot", "spring-boot-starter-webflux")

    // GRPC related
    implementation(dataRegistry.protocGenGrpcKotlin)
    implementation("net.devh:grpc-client-spring-boot-starter:$grpcSpringBootVersion")

    implementation("com.personio.platform.kotlin-authentication-client:spring-grpc:$authNClientLibraryVersion")
    implementation(
        "com.personio.platform.kotlin-authentication-client:s2s-spring-grpcclient:$authNClientLibraryVersion",
    )

    // DB
    implementation("org.postgresql:postgresql:42.7.4")
    jdbc("org.postgresql:postgresql:42.7.4")
    implementation("org.jooq:jooq:3.19.11")
    implementation("org.springframework.boot:spring-boot-starter-jooq")
    implementation("org.flywaydb:flyway-core")
    implementation("org.flywaydb:flyway-database-postgresql:10.17.2")

    // Misc Dependencies
    implementation(kotlin("reflect"))
    implementation("com.personio.feature-flags:spring")
    implementation("org.apache.httpcomponents.client5:httpclient5")
    // Json handling
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.7.2")

    // Metrics/logging/alerts
    implementation("io.micrometer:micrometer-registry-statsd")
    implementation("net.logstash.logback:logstash-logback-encoder:8.0")

    // TODO: Noisy startup log see issue: https://github.com/getsentry/sentry-java/issues/3042
    implementation("io.sentry:sentry-spring-boot-starter-jakarta:7.14.0")

    // AWS Dependencies
    implementation(platform("software.amazon.awssdk:bom:2.27.16"))
    implementation("software.amazon.awssdk:sts") {
        because("Required for com.personio.feature-flags:spring to properly resolve API key from SSM")
    }

    // Payslip html to pdf implementation
    implementation("org.xhtmlrenderer:flying-saucer-core:9.8.0")
    implementation("org.xhtmlrenderer:flying-saucer-pdf:9.9.1")
    implementation("com.itextpdf:itextpdf:5.5.13.4")
    implementation("io.pebbletemplates:pebble:3.2.2")

    // xml libraries for FPS
    implementation("org.apache.santuario:xmlsec:4.0.2")

    // SQS
    implementation("de.personio.coroutine:sqs-listener-spring-starter:12.3.3")

    // Test Related
    val mockkVersion = "1.13.12"
    testImplementation("org.springframework.boot:spring-boot-starter-test")
    testImplementation("org.mockito.kotlin:mockito-kotlin:5.3.1")
    testImplementation("org.mockito:mockito-inline:5.2.0")
    testImplementation("io.mockk:mockk:$mockkVersion")
    testImplementation("com.ninja-squad:springmockk:4.0.2")
    testImplementation("org.jetbrains.kotlin:kotlin-test:2.0.20")

    testImplementation("com.personio:database-test-support")
    testImplementation("com.fasterxml.jackson.module:jackson-module-kotlin")

    val kotestVersion = "5.9.1"
    testImplementation("io.kotest:kotest-assertions-core:$kotestVersion")
    testImplementation("io.kotest:kotest-assertions-json:$kotestVersion")
    testImplementation("io.kotest:kotest-framework-datatest:$kotestVersion")
    testImplementation("io.kotest:kotest-runner-junit5:$kotestVersion")

    val konsistVersion = "0.15.1"
    testImplementation("com.lemonappdev:konsist:$konsistVersion")

    // Pact Tests
    val pactVersion = "4.6.13"
    testImplementation("au.com.dius.pact.consumer:junit5:$pactVersion")
    testImplementation("au.com.dius.pact.provider:junit5:$pactVersion")
    testImplementation("au.com.dius.pact.consumer:kotlin:$pactVersion")

    //
    val mockWebServerVersion = "4.12.0"
    testImplementation("com.squareup.okhttp3:okhttp:$mockWebServerVersion")
    testImplementation("com.squareup.okhttp3:mockwebserver:$mockWebServerVersion")

    // Utility to compare XMLs for testing
    val xmlUnitVersion = "2.10.0"
    testImplementation("org.xmlunit:xmlunit-core:$xmlUnitVersion")
    testImplementation("org.xmlunit:xmlunit-matchers:$xmlUnitVersion")

    // Generate openapi spec & docs
    implementation("org.springdoc:springdoc-openapi-starter-webmvc-ui:2.6.0")
    testImplementation("io.swagger.core.v3:swagger-core:2.2.23") {
        because("Needed after v2.0.3 or springdoc for Hikaku to work")
    }

    testImplementation("com.codeborne:pdf-test:1.9.0")

    // Testcontainers
    testImplementation(platform("org.testcontainers:testcontainers-bom:1.20.1"))
    testImplementation("org.testcontainers:postgresql")

    // Authentication test related
    testImplementation(
        "com.personio.platform.kotlin-authentication-client:s2s-spring-testkit:$authNClientLibraryVersion",
    )
    // Adding gRPC server capabilities only to test our client
    testImplementation("net.devh:grpc-server-spring-boot-starter:$grpcSpringBootVersion")
}

/**
 * This removes the following warning:
 *
 * Warning: Kotest autoscan is enabled. This means Kotest will scan the classpath for extensions that are annotated with @AutoScan.
 * To avoid this startup cost, disable autoscan by setting the system property 'kotest.framework.classpath.scanning.autoscan.disable=true'.
 * In 6.0 this value will default to true. For further details see https://kotest.io/docs/next/framework/project-config.html#runtime-detection
 */
fun Test.disableKotestAutoScan() {
    systemProperties["kotest.framework.classpath.scanning.autoscan.disable"] = true
}
