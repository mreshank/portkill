'use strict';

const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

/**
 * Kill process running on specified port
 * @param {number|string} port - Port number to kill
 * @param {string} method - Protocol method: 'tcp' or 'udp' (default: 'tcp')
 * @returns {Promise<object>} Result object with stdout, stderr, and port
 */
async function portClear(port, method = 'tcp') {
  // Validate port
  port = parseInt(port, 10);
  
  if (!port || isNaN(port) || port < 1 || port > 65535) {
    throw new Error(`Invalid port number: ${port}. Port must be between 1 and 65535.`);
  }

  // Validate method
  method = method.toLowerCase();
  if (method !== 'tcp' && method !== 'udp') {
    throw new Error(`Invalid method: ${method}. Method must be 'tcp' or 'udp'.`);
  }

  const platform = process.platform;

  try {
    if (platform === 'win32') {
      return await killPortWindows(port, method);
    } else {
      return await killPortUnix(port, method);
    }
  } catch (error) {
    // Re-throw with more context
    if (error.message.includes('No process running')) {
      throw error;
    }
    throw new Error(`Failed to kill process on port ${port}: ${error.message}`);
  }
}

/**
 * Kill port on Windows systems
 */
async function killPortWindows(port, method) {
  // Find process using the port
  const findCommand = 'netstat -ano';
  const { stdout: netstatOutput } = await execAsync(findCommand);

  if (!netstatOutput) {
    throw new Error(`No process running on port ${port}`);
  }

  const lines = netstatOutput.split('\n');
  const protocol = method.toUpperCase();
  
  // Match lines with the specified port and protocol
  const portRegex = new RegExp(`^\\s*${protocol}\\s+[^:]*:${port}\\s`, 'gm');
  const matchingLines = lines.filter(line => portRegex.test(line));

  if (matchingLines.length === 0) {
    throw new Error(`No process running on port ${port}`);
  }

  // Extract PIDs from matching lines
  const pids = [];
  matchingLines.forEach(line => {
    const parts = line.trim().split(/\s+/);
    const pid = parts[parts.length - 1];
    if (pid && !isNaN(pid) && !pids.includes(pid)) {
      pids.push(pid);
    }
  });

  if (pids.length === 0) {
    throw new Error(`No process running on port ${port}`);
  }

  // Kill all processes
  const killCommand = `taskkill /F /PID ${pids.join(' /PID ')}`;
  const result = await execAsync(killCommand);

  return {
    ...result,
    port,
    pids,
    platform: 'win32'
  };
}

/**
 * Kill port on Unix-like systems (macOS, Linux, Unix)
 */
async function killPortUnix(port, method) {
  // Check if process exists on port
  const checkCommand = `lsof -i :${port}`;
  
  try {
    await execAsync(checkCommand);
  } catch (error) {
    // lsof returns non-zero exit code if no process found
    throw new Error(`No process running on port ${port}`);
  }

  // Find and kill process
  const protocol = method === 'udp' ? 'udp' : 'tcp';
  const grepPattern = method === 'udp' ? 'UDP' : 'LISTEN';
  
  // Use lsof to find PID and kill it
  const killCommand = `lsof -ti ${protocol}:${port} | xargs kill -9`;
  
  try {
    const result = await execAsync(killCommand);
    return {
      ...result,
      port,
      platform: process.platform
    };
  } catch (error) {
    // Check if it's because no process was found
    if (error.code === 123 || error.message.includes('xargs')) {
      throw new Error(`No process running on port ${port}`);
    }
    throw error;
  }
}

module.exports = portClear;
module.exports.default = portClear;
