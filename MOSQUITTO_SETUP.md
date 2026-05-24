# Mosquitto MQTT Broker Setup for React Native / Expo Go

## Quick Setup

### Windows (XAMPP or Standalone)

#### 1. **Download Mosquitto**
- Download from: https://mosquitto.org/download/
- Choose "mosquitto-2.x.x-install-windows-x64.exe" (or 32-bit if needed)
- Install to default location

#### 2. **Configure Mosquitto for WebSocket**

Find the Mosquitto configuration file:
- **Default location**: `C:\Program Files\mosquitto\mosquitto.conf`
- **Or**: Find it by searching for `mosquitto.conf`

Edit the file and add these lines (if not already present):

```conf
# Standard MQTT Protocol (for backend/admin)
listener 1883
protocol mqtt

# WebSocket Protocol (for mobile/web clients)
listener 9001
protocol websockets
```

Save the file.

#### 3. **Start Mosquitto**

**Option A: Start as a Service (Windows)**
```bash
# Open Command Prompt as Administrator
net start mosquitto
```

**Option B: Start from Command Line**
```bash
# Navigate to Mosquitto installation directory
cd "C:\Program Files\mosquitto"
mosquitto -c mosquitto.conf
```

**Option C: Start from File Explorer**
- Navigate to: `C:\Program Files\mosquitto\`
- Double-click `mosquitto.exe`
- Leave the console window open

#### 4. **Verify Mosquitto is Running**

Check if ports are listening:
```bash
# Windows Command Prompt
netstat -an | findstr "1883\|9001"

# Should show:
# TCP    0.0.0.0:1883       LISTENING
# TCP    0.0.0.0:9001       LISTENING
```

---

## Mac/Linux Setup

### macOS (Homebrew)

```bash
# Install
brew install mosquitto

# Start service
brew services start mosquitto

# Or start manually
mosquitto -c /usr/local/etc/mosquitto/mosquitto.conf
```

### Linux (Ubuntu/Debian)

```bash
# Install
sudo apt-get install mosquitto mosquitto-clients

# Edit configuration
sudo nano /etc/mosquitto/mosquitto.conf

# Add these lines if not present:
# listener 1883
# protocol mqtt
# listener 9001
# protocol websockets

# Restart service
sudo systemctl restart mosquitto

# Verify it's running
sudo systemctl status mosquitto
```

---

## Configuration File Details

Your `mosquitto.conf` should have at least:

```conf
# MQTT Protocol listener (default port)
listener 1883
protocol mqtt

# WebSocket listener (for web/mobile apps)
listener 9001
protocol websockets

# Optional: Enable persistence
persistence true
persistence_location /var/lib/mosquitto/

# Optional: Set log level
log_dest file /var/log/mosquitto/mosquitto.log
log_level default
```

---

## Test MQTT Connection

### Using mosquitto_sub (Subscribe)

Open one terminal:
```bash
mosquitto_sub -h localhost -p 1883 -t "school/BSIT2A/WebDev"
```

### Using mosquitto_pub (Publish)

Open another terminal:
```bash
mosquitto_pub -h localhost -p 1883 -t "school/BSIT2A/WebDev" -m '{"title":"Test","message":"Hello World"}'
```

You should see the message in the subscriber window.

---

## Troubleshooting Mosquitto

### Issue: "Address already in use"
- Another service is using the port
- Check what's using port 1883 or 9001:
  ```bash
  # Windows
  netstat -ano | findstr ":1883"
  
  # Kill the process
  taskkill /PID <PID> /F
  ```

### Issue: "Permission denied" on Linux
- Run with sudo:
  ```bash
  sudo mosquitto -c /etc/mosquitto/mosquitto.conf
  ```

### Issue: WebSocket not working
- Verify port 9001 is in the config file
- Ensure `protocol websockets` is set
- Check firewall isn't blocking port 9001
- Restart Mosquitto after config changes

### Issue: Mobile app can't connect to MQTT
- Check if Mosquitto is actually running (see verify steps above)
- Update IP address in mobile-app config.js to your computer's IP
- Ensure phone/device is on the same WiFi network
- Check firewall allows ports 1883 and 9001
- Check Mosquitto logs for errors

---

## Network Configuration for Mobile App

Once Mosquitto is running with WebSocket enabled:

**mobile-app/src/config.js:**
```javascript
// Replace YOUR_IP with your computer's IP (get with ipconfig on Windows)
export const API_URL = 'http://YOUR_IP:5000/api';
export const MQTT_BROKER_WS_URL = 'ws://YOUR_IP:9001';
```

Example:
```javascript
export const API_URL = 'http://192.168.1.100:5000/api';
export const MQTT_BROKER_WS_URL = 'ws://192.168.1.100:9001';
```

---

## Full System Checklist

Before running mobile app, verify:

- [ ] **Backend running**: `npm run dev` in `/backend` 
- [ ] **MySQL running**: XAMPP MySQL service active
- [ ] **Mosquitto running**: Check `netstat` shows 1883 & 9001
- [ ] **Mosquitto WebSocket enabled**: Port 9001 configured
- [ ] **IP in config.js updated**: Use your computer's actual IP
- [ ] **Phone on same WiFi**: Connect to same network
- [ ] **Firewall allows ports**: 5000, 1883, 9001
- [ ] **Database imported**: `database.sql` in MySQL
- [ ] **Dependencies installed**: `npm install` in `/mobile-app`

---

## Development Tips

### Test WebSocket connection:
```bash
# Install wscat if not already
npm install -g wscat

# Test WebSocket connection
wscat -c ws://localhost:9001
```

### Monitor Mosquitto in real-time:
```bash
# Increase log level temporarily
mosquitto -c mosquitto.conf -v

# This will show all connections and messages
```

### Check active connections:
```bash
# List all processes using ports 1883 and 9001
lsof -i :1883
lsof -i :9001
```

---

## Firewall Configuration

### Windows Firewall
1. Open Windows Defender Firewall → Advanced Settings
2. Click "Inbound Rules" → "New Rule"
3. Select "Port"
4. Select "TCP", specify ports: `1883, 9001`
5. Allow the connection
6. Name it "Mosquitto MQTT"

### Mac Firewall
- Go to System Preferences → Security & Privacy → Firewall Options
- Allow Mosquitto through the firewall

### Linux (UFW)
```bash
sudo ufw allow 1883/tcp
sudo ufw allow 9001/tcp
```

---

## Reference

- **Mosquitto Official Docs**: https://mosquitto.org/man/mosquitto_8/
- **Mosquitto Configuration**: https://mosquitto.org/man/mosquitto-conf-5/
- **MQTT Protocol**: https://mqtt.org/
