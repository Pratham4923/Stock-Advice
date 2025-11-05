
# Live Stock Advice (Real-time)

A minimal real-time website for broadcasting stock-related commentary to an audience.

## Features
- Real-time broadcast from admin to all connected viewers (Socket.IO)
- Simple admin authentication via environment variable `ADMIN_KEY`
- Static hosting via Express

## Setup
1) Install dependencies from package.json:
```
npm i
```
2) Set an admin key (PowerShell example — applies only to current terminal):
```
$env:ADMIN_KEY = "your-strong-secret"
```
3) Optional: enable JSON persistence (default is in-memory). Two options are supported:
- In-memory (default): no extra setup.
- JSON file: set env vars and a path for the store (folder will be created if missing):
```
$env:STORAGE = "json"
$env:MESSAGE_STORE_PATH = ".\\data\\messages.json"
```
4) Start the server:
```
npm start
```
5) Open the app:
- Audience: http://localhost:3000/
- Admin: http://localhost:3000/admin (enter the admin key to unlock the console)

## Testing (optional)
```
npm test
```

## Notes
- Do not use the default `changeme` in production. Use a strong secret in `ADMIN_KEY`.
- This is a demo and not production-hardened (rate limits, persistence, TLS, logging, etc.).
- All content is for educational purposes and not financial advice.
=======
# Live Stock Advice (Real-time)

A minimal real-time website for broadcasting stock-related commentary to an audience.

## Features
- Real-time broadcast from admin to all connected viewers (Socket.IO)
- Simple admin authentication via environment variable `ADMIN_KEY`
- Static hosting via Express

## Setup
1) Install dependencies from package.json:
```
npm i
```
2) Set an admin key (PowerShell example — applies only to current terminal):
```
$env:ADMIN_KEY = "your-strong-secret"
```
3) Optional: enable JSON persistence (default is in-memory). Two options are supported:
- In-memory (default): no extra setup.
- JSON file: set env vars and a path for the store (folder will be created if missing):
```
$env:STORAGE = "json"
$env:MESSAGE_STORE_PATH = ".\\data\\messages.json"
```
4) Start the server:
```
npm start
```
5) Open the app:
- Audience: http://localhost:3000/
- Admin: http://localhost:3000/admin (enter the admin key to unlock the console)

## Testing (optional)
```
npm test
```

## Notes
- Do not use the default `changeme` in production. Use a strong secret in `ADMIN_KEY`.
- This is a demo and not production-hardened (rate limits, persistence, TLS, logging, etc.).
- All content is for educational purposes and not financial advice.
>>>>>>> 7068a31 (Initial commit for Advice update project)
