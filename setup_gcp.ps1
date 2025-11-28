# Set the Google Cloud Project ID
$ProjectId = "idyllic-catcher-479617-b6"

Write-Host "Setting Google Cloud Project to $ProjectId..."
gcloud config set project $ProjectId

Write-Host "Project set successfully."
gcloud config get-value project
