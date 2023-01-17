import type { RegisterOptions } from 'react-hook-form';

type HTMLElementRef = {
  current: HTMLElement | null;
};

export type FormInputBaseProps = {
  inputId: string;
  label: string;
  registerOptions: RegisterOptions;
  updateCallback: () => void;
  initialValue: React.HTMLAttributes<HTMLElement>['defaultValue'] | React.HTMLAttributes<HTMLElement>['defaultChecked'];
  htmlElRef: HTMLElementRef | null;
  isEnabled: boolean;
};
