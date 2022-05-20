const { SecretsManagerClient, GetSecretValueCommand } = require("@aws-sdk/client-secrets-manager");

const loadToEnv = () => {
    const secretName = process.env.SECRET_NAME;
    const region = "us-east-1";

    // Create a Secrets Manager client
    const client = new SecretsManagerClient({ region });
    const cmd = new GetSecretValueCommand({ SecretId: secretName });

    const response = client.send(cmd)
    const secrets = JSON.stringify(response.SecretString);

    process.env = Object.assign(process.env, secrets);
};

module.exports = {
    loadToEnv
};
