# Kronos AI CRM - Deployment Guide

## Live AWS EC2 Instance
- **Hosted Application URL**: `http://65.2.220.208:8080`
- **GitHub Repository**: [https://github.com/RAVIKIRAN6424/Kronos-AI-Intelligent-Career-Assistant.git](https://github.com/RAVIKIRAN6424/Kronos-AI-Intelligent-Career-Assistant.git)

---

## 1. Microsoft IIS Deployment (Port 8080)
1. Install IIS on Windows Server.
2. Run `scripts/Install-IIS-UrlRewrite.bat`.
3. Create a Web Site in IIS Manager pointing to `dist/` or `frontend/dist/` binding to Port 8080.
4. Verify `web.config` is present in the site root directory.

---

## 2. Docker Deployment
Run Docker Compose in root:

```bash
docker-compose -f deployment/docker-compose.yml up -d --build
```

---

## 3. Nginx Deployment
Copy `deployment/nginx.conf` to `/etc/nginx/conf.d/default.conf` and restart Nginx:

```bash
sudo systemctl restart nginx
```
