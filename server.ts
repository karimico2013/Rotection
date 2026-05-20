import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import cors from 'cors';
import dotenv from 'dotenv';
import firebaseConfig from './firebase-applet-config.json' with { type: 'json' };

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Initialize Firebase Admin
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  app.use(express.json());
  app.use(cors());

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

  // --- Google Sheets Core Logic ---
  const getSheetDoc = async () => {
    let sheetId = process.env.GOOGLE_SHEET_ID;
    if (!email || !key || !sheetId) throw new Error('GOOGLE_CONFIG_MISSING');

    const serviceAccountAuth = new JWT({
      email: email,
      key: key,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    if (sheetId.includes('/d/')) {
      sheetId = sheetId.split('/d/')[1].split('/')[0];
    }

    const doc = new GoogleSpreadsheet(sheetId, serviceAccountAuth);
    await doc.loadInfo();
    return doc;
  };

  // --- Games API ---
  const getRowVal = (row: any, keys: string[]) => {
    const obj = row.toObject();
    const rawKeys = Object.keys(obj);
    for (const key of keys) {
      const target = key.toLowerCase().trim();
      const foundKey = rawKeys.find(k => k.toLowerCase().trim() === target);
      if (foundKey && obj[foundKey] !== undefined && obj[foundKey] !== null) return obj[foundKey];
    }
    return '';
  };

  app.get('/api/games', async (req, res) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    try {
      const doc = await getSheetDoc();
      const gameSheet = doc.sheetsByTitle['Games'] || doc.sheetsByIndex[0];
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
          imgUrl: getRowVal(row, ['Thumbnail', 'Icon', 'Image', 'Img']),
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
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/games/:id', async (req, res) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    try {
      const { id } = req.params;
      const doc = await getSheetDoc();
      const gameSheet = doc.sheetsByTitle['Games'] || doc.sheetsByIndex[0];
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
        imgUrl: getRowVal(row, ['Thumbnail', 'Icon', 'Image', 'Img']),
        rating: parseFloat(getRowVal(row, ['Ratings', 'User Rating', 'Stars'])) || 0,
        metrics: {
          honesty: parseFloat(getRowVal(row, ['Honesty'])) || 0,
          safety: parseFloat(getRowVal(row, ['Safety'])) || 0,
          fairness: parseFloat(getRowVal(row, ['Fairness'])) || 0,
          ageAppropriateness: parseFloat(getRowVal(row, ['Age-appropriate', 'Appropriateness'])) || 0
        }
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // --- Posts (Blog) API ---
  app.get('/api/posts', async (req, res) => {
    try {
      const doc = await getSheetDoc();
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
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/posts', async (req, res) => {
    try {
      const doc = await getSheetDoc();
      let postSheet = doc.sheetsByTitle['Posts'];
      if (!postSheet) {
        postSheet = await doc.addSheet({ title: 'Posts', headerValues: ['ID', 'Title', 'Excerpt', 'Content', 'Author', 'Date', 'Image', 'Category'] });
      }
      const newPost = {
        'ID': `POST-${Date.now()}`,
        'Title': req.body.title,
        'Excerpt': req.body.description || req.body.excerpt,
        'Content': req.body.content,
        'Author': req.body.author,
        'Date': new Date().toISOString(),
        'Image': req.body.image,
        'Category': req.body.category
      };
      await postSheet.addRow(newPost);
      res.json(newPost);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete('/api/posts/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const doc = await getSheetDoc();
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
      const doc = await getSheetDoc();
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
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/games/:id/reviews', async (req, res) => {
    try {
      const { id } = req.params;
      const doc = await getSheetDoc();
      let reviewSheet = doc.sheetsByTitle['Reviews'];
      if (!reviewSheet) {
        reviewSheet = await doc.addSheet({ title: 'Reviews', headerValues: ['GameID', 'UserID', 'Username', 'PhotoURL', 'Text', 'Rating', 'CreatedAt', 'RobloxID'] });
      }
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
      const doc = await getSheetDoc();
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
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/games/:id/reports', async (req, res) => {
    try {
      const { id } = req.params;
      const doc = await getSheetDoc();
      let reportSheet = doc.sheetsByTitle['Reports'];
      if (!reportSheet) {
        reportSheet = await doc.addSheet({ title: 'Reports', headerValues: ['GameID', 'UserID', 'Username', 'PhotoURL', 'Type', 'Description', 'Evidence', 'Severity', 'CreatedAt', 'RobloxID'] });
      }
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

  app.get('/api/users/:uid/activity', async (req, res) => {
    try {
      const { uid } = req.params;
      const doc = await getSheetDoc();
      
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
  app.get('/api/users/:uid', async (req, res) => {
    try {
      const { uid } = req.params;
      const doc = await getSheetDoc();

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
        photoURL: row.get('PhotoURL'),
        robloxUsername: row.get('RobloxUsername'),
        robloxId: row.get('RobloxID')
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/users/register', async (req, res) => {
    try {
      const { uid, username, bio, robloxId, robloxUsername } = req.body;
      const doc = await getSheetDoc();

      let userSheet = doc.sheetsByTitle['Users'];
      if (!userSheet) {
        userSheet = await doc.addSheet({ 
          title: 'Users', 
          headerValues: ['UID', 'Username', 'Description', 'Role', 'Creation Date', 'Last Updated', 'PhotoURL', 'RobloxUsername', 'RobloxID'] 
        });
      }

      const rows = await userSheet.getRows();
      let existingRow = rows.find(r => r.get('UID') === uid.toString());

      const avatarRes = await fetch(`/api/roblox/thumbnails/user-avatar?userId=${robloxId}`);
      const avatarData: any = await avatarRes.json();
      const photoURL = avatarData.data?.[0]?.imageUrl || `https://www.roblox.com/headshot-thumbnail/image?userId=${robloxId}&width=420&height=420&format=png`;

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
        photoURL: payload.PhotoURL,
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
      const doc = await getSheetDoc();

      let userSheet = doc.sheetsByTitle['Users'];
      if (!userSheet) {
        userSheet = await doc.addSheet({ 
          title: 'Users', 
          headerValues: ['UID', 'Username', 'Description', 'Role', 'Creation Date', 'Last Updated'] 
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
        photoURL: row.get('PhotoURL'),
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
      const doc = await getSheetDoc();

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

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
