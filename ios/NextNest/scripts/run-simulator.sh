#!/bin/bash
# Run NextNest in the iOS Simulator (no TestFlight needed)
set -e
cd "$(dirname "$0")/.."
SIM="iPhone 17"
# Use iPhone 16 if 17 isn't available
xcrun simctl list devices available | grep -q "iPhone 17 " || SIM="iPhone 16"
echo "Building for $SIM..."
xcodebuild -scheme NextNest -project NextNest.xcodeproj -destination "platform=iOS Simulator,name=$SIM" -derivedDataPath build/DerivedData build 2>/dev/null
echo "Launching Simulator..."
open -a Simulator
sleep 2
APP=$(find build/DerivedData -name "NextNest.app" -path "*iphonesimulator*" | head -1)
if [ -z "$APP" ]; then
  echo "App not found. Run from Xcode (⌘R) instead."
  exit 1
fi
xcrun simctl boot "$SIM" 2>/dev/null || true
xcrun simctl install booted "$APP"
xcrun simctl launch booted com.nextnest.app
echo "App launched."
