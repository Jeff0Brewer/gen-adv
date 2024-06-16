/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    /* eslint-disable-next-line @typescript-eslint/explicit-function-return-type */
    webpack: (config) => {
        // camelCase style names from css modules
        config.module.rules
            .find(({ oneOf }) => !!oneOf).oneOf
            .filter(({ use }) => JSON.stringify(use)?.includes('css-loader'))
            .reduce((acc, { use }) => acc.concat(use), [])
            .forEach(({ options }) => {
                if (options.modules) {
                    options.modules.exportLocalsConvention = 'camelCase'
                }
            })

        return config
    }
}

export default nextConfig
