# 📦 Installation Guide

## Installing System Requirements

### 1. Install Node.js

**Option A: Via Homebrew (recommended for macOS)**
```bash
# Install Homebrew (if not already installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js
brew install node
```

**Option B: Direct Download**
1. Visit https://nodejs.org/
2. Download the LTS version for your operating system
3. Run the installer

**Option C: Node Version Manager (nvm)**
```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Restart terminal or:
source ~/.bashrc

# Install latest LTS version
nvm install --lts
nvm use --lts
```

### 2. Verify Installation

```bash
node --version   # Should show v18.x.x or higher
npm --version    # Should show 9.x.x or higher
```

## Install Project

### 1. Navigate to Project Directory
```bash
cd /path/to/schreckmonitor
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Database Connection
```bash
# Create configuration file
cp config.example.js config.js

# Edit config.js with your database credentials
nano config.js  # or use your preferred editor
```

### 4. Prepare MariaDB

Ensure MariaDB is running and the database exists:

```sql
-- Connect to MariaDB
mysql -u root -p

-- Create database (if not exists)
CREATE DATABASE IF NOT EXISTS cat_deterrent;
USE cat_deterrent;

-- Create table with updated schema including thumbnails
CREATE TABLE IF NOT EXISTS `detections_images` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `timestamp` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `camera_name` VARCHAR(50) NOT NULL,
    `accuracy` DECIMAL(3,4) NOT NULL,
    `thumbnail_jpeg` MEDIUMBLOB,
    `blob_jpeg` MEDIUMBLOB NOT NULL,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB;

-- Insert sample data (optional)
INSERT INTO detections_images (camera_name, accuracy, thumbnail_jpeg, blob_jpeg) VALUES 
('Camera 1', 0.95, LOAD_FILE('/path/to/test/thumbnail.jpg'), LOAD_FILE('/path/to/test/image.jpg')),
('Camera 2', 0.87, LOAD_FILE('/path/to/test/thumbnail2.jpg'), LOAD_FILE('/path/to/test/image2.jpg'));
```

## Start App

### Development Mode (with DevTools)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

### Build App for Distribution
```bash
npm run build
```

## Common Issues and Solutions

### "npm: command not found"
- Node.js is not installed or not in PATH
- Install Node.js as described above
- Restart terminal after installation

### "Database connection failed"
- Check MariaDB status: `brew services list | grep mariadb`
- Start MariaDB: `brew services start mariadb`
- Verify connection data in `config.js`

### "electron: command not found"
- Dependencies not installed: `npm install`
- Global installation: `npm install -g electron`

### Permission Errors
```bash
# Fix npm permissions
sudo chown -R $(whoami) ~/.npm
```

### Node.js Version Too Old
```bash
# Update with nvm
nvm install --lts
nvm use --lts

# Or with Homebrew
brew upgrade node
```

## Development Tools (optional)

### Initialize Git
```bash
git init
git add .
git commit -m "Initial commit: Schreckmonitor Gallery App"
```

### VS Code Extensions (recommended)
- Electron Debugger
- JavaScript (ES6) code snippets
- Prettier - Code formatter
- ESLint

## Next Steps

After successful installation, read `QUICK_START.md` for getting started with the application.
