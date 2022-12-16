import { Button as TwilioButton, IconButton as TwilioIconButton } from '@twilio/flex-ui';

/**
 * This is a workaround for an issue seen starting in @twilio/flex-ui v2.0.0-beta.3
 * Twilio Buttons were failing on type checks because it thought their props has a mandatory 'css' property, which it doesn't
 * This workaround does some TS back flips to create the same type with the 'css' property explicitly omitted, which shuts the TS compiler up
 * Just use this instead of the Twilio UI button as long as the issue persists
 */

type extractGeneric<Type> = Type extends React.FC<infer X> ? X : never;
type ButtonProps = extractGeneric<typeof TwilioButton>;
export const Button: React.FC<Omit<ButtonProps, 'css'>> = TwilioButton;

type IconButtonProps = extractGeneric<typeof TwilioIconButton>;
export const IconButton: React.FC<Omit<IconButtonProps, 'css'>> = TwilioIconButton;
