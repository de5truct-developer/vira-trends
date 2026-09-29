// @ts-check
import { defineConfig } from 'astro/config';

// site is set to the dev subdomain chosen for GG-724 (trends.tryvira.app).
// Change here if the subdomain or final prod domain is picked differently later.
export default defineConfig({
  site: 'https://trends.tryvira.app',
});
