# Madplan Backend

## Deploy på Render.com

1. Upload disse filer til et NYT GitHub repository kaldet `madplan-backend`
2. Gå til render.com → "New" → "Web Service"
3. Forbind dit `madplan-backend` repository
4. Udfyld:
   - **Name:** madplan-backend
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
5. Klik på "Environment" → "Add Environment Variable":
   - **Key:** `ANTHROPIC_API_KEY`
   - **Value:** (din API nøgle — indtast den her, den er hemmelig)
6. Klik "Create Web Service"
7. Vent 2-3 minutter — du får en URL som: `https://madplan-backend.onrender.com`
