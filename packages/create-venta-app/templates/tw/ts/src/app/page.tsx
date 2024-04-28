import { RootLayout } from './components/layout.js';

export default function Home() {
  return (
    <RootLayout>
      <div className="radial-gradient-overlay">
        <main className="flex flex-col justify-center items-center w-full relative">
          <a href='https://ventajs.dev/docs' target='_blank' rel='noreferrer'>
            <button className="bg-gray-800 border-2 border-gray-700  border-opacity-50 rounded-full py-1 px-4 text-sm font-semibold leading-6 text-gray-300 inline-block shadow-xl cursor-pointer hover:bg-gray-700 transition">
              View Documentation
              <span className="icon" />
            </button>
          </a>
          <div className="absolute inset-0 flex items-center justify-center bg-no-repeat bg-center mask-radial mask-size-contain z-0">
            <div />
          </div>
          <div>
            <p className="text-logo">
              Venta.js
            </p>
          </div>
          <div className="text-center z-10 text-gray-300">
            <p>
              Change this page by editing {' '}
              <code className="bg-gray-50 rounded mx-2 px-2 text-gray-800 inline-block my-4 font-mono">
                app/page.tsx
              </code>
            </p>
          </div>
        </main>
      </div>
    </RootLayout>
  );
}
