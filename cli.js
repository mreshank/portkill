#!/usr/bin/env node
'use strict';

const portClear = require('./index.js');

/**
 * Parse command line arguments
 * Supports both positional and flag-based arguments
 */
function parseArgs(argv) {
  const args = {
    ports: [],
    method: 'tcp',
    verbose: false,
    help: false
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];

    if (arg === '-h' || arg === '--help') {
      args.help = true;
    } else if (arg === '-v' || arg === '--verbose') {
      args.verbose = true;
    } else if (arg === '-p' || arg === '--port') {
      // Next argument is the port(s)
      i++;
      if (i < argv.length) {
        const portArg = argv[i];
        // Support comma-separated ports
        if (portArg.includes(',')) {
          args.ports.push(...portArg.split(',').map(p => p.trim()));
        } else {
          args.ports.push(portArg);
        }
      }
    } else if (arg === '-m' || arg === '--method') {
      // Next argument is the method (tcp/udp)
      i++;
      if (i < argv.length) {
        args.method = argv[i];
      }
    } else if (!arg.startsWith('-')) {
      // Positional argument - treat as port
      args.ports.push(arg);
    }
  }

  return args;
}

/**
 * Display help message
 */
function showHelp() {
  console.log(`
port-clear - Kill process running on any given port

USAGE:
  npx port-clear <port>                    Kill process on port
  npx port-clear <port1> <port2> ...       Kill processes on multiple ports
  npx port-clear -p <port>                 Kill process on port (flag syntax)
  npx port-clear -p <port> -v              Verbose output
  npx port-clear -p <port> -m udp          Kill UDP process (default: tcp)

ALIASES:
  npx portkill <port>
  npx pkill-port <port>
  npx port-stop <port>
  npx port-nuke <port>
  npx port-eject <port>

OPTIONS:
  -p, --port <port>      Port number(s) to kill (supports comma-separated)
  -m, --method <method>  Protocol method: tcp or udp (default: tcp)
  -v, --verbose          Show detailed output
  -h, --help             Show this help message

EXAMPLES:
  npx port-clear 3000
  npx port-clear 3000 8080 9000
  npx port-clear -p 3000
  npx port-clear -p 3000,8080,9000
  npx port-clear -p 3000 -v
  npx port-clear -p 3000 -m udp
  npx portkill 3000

PROGRAMMATIC USAGE:
  const portClear = require('port-clear');
  await portClear(3000);
  await portClear(3000, 'udp');
`);
}

/**
 * Main CLI execution
 */
async function main() {
  const argv = process.argv.slice(2);
  const args = parseArgs(argv);

  // Show help if requested or no ports provided
  if (args.help || args.ports.length === 0) {
    showHelp();
    process.exit(args.help ? 0 : 1);
  }

  // Process all ports
  const results = await Promise.allSettled(
    args.ports.map(async (port) => {
      try {
        const result = await portClear(port, args.method);
        console.log(`✓ Process on port ${port} killed successfully`);
        
        if (args.verbose) {
          console.log(`  Platform: ${result.platform}`);
          if (result.pids) {
            console.log(`  PIDs: ${result.pids.join(', ')}`);
          }
          if (result.stdout) {
            console.log(`  Output: ${result.stdout.trim()}`);
          }
        }
        
        return { port, success: true };
      } catch (error) {
        console.error(`✗ Failed to kill process on port ${port}: ${error.message}`);
        
        if (args.verbose) {
          console.error(`  Error details: ${error.stack}`);
        }
        
        return { port, success: false, error: error.message };
      }
    })
  );

  // Determine exit code based on results
  const hasFailures = results.some(r => r.status === 'rejected' || !r.value.success);
  process.exit(hasFailures ? 1 : 0);
}

// Run CLI
main().catch((error) => {
  console.error(`Unexpected error: ${error.message}`);
  process.exit(1);
});
