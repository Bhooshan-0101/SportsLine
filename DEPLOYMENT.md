# Deployment Guide

This guide covers deploying the SportsLine E-commerce Platform to various hosting providers.

## 🚀 Production Deployment

### Environment Setup

1. **Set Production Environment Variables**
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/sportsline
JWT_SECRET=your_super_secure_production_jwt_secret
CLIENT_URL=https://your-domain.com
```

2. **Build the Client**
```bash
cd client
npm run build
```

3. **Configure Server for Production**
The server is already configured to serve the built React app in production mode.

## 🌐 Deployment Options

### Option 1: Heroku Deployment

1. **Install Heroku CLI**
```bash
npm install -g heroku
heroku login
```

2. **Create Heroku App**
```bash
heroku create your-app-name
```

3. **Set Environment Variables**
```bash
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your_mongodb_uri
heroku config:set JWT_SECRET=your_jwt_secret
heroku config:set CLIENT_URL=https://your-app-name.herokuapp.com
```

4. **Deploy**
```bash
git add .
git commit -m "Deploy to Heroku"
git push heroku main
```

### Option 2: Railway Deployment

1. **Connect GitHub Repository**
   - Go to [Railway](https://railway.app)
   - Connect your GitHub repository
   - Select the repository

2. **Set Environment Variables**
   - Add all required environment variables in Railway dashboard
   - Set `NODE_ENV=production`

3. **Deploy**
   - Railway will automatically deploy on push to main branch

### Option 3: Render Deployment

1. **Create Web Service**
   - Go to [Render](https://render.com)
   - Create new Web Service
   - Connect GitHub repository

2. **Configure Build Settings**
   - Build Command: `npm install && cd client && npm install && npm run build`
   - Start Command: `npm start`

3. **Set Environment Variables**
   - Add all required environment variables
   - Set `NODE_ENV=production`

### Option 4: DigitalOcean App Platform

1. **Create App**
   - Go to DigitalOcean App Platform
   - Create new app from GitHub

2. **Configure Components**
   - Set build command: `npm install && cd client && npm install && npm run build`
   - Set run command: `npm start`

3. **Set Environment Variables**
   - Add all required environment variables

### Option 5: AWS EC2 (Manual Deployment)

1. **Launch EC2 Instance**
   - Choose Ubuntu 20.04 LTS
   - Configure security groups (ports 22, 80, 443)

2. **Install Dependencies**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install nginx -y
```

3. **Deploy Application**
```bash
# Clone repository
git clone https://github.com/yourusername/sportsline-ecommerce.git
cd sportsline-ecommerce

# Install dependencies
npm install
cd client && npm install && npm run build && cd ..

# Set up environment variables
cp server/.env.example server/.env
# Edit .env with production values

# Start with PM2
pm2 start server/server.js --name "sportsline"
pm2 startup
pm2 save
```

4. **Configure Nginx**
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🗄️ Database Setup

### MongoDB Atlas (Recommended)

1. **Create Cluster**
   - Go to [MongoDB Atlas](https://cloud.mongodb.com)
   - Create new cluster
   - Choose appropriate tier

2. **Configure Network Access**
   - Add IP addresses or allow all (0.0.0.0/0) for cloud deployment
   - Create database user

3. **Get Connection String**
   - Replace in MONGODB_URI environment variable

### Self-Hosted MongoDB

1. **Install MongoDB**
```bash
# Ubuntu
sudo apt install mongodb -y
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

2. **Configure Security**
```bash
# Create admin user
mongo
use admin
db.createUser({
  user: "admin",
  pwd: "secure_password",
  roles: ["userAdminAnyDatabase"]
})
```

## 🔒 Security Considerations

### SSL/TLS Certificate

1. **Using Certbot (Let's Encrypt)**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

2. **Update Nginx Configuration**
```nginx
server {
    listen 443 ssl;
    server_name your-domain.com;
    
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    
    # ... rest of configuration
}
```

### Environment Security

1. **Secure JWT Secret**
   - Use a strong, random JWT secret
   - Never commit secrets to version control

2. **Database Security**
   - Use strong database passwords
   - Enable authentication
   - Restrict network access

3. **File Upload Security**
   - Validate file types and sizes
   - Use secure upload directories
   - Implement virus scanning if needed

## 📊 Monitoring and Logging

### PM2 Monitoring

```bash
# View logs
pm2 logs sportsline

# Monitor processes
pm2 monit

# Restart application
pm2 restart sportsline
```

### Log Management

1. **Configure Log Rotation**
```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
```

2. **Application Logging**
   - Use Winston for structured logging
   - Log to files and external services
   - Monitor error rates and performance

## 🔄 CI/CD Pipeline

### GitHub Actions Example

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: |
        npm install
        cd client && npm install
        
    - name: Build client
      run: cd client && npm run build
      
    - name: Run tests
      run: |
        cd server && npm test
        cd ../client && npm test -- --coverage --watchAll=false
        
    - name: Deploy to Heroku
      uses: akhileshns/heroku-deploy@v3.12.12
      with:
        heroku_api_key: ${{secrets.HEROKU_API_KEY}}
        heroku_app_name: "your-app-name"
        heroku_email: "your-email@example.com"
```

## 🚨 Troubleshooting

### Common Issues

1. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Check for environment variable issues

2. **Database Connection Issues**
   - Verify MongoDB URI format
   - Check network connectivity
   - Ensure database user has proper permissions

3. **File Upload Issues**
   - Check upload directory permissions
   - Verify file size limits
   - Ensure proper CORS configuration

4. **Performance Issues**
   - Enable gzip compression
   - Implement caching strategies
   - Optimize database queries
   - Use CDN for static assets

### Health Checks

```bash
# Check application health
curl https://your-domain.com/api/health

# Check database connection
curl https://your-domain.com/api/health/db

# Monitor response times
curl -w "@curl-format.txt" -o /dev/null -s https://your-domain.com
```

## 📈 Scaling Considerations

### Horizontal Scaling

1. **Load Balancer Setup**
   - Use Nginx or cloud load balancers
   - Implement session management
   - Configure health checks

2. **Database Scaling**
   - MongoDB replica sets
   - Read replicas for read-heavy operations
   - Sharding for large datasets

3. **Caching**
   - Redis for session storage
   - CDN for static assets
   - Application-level caching

### Performance Optimization

1. **Code Optimization**
   - Bundle size optimization
   - Lazy loading components
   - Database query optimization

2. **Infrastructure**
   - Use appropriate server sizes
   - Implement auto-scaling
   - Monitor resource usage

## 📞 Support

For deployment issues:
- Check the troubleshooting section
- Review application logs
- Contact support team
- Create GitHub issues for bugs

---

**Remember to always test deployments in a staging environment first!**
