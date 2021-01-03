module.exports = {
    purge: ['./index.html', './src/**/*.vue', './src/**/*.ts'],
    theme: {
        extend: {
            cursor: {
                help: 'help',
            },
        },
    },
    variants: {
        extend: {
            cursor: ['hover'],
            textColor: ['active'],
            opacity: ['disabled'],
        },
    },
    plugins: [],
};
