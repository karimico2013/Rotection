import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import cors from 'cors';
import dotenv from 'dotenv';
import firebaseConfig from './firebase-applet-config.json' with { type: 'json' };

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors());

// --- Discord Vercel Domain Protection Verification Routes ---
app.get('/_discord.rotection.vercel.app', (req, res) => {
  res.type('text/plain');
  res.send('dh=400e111fe3a4eb8e85ef5d18d183cf7835e0f497');
});

app.get('/_discord.rotection.vercel.app.txt', (req, res) => {
  res.type('text/plain');
  res.send('dh=400e111fe3a4eb8e85ef5d18d183cf7835e0f497');
});

  // Enrich and Save Discovered Games
  app.post('/api/games/enrich', async (req, res) => {
    console.log('Received discovered games for enrichment...');
    try {
      const { games } = req.body;
      if (!games || !Array.isArray(games)) {
        throw new Error('INVALID_DATA');
      }

      const enrichedGames = [];

      for (const game of games) {
        try {
          const placeId = game.placeId;
          
          // Get Universe ID
          const placeDetailsRes = await fetch(`https://games.roblox.com/v1/games/multiget-place-details?placeIds=${placeId}`);
          const placeDetails = await placeDetailsRes.json();
          
          if (placeDetails && placeDetails[0]) {
            const universeId = placeDetails[0].universeId;
            
            // Get Thumbnail URL (Icon)
            const thumbnailRes = await fetch(`https://thumbnails.roblox.com/v1/games/icons?universeIds=${universeId}&size=512x512&format=Png&isCircular=false`);
            const thumbnailData = await thumbnailRes.json();
            
            // Get Gallery Thumbnail (Banner)
            const bannerRes = await fetch(`https://thumbnails.roblox.com/v1/games/multiget/thumbnails?universeIds=${universeId}&countPerUniverse=1&defaults=true&size=768x432&format=Png&isCircular=false`);
            const bannerData = await bannerRes.json();

            const imgUrl = thumbnailData.data?.[0]?.imageUrl || '';
            const bannerUrl = bannerData.data?.[0]?.thumbnails?.[0]?.imageUrl || imgUrl;
            const gameLink = `https://www.roblox.com/games/${placeId}`;

            enrichedGames.push({
              ...game,
              universeId,
              imgUrl,
              bannerUrl,
              gameLink,
              status: 'AI Scanned',
              updatedAt: new Date().toISOString()
            });
          }
        } catch (err) {
          console.error(`Error enriching game:`, err);
        }
      }

      res.json({ games: enrichedGames });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // --- Fallback Database Layer ---
  let isFallbackMode = false;
  let hasMissingConfig = false;
  let lastFallbackErrorTime = 0;
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!email || !key || !process.env.GOOGLE_SHEET_ID) {
    console.warn("⚠️ Google Sheets configuration variables are missing. Running in In-Memory Local Fallback Database Mode!");
    isFallbackMode = true;
    hasMissingConfig = true;
  }

  const proxyRobloxUrl = (url: string): string => {
    if (!url) return '';
    if (url.startsWith('https://thumbnails.roblox.com/')) {
      return `/api/roblox-img-proxy?url=${encodeURIComponent(url)}`;
    }
    return url;
  };

  // Initial Seed Data for Fallback/In-Memory Mode
  let localGames = [
    {
      id: "theme-park-tycoon-2",
      title: "Theme Park Tycoon 2",
      studio: "Den_S",
      description: "Construct and operate your own theme park! Arrange paths, rides, and decorations.",
      ageGroup: "All Ages",
      category: "Simulation",
      gameLink: "https://www.roblox.com/games/183132717/Theme-Park-Tycoon-2",
      shieldScore: 98,
      status: "Verified Safe",
      imgUrl: "https://thumbnails.roblox.com/v1/assets?assetIds=183132717&size=420x420&format=Png&isCircular=false",
      rating: 4.8,
      metrics: { honesty: 98, safety: 99, fairness: 96, ageAppropriateness: 99 },
      updatedAt: new Date().toISOString()
    },
    {
      id: "adopt-me",
      title: "Adopt Me!",
      studio: "DreamCraft",
      description: "Adopt pets, decorate your house, and explore the magical island of Adoption Island!",
      ageGroup: "All Ages",
      category: "Roleplay",
      gameLink: "https://www.roblox.com/games/920587260/Adopt-Me",
      shieldScore: 92,
      status: "Verified Safe",
      imgUrl: "https://thumbnails.roblox.com/v1/assets?assetIds=920587260&size=420x420&format=Png&isCircular=false",
      rating: 4.5,
      metrics: { honesty: 90, safety: 95, fairness: 92, ageAppropriateness: 91 },
      updatedAt: new Date().toISOString()
    },
    {
      id: "brookhaven-rp",
      title: "Brookhaven RP",
      studio: "Wolfpaq",
      description: "A place to roleplay with like minded people. Own and live in amazing houses, drive cool vehicles and explore the city.",
      ageGroup: "All Ages",
      category: "Roleplay",
      gameLink: "https://www.roblox.com/games/4924144855/Brookhaven-RP",
      shieldScore: 94,
      status: "Verified Safe",
      imgUrl: "https://thumbnails.roblox.com/v1/assets?assetIds=4924144855&size=420x420&format=Png&isCircular=false",
      rating: 4.7,
      metrics: { honesty: 95, safety: 93, fairness: 96, ageAppropriateness: 94 },
      updatedAt: new Date().toISOString()
    }
  ];

  let localPosts = [
    {
      id: "post-1",
      title: "Introducing Rotection Security Platform",
      excerpt: "Learn how Rotection modernizes Roblox safety with deep threat telemetry and decentralized reporting.",
      content: "# Modernizing Roblox Safety\n\nRoblox experiences are vast, but security checks shouldn't be secondary. Rotection operates a multi-vector security framework that assesses game honesty, safety, fairness, and overall age-appropriateness. We partner directly with creators, auditors, and active players to create transparent ledger reports.",
      author: "Rotection Security Team",
      date: new Date().toISOString(),
      image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=60",
      category: "Announcements"
    },
    {
      id: "post-2",
      title: "The Danger of Simulated Microtransactions",
      excerpt: "Exploring safety violations in gamified mechanics and how to identify deceptive monetization loops.",
      content: "# Understanding Deceptive Monetization\n\nMany modern experiences employ dark patterns to encourage continuous purchasing. Rotection auditors analyze scripts for aggressive premium triggers, randomized loops with undisclosed odds, and pay-to-win barriers.",
      author: "Auditing Division",
      date: new Date().toISOString(),
      image: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop&q=60",
      category: "Safety Reports"
    }
  ];

  let localReviews = [
    {
      gameId: "theme-park-tycoon-2",
      userId: "test-user-id",
      userName: "NPC",
      userPhoto: "",
      text: "Outstanding design, zero predatory monetization. Extremely high safety standards.",
      rating: 5,
      createdAt: new Date().toISOString(),
      robloxId: "12345"
    }
  ];

  let localReports = [
    {
      gameId: "theme-park-tycoon-2",
      userId: "test-user-id",
      userName: "NPC",
      userPhoto: "",
      type: "Monetization Audit",
      description: "Verified all transactions. Highly educational.",
      evidence: "None",
      severity: "Low",
      createdAt: new Date().toISOString(),
      robloxId: "12345"
    }
  ];

  let localUsers = [
    {
      uid: "test-user-id",
      username: "NPC",
      displayName: "NPC",
      bio: "The Owner & Founder of Rotection.",
      role: "owner",
      photoURL: "https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=12345&size=420x420&format=Png&isCircular=false",
      robloxUsername: "NOPURPOSECREATED",
      robloxId: "12345",
      creationDate: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    }
  ];

  // --- Google Sheets Core Logic ---
  const getSheetDoc = async () => {
    const activeEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || email;
    let activeKey = process.env.GOOGLE_PRIVATE_KEY || key;
    if (activeKey) {
      activeKey = activeKey.trim();
      if (activeKey.startsWith('"') && activeKey.endsWith('"')) {
        activeKey = activeKey.slice(1, -1);
      }
      if (activeKey.startsWith("'") && activeKey.endsWith("'")) {
        activeKey = activeKey.slice(1, -1);
      }
      activeKey = activeKey.replace(/\\n/g, '\n');
    }
    let sheetId = process.env.GOOGLE_SHEET_ID;
    if (!activeEmail || !activeKey || !sheetId) throw new Error('GOOGLE_CONFIG_MISSING');

    const serviceAccountAuth = new JWT({
      email: activeEmail,
      key: activeKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    if (sheetId.includes('/d/')) {
      sheetId = sheetId.split('/d/')[1].split('/')[0];
    }

    const doc = new GoogleSpreadsheet(sheetId, serviceAccountAuth);
    await doc.loadInfo();
    return doc;
  };

  const getSheetDocSafe = async () => {
    try {
      const activeEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || email;
      const activeKey = process.env.GOOGLE_PRIVATE_KEY || key;
      const activeSheetId = process.env.GOOGLE_SHEET_ID;

      if (!activeEmail || !activeKey || !activeSheetId) {
        hasMissingConfig = true;
        return null;
      }
      
      if (hasMissingConfig) return null;

      // Cooldown check: if previous call timed out or failed, wait 30 seconds before retrying to prevent blocking/hanging routing threads
      if (lastFallbackErrorTime > 0 && (Date.now() - lastFallbackErrorTime < 30000)) {
        return null; // Silent skip during cooldown period
      }

      // Enforce a strict 6-second timeout block.
      // If the Google Sheets API is hanging/down, we resolve to local fallback immediately without blocking Express.
      const doc = await Promise.race([
        getSheetDoc(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Google Sheets request timed out after 6000ms')), 6000)
        )
      ]);

      // Successfully connected! Clear out any transient error states
      lastFallbackErrorTime = 0;
      isFallbackMode = false;
      return doc;
    } catch (e: any) {
      console.warn("⚠️ Failed to load Google Sheets doc, switching to local in-memory fallback!", e);
      lastFallbackErrorTime = Date.now();
      isFallbackMode = true;
      return null;
    }
  };

  app.post('/api/sync-sheets', async (req, res) => {
    try {
      // Dynamically load Google Sheets to see if it succeeds
      const doc = await getSheetDoc();
      isFallbackMode = false;
      lastFallbackErrorTime = 0;
      hasMissingConfig = false;

      // Ensure key sheets exist
      const requiredSheets = ['Games', 'Posts', 'Reviews', 'Reports', 'Users'];
      const docSheetTitles = Object.keys(doc.sheetsByTitle);
      const createdSheets: string[] = [];

      for (const title of requiredSheets) {
        if (!doc.sheetsByTitle[title]) {
          let headers: string[] = [];
          if (title === 'Games') {
            headers = ['id', 'Title', 'Studio', 'Description', 'Age Group', 'Category', 'Game Link', 'Safety Score', 'Status', 'Thumbnail', 'Ratings', 'Honesty', 'Safety', 'Fairness', 'Age-appropriate', 'Last Updated'];
          } else if (title === 'Posts') {
            headers = ['ID', 'Title', 'Content', 'Author', 'Role', 'Date', 'Category'];
          } else if (title === 'Reviews') {
            headers = ['ID', 'GameID', 'Author', 'Role', 'Rating', 'Content', 'Date'];
          } else if (title === 'Reports') {
            headers = ['ID', 'GameID', 'Reporter', 'ReporterRole', 'Reason', 'Description', 'Evidence', 'Severity', 'Date'];
          } else if (title === 'Users') {
            headers = ['UID', 'Username', 'Description', 'Role', 'Creation Date', 'Last Updated', 'PhotoURL', 'RobloxUsername', 'RobloxID', 'Password'];
          }
          await doc.addSheet({ title, headerValues: headers });
          createdSheets.push(title);
        }
      }

      res.json({
        success: true,
        message: 'Google Sheets synced successfully! Real-time synchronization is fully active. All 5 central databases (Games, Users, Reports, Reviews, Posts) are linked and validated.',
        createdTables: createdSheets,
        availableTables: docSheetTitles.concat(createdSheets)
      });
    } catch (error: any) {
      console.warn("Failed manual sync of Google Sheets:", error);
      
      const activeEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || email;
      const activeKey = process.env.GOOGLE_PRIVATE_KEY || key;
      const activeSheetId = process.env.GOOGLE_SHEET_ID;

      if (!activeEmail || !activeKey || !activeSheetId || error.message === 'GOOGLE_CONFIG_MISSING') {
        // Return a successful, graceful response informing them we are gracefully in fallback mode
        return res.json({
          success: true,
          fallback: true,
          message: 'System is running in memory-cached Local Database Fallback mode (fully operational, with local tables for Games, Users, Reports, Reviews, and Posts). Once environment variables are linked, full live sync will automatically configure!'
        });
      }

      res.status(400).json({
        error: `Could not connect to Google Sheets. Verify that your Google Service Account email has 'Editor' permission on structural Sheet ID [${activeSheetId}]. Details: ${error.message}`
      });
    }
  });

  // --- Games API ---
  const getRowVal = (row: any, keys: string[]) => {
    if (!row) return '';
    
    // google-spreadsheet v4+ uses row.get(key)
    if (typeof row.get === 'function') {
      const headers = row._sheet?.headerValues || [];
      for (const key of keys) {
        const target = key.toLowerCase().trim();
        const foundHeader = headers.find((h: string) => h.toLowerCase().trim() === target);
        if (foundHeader !== undefined) {
          const val = row.get(foundHeader);
          if (val !== undefined && val !== null) {
            return val;
          }
        }
      }
      
      // Fallback: try direct property lookup
      for (const key of keys) {
        const target = key.toLowerCase().trim();
        for (const k of Object.keys(row)) {
          if (k.toLowerCase().trim() === target && row[k] !== undefined && row[k] !== null) {
            return row[k];
          }
        }
      }
    } else {
      // Direct raw property lookup for fallback local memory objects
      for (const key of keys) {
        const target = key.toLowerCase().trim();
        const foundKey = Object.keys(row).find(k => k.toLowerCase().trim() === target);
        if (foundKey && row[foundKey] !== undefined && row[foundKey] !== null) {
          return row[foundKey];
        }
      }
    }
    return '';
  };

  app.get('/api/games', async (req, res) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    try {
      const doc = await getSheetDocSafe();
      if (isFallbackMode || !doc) {
        const mapped = localGames.map(g => ({
          ...g,
          imgUrl: proxyRobloxUrl(g.imgUrl)
        }));
        return res.json(mapped);
      }
      try {
        const gameSheet = doc.sheetsByTitle['Games'] || doc.sheetsByIndex[0];
        if (!gameSheet) {
          throw new Error('No sheets available in Google Spreadsheet');
        }
        const rows = await gameSheet.getRows();
        
        const games = rows.map((row, index) => {
          const title = getRowVal(row, ['Game Name', 'Title', 'Name']);
          const gameId = getRowVal(row, ['Game ID', 'id', 'ID']) || title.toString().toLowerCase().replace(/[^a-z0-9]+/g, '-') || `game-${index}`;
          
          return {
            id: gameId.toString().trim(),
            title: title,
            studio: getRowVal(row, ['Creators', 'Studio', 'Author', 'Creator']),
            description: getRowVal(row, ['Description', 'Game Description', 'About', 'Desc']),
            ageGroup: getRowVal(row, ['Age Group', 'Rating', 'Age']),
            category: getRowVal(row, ['Category', 'Genre', 'Type']),
            gameLink: getRowVal(row, ['Game Link', 'URL', 'Link']),
            shieldScore: parseFloat(getRowVal(row, ['Safety Score', 'Shield Score', 'Score'])) || 0,
            status: getRowVal(row, ['Status', 'Verification', 'State']),
            imgUrl: proxyRobloxUrl(getRowVal(row, ['Thumbnail', 'Icon', 'Image', 'Img'])),
            rating: parseFloat(getRowVal(row, ['Ratings', 'User Rating', 'Stars'])) || 0,
            metrics: {
              honesty: parseFloat(getRowVal(row, ['Honesty'])) || 0,
              safety: parseFloat(getRowVal(row, ['Safety'])) || 0,
              fairness: parseFloat(getRowVal(row, ['Fairness'])) || 0,
              ageAppropriateness: parseFloat(getRowVal(row, ['Age-appropriate', 'Appropriateness'])) || 0
            },
            updatedAt: getRowVal(row, ['Last Updated', 'Date', 'Updated']) || new Date().toISOString()
          };
        }).filter(g => g.title);
        res.json(games);
      } catch (sheetErr: any) {
        console.error("❌ Failed to query games from sheet, serving local games fallback:", sheetErr);
        const mapped = localGames.map(g => ({
          ...g,
          imgUrl: proxyRobloxUrl(g.imgUrl)
        }));
        return res.json(mapped);
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/games/:id', async (req, res) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    try {
      const { id } = req.params;
      const doc = await getSheetDocSafe();
      if (isFallbackMode || !doc) {
        const game = localGames.find(g => g.id.toLowerCase() === id.trim().toLowerCase());
        if (!game) return res.status(404).json({ error: 'Game not found' });
        return res.json({
          ...game,
          imgUrl: proxyRobloxUrl(game.imgUrl)
        });
      }
      try {
        const gameSheet = doc.sheetsByTitle['Games'] || doc.sheetsByIndex[0];
        if (!gameSheet) {
          throw new Error('No sheet found');
        }
        const rows = await gameSheet.getRows();
        
        const targetId = id.toString().trim().toLowerCase();
        const row = rows.find((r, index) => {
          const title = getRowVal(r, ['Game Name', 'Title', 'Name']);
          const rowGameId = (getRowVal(r, ['Game ID', 'id', 'ID']) || title.toString().toLowerCase().replace(/[^a-z0-9]+/g, '-') || `game-${index}`).toString().trim().toLowerCase();
          return rowGameId === targetId;
        });

        if (!row) {
          console.warn(`Game lookup failed for ID: "${id}"`);
          return res.status(404).json({ error: 'Game not found' });
        }

        const foundIndex = rows.indexOf(row);
        const title = getRowVal(row, ['Game Name', 'Title', 'Name']);
        const computedId = getRowVal(row, ['Game ID', 'id', 'ID']) || title.toString().toLowerCase().replace(/[^a-z0-9]+/g, '-') || `game-${foundIndex}`;
        
        res.json({
          id: computedId,
          title: title,
          studio: getRowVal(row, ['Creators', 'Studio', 'Author', 'Creator']),
          description: getRowVal(row, ['Description', 'Game Description', 'About', 'Desc']),
          ageGroup: getRowVal(row, ['Age Group', 'Rating', 'Age']),
          category: getRowVal(row, ['Category', 'Genre', 'Type']),
          gameLink: getRowVal(row, ['Game Link', 'URL', 'Link']),
          shieldScore: parseFloat(getRowVal(row, ['Safety Score', 'Shield Score', 'Score'])) || 0,
          status: getRowVal(row, ['Status', 'Verification', 'State']),
          imgUrl: proxyRobloxUrl(getRowVal(row, ['Thumbnail', 'Icon', 'Image', 'Img'])),
          rating: parseFloat(getRowVal(row, ['Ratings', 'User Rating', 'Stars'])) || 0,
          metrics: {
            honesty: parseFloat(getRowVal(row, ['Honesty'])) || 0,
            safety: parseFloat(getRowVal(row, ['Safety'])) || 0,
            fairness: parseFloat(getRowVal(row, ['Fairness'])) || 0,
            ageAppropriateness: parseFloat(getRowVal(row, ['Age-appropriate', 'Appropriateness'])) || 0
          }
        });
      } catch (sheetErr: any) {
        console.error("❌ Failed to query game detail from sheet, serving from local games list:", sheetErr);
        const game = localGames.find(g => g.id.toLowerCase() === id.trim().toLowerCase());
        if (!game) return res.status(404).json({ error: 'Game not found' });
        return res.json({
          ...game,
          imgUrl: proxyRobloxUrl(game.imgUrl)
        });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // --- Posts (Blog) API ---
  app.get('/api/posts', async (req, res) => {
    try {
      const doc = await getSheetDocSafe();
      if (isFallbackMode || !doc) {
        return res.json(localPosts);
      }
      try {
        let postSheet = doc.sheetsByTitle['Posts'];
        if (!postSheet) {
          postSheet = await doc.addSheet({ title: 'Posts', headerValues: ['ID', 'Title', 'Excerpt', 'Content', 'Author', 'Date', 'Image', 'Category'] });
        }
        const rows = await postSheet.getRows();
        const posts = rows.map(r => ({
          id: r.get('ID'),
          title: r.get('Title'),
          excerpt: r.get('Excerpt'),
          content: r.get('Content'),
          author: r.get('Author'),
          date: r.get('Date'),
          image: r.get('Image'),
          category: r.get('Category')
        }));
        res.json(posts);
      } catch (sheetErr: any) {
        console.error("❌ Failed to query posts from sheet, serving local posts fallback:", sheetErr);
        return res.json(localPosts);
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/posts', async (req, res) => {
    try {
      const doc = await getSheetDocSafe();
      const newPostObj = {
        id: `POST-${Date.now()}`,
        title: req.body.title,
        excerpt: req.body.description || req.body.excerpt,
        content: req.body.content,
        author: req.body.author,
        date: new Date().toISOString(),
        image: req.body.image,
        category: req.body.category
      };
      if (isFallbackMode || !doc) {
        localPosts.push(newPostObj);
        return res.json(newPostObj);
      }
      let postSheet = doc.sheetsByTitle['Posts'];
      if (!postSheet) {
        postSheet = await doc.addSheet({ title: 'Posts', headerValues: ['ID', 'Title', 'Excerpt', 'Content', 'Author', 'Date', 'Image', 'Category'] });
      }
      const newPost = {
        'ID': newPostObj.id,
        'Title': newPostObj.title,
        'Excerpt': newPostObj.excerpt,
        'Content': newPostObj.content,
        'Author': newPostObj.author,
        'Date': newPostObj.date,
        'Image': newPostObj.image,
        'Category': newPostObj.category
      };
      await postSheet.addRow(newPost);
      res.json(newPostObj);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete('/api/posts/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const doc = await getSheetDocSafe();
      if (isFallbackMode || !doc) {
        localPosts = localPosts.filter(p => p.id !== id);
        return res.json({ message: 'Post deleted' });
      }
      const postSheet = doc.sheetsByTitle['Posts'];
      if (!postSheet) return res.status(404).json({ error: 'Post sheet not found' });
      
      const rows = await postSheet.getRows();
      const row = rows.find(r => r.get('ID') === id);
      if (row) {
        await row.delete();
        res.json({ message: 'Post deleted' });
      } else {
        res.status(404).json({ error: 'Post not found' });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // --- Reviews API ---
  app.get('/api/games/:id/reviews', async (req, res) => {
    try {
      const { id } = req.params;
      const doc = await getSheetDocSafe();
      if (isFallbackMode || !doc) {
        const reviews = localReviews.filter(r => r.gameId === id);
        return res.json(reviews);
      }
      try {
        let reviewSheet = doc.sheetsByTitle['Reviews'];
        if (!reviewSheet) {
          reviewSheet = await doc.addSheet({ title: 'Reviews', headerValues: ['GameID', 'UserID', 'Username', 'PhotoURL', 'Text', 'Rating', 'CreatedAt', 'RobloxID'] });
        }
        const rows = await reviewSheet.getRows();
        const reviews = rows.filter(r => r.get('GameID') === id).map(r => ({
          gameId: r.get('GameID'),
          userId: r.get('UserID'),
          userName: r.get('Username'),
          userPhoto: r.get('PhotoURL'),
          text: r.get('Text'),
          rating: parseFloat(r.get('Rating')),
          createdAt: r.get('CreatedAt'),
          robloxId: r.get('RobloxID')
        }));
        res.json(reviews);
      } catch (sheetErr: any) {
        console.error("❌ Failed to query reviews from sheet, serving local reviews fallback:", sheetErr);
        const reviews = localReviews.filter(r => r.gameId === id);
        return res.json(reviews);
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/games/:id/reviews', async (req, res) => {
    try {
      const { id } = req.params;
      const doc = await getSheetDocSafe();
      const payload = {
        'GameID': id,
        'UserID': req.body.userId,
        'Username': req.body.userName,
        'PhotoURL': req.body.userPhoto,
        'Text': req.body.text,
        'Rating': req.body.rating,
        'CreatedAt': new Date().toISOString(),
        'RobloxID': req.body.robloxId
      };
      if (isFallbackMode || !doc) {
        localReviews.push({
          gameId: payload.GameID,
          userId: payload.UserID,
          userName: payload.Username,
          userPhoto: payload.PhotoURL,
          text: payload.Text,
          rating: parseFloat(payload.Rating as string) || 0,
          createdAt: payload.CreatedAt,
          robloxId: payload.RobloxID
        });
        return res.json(payload);
      }
      let reviewSheet = doc.sheetsByTitle['Reviews'];
      await reviewSheet.addRow(payload);
      res.json(payload);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // --- Reports API ---
  app.get('/api/games/:id/reports', async (req, res) => {
    try {
      const { id } = req.params;
      const doc = await getSheetDocSafe();
      if (isFallbackMode || !doc) {
        const reports = localReports.filter(r => r.gameId === id);
        return res.json(reports);
      }
      try {
        let reportSheet = doc.sheetsByTitle['Reports'];
        if (!reportSheet) {
          reportSheet = await doc.addSheet({ title: 'Reports', headerValues: ['GameID', 'UserID', 'Username', 'PhotoURL', 'Type', 'Description', 'Evidence', 'Severity', 'CreatedAt', 'RobloxID'] });
        }
        const rows = await reportSheet.getRows();
        const reports = rows.filter(r => r.get('GameID') === id).map(r => ({
          gameId: r.get('GameID'),
          userId: r.get('UserID'),
          userName: r.get('Username'),
          userPhoto: r.get('PhotoURL'),
          type: r.get('Type'),
          description: r.get('Description'),
          evidence: r.get('Evidence'),
          severity: r.get('Severity'),
          createdAt: r.get('CreatedAt'),
          robloxId: r.get('RobloxID')
        }));
        res.json(reports);
      } catch (sheetErr: any) {
        console.error("❌ Failed to query reports from sheet, serving local reports fallback:", sheetErr);
        const reports = localReports.filter(r => r.gameId === id);
        return res.json(reports);
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/games/:id/reports', async (req, res) => {
    try {
      const { id } = req.params;
      const doc = await getSheetDocSafe();
      const payload = {
        'GameID': id,
        'UserID': req.body.userId,
        'Username': req.body.userName,
        'PhotoURL': req.body.userPhoto,
        'Type': req.body.type,
        'Description': req.body.description,
        'Evidence': req.body.evidence,
        'Severity': req.body.severity,
        'CreatedAt': new Date().toISOString(),
        'RobloxID': req.body.robloxId
      };
      if (isFallbackMode || !doc) {
        localReports.push({
          gameId: payload.GameID,
          userId: payload.UserID,
          userName: payload.Username,
          userPhoto: payload.PhotoURL,
          type: payload.Type,
          description: payload.Description,
          evidence: payload.Evidence,
          severity: payload.Severity,
          createdAt: payload.CreatedAt,
          robloxId: payload.RobloxID
        });
        return res.json(payload);
      }
      let reportSheet = doc.sheetsByTitle['Reports'];
      await reportSheet.addRow(payload);
      res.json(payload);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // --- Roblox Verification API ---
  app.get('/api/roblox/user/:username', async (req, res) => {
    try {
      const { username } = req.params;
      
      // 1. Get User ID from Username
      const searchRes = await fetch('https://users.roblox.com/v1/usernames/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usernames: [username], excludeBannedUsers: true })
      });
      const searchData: any = await searchRes.json();
      
      if (!searchData.data || searchData.data.length === 0) {
        return res.status(404).json({ error: 'User not found on Roblox' });
      }
      
      const userId = searchData.data[0].id;
      const verifiedUsername = searchData.data[0].name;

      // 2. Get Profile Description
      const profileRes = await fetch(`https://users.roblox.com/v1/users/${userId}`);
      const profileData: any = await profileRes.json();

      res.json({
        userId: userId,
        username: verifiedUsername,
        description: profileData.description,
        displayName: profileData.displayName
      });
    } catch (error: any) {
      console.error('Roblox Proxy Error:', error);
      res.status(500).json({ error: 'Failed to fetch Roblox data' });
    }
  });

  // Proxy for User Avatars
  app.get('/api/roblox/thumbnails/user-avatar', async (req, res) => {
    try {
      const { userId } = req.query;
      if (!userId) return res.status(400).json({ error: 'userId is required' });
      
      const response = await fetch(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=420x420&format=Png&isCircular=false`);
      const data = await response.json();
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Proxy for Game Icons
  app.get('/api/roblox/thumbnails/game-icon', async (req, res) => {
    try {
      const { universeId } = req.query;
      if (!universeId) return res.status(400).json({ error: 'universeId is required' });
      
      const response = await fetch(`https://thumbnails.roblox.com/v1/games/icons?universeIds=${universeId}&size=512x512&format=Png&isCircular=false`);
      const data = await response.json();
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Proxy for Game Thumbnails
  app.get('/api/roblox/thumbnails/game-banner', async (req, res) => {
    try {
      const { universeId } = req.query;
      if (!universeId) return res.status(400).json({ error: 'universeId is required' });
      
      const response = await fetch(`https://thumbnails.roblox.com/v1/games/multiget/thumbnails?universeIds=${universeId}&countPerUniverse=1&defaults=true&size=768x432&format=Png&isCircular=false`);
      const data = await response.json();
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Universal Roblox Proxy Image Redirector
  app.get('/api/roblox-img-proxy', async (req, res) => {
    try {
      const { url } = req.query;
      if (!url || typeof url !== 'string') {
        return res.status(400).send('url parameter is required');
      }
      
      const response = await fetch(url);
      if (!response.ok) {
        return res.redirect('https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80');
      }
      
      const json: any = await response.json();
      let imageUrl = '';
      
      if (json.data && json.data[0]) {
        const item = json.data[0];
        if (item.thumbnails && item.thumbnails[0]) {
          imageUrl = item.thumbnails[0].imageUrl;
        } else {
          imageUrl = item.imageUrl;
        }
      }
      
      if (imageUrl) {
        const imgRes = await fetch(imageUrl);
        if (imgRes.ok) {
          const contentType = imgRes.headers.get('content-type') || 'image/png';
          res.setHeader('Content-Type', contentType);
          res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache image for 24 hours
          
          const arrayBuffer = await imgRes.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          return res.send(buffer);
        } else {
          return res.redirect(imageUrl); // fallback to redirect if fetching fails
        }
      } else {
        return res.redirect('https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80');
      }
    } catch (error) {
      console.error('Error in roblox-img-proxy:', error);
      return res.redirect('https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80');
    }
  });

  app.get('/api/users/:uid/activity', async (req, res) => {
    try {
      const { uid } = req.params;
      const doc = await getSheetDocSafe();
      
      if (isFallbackMode || !doc) {
        const userReviews = localReviews.filter(r => r.userId === uid).map((r, index) => ({
          type: 'comment',
          id: `comment-${index}`,
          gameId: r.gameId,
          text: r.text,
          rating: r.rating,
          createdAt: r.createdAt
        }));
        const userReports = localReports.filter(r => r.userId === uid).map((r, index) => ({
          type: 'report',
          id: `report-${index}`,
          gameId: r.gameId,
          description: r.description,
          overallRating: parseFloat(r.severity) || 0,
          createdAt: r.createdAt
        }));
        const activity = [...userReviews, ...userReports];
        activity.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        return res.json(activity);
      }
      
      const reviewSheet = doc.sheetsByTitle['Reviews'];
      const reportSheet = doc.sheetsByTitle['Reports'];
      
      let activity: any[] = [];
      
      if (reviewSheet) {
        const reviewRows = await reviewSheet.getRows();
        const userReviews = reviewRows.filter(r => r.get('UserID') === uid).map(r => ({
          type: 'comment',
          id: `comment-${r.rowNumber}`,
          gameId: r.get('GameID'),
          text: r.get('Text'),
          rating: parseFloat(r.get('Rating')),
          createdAt: r.get('CreatedAt')
        }));
        activity = [...activity, ...userReviews];
      }
      
      if (reportSheet) {
        const reportRows = await reportSheet.getRows();
        const userReports = reportRows.filter(r => r.get('UserID') === uid).map(r => ({
          type: 'report',
          id: `report-${r.rowNumber}`,
          gameId: r.get('GameID'),
          description: r.get('Description'),
          overallRating: parseFloat(r.get('Severity')) || 0,
          createdAt: r.get('CreatedAt')
        }));
        activity = [...activity, ...userReports];
      }
      
      activity.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      res.json(activity);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // --- App Users (Sheet-First Session) ---
  app.get('/api/users/check', async (req, res) => {
    try {
      const { robloxId } = req.query;
      if (!robloxId) return res.status(400).json({ error: 'robloxId query parameter is required' });

      const doc = await getSheetDocSafe();

      if (isFallbackMode || !doc) {
        const user = (localUsers as any[]).find(u => u.robloxId === robloxId.toString());
        if (!user) return res.json({ exists: false });
        return res.json({ 
          exists: true, 
          hasPassword: !!user.password, 
          uid: user.uid,
          displayName: user.displayName,
          robloxId: user.robloxId,
          robloxUsername: user.robloxUsername,
          photoURL: proxyRobloxUrl(user.photoURL)
        });
      }

      const userSheet = doc.sheetsByTitle['Users'];
      if (!userSheet) return res.json({ exists: false });

      const rows = await userSheet.getRows();
      const row = rows.find(r => r.get('RobloxID') === robloxId.toString());
      if (!row) return res.json({ exists: false });

      return res.json({
        exists: true,
        hasPassword: !!row.get('Password'),
        uid: row.get('UID'),
        displayName: row.get('Username'),
        robloxId: row.get('RobloxID'),
        robloxUsername: row.get('RobloxUsername'),
        photoURL: proxyRobloxUrl(row.get('PhotoURL'))
      });
    } catch (error: any) {
      console.error('Check user error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/users/login', async (req, res) => {
    try {
      const { robloxId, password } = req.body;
      if (!robloxId || !password) return res.status(400).json({ error: 'robloxId and password are required' });

      const doc = await getSheetDocSafe();

      if (isFallbackMode || !doc) {
        const user = (localUsers as any[]).find(u => u.robloxId === robloxId.toString());
        if (!user) return res.status(404).json({ error: 'User profile not registered.' });
        if (!user.password) return res.status(400).json({ error: 'This profile does not have a password. Please verify using Roblox description instead.' });
        if (user.password !== password) return res.status(401).json({ error: 'Incorrect password. Access denied.' });
        
        return res.json({
          uid: user.uid,
          displayName: user.displayName,
          bio: user.bio,
          role: user.role,
          photoURL: proxyRobloxUrl(user.photoURL),
          robloxUsername: user.robloxUsername,
          robloxId: user.robloxId
        });
      }

      const userSheet = doc.sheetsByTitle['Users'];
      if (!userSheet) return res.status(404).json({ error: 'Users directory not found.' });

      const rows = await userSheet.getRows();
      const row = rows.find(r => r.get('RobloxID') === robloxId.toString());
      if (!row) return res.status(404).json({ error: 'User profile not registered.' });

      const storedPass = row.get('Password');
      if (!storedPass) return res.status(400).json({ error: 'This profile does not have a password. Please verify using Roblox description instead.' });
      if (storedPass !== password) return res.status(401).json({ error: 'Incorrect password. Access denied.' });

      return res.json({ 
        uid: row.get('UID'),
        displayName: row.get('Username'),
        bio: row.get('Description'),
        role: row.get('Role'),
        photoURL: proxyRobloxUrl(row.get('PhotoURL')),
        robloxUsername: row.get('RobloxUsername'),
        robloxId: row.get('RobloxID')
      });
    } catch (error: any) {
      console.error('Password login error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/users/:uid', async (req, res) => {
    try {
      const { uid } = req.params;
      const doc = await getSheetDocSafe();

      if (isFallbackMode || !doc) {
        const user = localUsers.find(u => u.uid === uid);
        if (!user) return res.status(404).json({ error: 'User not found' });
        return res.json({ 
          uid: user.uid,
          displayName: user.displayName,
          bio: user.bio,
          role: user.role,
          photoURL: proxyRobloxUrl(user.photoURL),
          robloxUsername: user.robloxUsername,
          robloxId: user.robloxId
        });
      }

      const userSheet = doc.sheetsByTitle['Users'];
      if (!userSheet) return res.status(404).json({ error: 'Users sheet not found' });

      const rows = await userSheet.getRows();
      const row = rows.find(r => r.get('UID') === uid);
      
      if (!row) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      res.json({ 
        uid: row.get('UID'),
        displayName: row.get('Username'),
        bio: row.get('Description'),
        role: row.get('Role'),
        photoURL: proxyRobloxUrl(row.get('PhotoURL')),
        robloxUsername: row.get('RobloxUsername'),
        robloxId: row.get('RobloxID')
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/users/register', async (req, res) => {
    try {
      const { uid, username, bio, robloxId, robloxUsername, password } = req.body;
      const doc = await getSheetDocSafe();

      const avatarRes = await fetch(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${robloxId}&size=420x420&format=Png&isCircular=false`);
      const avatarData: any = await avatarRes.json();
      const photoURL = avatarData.data?.[0]?.imageUrl || `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${robloxId}&size=420x420&format=Png&isCircular=false`;

      if (isFallbackMode || !doc) {
        const existingIdx = localUsers.findIndex(u => u.uid === uid.toString());
        const role = existingIdx !== -1 ? localUsers[existingIdx].role : 'user';
        const userObj = {
          uid: uid.toString(),
          username,
          displayName: username,
          bio: bio || '',
          role,
          photoURL,
          robloxUsername,
          robloxId: robloxId.toString(),
          password: password || '',
          creationDate: existingIdx !== -1 ? localUsers[existingIdx].creationDate : new Date().toISOString(),
          lastUpdated: new Date().toISOString()
        };
        if (existingIdx !== -1) {
          localUsers[existingIdx] = userObj;
        } else {
          localUsers.push(userObj);
        }
        return res.json({
          uid: userObj.uid,
          displayName: userObj.username,
          bio: userObj.bio,
          role: userObj.role,
          photoURL: proxyRobloxUrl(userObj.photoURL),
          robloxUsername: userObj.robloxUsername,
          robloxId: userObj.robloxId
        });
      }

      let userSheet = doc.sheetsByTitle['Users'];
      if (!userSheet) {
        userSheet = await doc.addSheet({ 
          title: 'Users', 
          headerValues: ['UID', 'Username', 'Description', 'Role', 'Creation Date', 'Last Updated', 'PhotoURL', 'RobloxUsername', 'RobloxID', 'Password'] 
        });
      } else {
        try {
          await userSheet.loadHeaderRow();
          if (!userSheet.headerValues.includes('Password')) {
            const updatedHeaders = [...userSheet.headerValues, 'Password'];
            await userSheet.setHeaderRow(updatedHeaders);
          }
        } catch (hErr) {
          console.warn('Failed to dynamically append Password header, continuing with existing', hErr);
        }
      }

      const rows = await userSheet.getRows();
      let existingRow = rows.find(r => r.get('UID') === uid.toString());

      const payload = {
        'UID': uid.toString(),
        'Username': username,
        'Description': bio || '',
        'Role': existingRow ? (existingRow.get('Role') || 'user') : 'user',
        'Creation Date': existingRow ? existingRow.get('Creation Date') : new Date().toISOString(),
        'Last Updated': new Date().toISOString(),
        'PhotoURL': photoURL,
        'RobloxUsername': robloxUsername,
        'RobloxID': robloxId.toString(),
        'Password': password || ''
      };

      if (existingRow) {
        existingRow.assign(payload);
        await existingRow.save();
      } else {
        await userSheet.addRow(payload);
      }
      
      res.json({
        uid: payload.UID,
        displayName: payload.Username,
        bio: payload.Description,
        role: payload.Role,
        photoURL: proxyRobloxUrl(payload.PhotoURL),
        robloxUsername: payload.RobloxUsername,
        robloxId: payload.RobloxID
      });
    } catch (error: any) {
      console.error('Registration Error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // --- Users API (Sheet-First) ---
  app.get('/api/admin/users', async (req, res) => {
    try {
      const doc = await getSheetDocSafe();

      if (isFallbackMode || !doc) {
        const mapped = localUsers.map(u => ({
          ...u,
          photoURL: proxyRobloxUrl(u.photoURL)
        }));
        return res.json(mapped);
      }

      let userSheet = doc.sheetsByTitle['Users'];
      if (!userSheet) {
        userSheet = await doc.addSheet({ 
          title: 'Users', 
          headerValues: ['UID', 'Username', 'Description', 'Role', 'Creation Date', 'Last Updated', 'PhotoURL', 'RobloxUsername', 'RobloxID', 'Password'] 
        });
      }

      const rows = await userSheet.getRows();
      const users = rows.map(row => ({
        uid: row.get('UID'),
        displayName: row.get('Username'),
        bio: row.get('Description'),
        role: row.get('Role'),
        createdAt: row.get('Creation Date'),
        lastUpdated: row.get('Last Updated'),
        photoURL: proxyRobloxUrl(row.get('PhotoURL')),
        robloxUsername: row.get('RobloxUsername'),
        robloxId: row.get('RobloxID')
      })).filter(u => u.uid && u.uid !== 'undefined');

      res.json(users);
    } catch (error: any) {
      console.error('Fetch Users Error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // --- Admin API ---
  app.delete('/api/admin/users/:uid', async (req, res) => {
    try {
      const { uid } = req.params;
      const doc = await getSheetDocSafe();

      if (isFallbackMode || !doc) {
        localUsers = localUsers.filter(u => u.uid !== uid);
        return res.json({ message: `User ${uid} successfully deleted from the system.` });
      }

      // 1. Remove from Sheet
      const userSheet = doc.sheetsByTitle['Users'];
      if (userSheet) {
        const rows = await userSheet.getRows();
        const rowToDelete = rows.find(r => r.get('UID') === uid);
        if (rowToDelete) {
          await rowToDelete.delete();
          console.log(`Deleted user ${uid} from sheet.`);
        }
      }

      res.json({ message: `User ${uid} successfully deleted from the system.` });
    } catch (error: any) {
      console.error('Delete User Error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development (dynamically loaded to keep production bundles light and independent of devDependencies)
  if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    import('vite').then(({ createServer: createViteServer }) => {
      createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      }).then((vite) => {
        app.use(vite.middlewares);
      }).catch((e) => {
        console.error('Failed to create Vite dev server:', e);
      });
    }).catch((e) => {
      console.error('Failed to load Vite package:', e);
    });
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Bind and run dev/prod server locally, but bypass when running inside a Serverless engine (Vercel)
  if (!process.env.VERCEL && !process.env.NOW_BUILDER) {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }

  export default app;
