# Load Average Calculator

Run with Node.js (no npm packages required):

```powershell
node server.js
```

Open `http://localhost:3000` in a browser.

The backend accepts `POST /api/calculate` with JSON such as:

```json
{ "loads": [0.5, 1.2, 2.1], "cpuCores": 4 }
```

