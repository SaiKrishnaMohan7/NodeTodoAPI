var env = process.env.NODE_ENV || 'development';

if (env === 'development' || env === 'test'){
    try {
        let config = require('./config.json');
        var envConfig = config[env];
        Object.keys(envConfig).forEach((key) => {
            process.env[key] = envConfig[key];
        });
    }catch(e){console.log('If you are seeing this in test or dev, something is wrong');}
} 