# ⚡ StreamLink — Professional Network for Livestreamers

> The LinkedIn for streamers. Connect, collaborate, land brand deals.

---

## 🚀 Deploy in 30 Minutes — Step by Step

### STEP 1 — Get Your Domain (~5 min)
1. Go to **namecheap.com**
2. Search for `getstreamlink.io` or `streamlink.app`
3. Buy it (~$10–15/year)
4. You'll connect it to Vercel in Step 4

---

### STEP 2 — Set Up Supabase (Your Backend) (~10 min)

1. Go to **supabase.com** → Sign up free
2. Click **"New Project"** → name it `streamlink`
3. Choose a region close to your users (e.g. `South America (São Paulo)`)
4. Wait ~2 min for it to boot up
5. Go to **SQL Editor** → **New Query**
6. Copy the entire contents of `supabase/migrations/001_initial_schema.sql`
7. Paste it and click **Run** ✅
8. Go to **Settings → API** and copy:
   - `Project URL` → this is your `VITE_SUPABASE_URL`
   - `anon public` key → this is your `VITE_SUPABASE_ANON_KEY`

---

### STEP 3 — Push to GitHub (~5 min)

```bash
# In your terminal, inside this folder:
git init
git add .
git commit -m "Initial StreamLink commit"

# Create a repo on github.com then:
git remote add origin https://github.com/YOUR_USERNAME/streamlink.git
git push -u origin main
```

---

### STEP 4 — Deploy to Vercel (~5 min)

1. Go to **vercel.com** → Sign up with GitHub
2. Click **"Add New Project"** → Import your `streamlink` repo
3. Framework: **Vite** (auto-detected)
4. Under **Environment Variables**, add:
   ```
   VITE_SUPABASE_URL       = https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY  = your-anon-key
   ```
5. Click **Deploy** 🚀
6. Once live, go to **Settings → Domains** → add your custom domain from Step 1

---

### STEP 5 — Connect Domain to Vercel (~5 min)

1. In Vercel: **Settings → Domains** → add `yourdomain.com`
2. Vercel gives you DNS records (usually A record or CNAME)
3. Go to **Namecheap → Manage → Advanced DNS**
4. Add the records Vercel shows you
5. Wait 5–30 min for DNS to propagate ✅

---

## 🧑‍💻 Running Locally

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.example .env.local
# Fill in your Supabase URL and anon key

# 3. Start dev server
npm run dev

# Open http://localhost:5173
```

---

## 📁 Project Structure

```
streamlink/
├── src/
│   ├── App.jsx                  # Router + auth listener
│   ├── main.jsx                 # React entry point
│   ├── lib/
│   │   ├── supabase.js          # Supabase client
│   │   └── store.js             # Zustand global state
│   ├── pages/
│   │   ├── LandingPage.jsx      # Public landing page
│   │   ├── LoginPage.jsx        # Sign in
│   │   ├── RegisterPage.jsx     # Sign up
│   │   ├── FeedPage.jsx         # ✅ Full — real posts from DB
│   │   ├── ProfilePage.jsx      # Stub — ready to expand
│   │   ├── MessagesPage.jsx     # Stub — ready to expand
│   │   ├── NetworkPage.jsx      # Stub — ready to expand
│   │   ├── JobsPage.jsx         # Stub — ready to expand
│   │   ├── OffersPage.jsx       # Stub — ready to expand
│   │   ├── AnalyticsPage.jsx    # Stub — ready to expand
│   │   └── CompaniesPage.jsx    # Stub — ready to expand
│   ├── components/
│   │   └── layout/
│   │       ├── AppLayout.jsx    # Nav + page shell
│   │       └── Toast.jsx        # Notifications
│   └── styles/
│       └── globals.css
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql   # ← Run this in Supabase
├── .env.example                 # Copy to .env.local
├── vercel.json                  # Vercel SPA routing
├── vite.config.js
├── tailwind.config.js
└── package.json
```

---

## 🗄️ Database Tables

| Table | Purpose |
|---|---|
| `profiles` | User profiles (streamer info, platforms, stats) |
| `posts` | Feed posts (text, clips, milestones, collabs) |
| `post_likes` | Likes with auto-increment trigger |
| `connections` | Follow requests (pending/accepted/declined) |
| `messages` | Direct messages between users |
| `jobs` | Brand deals and job listings |
| `job_applications` | Applications to jobs |
| `companies` | Company/brand pages |
| `follows` | Follow relationships |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS |
| Routing | React Router v6 |
| State | Zustand |
| Backend | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Realtime | Supabase Realtime |
| Hosting | Vercel |
| Domain | Namecheap |

---

## 💰 Monthly Cost Breakdown

| Service | Cost |
|---|---|
| Vercel (hosting) | Free |
| Supabase (backend + DB) | Free up to 500MB / 50K users |
| Domain (yearly) | ~$1/month |
| **Total** | **~$1/month** |

Supabase free tier handles up to **50,000 monthly active users**.
When you outgrow it → upgrade to Supabase Pro ($25/mo).

---

## 📈 Next Features to Build

- [ ] **Real-time messages** — Supabase Realtime subscriptions
- [ ] **Image uploads** — Supabase Storage for avatars/banners
- [ ] **Notifications** — connection requests, new messages
- [ ] **Full profile page** — clips, schedule, stats tabs
- [ ] **Jobs board** — companies post, streamers apply
- [ ] **Search** — full-text search with Supabase
- [ ] **Email notifications** — Resend.com integration

---

## 🆘 Common Issues

**"Missing Supabase environment variables"**
→ Make sure `.env.local` exists and has both variables filled in

**"relation does not exist"**
→ You forgot to run the SQL migration in Supabase

**Page refreshes give 404 on Vercel**
→ `vercel.json` handles this — make sure it's in root of project

**Auth not persisting after refresh**
→ Normal in dev sometimes — check Supabase → Authentication → Users to confirm signup worked

---

Built with ❤️ for streamers
