export function currentRoute(){const raw=location.hash.replace(/^#\/?/,'')||'dashboard';const [route,id]=raw.split('/');return {route,id};}
export function navigate(route){location.hash=`/${route}`;}
export function initRouter(callback){window.addEventListener('hashchange',callback);}
