export const handleLocation = async () => {
  const path = window.location.pathname;
  const module = await import(`./${path}.js`);
  const component = module.default; // or whatever the exported component is named
  const root = document.getElementById("root")!;
  root.innerHTML = '';
  if (component) {
    root.appendChild(component());
  }
};

window.onpopstate = handleLocation;
window.addEventListener('venta-link', function() {
  handleLocation();
});
handleLocation();

