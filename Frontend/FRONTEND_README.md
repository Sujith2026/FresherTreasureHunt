# Data Hunter - Frontend

React + Vite frontend for the Data Hunter QR-based scavenger hunt platform.

## 🚀 Features

- **Authentication System**: Team registration and login with JWT
- **QR Code Scanner**: Real-time camera-based QR scanning using html5-qrcode
- **Live Leaderboard**: Auto-refreshing team rankings
- **Team Dashboard**: View stats, points, current stage, and scan history
- **Responsive Design**: Mobile-first design with TailwindCSS
- **Toast Notifications**: Real-time feedback for user actions
- **Protected Routes**: Secure access to authenticated pages

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Button.jsx      # Customizable button component
│   ├── Card.jsx        # Card container component
│   ├── LoadingSpinner.jsx
│   ├── Modal.jsx       # Modal dialog component
│   ├── Navbar.jsx      # Navigation bar with auth status
│   └── ProtectedRoute.jsx
│
├── config/
│   └── api.js          # Axios configuration with interceptors
│
├── context/
│   └── AuthContext.jsx # Global authentication state management
│
├── pages/              # Page components
│   ├── HomePage.jsx
│   ├── AboutPage.jsx
│   ├── InstructionsPage.jsx
│   ├── LoginPage.jsx
│   ├── SignupPage.jsx
│   ├── ScanQrPage.jsx
│   ├── LeaderboardsPage.jsx
│   └── NotFoundPage.jsx
│
├── services/           # API service layer
│   ├── authService.js
│   ├── teamService.js
│   ├── scanService.js
│   ├── leaderboardService.js
│   └── adminService.js
│
├── App.jsx             # Root component with toast provider
└── main.jsx            # Entry point with routing
```

## 🛠️ Tech Stack

- **React** 19.1.1
- **Vite** 7.1.7 - Build tool
- **React Router** 7.9.5 - Client-side routing
- **TailwindCSS** 4.1.16 - Styling
- **Axios** - HTTP client
- **html5-qrcode** 2.3.8 - QR scanner
- **react-hot-toast** - Toast notifications
- **lucide-react** - Icon library

## 📦 Installation

### Prerequisites

- Node.js 16+ and npm
- Backend server running on port 5000

### Setup Steps

1. **Navigate to frontend directory**:

   ```bash
   cd Utkrishta/Frontend/matrix-utkrishta
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Configure environment** `.env`:

   ```env
   VITE_API_URL=http://localhost:5000
   ```

4. **Start development server**:

   ```bash
   npm run dev
   ```

   Frontend will run on **http://localhost:5173**

## 🔑 API Services

### Auth Service (`authService.js`)

- `register(teamData)` - Register new team
- `login(credentials)` - Login team
- `logout()` - Clear auth data
- `getCurrentTeam()` - Get stored team
- `isAuthenticated()` - Check auth status

### Team Service (`teamService.js`)

- `getProfile()` - Get team profile
- `updateProfile(updates)` - Update team info
- `addMember(memberName)` - Add team member
- `removeMember(memberId)` - Remove team member
- `getScanHistory()` - Get scan history
- `getStats()` - Get team statistics

### Scan Service (`scanService.js`)

- `scanQR(qrCode)` - Submit QR code scan
- `getStats()` - Get scan statistics

### Leaderboard Service (`leaderboardService.js`)

- `getLeaderboard()` - Get current rankings

### Admin Service (`adminService.js`)

- Dashboard, teams, QR stages, scan logs management
- Full CRUD operations for admin panel

## 🎨 Key Components

### AuthContext

Provides global authentication state:

```jsx
const { team, isAuthenticated, loading, login, register, logout, updateTeam } =
  useAuth();
```

### ProtectedRoute

Wraps routes that require authentication:

```jsx
<Route
  path="/scan-qr"
  element={
    <ProtectedRoute>
      <ScanQrPage />
    </ProtectedRoute>
  }
/>
```

### QR Scanner (ScanQrPage)

- Camera integration with html5-qrcode
- Real-time QR code detection
- Automatic scan result processing
- Scan history display

## 🚦 Routes

| Path            | Component        | Protected | Description       |
| --------------- | ---------------- | --------- | ----------------- |
| `/`             | HomePage         | No        | Landing page      |
| `/about`        | AboutPage        | No        | About the event   |
| `/instructions` | InstructionsPage | No        | How to play       |
| `/login`        | LoginPage        | No        | Team login        |
| `/signup`       | SignupPage       | No        | Team registration |
| `/leaderboards` | LeaderboardsPage | No        | Live rankings     |
| `/scan-qr`      | ScanQrPage       | **Yes**   | QR scanner        |

## 🎯 User Flow

1. **Registration/Login**

   - Team creates account or logs in
   - JWT token stored in localStorage
   - Redirected to scanner page

2. **QR Scanning**

   - Access camera for QR scanning
   - Scan codes in correct sequence
   - View real-time points and stage updates
   - Check scan history

3. **Leaderboard**
   - View live team rankings
   - Auto-refresh every 30 seconds
   - See own team highlighted

## 🔒 Authentication Flow

1. User submits login/register form
2. API request sent via `authService`
3. On success:

   - Token stored in localStorage
   - Team data stored in localStorage
   - AuthContext updated
   - User redirected to /scan-qr

4. Protected routes check `isAuthenticated`
5. Axios interceptor adds token to requests
6. On 401 response, user logged out automatically

## 🎨 Styling

Using TailwindCSS with custom color scheme:

- Primary: Blue (blue-600, blue-700)
- Success: Green
- Error: Red
- Warning: Yellow

Components use consistent spacing, shadows, and transitions.

## 📱 Responsive Design

- Mobile-first approach
- Hamburger menu for mobile navigation
- Touch-friendly button sizes
- Adaptive layouts for all screen sizes

## 🐛 Error Handling

- API errors displayed via toast notifications
- Form validation with error messages
- Loading states for async operations
- Fallback UI for no data states

## 🚀 Build for Production

```bash
npm run build
```

Output in `dist/` directory. Serve with:

```bash
npm run preview
```

## 🧪 Test Login

Use these credentials from the seeded database:

- **Team Name**: Alpha Hunters
- **Password**: password123

## 📝 Environment Variables

| Variable       | Description     | Default               |
| -------------- | --------------- | --------------------- |
| `VITE_API_URL` | Backend API URL | http://localhost:5000 |

## 🤝 Integration with Backend

Frontend expects backend on port 5000 with these endpoints:

```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/team/profile
POST   /api/scan
GET    /api/leaderboard
... (21 total endpoints)
```

See backend `README.md` for complete API documentation.

## 📄 License

MIT License - See LICENSE file for details.

---

## **Made with ❤️ for Data Hunter 2025**

## 🚀 Deployment on Vercel

1. Go to [Vercel](https://vercel.com/) and create a new project.
2. Import this repository or upload your frontend code.
3. Set environment variable:
   - `VITE_API_URL` (your Railway backend URL, e.g., https://data-hunter-backend-production.up.railway.app)
4. Ensure `vercel.json` exists and proxies `/api` requests to your backend.
5. Deploy! Vercel will build and host your frontend automatically.

## 🛠️ Notes

- SPA routing is handled by `vercel.json` rewrites.
- For local development, use `.env` file with `VITE_API_URL`.
