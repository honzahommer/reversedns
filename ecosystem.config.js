module.exports = {
  apps: [{
    name: 'reversedns',
    script: 'server.js',
    post_update: ['npm install'],
    watch: false,
    merge_logs: true,
    max_restarts: 10,
    instances: 2,
    max_memory_restart: '64M',
    env: {
      NODE_ENV: "development",
    },
    env_production: {
      PORT: 53,
      NODE_ENV: "production"
    }
  }]
}
