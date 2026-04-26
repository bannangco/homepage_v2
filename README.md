# Bannangco Homepage

Bannangco(주식회사 반낭코) 공식 홈페이지입니다.  
Next.js App Router 기반의 culture-tech editorial company site로, 회사 소개, 서비스 아카이브, 공지사항, 연락처를 제공합니다.

## Stack

- Next.js 15, React 19, TypeScript
- Tailwind CSS
- Static source-controlled announcements
- Oracle Cloud Ubuntu VM + Nginx + PM2 deployment

## Local Development

```bash
npm ci
npm run dev
```

Production verification:

```bash
npm run lint
npm run build
npm run start
```

`npm run start` binds to `127.0.0.1:3001` so the app can sit behind Nginx beside another website.

## Content Editing

Public announcements are stored in `lib/announcements.ts`.

- Add or edit notices in that file.
- Detail pages are generated from the same source.
- There is no public browser-based announcement writer.
- Attachments/uploads are intentionally removed from this version.

## Oracle VM Deployment

Target:

- Domain: `bannangco.com`, `www.bannangco.com`
- Server: Oracle Cloud Ubuntu 24.04 Minimal aarch64
- Public IP: `131.186.26.33`
- App bind address: `127.0.0.1:3001`
- PM2 process name: `bannangco-homepage`

Server setup:

```bash
sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs git nginx certbot python3-certbot-nginx
sudo npm install -g pm2
```

Deploy:

```bash
git clone <REPOSITORY_URL> bannangco-homepage
cd bannangco-homepage
npm ci
npm run lint
npm run build
npm run start:pm2
pm2 save
pm2 startup
```

Nginx:

```bash
sudo cp deploy/nginx/bannangco.com.conf /etc/nginx/sites-available/bannangco.com
sudo ln -s /etc/nginx/sites-available/bannangco.com /etc/nginx/sites-enabled/bannangco.com
sudo nginx -t
sudo systemctl reload nginx
```

HTTPS:

```bash
sudo certbot --nginx -d bannangco.com -d www.bannangco.com
sudo certbot renew --dry-run
```

OCI networking:

- Allow inbound TCP `80` and `443` in the subnet security list or network security group.
- Keep `3001` private; Nginx proxies to it locally.
- Preserve any existing website with its own Nginx `server_name` block.

DNS:

- `A @ -> 131.186.26.33`
- `A www -> 131.186.26.33`

## Security Notes

- Legacy Firebase Hosting files and workflows were removed.
- The previous unsafe GitHub workflow that posted secrets to an external domain was removed.
- Rotate any GitHub/Firebase secrets that may have existed before this cleanup.
- `npm audit` should be reviewed before each production deploy.

## Useful Commands

- `npm run dev`: development server
- `npm run lint`: ESLint check
- `npm run build`: production build
- `npm run start`: production server on `127.0.0.1:3001`
- `npm run start:pm2`: start PM2 process
- `npm run stop:pm2`: stop PM2 process
