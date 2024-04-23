import glob from 'glob';

export function loadFile(pattern) {
  try {
    const files = glob.sync(pattern, { cwd: process.cwd() });
    if (files.length === 0) {
      return null;
    }

    const configFile = files[0];
    const filePath = path.resolve(process.cwd(), configFile);

    if (configFile.endsWith('ts')) {
      // Use ts-node to handle TypeScript files, if applicable
      return require('ts-node').register({ transpileOnly: true });
    }

    return require(filePath);
  } catch (error) {
    console.error('Error loading file:', error);
    return null;
  }
}



// Default configuration to use if no config file is found
const defaultTailwindConfig = {
  content: ['./app/src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {},
  },
  variants: {},
  plugins: [],
};



const defaultPostcssConfig = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}

const typescriptCompilerOptions = {
  "target": "ES5",
  "module": "ESNext",
  "moduleResolution": "node",
  "outDir": "./dist",
  "rootDir": "./src",
  "strict": true
}

const defaultTypescriptConfig = {
  "compilerOptions": typescriptCompilerOptions
}



export const getTailwindConfig = () => loadFile('tailwind.config.*') || defaultTailwindConfig
export const getPostCssConfig = () => loadFile('postcss.config.*') || defaultPostcssConfig

export const getTypeScriptConfig = () => {
  let typescriptConfig = loadFile('tsconfig.json')
  if (typescriptConfig === null) {
    typescriptConfig = { ...typescriptConfig, ...defaultTypescriptConfig }
  }
  return typescriptConfig
}
