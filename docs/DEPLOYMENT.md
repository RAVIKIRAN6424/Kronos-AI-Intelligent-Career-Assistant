# Kronos AI CRM - Deployment Guide

## Live Production Environments
- **Frontend Live Application (Vercel)**: [https://kronos-ai-intelligent-career-assist.vercel.app/](https://kronos-ai-intelligent-career-assist.vercel.app/)
- **Backend REST API (Render)**: [https://kronos-ai-intelligent-career-assistant.onrender.com](https://kronos-ai-intelligent-career-assistant.onrender.com)
- **Backend Health Check**: [https://kronos-ai-intelligent-career-assistant.onrender.com/health](https://kronos-ai-intelligent-career-assistant.onrender.com/health)
- **GitHub Repository**: [https://github.com/RAVIKIRAN6424/Kronos-AI-Intelligent-Career-Assistant.git](https://github.com/RAVIKIRAN6424/Kronos-AI-Intelligent-Career-Assistant.git)

---

## 1. Docker Deployment
Run Docker Compose in root:

```bash
docker-compose -f deployment/docker-compose.yml up -d --build
```

---

## 2. Nginx Deployment
Copy `deployment/nginx.conf` to `/etc/nginx/conf.d/default.conf` and restart Nginx:

```bash
sudo systemctl restart nginx
```
