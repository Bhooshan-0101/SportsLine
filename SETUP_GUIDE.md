# SportsLine Setup Guide

## Current Status ✅

The application is now running with a **mock server** that provides basic functionality:

- **Client**: Running on http://localhost:3000
- **Mock Server**: Running on http://localhost:5000
- **API Health**: http://localhost:5000/api/health

## What's Working Now

✅ **Login/Authentication**: Basic login with mock users
✅ **Product Display**: Mock product data
✅ **Console Errors**: Fixed console filter issues
✅ **API Endpoints**: Basic endpoints responding

## Mock Users Available

### Customer Account
- **Email**: `pavi@gmail.com`
- **Password**: Any password (mock authentication)

### Admin Account  
- **Email**: `admin@sportsline.com`
- **Password**: Any password (mock authentication)

## To Get Full Functionality

### Install MongoDB (Required for full features)

#### Option 1: MongoDB Community Server (Recommended)
1. Download from: https://www.mongodb.com/try/download/community
2. Install MongoDB Community Server
3. Start MongoDB service:
   ```bash
   # Windows (as Administrator)
   net start MongoDB
   
   # Or start manually
   mongod --dbpath "C:\data\db"
   ```

#### Option 2: MongoDB Atlas (Cloud)
1. Create account at: https://www.mongodb.com/atlas
2. Create a free cluster
3. Get connection string
4. Update `server/.env` file:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/sportsline
   ```

### Switch to Full Server

Once MongoDB is running:

1. **Stop the mock server**:
   ```bash
   # Find the process
   netstat -ano | findstr :5000
   # Kill it
   taskkill /PID [PID_NUMBER] /F
   ```

2. **Start the full server**:
   ```bash
   cd server
   npm start
   ```

3. **Seed the database** (optional):
   ```bash
   cd server
   npm run seed
   ```

## Current Error Resolution ✅

### Fixed Issues:
1. **Console Filter Errors**: Updated error handling in `client/src/utils/consoleFilter.js`
2. **500 API Errors**: Replaced with mock server responses
3. **Database Connection**: Graceful handling when MongoDB is unavailable
4. **Server Startup**: Mock server provides immediate functionality

### Browser Console Should Now Show:
- ✅ No console filter errors
- ✅ Successful API calls to mock endpoints
- ✅ Proper authentication flow

## Development Commands

### Client (React)
```bash
cd client
npm start          # Start development server
npm run build      # Build for production
npm test           # Run tests
```

### Server (Node.js)
```bash
cd server
npm start          # Start production server
npm run dev        # Start with nodemon (auto-reload)
npm test           # Run tests
npm run seed       # Seed database with sample data
```

### Mock Server (Current)
```bash
cd server
node mock-server.js  # Start mock server (currently running)
```

## Next Steps

1. **Install MongoDB** for full functionality
2. **Test login** with the provided mock credentials
3. **Explore the application** - most features should work
4. **Switch to full server** when MongoDB is ready

## Troubleshooting

### If you see 500 errors:
- The mock server should handle this, but if you see them, restart the mock server

### If login doesn't work:
- Use the mock credentials provided above
- Check that the mock server is running on port 5000

### If the client won't start:
- Make sure port 3000 is available
- Run `npm install` in the client directory

### If you need the full database features:
- Install MongoDB and switch to the full server
- Run the seed script to populate with sample data
