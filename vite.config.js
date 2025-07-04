import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd());

	const isDev = env.VITE_NODE_ENV === 'development';
	const address = env.VITE_NODE_ENV === 'development' ? env.VITE_DEV_IP : env.VITE_PROD_IP;
	const port = env.VITE_PORT;
	const target = `http://${address}:${port}`;
	return {
		plugins: [react()],
		server: {
			host: !isDev,
			proxy: {
				'/api': {
					target,
					changeOrigin: true,
					rewrite: (path) => path.replace(/^\/api/, ''),
				},
			},
		},
	};
});
