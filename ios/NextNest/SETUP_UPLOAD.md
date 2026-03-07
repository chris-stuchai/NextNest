# One-Time Setup: Automated TestFlight Upload

So the agent can upload builds for you (no manual Transporter step), add App Store Connect API credentials once.

## 1. Create an API Key

1. Go to [App Store Connect](https://appstoreconnect.apple.com/) → **Users and Access** → **Integrations** → **App Store Connect API**
2. Click **Generate API Key** (or +)
3. Name it e.g. "TestFlight Upload"
4. Under Access, select **App Manager** (or Admin)
5. Click **Generate**
6. **Download the .p8 file immediately** (you can only do this once)
7. Note your **Key ID** and **Issuer ID** (shown on the same page)

## 2. Install the Key

```bash
mkdir -p ~/.appstoreconnect/private_keys
mv ~/Downloads/AuthKey_XXXXXXXXXX.p8 ~/.appstoreconnect/private_keys/
chmod 600 ~/.appstoreconnect/private_keys/AuthKey_*.p8
```

(Replace XXXXXXXXXX with your actual Key ID.)

## 3. Add Env Vars (for the script / agent)

Create `nextnest/ios/NextNest/.env.appstore` (this file is gitignored):

```
APP_STORE_API_KEY=XXXXXXXXXX
APP_STORE_ISSUER_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

Use your real Key ID and Issuer ID from App Store Connect.

## 4. Update the Script to Source It

The archive script will load `.env.appstore` if it exists, so uploads run automatically.

After this, running `./scripts/archive-for-testflight.sh` will archive, export, **and upload** to TestFlight.
