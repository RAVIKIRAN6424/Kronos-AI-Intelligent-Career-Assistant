# 🚀 Kronos AI - Deployment Guide (AWS EC2 & Docker)

## 1. AWS EC2 Deployment Architecture

- **Public IP / URL**: `http://65.2.220.208:8080`
- **Reverse Proxy**: Nginx listening on Port 8080.
- **Process Manager**: PM2 running `backend/src/server.js` on Port 3001.

---

## 2. Docker & Docker Compose Setup

Run Kronos AI inside Docker containers using `deployment/docker-compose.yml`:

```yaml
version: '3.8'

services:
  app:
    build:
      context: ..
      dockerfile: deployment/Dockerfile
    ports:
      - "8080:8080"
    environment:
      - PORT=8080
      - NODE_ENV=production
      - EMAIL_USER=kronosai6424@gmail.com
      - EMAIL_PASS=atzrgeyqytdueovb
    volumes:
      - ../backend/database.db:/app/backend/database.db
    restart: always
```

### Command Execution:
```bash
cd deployment
docker-compose up -d --build
```

---

## 3. IIS Web Server Deployment (`deployment/web.config`)

For deployment on IIS (Windows Server), the `deployment/web.config` file routes request paths to `backend/src/server.js` via `iisnode` or static file modules:

```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <system.webServer>
    <handlers>
      <add name="iisnode" path="backend/src/server.js" verb="*" modules="iisnode" />
    </handlers>
    <rewrite>
      <rules>
        <rule name="NodeAPI" stopProcessing="true">
          <match url="^api/.*" />
          <action type="Rewrite" url="backend/src/server.js" />
        </rule>
      </rules>
    </rewrite>
  </system.webServer>
</configuration>
```
