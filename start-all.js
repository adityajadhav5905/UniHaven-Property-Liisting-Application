import { spawn, execSync } from 'child_process';
import net from 'net';

const MYSQL_PORT = 3306;

/**
 * Checks if a port is actively open on localhost.
 */
function isPortOpen(port) {
  return new Promise((resolve) => {
    const client = new net.Socket();
    client.once('connect', () => {
      client.end();
      resolve(true);
    });
    client.once('error', () => {
      resolve(false);
    });
    client.connect({ port, host: '127.0.0.1' });
  });
}

/**
 * Tries starting the MySQL service on Windows.
 */
function tryStartMySQL() {
  console.log('MySQL port 3306 is closed. Attempting to start MySQL service...');
  const services = ['MySQL80', 'MySQL', 'wampmysqld64', 'mysql'];
  
  for (const service of services) {
    try {
      console.log(`Executing: net start ${service}`);
      execSync(`net start ${service}`, { stdio: 'inherit' });
      return true;
    } catch (e) {
      // Try next service name
    }
  }

  // Also try running standard command line daemon
  try {
    console.log('Attempting command line start: mysqld --console');
    const child = spawn('mysqld', ['--console'], { detached: true, stdio: 'ignore' });
    child.unref();
    return true;
  } catch (e) {
    // ignore
  }

  return false;
}

/**
 * Stream output from child process with colored prefix.
 */
function streamOutput(child, prefix, colorCode) {
  child.stdout.on('data', (data) => {
    const lines = data.toString().trim().split('\n');
    lines.forEach(line => {
      console.log(`\x1b[${colorCode}m[${prefix}]\x1b[0m ${line}`);
    });
  });

  child.stderr.on('data', (data) => {
    const lines = data.toString().trim().split('\n');
    lines.forEach(line => {
      console.error(`\x1b[31m[${prefix}-ERROR]\x1b[0m ${line}`);
    });
  });
}

async function main() {
  console.log('=== NESTLY AUTOMATED ENTERPRISE STARTUP ENGINE ===');

  // Step 1: Assert MySQL state
  let mysqlReady = await isPortOpen(MYSQL_PORT);
  if (!mysqlReady) {
    tryStartMySQL();
    
    // Wait for connection to wake up
    for (let i = 0; i < 6; i++) {
      await new Promise(r => setTimeout(r, 1000));
      mysqlReady = await isPortOpen(MYSQL_PORT);
      if (mysqlReady) break;
    }
  }

  if (mysqlReady) {
    console.log('✅ MySQL Database is responding on port 3306.');
  } else {
    console.warn('⚠️ Could not auto-start MySQL. Please ensure your MySQL instance is running manually.');
  }

  // Step 2: Spawn Backend (Port 5000)
  console.log('Starting Express Backend...');
  const backend = spawn('npm', ['run', 'start'], { 
    cwd: './server', 
    shell: true 
  });
  streamOutput(backend, 'BACKEND', '34'); // Blue prefix

  // Step 3: Spawn Frontend (Port 5173)
  console.log('Starting Vite Frontend...');
  const frontend = spawn('npm', ['run', 'dev'], { 
    cwd: './', 
    shell: true 
  });
  streamOutput(frontend, 'FRONTEND', '32'); // Green prefix

  // Handle exits cleanly
  process.on('SIGINT', () => {
    console.log('\nShutting down Nestly services...');
    backend.kill();
    frontend.kill();
    process.exit(0);
  });
}

main();
