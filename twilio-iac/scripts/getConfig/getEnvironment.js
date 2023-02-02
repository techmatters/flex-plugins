const environments = [
    'development',
    'staging',
    'production',
]

export const getEnvironment = () => {
  if (!process.argv[3]) throw new Error('Environment not provided');

  if (!environments.includes(process.argv[3])) throw new Error('Environment not valid');

  return process.argv[3];
}

export const environment = getEnvironment();