type ContactComponentGenerator = (
  parameters: ({ taskSid: string } | { contactId: string }) & { props: Record<string, string | boolean | number> },
) => JSX.Element;
const registry: Record<string, ContactComponentGenerator> = {};

const customContactComponentRegistry = {
  register: (name: string, generator: ContactComponentGenerator) => {
    registry[name] = generator;
  },
  lookup: (name: string): ContactComponentGenerator => registry[name],
};

export default customContactComponentRegistry;
