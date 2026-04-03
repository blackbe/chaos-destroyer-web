Here’s the implementation for the unused code finder feature in the HugBack app. The implementation consists of a utility function that scans the React codebase for unused exported components and functions.

### Implementation

[FILE: src/utils/findUnusedExports.js]
```javascript
import fs from 'fs';
import path from 'path';

// Helper function to get all files in a directory recursively
const getFilesRecursively = (dir) => {
  return fs.readdirSync(dir).flatMap(file => {
    const filePath = path.join(dir, file);
    return fs.statSync(filePath).isDirectory()
      ? getFilesRecursively(filePath)
      : filePath;
  });
};

// Main function to find unused exports
export const findUnusedExports = (srcDir) => {
  const files = getFilesRecursively(srcDir);
  const exports = {};
  const imports = new Set();

  // Step 1: Gather all exports
  files.forEach(file => {
    const content = fs.readFileSync(file, 'utf-8');
    const matches = content.match(/export (function|const|class) (\w+)/g);
    if (matches) {
      matches.forEach(match => {
        const [, , name] = match.split(' ');
        exports[name] = file;
      });
    }
  });

  // Step 2: Gather all imports
  files.forEach(file => {
    const content = fs.readFileSync(file, 'utf-8');
    const matches = content.match(/import (\w+)/g);
    if (matches) {
      matches.forEach(match => {
        const [, name] = match.split(' ');
        imports.add(name);
      });
    }
  });

  // Step 3: Identify unused exports
  const unusedExports = Object.keys(exports).filter(exportName => !imports.has(exportName));
  return unusedExports.map(name => ({ name, file: exports[name] }));
};
```

### README.md

```markdown
# Unused Code Finder for HugBack

## What I Built
I built a utility function that scans the React codebase to find exported components and functions that are never imported anywhere in the code.

## How to Test It
1. Place the `findUnusedExports.js` file in the `src/utils/` directory.
2. Call the `findUnusedExports` function with the path to the `src/` directory.
3. Run the function in a Node.js environment to see the output of unused exports.

## Integration Steps
To integrate the utility, you can call the function in a script or a command line tool within your application. For example:
```javascript
import { findUnusedExports } from './utils/findUnusedExports';

const unusedExports = findUnusedExports('./src');
console.log(unusedExports);
```

## Supabase Schema Changes
No changes are required to the Supabase schema for this feature.

## Additional Notes
Ensure that the environment has access to the filesystem to read files. This feature is best run in a development setting.

```

### SCREENSHOTS.md

```markdown
# Unused Code Finder

## Code Example
Here is an example of how to use the `findUnusedExports` function:
```javascript
import { findUnusedExports } from './utils/findUnusedExports';

const unusedExports = findUnusedExports('./src');
console.log(unusedExports);
```

## Visual Description
When the function is executed, it will log an array of unused exported components/functions and their file paths, which can be reviewed by developers to clean up the codebase.
```

### CSS File (No CSS is required for this utility)

### Router Config
No new routes are required for this feature.

### Error Handling, Loading States, Accessibility
Since this code runs in a backend or script context, the primary focus is on checking for unused code, which doesn't require UI components, error handling, or loading states.

### PropTypes or TypeScript Types
This utility uses standard JavaScript, but you can easily convert it to TypeScript if desired.

### Conclusion
This implementation provides a foundational tool for identifying unused exports in the HugBack codebase, contributing to better code quality and maintainability.
