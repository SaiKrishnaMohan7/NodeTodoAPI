var env = process.env.NODE_ENV || 'development';

if (env === 'development' || env === 'test'){
    try{
        var config = require('./config.json');
    }
    catch(e){}

    let envConfig = config[env];

    Object.keys(envConfig).forEach((key) => {
        process.env[key] = envConfig[key];
    });
} 