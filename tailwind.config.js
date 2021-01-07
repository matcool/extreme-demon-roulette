module.exports = {
    purge: ['./index.html', './src/**/*.vue', './src/**/*.ts'],
    theme: {
        extend: {
            cursor: {
                help: 'help',
            },
            zIndex: {
                '-10': '-10',
            },
            colors: {
                'plain-gray': {
                    light: '#252728',
                    DEFAULT: '#1e2021',
                    dark: '#171819',
                }
            }
        },
    },
    darkMode: 'class',
    variants: {
        extend: {
            cursor: ['hover'],
            textColor: ['active'],
            opacity: ['disabled'],
        },
    },
    plugins: [],
};
