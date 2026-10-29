// Tiny --flag value parser shared by the okta scripts.
export function parseArgs(argv = process.argv.slice(2)) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (!arg.startsWith('--')) {
      args._.push(arg);
      continue;
    }
    const [key, inline] = arg.slice(2).split('=');
    const camel = key.replace(/-(\w)/g, (_, c) => c.toUpperCase());
    if (inline !== undefined) args[camel] = inline;
    else if (argv[i + 1] && !argv[i + 1].startsWith('--')) args[camel] = argv[++i];
    else args[camel] = true;
  }
  return args;
}

export function requireArgs(args, names, usage) {
  const missing = names.filter((n) => !args[n]);
  if (args.help || missing.length) {
    console.log(usage.trim());
    process.exit(args.help ? 0 : 1);
  }
}

export const normalizeEnvironment = (env) => ({ stg: 'staging', prod: 'production' })[env] ?? env;
