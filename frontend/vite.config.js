import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    server: {
        host: '0.0.0.0',
        port: 3000,
        strictPort: false,
        allowedHosts: true,
        cors: true,
        // Disable host check completely
        disableHostCheck: true,
        // SPA fallback - serve index.html for all routes
        historyApiFallback: true,
    },
    build: {
        // Optimize build for better performance
        target: 'es2015',
        minify: 'terser',
        rollupOptions: {
            output: {
                manualChunks: {
                    vendor: ['react', 'react-dom', 'react-router-dom'],
                    apollo: ['@apollo/client', 'graphql'],
                },
            },
        },
        // Enable source maps for debugging
        sourcemap: true,
    },
    // Performance optimizations
    optimizeDeps: {
        include: ['react', 'react-dom', 'react-router-dom', '@apollo/client'],
    },
})
