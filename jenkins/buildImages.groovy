library 'spwK8Scentailze-jenkins-library'
buildImage(
    label: "build",
    registryId: "HARBOR-DEV-CREDENTIAL",
    dockerTaget: "Dockerfile",
    registryURL: "harbor-dev.onesiam.com",
    imageName: "spw/iconwebsite-fe",
    appName: "iconwebsite-fe",
    scanFlag: "yes",
    programLanguage: "typeScript",
    sonarSources: "src",
    sonarExclusions: "",
    replicateToECR: "yes"
)
