import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { namespace, shortcutBase, RootState } from '../../states';
import { updatePressedKeys, openGuideModal, closeGuideModal } from '../../states/shortcuts/actions';
import KeyboardShortcut from './KeyboardShortcut';

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
