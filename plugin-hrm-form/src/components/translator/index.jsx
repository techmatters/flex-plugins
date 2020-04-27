import React from 'react';
import PropTypes from 'prop-types';
import TranslateIcon from '@material-ui/icons/TranslateOutlined';
import { Template } from '@twilio/flex-ui';

class Translator extends React.Component {
  static displayName = 'Translator';

  static propTypes = {
    manager: PropTypes.shape({
      strings: PropTypes.shape({
        TranslateButtonAriaLabel: PropTypes.string,
      }),
    }).isRequired,
    setNewStrings: PropTypes.func.isRequired,
    defaultLanguage: PropTypes.string.isRequired,
    showLabel: PropTypes.bool.isRequired,
  };

  state = {
    language: this.props.defaultLanguage,
  };

  translate = async language => {
    try {
      const { strings } = this.props.manager;
      const translation = (await import(`../../translations/${language}/translation`)).default;
      const newStrings = { ...strings, ...translation };
      this.props.setNewStrings(newStrings);
    } catch (err) {
      console.log('Error while loading translation', err);
    }
  };

  // this function should receive the new language selected (passed via event?)
  handleClick = async () => {
    // eslint-disable-next-line react/no-access-state-in-setstate
    const language = this.state.language === 'en' ? 'es' : 'en';
    await this.translate(language);
    this.setState({ language });
  };

  render() {
    return (
      <button
        className="Twilio-Side-Link css-1omrnme"
        type="button"
        aria-label={this.props.manager.strings.TranslateButtonAriaLabel}
        onClick={this.handleClick}
      >
        <div className="Twilio-Side-Link-IconContainer css-14ypp0a">
          <div className="Twilio-Icon Twilio-Icon-AgentBold  css-y8bnhq">
            <TranslateIcon width="1em" height="1em" viewBox="0 0 24 24" className="Twilio-Icon-Content" />
          </div>
        </div>
        {this.props.showLabel && (
          <div className="css-1xm4x2c">
            <Template code="TranslateButtonAriaLabel" />
          </div>
        )}
      </button>
    );
  }
}

export default Translator;
