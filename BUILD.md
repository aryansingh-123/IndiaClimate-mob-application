# IndiaClimate: builds and release

Builds run in the cloud with EAS Build, so no local Android Studio is needed.
Run every command from the project folder. `eas-cli` is run with `npx`.

## One-time setup

1. Log in to Expo (creates a free account if you don't have one):

   ```bash
   npx eas-cli@latest login
   ```

2. Link this project to an EAS project. This writes a `projectId` into `app.json`:

   ```bash
   npx eas-cli@latest init
   ```

3. Check the Android package name in `app.json` (`android.package`). It is set to
   `com.indiaclimate.app`. Change it before your first upload: the Play Store
   does not allow changing it afterwards.

## Build types

| Build | Command | Output |
|---|---|---|
| Development build (runs the dev server, with live reload) | `npx eas-cli@latest build --profile development --platform android` | APK to install on the phone |
| Test APK (standalone, no dev server) | `npx eas-cli@latest build --profile preview --platform android` | APK |
| Play Store bundle | `npx eas-cli@latest build --profile production --platform android` | AAB (version code bumps automatically) |

For a development build, install the APK, then start the dev server:

```bash
npx expo start --dev-client
```

Scan the QR code from the development build app. Expo Go is not used: the map,
location, and WebView modules are not all in Expo Go.

## Publishing to Google Play

1. Create the app in the Google Play Console. Upload the AAB from the production build
   (or let EAS upload it, see below).
2. Create a Google Play service account and download its JSON key. Save it as
   `google-service-account.json` in the project folder. It is already excluded from git by `.gitignore`.
3. Upload:

   ```bash
   npx eas-cli@latest submit --platform android --profile production
   ```

4. In the Play Console, complete:
   - **Privacy policy URL.** The app asks for location, so a policy is required.
   - **Data safety form.** Declare location (used to show weather, not shared, not
     stored on a server). Declare no background location: the app does not request it.
   - **Location permission declaration.** The app requests foreground location only.
   - **Content rating and target audience.**

## Permissions in the build

- `ACCESS_COARSE_LOCATION` and `ACCESS_FINE_LOCATION`: foreground only.
- No background location (`isAndroidBackgroundLocationEnabled` is `false` in `app.json`).
- Internet access, used for the weather APIs and map tiles.

## Known items before release

- **Open-Meteo** free data is for non-commercial use. This app is personal, so the free
  tier applies. Keep the attribution line on Home.
- **OpenStreetMap tiles** use the public server. Fine for personal use. A public release
  with many users needs a hosted tile provider.
- **iOS icon** still uses the template in `assets/expo.icon`. The Android icon and splash
  are generated from `assets/branding/logo.svg`.
