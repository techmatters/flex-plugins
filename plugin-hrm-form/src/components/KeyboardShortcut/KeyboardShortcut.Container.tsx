import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { namespace, shortcutBase, RootState } from '../../states';
import { updatePressedKeys, openGuideModal, closeGuideModal } from '../../states/shortcuts/actions';
import KeyboardShortcut from './KeyboardShortcut';

/**
 * We're not using the pattern Container/Component in the rest of the app.
 * So I suggest we don't do this here. We should unify KeyboarShortcut.Container and
 * KeyboardShortcut to be a single component/file.
 */
const mapStateToProps = (state: RootState) => ({
  pressedKeys: state[namespace][shortcutBase].pressedKeys,
  isGuideModalOpen: state[namespace][shortcutBase].isGuideModalOpen,
});

const mapDispatchToProps = dispatch => ({
  updatePressedKeys: bindActionCreators(updatePressedKeys, dispatch),
  openGuideModal: bindActionCreators(openGuideModal, dispatch),
  closeGuideModal: bindActionCreators(closeGuideModal, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(KeyboardShortcut);
