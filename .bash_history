apt update && apt upgrade -y
apt install -y curl
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs
node -v
cd cd
ls
cd backend/
ls
ls package.json
rm -rf /root/backend
rm -rf /backend
ls
pwd
cd ..
rm -rf /root/backend
ls
cd backend/
ls
cd ..
rm -rf backend
ls
apt install -y unzip
ls
l
ls
unzip backend.zip
ls
cd backend/
ls
npm install
npm run build
chmod +x ./node_modules/.bin/tsc
npm run build
npx prisma generate
chmod +x ./node_modules/.bin/prisma
npx prisma generate
ls -l prisma.config.*
cat prisma.config.js
mkdir -p prisma_config_backup
mv prisma.config.* prisma_config_backup/
DATABASE_URL="file:./prisma/dev.db" npx prisma generate --schema=prisma/schema.prisma
npm run build
nano src/middleware/auth.ts
npm run build
nano src/middleware/auth.ts
npm run build
ls
cd ..
ls
cd backend/
ls
cat tsconfig.json
nano tsconfig.json
npm run build
nano tsconfig.json
npm run build
nano tsconfig.json
npm run build
nano tsconfig.json
npm run build
l
npm start
rm -rf node_modules
rm -rf dist
npm install
DATABASE_URL="file:./prisma/dev.db" npx prisma generate --schema=prisma/schema.prisma
npm run build
npm start
npm install -g pm2
cd /root/backend
pm2 start dist/index.js --name mora-backend
pm2 list
pm2 startup
pm2 save
ls
cd ..
ls
unzip frontend.zip
cd frontend/
ls
cat package.json
cd /root/frontend
cat package.json
find . -maxdepth 2 \( -name ".env*" -o -name "*.ts" -o -name "*.tsx" \) | grep -E "main|App|api|config|env" | head -20
grep -R "http://localhost" -n src
grep -R "127.0.0.1" -n src
grep -R "VITE_" -n src .
grep -R "fetch(" -n src
grep -R "http://" -n src
grep -R "https://" -n src
apt install -y nginx
ls
rm -rf node_modules
rm -rf dist
npm install
npm run build
ls
cat > /etc/nginx/sites-available/mora <<'EOF'
server {
    listen 80;
    server_name _;

    root /root/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
EOF

ln -s /etc/nginx/sites-available/mora /etc/nginx/sites-enabled/mora
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx
systemctl status nginx --no-pager
tail -n 50 /var/log/nginx/error.log
ls -ld /root /root/frontend /root/frontend/dist
mkdir -p /var/www/mora
cp -r /root/frontend/dist/* /var/www/mora/
chown -R www-data:www-data /var/www/mora
chmod -R 755 /var/www/mora
nano /etc/nginx/sites-available/mora
nginx -t
systemctl restart nginx
ls
cd ..
cd backend/
nano .env
pm2 restart all
pm2 logs
curl -i http://127.0.0.1:5000/api/health
curl -i http://TUO_IP/api/health
sudo nano /etc/nginx/sites-available/default
curl -i http://127.0.0.1:5000/api/health
curl -4 ifconfig.me
hostname -I
curl -i http://185.197.194.68/api/health
curl -i -X POST http://185.197.194.68/api/auth/login   -H "Content-Type: application/json"   -d '{"email":"test@gmail.com","password":"123456"}'
cd ..
cd frontend/
npm run build
sudo rm -rf /var/www/mora/*
sudo cp -r dist/* /var/www/mora/
cd ..
cd backend/
cat .env
nano .env
cat .env
nano .env
pm2 restart all
sudo nginx -T | grep server_name
ping moraapp.it
185.197.194.68
dig moraapp.it +short
sudo nano /etc/nginx/sites-available/default
sudo nginx -t
sudo systemctl reload nginx
sudo apt update
sudo certbot --nginx -d moraapp.it -d www.moraapp.it
sudo apt update
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d moraapp.it -d www.moraapp.it
sudo grep -R "server_name" /etc/nginx/sites-available /etc/nginx/sites-enabled
sudo nano /etc/nginx/sites-available/mora
sudo nginx -t
sudo systemctl reload nginx
sudo certbot install --cert-name moraapp.it
cd ~/backend
grep ALLOWED_ORIGINS .env
nano ~/backend/.env
pm2 restart all
sudo nginx -t
sudo systemctl reload nginx
85.197.194.6wqwqwqwq
sudo nginx -t
sudo systemctl reload nginx
sudo nginx -t
sudo systemctl reload nginx
sudo nginx -t
sudo systemctl reload nginx
cd backend/
npm install
npm run build
pm2 restart all
cd ..
sudo nginx -t
sudo systemctl reload nginx
ls
cd ..
ls
cd var/
cd www/
cd mora/
zip -r progetto_funzionante.zip .
apt install zip
zip -r progetto_funzionante.zip .
scp user@ip-server:/var/www/mora/progetto_funzionante.zip .
scp root@185.197.194.68:/var/www/mora/progetto_funzionante.zip .
exit
cat /etc/nginx/sites-available/default
grep -R "proxy_pass" /etc/nginx 2>/dev/nul
grep -R "proxy_pass" /etc/nginx 2>/dev/null
find /var/www -maxdepth 4 -type f -name "package.json"
find /var/www -maxdepth 4 -type f -name ".env*"
find /var/www -maxdepth 4 -type f -name "vite.config.*"
ls
rm frontend.zip 
rm backend.zip 
ls
zip -r frontend_sorgente.zip frontend
zip -r backend_sorgente.zip backend
zip -r frontend_sorgente.zip frontend
ls
exit
find / -type f -name "package.json" 2>/dev/null | grep -v "/node_modules/" | grep -v "/usr/"
find / -type f -name "vite.config.*" 2>/dev/null
find / -type f -name "index.html" 2>/dev/null | grep -E "frontend|mora|dist"
ls -lah /var/www/mora
ls -lah /var/www/mora/assets
ls -lah ~/frontend/dist
systemctl reload nginx
systemctl reoad nginx
systemctl reload nginx
exit.php
exit
systemctl reload nginx
pm2 
exit
systemctl reload nginx
exit
cd backend/
npm install
npm install -g npm@11.12.1
npm error code 1
npm error path /root/backend/node_modules/prisma
npm error command failed
npm error command sh -c node scripts/preinstall-entry.js
npm error ┌────────────────────────────────────────────────────────────────────┐
npm error │    Prisma only supports Node.js versions 20.19+, 22.12+, 24.0+.    │
npm error │    Please upgrade your Node.js version.                            │
npm error └────────────────────────────────────────────────────────────────────┘
npm notice
npm notice New major version of npm available! 10.8.2 -> 11.12.1
npm notice Changelog: https://github.com/npm/cli/releases/tag/v11.12.1
npm notice To update run: npm install -g npm@11.12.1
npm notice
npm error A complete log of this run can be found in: /root/.npm/_logs/2026-03-30T16_06_57_895Z-debug-0.log
root@vmi3170408:~/backend# npm install -g npm@11.12.1
npm error code EBADENGINE
npm error engine Unsupported engine
npm error engine Not compatible with your version of node/npm: npm@11.12.1
npm error notsup Not compatible with your version of node/npm: npm@11.12.1
npm error notsup Required: {"node":"^20.17.0 || >=22.9.0"}
npm error notsup Actual:   {"npm":"10.8.2","node":"v18.20.8"}
npm error A complete log of this run can be found in: /root/.npm/_logs/2026-03-30T16_07_27_505Z-debug-0.log
root@vmi3170408:~/backend# npm install -g npm@11.12.1
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs
node -v
npm -v
rm -rf node_modules package-lock.json
npm install
npx prisma generate
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
npm ls prisma @prisma/client
rm -rf node_modules package-lock.json
npm cache clean --force
npm remove prisma @prisma/client
npm install prisma@6.19.2 @prisma/client@6.19.2
npm ls prisma @prisma/client
mv prisma.config.ts prisma.config.ts.bak
nano ~/backend/prisma/schema.prisma
npx prisma generate
npx prisma db push
pm2 restart all
