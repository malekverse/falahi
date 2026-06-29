param(
  [string]$OutputDir = "./backups"
)

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$outputFile = Join-Path $OutputDir "filahi-backup-$timestamp.sql"

# Ensure output directory exists
New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null

Write-Host "Backing up database to $outputFile ..."

# Requires Supabase CLI with Docker running locally
# The local Supabase instance must be started via: supabase start
supabase db dump --local --file $outputFile 2>&1 | Out-Null

if ($LASTEXITCODE -eq 0) {
  Write-Host "✅ Backup saved to $outputFile"
  
  # Compress
  $gzFile = "$outputFile.gz"
  if (Get-Command gzip -ErrorAction SilentlyContinue) {
    gzip -f $outputFile
    Write-Host "✅ Compressed to $gzFile"
  }
} else {
  Write-Host "❌ Backup failed. Ensure Docker is running and supabase start has been run."
  exit 1
}
