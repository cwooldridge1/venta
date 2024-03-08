import { render } from '../utils/rendering';
const handleLocation = async () => {
  const path = window.location.pathname;
  // Dynamically import the module based on the current path
  try {
    console.log('trying')
    const module = await import(`${path}.bundle.js`);
    console.log('module', module)
    // Assuming the module exports a component or function that can be rendered
    const component = module.default; // or whatever the exported component is named
    const root = document.getElementById("root")
    root.innerHTML = '';
    root.appendChild(component());
  } catch (error) {
    console.error('Error loading the component bundle:', error);
    // Handle the loading error (e.g., component not found)
  }
};

window.onpopstate = handleLocation;

handleLocation();
