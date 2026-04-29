import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import fs from "fs";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import multer from "multer";
import { GoogleGenAI } from "@google/genai";
import { createClient } from "@supabase/supabase-js";
import twilio from "twilio";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || "edugrowth_secure_fallback_secret_v1";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "imtamilarasu@gmail.com";

// Cleanup: Removed Twilio config and initialization logic as mobile verification is removed.
// If you need SMS features in the future, restore these variables and the cleanTwilioKey Helper.

// Multier setup for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Database Setup
const DB_PATH = path.join(__dirname, "db.json");
if (!fs.existsSync(DB_PATH)) {
  fs.writeFileSync(DB_PATH, JSON.stringify({
    users: [],
    scholarships: [
      { id: "s1", title: "HDFC Bank Parivartan's ECS Scholarship", description: "Supports meritorious students from underprivileged backgrounds, providing financial assistance for school to post-graduation studies.", amount: 75000, eligibility: { marks: 60, income: 250000, caste: ["General", "OBC", "SC", "ST"], education: ["UG", "PG"] }, course: ["UG", "PG", "PhD"], deadline: "2024-06-30" },
      { id: "s2", title: "Reliance Foundation Undergraduate Scholarship", description: "Providing support for students from all demographics based on merit and economic need to pursue higher education in India.", amount: 200000, eligibility: { marks: 75, income: 600000, caste: ["All"], education: ["UG"] }, course: ["UG", "B.Tech", "B.Sc"], deadline: "2024-07-15" },
      { id: "s3", title: "Kotak Kanya Scholarship", description: "Specifically designed for girl students to pursue higher professional education like Engineering, MBBS, and Law.", amount: 150000, eligibility: { marks: 75, income: 320000, caste: ["All"], education: ["UG"] }, course: ["UG", "B.Tech", "MBBS", "LLB"], deadline: "2024-09-30" },
      { id: "s4", title: "L'Oréal India For Young Women In Science", description: "Scholarships for young women who want to pursue their graduation in any scientific field (Pure Sciences/Applied Sciences/Engineering/Medical, etc.).", amount: 250000, eligibility: { marks: 85, income: 400000, caste: ["All"], education: ["UG"] }, course: ["B.Sc", "B.Tech"], deadline: "2024-08-31" },
      { id: "s5", title: "Adobe India Women-in-Technology Scholarship", description: "Strives to bring more gender diversity to the technology industry by supporting female engineers.", amount: 100000, eligibility: { marks: 70, income: 1000000, caste: ["All"], education: ["UG", "PG"] }, course: ["Computer Science", "B.Tech"], deadline: "2024-12-31" },
    ],
    subsidies: [
      { id: "sub1", title: "Startup India Seed Fund Scheme (SISFS)", description: "Provides financial assistance to startups for proof of concept, prototype development, product trials, and market entry.", category: "Entrepreneurship", benefit: "Up to ₹20 Lakh Grant" },
      { id: "sub2", title: "Atal Innovation Mission (AIM)", description: "Nurtures innovation through Atal Tinkering Labs and Atal Incubation Centers across India.", category: "Innovation", benefit: "Mentorship & Infrastructure" },
      { id: "sub3", title: "Pradhan Mantri Yuva Yojana (PM-YUVA)", description: "Entrepreneurship education and training to young individuals for 5 years.", category: "Education", benefit: "Training & Handholding" },
      { id: "sub4", title: "Aatmanirbhar Bharat Subsidy", description: "Incentivizes employers for creation of new employment opportunities during the recovery phase of the economy.", category: "Employment", benefit: "EPF Subsidy" },
    ],
    projects: [
      { id: "p1", title: "AI-Powered Agri-Tech Node", description: "Leveraging decentralized AI for localized crop disease detection and soil nutrient optimization.", userId: "admin", status: "prototype", createdAt: "2024-03-15T10:00:00Z" },
      { id: "p2", title: "Green Hydrogen Fuel Cell", description: "Developing a scalable hydrogen extraction unit for educational institutions and small campuses.", userId: "admin", status: "funding", createdAt: "2024-04-01T12:00:00Z" },
    ],
    notifications: []
  }, null, 2));
}

const addDefaultNotifications = (db: any, userId: string) => {
  const notifications = [
    { id: "n1", userId, title: "Welcome to EduGrowth!", message: "Your account is active. Complete your profile to get matched with 24+ scholarships.", type: "system", isRead: false, createdAt: new Date().toISOString() },
    { id: "n2", userId, title: "Upcoming Deadline", message: "NMMS Scholarship deadline is approaching in 7 days. Start your application now!", type: "scholarship", isRead: false, createdAt: new Date().toISOString() },
    { id: "n3", userId, title: "New Venture Funding", message: "National Startup Fund is now accepting prototypes in the Incubator Hub.", type: "project", isRead: false, createdAt: new Date().toISOString() }
  ];
  db.notifications.push(...notifications);
};

const getData = () => {
  try {
    const content = fs.readFileSync(DB_PATH, "utf-8");
    return JSON.parse(content || '{"users":[],"scholarships":[],"subsidies":[],"projects":[],"notifications":[]}');
  } catch (err) {
    console.error("[DB Error] Failed to read or parse db.json:", err);
    return { users: [], scholarships: [], subsidies: [], projects: [], notifications: [] };
  }
};
const saveData = (data: any) => {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("[DB Error] Failed to save db.json:", err);
  }
};

// Supabase Client (Lazy Load)
let supabaseInstance: any = null;
const getSupabase = () => {
  if (!supabaseInstance) {
    let url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    let key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
    
    // Clean potential quote/whitespace issues from env vars
    url = url?.trim().replace(/^"|"$/g, '');
    key = key?.trim().replace(/^"|"$/g, '');

    if (url && url.startsWith('http') && key) {
      try {
        console.log(`[Supabase] Initializing with URL: ${url}`);
        supabaseInstance = createClient(url, key);
        // Test connection and run migration check
        supabaseInstance.from('users').select('id', { count: 'exact', head: true }).limit(1)
          .then(() => {
            console.log("[Supabase] Connection verified successfully.");
            syncDataToSupabase().catch(err => console.error("[Supabase Sync Error]", err));
          })
          .catch((err: any) => {
            console.error("[Supabase Connection Error] Could not reach Supabase. falling back to local storage.", err.message);
            supabaseInstance = null;
          });
      } catch (err) {
        console.error("Failed to initialize Supabase client constructor:", err);
      }
    } else {
       if (url || key) {
         console.warn("[Supabase Configuration] Missing or invalid SUPABASE_URL or SUPABASE_KEY. Fallback to local DB.");
       }
    }
  }
  return supabaseInstance;
};

// Automate migration from local db.json to Supabase
async function syncDataToSupabase() {
  const supabase = getSupabase();
  if (!supabase) return;

  try {
    const localData = getData();
    console.log("[Supabase Sync] Checking for data to migrate...");
    
    // 1. Scholarships
    const { count: scholarshipCount } = await supabase.from('scholarships').select('*', { count: 'exact', head: true });
    if (scholarshipCount === 0 && localData.scholarships?.length > 0) {
      console.log(`[Supabase Sync] Seeding ${localData.scholarships.length} scholarships...`);
      await supabase.from('scholarships').insert(localData.scholarships);
    }

    // 2. Subsidies
    const { count: subsidyCount } = await supabase.from('subsidies').select('*', { count: 'exact', head: true });
    if (subsidyCount === 0 && localData.subsidies?.length > 0) {
      console.log(`[Supabase Sync] Seeding ${localData.subsidies.length} subsidies...`);
      await supabase.from('subsidies').insert(localData.subsidies);
    }

    // 3. Users (Credentials)
    const { count: userCount } = await supabase.from('users').select('*', { count: 'exact', head: true });
    if (userCount === 0 && localData.users?.length > 0) {
      console.log(`[Supabase Sync] Seeding ${localData.users.length} users/credentials...`);
      // Ensure we don't insert duplicate IDs if possible, though count: 0 should prevent this
      await supabase.from('users').insert(localData.users);
    }

    // 4. Projects
    const { count: projectCount } = await supabase.from('projects').select('*', { count: 'exact', head: true });
    if (projectCount === 0 && localData.projects?.length > 0) {
      console.log(`[Supabase Sync] Seeding ${localData.projects.length} projects...`);
      const mappedProjects = localData.projects.map((p: any) => ({
        id: p.id,
        title: p.title,
        description: p.description,
        user_id: p.userId || 'admin',
        status: p.status || 'pending',
        created_at: p.createdAt || new Date().toISOString()
      }));
      await supabase.from('projects').insert(mappedProjects);
    }

    // 5. Notifications
    const { count: notificationCount } = await supabase.from('notifications').select('*', { count: 'exact', head: true });
    if (notificationCount === 0 && localData.notifications?.length > 0) {
      console.log(`[Supabase Sync] Seeding ${localData.notifications.length} notifications...`);
      const mappedNotifications = localData.notifications.map((n: any) => ({
        id: n.id,
        user_id: n.userId,
        title: n.title,
        message: n.message,
        type: n.type,
        is_read: n.isRead,
        created_at: n.createdAt
      }));
      await supabase.from('notifications').insert(mappedNotifications);
    }

    console.log("[Supabase Sync] Cloud synchronization completed.");
  } catch (err) {
    console.error("[Supabase Sync] Fatal error during migration:", err);
  }
}

async function startServer() {
  const app = express();
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));

  // Logging middleware
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
  });

  // MiddleWare for protected routes
  const authenticate = async (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      console.warn(`[Auth] Missing Authorization header for ${req.method} ${req.url}`);
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    const token = authHeader.split(" ")[1];
    if (!token || token === "undefined" || token === "null") {
      console.warn(`[Auth] Malformed or null token received: "${token}"`);
      return res.status(401).json({ error: "Invalid token" });
    }

    const supabase = getSupabase();

    try {
      // 1. Try Supabase verification first if available
      if (supabase) {
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (!error && user) {
          req.userId = user.id;
          return next();
        }
      }

      // 2. Fallback to custom JWT verification
      const decoded: any = jwt.verify(token, JWT_SECRET);
      req.userId = decoded.userId;
      next();
    } catch (err: any) {
      console.error(`[Auth] Authentication failed for ${req.method} ${req.url}:`, err.message);
      res.status(401).json({ error: "Invalid token" });
    }
  };

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // API Routes
  app.post("/api/auth/register", async (req, res) => {
    const { email: rawEmail, password, name } = req.body;
    const email = rawEmail?.trim().toLowerCase();
    const supabase = getSupabase();

    console.log(`[Auth Register] Attempting registration for: ${email}`);

    if (supabase) {
      // Supabase Flow
      const hashedPassword = await bcrypt.hash(password, 10);
      const { data: newUser, error } = await supabase.from('users').insert([{
        email, 
        password: hashedPassword, 
        name, 
        points: 0, 
        badges: [], 
        profile: {}, 
        documents: []
      }]).select().single();

      if (error) {
        console.warn(`[Supabase Register Error] ${error.message}`);
        return res.status(400).json({ error: error.message });
      }
      
      const token = jwt.sign({ userId: newUser.id }, JWT_SECRET);
      const { password: _, ...userWithoutPassword } = newUser;
      res.json({ token, user: userWithoutPassword });
    } else {
      // Local Fallback
      const db = getData();
      if (db.users.find((u: any) => u.email.toLowerCase() === email)) {
        console.warn(`[Local Register Warning] User already exists: ${email}`);
        return res.status(400).json({ error: "User already exists" });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = { id: Date.now().toString(), email, password: hashedPassword, name, profile: {}, points: 0, badges: [], documents: [] };
      db.users.push(newUser);
      addDefaultNotifications(db, newUser.id);
      saveData(db);
      const token = jwt.sign({ userId: newUser.id }, JWT_SECRET);
      const { password: _, ...userWithoutPassword } = newUser;
      res.json({ token, user: userWithoutPassword });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    const { email: rawEmail, password } = req.body;
    const email = rawEmail?.trim().toLowerCase();
    const supabase = getSupabase();

    console.log(`[Auth Login] Attempting login for: ${email}`);

    if (supabase) {
      console.log(`[Auth Login] Checking Supabase for: ${email}`);
      const { data: user, error } = await supabase.from("users").select("*").eq("email", email).single();
      
      if (!error && user) {
        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
          console.log(`[Auth] Supabase login successful for: ${email}`);
          const token = jwt.sign({ userId: user.id }, JWT_SECRET);
          const { password: _, ...userWithoutPassword } = user;
          return res.json({ token, user: userWithoutPassword });
        } else {
          console.warn(`[Auth] Supabase login failed: Password mismatch for "${email}". Length sent: ${password?.length}`);
          return res.status(401).json({ error: "Invalid credentials" });
        }
      }
      
      console.log(`[Auth] User "${email}" not found in Supabase or error: ${error?.message || "Not found"}. checking local...`);
    } else {
      console.log(`[Auth Login] Supabase not configured. Checking Local for: ${email}`);
    }

    // Local Fallback
    const db = getData();
    const user = db.users.find((u: any) => u.email.toLowerCase() === email);
    
    if (!user) {
      console.warn(`[Auth] Login failed: User "${email}" not found anywhere.`);
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.warn(`[Auth] Login failed: Password mismatch for "${email}" (Local). Length: ${password?.length}, Hash start: ${user.password.substring(0, 10)}`);
      return res.status(401).json({ error: "Invalid credentials" });
    }

    console.log(`[Auth] Local login successful for: ${email}`);
    const token = jwt.sign({ userId: user.id }, JWT_SECRET);
    const { password: _, ...userWithoutPassword } = user;
    res.json({ token, user: userWithoutPassword });
  });

  app.get("/api/profile", authenticate, async (req: any, res) => {
    try {
      const supabase = getSupabase();
      let user: any = null;

      if (supabase) {
        const { data, error } = await supabase.from('users').select('*').eq('id', req.userId).single();
        if (!error && data) {
          user = data;
        } else if (error && error.code === 'PGRST116') { // PGRST116 is "no rows found"
          // Auto-migrate/create user in Supabase public.users if they exist in auth but not public
          const { data: authUser } = await supabase.auth.getUser(req.headers.authorization?.split(" ")[1]);
          if (authUser?.user) {
            console.log(`[Supabase Auto-Create] Creating public record for auth user: ${authUser.user.email}`);
            const { data: newUser, error: createError } = await supabase.from('users').insert([{
              id: req.userId,
              email: authUser.user.email,
              name: authUser.user.user_metadata?.full_name || authUser.user.user_metadata?.name || "Supabase User",
              points: 100,
              badges: [],
              profile: {},
              documents: []
            }]).select().single();
            if (!createError) user = newUser;
          }
        }
      }
      
      if (!user) {
        const db = getData();
        // Use loose equality or string conversion to handle string/number ID mismatches
        user = db.users.find((u: any) => String(u.id) === String(req.userId));
      }

      if (!user) {
        console.warn(`[Profile Get Warning] User ID: ${req.userId} not found in any database (Checked Supabase and Local)`);
        return res.status(404).json({ error: "User not found" });
      }
      
      const { password: _, ...userWithoutPassword } = user;
      // Ensure default fields exist
      if (!userWithoutPassword.profile) userWithoutPassword.profile = {};
      if (!userWithoutPassword.documents) userWithoutPassword.documents = [];
      if (!userWithoutPassword.badges) userWithoutPassword.badges = [];
      if (!userWithoutPassword.points) userWithoutPassword.points = 0;
      
      res.json(userWithoutPassword);
    } catch (err: any) {
      console.error("Profile Fetch Exception:", err);
      res.status(500).json({ error: "Internal server error during profile retrieval" });
    }
  });

  app.put("/api/profile", authenticate, async (req: any, res) => {
    try {
      const supabase = getSupabase();
      let userExistsInSupabase = false;

      if (supabase) {
        const { data } = await supabase.from('users').select('id').eq('id', req.userId).single();
        if (data) userExistsInSupabase = true;
      }

      if (userExistsInSupabase && supabase) {
        // Update in Supabase
        const { name, points, badges, profile, documents, phone, phone_verified } = req.body;
        const updates: any = {};
        if (name !== undefined) updates.name = name;
        if (points !== undefined) updates.points = points;
        if (badges !== undefined) updates.badges = badges;
        if (profile !== undefined) updates.profile = profile;
        if (documents !== undefined) updates.documents = documents;
        if (phone !== undefined) updates.phone = phone;
        if (phone_verified !== undefined) updates.phone_verified = phone_verified;
        updates.updated_at = new Date().toISOString();

        const { data: updated, error } = await supabase.from('users').update(updates).eq('id', req.userId).select().single();
        if (error) {
          console.error("[Supabase Profile Update Error]", error);
          return res.status(400).json({ error: error.message });
        }
        const { password: _, ...userWithoutPassword } = updated;
        return res.json(userWithoutPassword);
      } else {
        // Update in Local
        const db = getData();
        const index = db.users.findIndex((u: any) => String(u.id) === String(req.userId));
        if (index === -1) return res.status(404).json({ error: "User not found in local db" });

        const { name, points, badges, profile, documents, phone, phone_verified } = req.body;
        if (name !== undefined) db.users[index].name = name;
        if (points !== undefined) db.users[index].points = points;
        if (badges !== undefined) db.users[index].badges = badges;
        if (profile !== undefined) db.users[index].profile = profile;
        if (documents !== undefined) db.users[index].documents = documents;
        if (phone !== undefined) db.users[index].phone = phone;
        if (phone_verified !== undefined) db.users[index].phone_verified = phone_verified;

        saveData(db);
        const { password: _, ...userWithoutPassword } = db.users[index];
        return res.json(userWithoutPassword);
      }
    } catch (err: any) {
      console.error("Profile Update Exception:", err);
      res.status(500).json({ error: err.message || "Failed to update profile" });
    }
  });

  // Phone Verification Routes
  app.get("/api/scholarships", async (req, res) => {
    const supabase = getSupabase();
    if (supabase) {
      const { data, error } = await supabase.from('scholarships').select('*');
      if (error) return res.status(500).json({ error: error.message });
      res.json(data);
    } else {
      const db = getData();
      res.json(db.scholarships);
    }
  });

  app.post("/api/scholarships", authenticate, async (req: any, res) => {
    const supabase = getSupabase();
    // Simple admin check
    const { data: user } = supabase 
      ? await supabase.from('users').select('email').eq('id', req.userId).single()
      : { data: getData().users.find((u: any) => String(u.id) === String(req.userId)) };

    if (user?.email !== ADMIN_EMAIL) {
      return res.status(403).json({ error: "Admin access required" });
    }

    if (supabase) {
      const { data, error } = await supabase.from('scholarships').insert([req.body]).select().single();
      if (error) return res.status(400).json({ error: error.message });
      res.json(data);
    } else {
      const db = getData();
      const newS = { ...req.body, id: Date.now().toString() };
      db.scholarships.push(newS);
      saveData(db);
      res.json(newS);
    }
  });

  // Bulk sync for AI results
  app.post("/api/scholarships/sync", authenticate, async (req: any, res) => {
    const supabase = getSupabase();
    const items = Array.isArray(req.body) ? req.body : [req.body];
    
    if (supabase) {
      // Filter out items that might already exist by title (simple deduplication)
      const { data: existing } = await supabase.from('scholarships').select('title');
      const existingTitles = new Set(existing?.map(e => e.title));
      const toInsert = items.filter(item => !existingTitles.has(item.title)).map(item => ({
        title: item.title,
        description: item.description,
        amount: item.amount,
        deadline: item.deadline,
        eligibility: item.eligibility || { 
          marks: 60, 
          income: 500000,
          caste: item.caste || ["All"],
          education: item.education || ["Any"]
        },
        course: item.course || ["Any"]
      }));

      if (toInsert.length > 0) {
        const { data, error } = await supabase.from('scholarships').insert(toInsert).select();
        if (error) return res.status(400).json({ error: error.message });
        return res.json({ message: `Synced ${toInsert.length} scholarships`, data });
      }
      res.json({ message: "No new scholarships to sync" });
    } else {
      const db = getData();
      const existingTitles = new Set(db.scholarships.map((s: any) => s.title));
      const toInsert = items.filter(item => !existingTitles.has(item.title)).map(item => ({
        ...item,
        id: Math.random().toString(36).substr(2, 9),
        eligibility: item.eligibility || { 
          marks: 60, 
          income: 500000,
          caste: item.caste || ["All"],
          education: item.education || ["Any"]
        },
        course: item.course || ["Any"]
      }));
      db.scholarships.push(...toInsert);
      saveData(db);
      res.json({ message: `Synced ${toInsert.length} scholarships` });
    }
  });

  app.get("/api/subsidies", async (req, res) => {
    const supabase = getSupabase();
    if (supabase) {
      const { data, error } = await supabase.from('subsidies').select('*');
      if (error) return res.status(500).json({ error: error.message });
      res.json(data);
    } else {
      const db = getData();
      res.json(db.subsidies);
    }
  });

  app.post("/api/projects", authenticate, async (req: any, res) => {
    const supabase = getSupabase();
    if (supabase) {
      const newProject = { 
        title: req.body.title, 
        description: req.body.description,
        user_id: req.userId, 
        status: "pending" 
      };
      const { data, error } = await supabase.from('projects').insert([newProject]).select().single();
      if (error) return res.status(400).json({ error: error.message });
      
      // Update points and send notification
      await supabase.rpc('increment_points', { user_id: req.userId, amount: 50 });
      await supabase.from('notifications').insert([{
        user_id: req.userId,
        title: "Project Submitted!",
        message: `Your project "${req.body.title}" has been successfully submitted.`,
        type: "project"
      }]);

      res.json({
        ...data,
        userId: data.user_id, // map back for frontend
        createdAt: data.created_at
      });
    } else {
      const db = getData();
      const newProject = { ...req.body, id: Date.now().toString(), userId: req.userId, status: "pending", createdAt: new Date() };
      db.projects.push(newProject);
      // Add points
      const user = db.users.find((u: any) => String(u.id) === String(req.userId));
      if (user) user.points += 50;
      // Add notification
      db.notifications.push({
        id: Date.now().toString() + "_n",
        userId: req.userId,
        title: "Project Submitted!",
        message: `Your project "${req.body.title}" has been successfully submitted to the Incubator Hub. Review is in progress.`,
        type: "project",
        isRead: false,
        createdAt: new Date().toISOString()
      });
      saveData(db);
      res.json(newProject);
    }
  });

  app.get("/api/projects", async (req, res) => {
    const supabase = getSupabase();
    if (supabase) {
      const { data, error } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
      if (error) return res.status(500).json({ error: error.message });
      // Map back for frontend
      const mapped = (data || []).map((p: any) => ({
        ...p,
        userId: p.user_id,
        createdAt: p.created_at
      }));
      res.json(mapped);
    } else {
      const db = getData();
      res.json(db.projects);
    }
  });

  app.get("/api/notifications", authenticate, async (req: any, res) => {
    console.log(`[API] GET /api/notifications requested by user: ${req.userId}`);
    try {
      const supabase = getSupabase();
      if (supabase) {
        console.log(`[API] Querying Supabase notifications for user: ${req.userId}`);
        const { data, error } = await supabase.from('notifications').select('*').eq('user_id', req.userId).order('created_at', { ascending: false });
        if (error) {
          console.error(`[Supabase Error] Notifications fetch:`, error);
        } else {
          const mapped = (data || []).map((n: any) => ({
            ...n,
            userId: n.user_id,
            isRead: n.is_read,
            createdAt: n.created_at
          }));
          return res.json(mapped);
        }
      }

      console.log(`[API] Falling back to local DB for notifications`);
      const db = getData();
      const notifications = db.notifications || [];
      const userNotifications = notifications.filter((n: any) => {
        return String(n.userId) === String(req.userId) || n.userId === "all";
      });
      
      const sorted = userNotifications.sort((a: any, b: any) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      res.json(sorted);
    } catch (err: any) {
      console.error("[API Error] GET /api/notifications:", err);
      res.status(500).json({ error: "Failed to fetch notifications", details: err.message });
    }
  });

  app.put("/api/notifications/:id/read", authenticate, async (req: any, res) => {
    try {
      const supabase = getSupabase();
      if (supabase) {
        const { data, error } = await supabase
          .from('notifications')
          .update({ is_read: true })
          .eq('id', req.params.id)
          .eq('user_id', req.userId)
          .select()
          .single();
        if (error) throw error;
        res.json({
          ...data,
          userId: data.user_id,
          isRead: data.is_read,
          createdAt: data.created_at
        });
      } else {
        const db = getData();
        const index = db.notifications.findIndex((n: any) => n.id === req.params.id && n.userId === req.userId);
        if (index !== -1) {
          db.notifications[index].isRead = true;
          saveData(db);
          res.json(db.notifications[index]);
        } else {
          res.status(404).json({ error: "Notification not found" });
        }
      }
    } catch (err: any) {
      console.error("PUT /api/notifications/:id/read error:", err);
      res.status(500).json({ error: err.message || "Failed to update notification" });
    }
  });

  app.put("/api/notifications/read-all", authenticate, async (req: any, res) => {
    try {
      const supabase = getSupabase();
      if (supabase) {
        const { error } = await supabase
          .from('notifications')
          .update({ is_read: true })
          .eq('user_id', req.userId);
        if (error) throw error;
        res.json({ success: true });
      } else {
        const db = getData();
        db.notifications.forEach((n: any) => {
          if (n.userId === req.userId) n.isRead = true;
        });
        saveData(db);
        res.json({ success: true });
      }
    } catch (err: any) {
      console.error("PUT /api/notifications/read-all error:", err);
      res.status(500).json({ error: err.message || "Failed to clear all notifications" });
    }
  });

  // Document Management
  app.post("/api/profile/documents/upload", authenticate, upload.single('file'), async (req: any, res: any) => {
    const supabase = getSupabase();
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const file = req.file;
    const { name, type } = req.body;
    const fileExt = file.originalname.split('.').pop();
    const fileName = `${req.userId}/${Date.now()}.${fileExt}`;
    const filePath = `documents/${fileName}`;

    if (supabase) {
      try {
        // 1. Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('user-documents')
          .upload(filePath, file.buffer, {
            contentType: file.mimetype,
            upsert: true
          });

        if (uploadError) {
          // If bucket doesn't exist, try to create it (might fail based on permissions)
          if (uploadError.message.includes('bucket not found')) {
             await supabase.storage.createBucket('user-documents', { public: true });
             // retry
             const { error: retryError } = await supabase.storage.from('user-documents').upload(filePath, file.buffer, { contentType: file.mimetype });
             if (retryError) throw retryError;
          } else {
            throw uploadError;
          }
        }

        // 2. Get Public URL
        const { data: { publicUrl } } = supabase.storage.from('user-documents').getPublicUrl(filePath);

        // 3. Update User Metadata
        const newDoc = {
          id: Date.now().toString(),
          name: name || file.originalname,
          type: type || "Other",
          status: "pending",
          url: publicUrl,
          path: filePath,
          uploadedAt: new Date().toISOString()
        };

        const { data: userData } = await supabase.from('users').select('documents').eq('id', req.userId).single();
        const docs = [...(userData?.documents || []), newDoc];
        await supabase.from('users').update({ documents: docs }).eq('id', req.userId);

        res.json(newDoc);
      } catch (err: any) {
        console.error("Storage Error:", err);
        res.status(500).json({ error: err.message || "Failed to upload to cloud storage" });
      }
    } else {
      // Local Fallback (Base64 simulate or just metadata)
      const newDoc = {
        id: Date.now().toString(),
        name: name || file.originalname,
        type: type || "Other",
        status: "pending",
        uploadedAt: new Date().toISOString(),
        isLocal: true
      };
      const db = getData();
      const userIndex = db.users.findIndex((u: any) => u.id === req.userId);
      if (userIndex === -1) return res.status(404).json({ error: "User not found" });
      if (!db.users[userIndex].documents) db.users[userIndex].documents = [];
      db.users[userIndex].documents.push(newDoc);
      saveData(db);
      res.json(newDoc);
    }
  });

  app.post("/api/profile/documents", authenticate, async (req: any, res) => {
    // Legacy support for metadata-only (if needed) or simple redirects
    const supabase = getSupabase();
    const newDoc = {
      id: Date.now().toString(),
      name: req.body.name,
      type: req.body.type,
      status: "pending",
      uploadedAt: new Date().toISOString()
    };

    if (supabase) {
      const { data: user } = await supabase.from('users').select('documents').eq('id', req.userId).single();
      const docs = [...(user?.documents || []), newDoc];
      await supabase.from('users').update({ documents: docs }).eq('id', req.userId);
      res.json(newDoc);
    } else {
      const db = getData();
      const userIndex = db.users.findIndex((u: any) => u.id === req.userId);
      if (userIndex === -1) return res.status(404).json({ error: "User not found" });

      if (!db.users[userIndex].documents) db.users[userIndex].documents = [];
      db.users[userIndex].documents.push(newDoc);
      saveData(db);
      res.json(newDoc);
    }
  });

  app.put("/api/profile/documents/:id/verify", authenticate, async (req: any, res) => {
    const supabase = getSupabase();
    if (supabase) {
      const { data: user } = await supabase.from('users').select('documents').eq('id', req.userId).single();
      const docs = user.documents.map((d: any) => d.id === req.params.id ? { ...d, status: 'verified' } : d);
      const { data: updated } = await supabase.from('users').update({ documents: docs }).eq('id', req.userId).select().single();
      res.json(docs.find((d: any) => d.id === req.params.id));
    } else {
      const db = getData();
      const userIndex = db.users.findIndex((u: any) => u.id === req.userId);
      if (userIndex === -1) return res.status(404).json({ error: "User not found" });

      const docIndex = db.users[userIndex].documents.findIndex((d: any) => d.id === req.params.id);
      if (docIndex === -1) return res.status(404).json({ error: "Document not found" });

      db.users[userIndex].documents[docIndex].status = "verified";
      saveData(db);
      res.json(db.users[userIndex].documents[docIndex]);
    }
  });

  // Final Error Handler
  app.use((err: any, req: any, res: any, next: any) => {
    console.error("[Fatal Express Error]", err);
    res.status(500).json({ error: "Internal Server Error", details: err.message });
  });

  // Use process handlers to prevent exit on error
  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  });
  process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
  });

  // Start server FIRST
  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`\n---------------------------------------------------`);
    console.log(`API Server running on http://0.0.0.0:${PORT}`);
    console.log(`---------------------------------------------------\n`);
  });

  // Vite setup SECOND (asynchronous)
  console.log("[Server] Preparing frontend middleware...");
  if (process.env.NODE_ENV !== "production") {
    createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    }).then(vite => {
      app.use(vite.middlewares);
      console.log("[Server] Vite middleware attached.");
    }).catch(err => {
      console.error("[Server] Vite initialization failed:", err);
    });
  } else {
    const distPath = path.join(process.cwd(), "dist");
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get("*", (req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
      });
      console.log("[Server] Production static files serving.");
    }
  }
}

startServer();
