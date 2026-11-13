
import { NAV } from '../config/constants.js';

export function renderSidebar(active) {
    const el = document.querySelector('#sidebar');

    el.innerHTML = `
        <div class="brand">
    <img
        class="brand-logo"
        src="assets/icons/studentmithra-logo.svg"
        alt="StudentMithra"
    >
        </div>

        <div class="nav-label">Workspace</div>

        <nav class="nav-list">
            ${NAV.map(([id, icon, label]) => `
                <a class="nav-link ${active === id ? 'active' : ''}"
                   href="#/${id}"
                   data-route="${id}">
                    <span class="nav-icon">${icon}</span>${label}
                </a>
            `).join('')}
        </nav>

        <div class="sidebar-footer">
            Offline-first · Version 1.0.0
        </div>
    `;
}
