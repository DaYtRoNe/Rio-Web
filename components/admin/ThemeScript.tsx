export const THEME_STORAGE_KEY = "rio-admin-theme";

/**
 * Applies the saved admin theme to <html data-theme> before the page paints,
 * so there is no light→dark flash. Falls back to the OS preference.
 *
 * Must be rendered in the ROOT layout's <head>. An inline <script> placed in a
 * regular component is skipped during client-side navigation (React never
 * executes script tags it renders), which Next.js warns about; in <head> of the
 * root layout it is parsed once with the initial HTML and runs synchronously.
 */
export default function ThemeScript() {
  const code = `(function(){try{var t=localStorage.getItem(${JSON.stringify(
    THEME_STORAGE_KEY
  )});if(t!=="light"&&t!=="dark"){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";}document.documentElement.setAttribute("data-theme",t);}catch(e){}})();`;

  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}
