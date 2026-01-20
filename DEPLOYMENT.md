# Deployment Guide (Private Repo)

Since your GitHub repository is **Private**, the free GitHub Pages tier won't work. Use one of these free alternatives that support private repositories securely.

## Option 1: Netlify (Recommended)
Netlify allows you to deploy specific folders from a private repo for free.

1. **Sign up/Log in** to [Netlify](https://app.netlify.com/).
2. Click **"Add new site"** -> **"Import from an existing project"**.
3. Select **GitHub**.
4. Authorize Netlify to access your `PointsDojo_app` repository.
5. In the "Site settings" screen, configure:
   - **Base directory**: `sms-collector-tool`
   - **Build command**: (Leave empty)
   - **Publish directory**: `.` (or leave empty)
6. Click **Deploy Site**.

Netlify will give you a URL like `peaceful-galaxy-123.netlify.app`. The site is now live (but private code remains private).

## Option 2: Vercel
Vercel is also excellent for static sites.

1. **Sign up/Log in** to [Vercel](https://vercel.com/).
2. Click **"Add New..."** -> **"Project"**.
3. Import your `PointsDojo_app` repository.
4. In the "Configure Project" screen:
   - **Framework Preset**: Other
   - **Root Directory**: Click "Edit" and select `sms-collector-tool`.
5. Click **Deploy**.

## Authentication (Optional)
If you want to restrict access to the deployment (so only you/trusted users can see the UI):
- **Netlify**: Settings > Access control (requires paid plan for password protection, or use Netlify Identity for free).
- **Vercel**: "Deployment Protection" (available on Pro, or use a middleware content function, which is advanced).

For this tool, since it's client-side only and doesn't expose any sensitive backend logic, a public URL (obfuscated) is usually acceptable for collecting samples.
