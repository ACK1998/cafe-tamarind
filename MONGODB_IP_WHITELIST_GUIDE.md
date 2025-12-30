# MongoDB Atlas IP Whitelist Guide

## For Local Development

1. **Get Your Current IP Address:**
   - Visit: https://whatismyipaddress.com/
   - Or run: `curl ifconfig.me` in terminal

2. **Add IP to MongoDB Atlas:**
   - Go to: https://cloud.mongodb.com/
   - Select your cluster
   - Click **"Network Access"** in the left sidebar
   - Click **"Add IP Address"**
   - Enter your IP address (e.g., `123.456.789.0`)
   - Click **"Confirm"**
   - Wait 1-2 minutes for changes to propagate

3. **Alternative: Allow All IPs (Less Secure, for Development Only):**
   - In Network Access, click **"Add IP Address"**
   - Click **"Allow Access from Anywhere"**
   - This adds `0.0.0.0/0` (allows all IPs)
   - ⚠️ **Warning:** Only use this for development/testing

## For Production (Vercel)

1. **Go to MongoDB Atlas Network Access**
2. **Add IP Address:**
   - Click **"Add IP Address"**
   - Click **"Allow Access from Anywhere"** (adds `0.0.0.0/0`)
   - Or add specific Vercel IP ranges (if available)

3. **Verify Environment Variables in Vercel:**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Ensure `MONGODB_URI` is set correctly
   - Ensure `NODE_ENV=production`

## Quick Fix for Local Development

If you need to work offline or can't whitelist your IP right now, you can temporarily use a local MongoDB instance:

1. Install MongoDB locally: `brew install mongodb-community` (Mac) or download from mongodb.com
2. Update `.env` file:
   ```
   MONGODB_URI=mongodb://localhost:27017/cafe-tamarind
   ```

## Troubleshooting

- **"IP not whitelisted" error:** Make sure you added your IP and waited 1-2 minutes
- **Connection timeout:** Check your internet connection and firewall settings
- **Production still failing:** Verify `MONGODB_URI` is set in Vercel environment variables

