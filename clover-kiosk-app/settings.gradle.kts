pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}

dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
        // Clover SDK repository
        maven { url = uri("https://clover.github.io/maven-repo") }
    }
}

rootProject.name = "CloverKiosk"
include(":app")
