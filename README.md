# port-clear

> Kill process running on any given port. Zero dependencies, cross-platform support for Windows, macOS, Linux & Unix.

[![npm version](https://img.shields.io/npm/v/port-clear.svg)](https://www.npmjs.com/package/port-clear)
[![npm downloads](https://img.shields.io/npm/dm/port-clear.svg)](https://www.npmjs.com/package/port-clear)
[![license](https://img.shields.io/npm/l/port-clear.svg)](https://github.com/mreshank/port-clear/blob/main/LICENSE)
[![package size](https://img.shields.io/bundlephobia/min/port-clear.svg)](https://bundlephobia.com/package/port-clear)

## Why port-clear?

✅ **Zero dependencies** - Only uses Node.js built-in modules  
✅ **Smallest package** - ~2-3 kB (vs competitors at 174 kB)  
✅ **Cross-platform** - Windows, macOS, Linux, Unix support  
✅ **Multiple aliases** - Available as `port-clear`, `portkill`, `pkill-port`, etc.  
✅ **Flexible CLI** - Supports both positional and flag-based arguments  
✅ **Promise-based API** - Clean programmatic usage  

## Installation

### Global Installation

```bash
npm install -g port-clear
```

### One-time Use (Recommended)

```bash
# Use any of these aliases:
npx port-clear <port>
npx portkill <port>
npx pkill-port <port>
npx port-stop <port>
npx port-nuke <port>
npx port-eject <port>
```

### Project Dependency

```bash
npm install port-clear
```

## Usage

### CLI Usage

**Basic usage:**
```bash
npx port-clear 3000
```

**Multiple ports:**
```bash
npx port-clear 3000 8080 9000
```

**Flag-based syntax:**
```bash
npx port-clear -p 3000
npx port-clear -p 3000,8080,9000
```

**Verbose output:**
```bash
npx port-clear -p 3000 -v
```

**Kill UDP process:**
```bash
npx port-clear -p 3000 -m udp
```

**Using aliases:**
```bash
npx portkill 3000
npx port-stop 8080
npx port-nuke 9000
```

### Programmatic Usage

```javascript
const portClear = require('port-clear');

// Kill process on port 3000
await portClear(3000);

// Kill UDP process on port 3000
await portClear(3000, 'udp');

// With error handling
try {
  await portClear(3000);
  console.log('Port 3000 cleared successfully');
} catch (error) {
  console.error('Failed to clear port:', error.message);
}
```

## CLI Options

| Option | Alias | Description | Default |
|--------|-------|-------------|---------|
| `--port <port>` | `-p` | Port number(s) to kill (supports comma-separated) | - |
| `--method <method>` | `-m` | Protocol method: `tcp` or `udp` | `tcp` |
| `--verbose` | `-v` | Show detailed output | `false` |
| `--help` | `-h` | Show help message | - |

## API

### `portClear(port, method)`

Kill process running on specified port.

**Parameters:**
- `port` (number|string) - Port number to kill (1-65535)
- `method` (string) - Protocol method: `'tcp'` or `'udp'` (default: `'tcp'`)

**Returns:**
- `Promise<object>` - Result object containing:
  - `stdout` - Command output
  - `stderr` - Command errors
  - `port` - Port number
  - `platform` - Operating system platform
  - `pids` (Windows only) - Array of killed process IDs

**Throws:**
- `Error` - If port is invalid, no process is running, or kill operation fails

## Platform Support

| Platform | Supported | Command Used |
|----------|-----------|--------------|
| Windows | ✅ | `netstat -ano` + `taskkill` |
| macOS | ✅ | `lsof` + `kill` |
| Linux | ✅ | `lsof` + `kill` |
| Unix | ✅ | `lsof` + `kill` |

## Comparison with Alternatives

| Package | Size (Unpacked) | Dependencies | Cross-Platform |
|---------|-----------------|--------------|----------------|
| **port-clear** | **~2-3 kB** | **0** | **✅** |
| kill-port | 174.6 kB | 2 | ✅ |
| killport | 2.3 kB | 2 | ❌ (Unix only) |
| port-kill | ~100 kB | 0 | ✅ |

## Examples

### Kill development server port
```bash
npx port-clear 3000
```

### Free multiple ports at once
```bash
npx port-clear 3000 8080 8081 9000
```

### Kill process with verbose logging
```bash
npx port-clear -p 3000 -v
```

### Use in package.json scripts
```json
{
  "scripts": {
    "clear-port": "port-clear 3000",
    "dev": "port-clear 3000 && npm run start"
  }
}
```

### Integration in Node.js apps
```javascript
const portClear = require('port-clear');

async function startServer(port) {
  try {
    // Clear port before starting server
    await portClear(port);
    console.log(`Port ${port} is now available`);
    
    // Start your server
    app.listen(port);
  } catch (error) {
    console.error('Could not clear port:', error.message);
  }
}

startServer(3000);
```

## Error Handling

The package provides clear error messages for common issues:

- **Invalid port**: Port must be between 1 and 65535
- **No process running**: No process found on specified port
- **Permission denied**: Requires elevated privileges (run with sudo on Unix/Mac, or as Administrator on Windows)

## Requirements

- Node.js >= 14.0.0

## License

MIT © [Reshank M](https://github.com/mreshank)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Issues

If you encounter any problems, please [open an issue](https://github.com/mreshank/port-clear/issues) on GitHub.

## Package Aliases

This package is available under multiple names for convenience:

- [port-clear](https://www.npmjs.com/package/port-clear) (main)
- [portkill](https://www.npmjs.com/package/portkill)
- [pkill-port](https://www.npmjs.com/package/pkill-port)
- [port-stop](https://www.npmjs.com/package/port-stop)
- [port-nuke](https://www.npmjs.com/package/port-nuke)
- [port-eject](https://www.npmjs.com/package/port-eject)

All aliases provide the exact same functionality.
