const fs = require('fs');
const path = require('path');

// Function to display usage
function usage() {
  console.log('Usage: generate_webhook_openapi.js --template <template> --buildpack-language <language>');
  process.exit(1);
}

// Parse command-line arguments
const args = process.argv.slice(2);
const argMap = {};

for (let i = 0; i < args.length; i += 2) {
  const key = args[i];
  const value = args[i + 1];
  if (!key.startsWith('--') || !value) {
    console.error(`Invalid argument: ${key}`);
    usage();
  }
  argMap[key.replace('--', '')] = value;
}

// Validate required arguments
const template = argMap['template'];
const buildpackLanguage = argMap['buildpack-language'];

if (!template || !buildpackLanguage) {
  console.error('Error: Both --template and --buildpack-language are required.');
  usage();
}

// Condition to check TEMPLATE and BUILDPACK_LANGUAGE
if (
  template === 'webhook' ||
  (template === 'buildpackWebhook' && buildpackLanguage === 'ballerina')
) {
  // Paths for the files
  const swaggerDir = path.join(process.cwd(), 'swagger');
  const serviceOpenapiPath = path.join(swaggerDir, 'service_openapi.yaml');
  const ignoreOpenapiPath = path.join(swaggerDir, 'ignore_openapi.yaml');
  const webhookOpenapiPath = path.join(swaggerDir, 'webhook_openapi.yaml');

  // Ensure swagger directory exists
  if (!fs.existsSync(swaggerDir)) {
    fs.mkdirSync(swaggerDir, { recursive: true });
  }

  // Remove existing files
  if (fs.existsSync(serviceOpenapiPath)) fs.unlinkSync(serviceOpenapiPath);
  if (fs.existsSync(ignoreOpenapiPath)) fs.unlinkSync(ignoreOpenapiPath);

  // Base64 encoded OpenAPI file content
  const base64Content =
    'b3BlbmFwaTogMy4wLjEKaW5mbzoKICB0aXRsZTogV2ViaG9vayBPcGVuYXBpIFlhbWwKICB2ZXJzaW9uOiAxLjAuMAp4LXdzbzItZGlzYWJsZS1zZWN1cml0eTogdHJ1ZQpzZXJ2ZXJzOgogIC0gdXJsOiAie3NlcnZlcn06e3BvcnR9IgogICAgdmFyaWFibGVzOgogICAgICBzZXJ2ZXI6CiAgICAgICAgZGVmYXVsdDogaHR0cDovL2xvY2FsaG9zdAogICAgICBwb3J0OgogICAgICAgIGRlZmF1bHQ6ICI4MDkwIgpwYXRoczoKICAvOgogICAgcG9zdDoKICAgICAgc3VtbWFyeTogIiIKICAgICAgb3BlcmF0aW9uSWQ6IG9wZXJhdGlvbl9wb3N0Xy8KICAgICAgcmVzcG9uc2VzOgogICAgICAgICIyMDAiOgogICAgICAgICAgZGVzY3JpcHRpb246IE9rCiAgICAgICAgICBjb250ZW50OgogICAgICAgICAgICB0ZXh0L3BsYWluOgogICAgICAgICAgICAgIHNjaGVtYToKICAgICAgICAgICAgICAgIHR5cGU6IHN0cmluZwogICAgICAgICI1MDAiOgogICAgICAgICAgZGVzY3JpcHRpb246IEZvdW5kIHVuZXhwZWN0ZWQgb3V0cHV0CiAgICBnZXQ6CiAgICAgIHN1bW1hcnk6ICIiCiAgICAgIG9wZXJhdGlvbklkOiBvcGVyYXRpb25fZ2V0Xy8KICAgICAgcmVzcG9uc2VzOgogICAgICAgICIyMDIiOgogICAgICAgICAgZGVzY3JpcHRpb246IE9rCiAgICAgICAgICBjb250ZW50OgogICAgICAgICAgICB0ZXh0L3BsYWluOgogICAgICAgICAgICAgIHNjaGVtYToKICAgICAgICAgICAgICAgIHR5cGU6IHN0cmluZwogICAgICAgICI1MDAiOgogICAgICAgICAgZGVzY3JpcHRpb246IEZvdW5kIHVuZXhwZWN0ZWQgb3V0cHV0CmNvbXBvbmVudHM6IHt9Cg==';

  // Decode and write to file
  fs.writeFileSync(webhookOpenapiPath, Buffer.from(base64Content, 'base64').toString('utf8'));
  console.log(`Generated OpenAPI file at ${webhookOpenapiPath}`);
} else {
  console.log('Condition not met. Exiting.');
}
