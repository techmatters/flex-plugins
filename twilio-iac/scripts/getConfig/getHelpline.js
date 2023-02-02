export const getHelpline = () => {
  if (!process.argv[2]) throw new Error('Helpline not provided');

  return process.argv[2];
}

export const helpline = getHelpline();