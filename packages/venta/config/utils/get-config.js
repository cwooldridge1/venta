import path from 'path';
import fs from 'fs';

export function getDefaultImportAlias(dir) {
  const tsConfigPath = path.join(dir, 'tsconfig.json');
  const jsConfigPath = path.join(dir, 'jsconfig.json');
  let configPath = '';

  if (fs.existsSync(tsConfigPath)) {
    configPath = tsConfigPath;
  } else if (fs.existsSync(jsConfigPath)) {
    configPath = jsConfigPath;
  } else {
    return null;
  }

  try {
    const configJson = fs.readFileSync(configPath, 'utf8');
    const config = JSON.parse(configJson);

    if (config.compilerOptions && config.compilerOptions.paths) {
      return Object.fromEntries(Object.entries(config.compilerOptions.paths)
        .map(([key, value]) => {
          const prefix = key[0].split('/')[0];
          const pathParts = value[0].split('/');
          pathParts.shift();
          pathParts.pop();
          const prefixPath = path.resolve(process.cwd(), pathParts.join('/'));
          return [prefix, prefixPath]
        }));
    }
  } catch (error) {
    console.error('Failed to read or parse the configuration file:', error);
    return null;
  }

  return null;
}

