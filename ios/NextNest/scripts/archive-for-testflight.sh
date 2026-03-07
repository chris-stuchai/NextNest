#!/bin/bash
# Bump build, archive, export IPA, and upload to TestFlight.
# Run this after iOS changes when ready for device testing.
# One-time setup: see SETUP_UPLOAD.md for App Store Connect API key.
set -e
cd "$(dirname "$0")/.."

# Load API credentials if .env.appstore exists
[ -f .env.appstore ] && source .env.appstore

# Bump build number
CURRENT=$(grep -m1 "CURRENT_PROJECT_VERSION" NextNest.xcodeproj/project.pbxproj | sed 's/.*= *\([0-9]*\).*/\1/')
NEW=$((CURRENT + 1))
echo "Bumping build $CURRENT -> $NEW"
sed -i '' "s/CURRENT_PROJECT_VERSION = $CURRENT;/CURRENT_PROJECT_VERSION = $NEW;/g" NextNest.xcodeproj/project.pbxproj
sed -i '' "s/CURRENT_PROJECT_VERSION: \"$CURRENT\"/CURRENT_PROJECT_VERSION: \"$NEW\"/" project.yml 2>/dev/null || true

# Archive
echo "Archiving..."
xcodebuild -scheme NextNest -project NextNest.xcodeproj -configuration Release \
  -archivePath build/NextNest.xcarchive -destination "generic/platform=iOS" archive

# Export
echo "Exporting IPA..."
xcodebuild -exportArchive -archivePath build/NextNest.xcarchive \
  -exportPath build/export -exportOptionsPlist ExportOptions.plist

echo ""
IPA="$PWD/build/export/NextNest.ipa"
echo "IPA ready: $IPA"

# Auto-upload if App Store Connect API keys are set
if [ -n "$APP_STORE_API_KEY" ] && [ -n "$APP_STORE_ISSUER_ID" ]; then
  echo "Uploading to App Store Connect..."
  if xcrun altool --upload-app -f "$IPA" --type ios --apiKey "$APP_STORE_API_KEY" --apiIssuer "$APP_STORE_ISSUER_ID"; then
    echo "Upload complete. Build will appear in TestFlight in ~15–60 min."
  else
    echo "Upload failed. Check .p8 is in ~/.appstoreconnect/private_keys/AuthKey_$APP_STORE_API_KEY.p8"
    exit 1
  fi
elif [ "$1" = "--upload" ]; then
  # Open Transporter and folder so user can drag IPA in
  echo "Opening Transporter + export folder - drag NextNest.ipa in, then Deliver."
  open -a "Transporter" 2>/dev/null || true
  open "$(dirname "$IPA")"
else
  echo "To upload: open Transporter, drag in the IPA, click Deliver."
  echo "Or run: $0 --upload  (opens Transporter with the IPA)"
  echo "For automated upload: set APP_STORE_API_KEY and APP_STORE_ISSUER_ID"
fi
