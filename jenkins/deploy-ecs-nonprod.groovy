library 'spwAWScentailze-jenkins-library'
deployIconwebsiteECS(
    label: "qa",
	applicationName: "frontend",
	imageName: "spw/iconwebsit-fe",
	ecrURL: "002274633774.dkr.ecr.ap-southeast-1.amazonaws.com",
	registryURL: "https://harbor-dev.onesiam.com",
	taskDifinationFile: "ecs/nonprod-definition-fe.json",
	serviceFile: "ecs/nonprod-service-fe.json",
	awsAccessKeyID: "AWS-ACCESS-KEY-NONPROD",
	awsSecretKeyID: "AWS-SECRET-KEY-NONPROD"
)
