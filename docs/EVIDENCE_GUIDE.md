# Evidence Guide

This document explains the evidence files collected during deployment and how to validate them.

## Evidence Files

### `service-describe-*.json`
- **Description**: Output of `gcloud run services describe`.
- **Validation**: Check `status.url` for the deployed service URL and `status.conditions` for "Ready" status.

### `service-url.txt`
- **Description**: The public URL of the deployed Cloud Run service.
- **Validation**: Can be used to access the service.

### `status.json`
- **Description**: Response from the `/status` endpoint.
- **Validation**: Should contain `commit_sha` matching the deployed commit and `ready: true`.

### `run_response.json`
- **Description**: Response from the `/run_agent` endpoint.
- **Validation**: Should contain a `run_id` and `status: ok`.

### `cloud-build-list.json`
- **Description**: List of recent Cloud Build builds.
- **Validation**: Verify that a build was triggered and succeeded for the deployment.

## How to Verify
1.  Download the evidence artifact.
2.  Inspect the JSON files to ensure the service is running the correct version.
3.  Visit the URL in `service-url.txt` to manually verify the service is up.
