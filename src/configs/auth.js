module.exports = {
    jwt: {
        secret: process.env.AUTH_SECRET || 'Default',
        expiresIn: '1d'
    }
}