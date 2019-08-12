import React from 'react';

// TODO(nick): these styles don't mean anything.  Change.
const taskListStyles = {
  padding: '10px',
  margin: '0px',
  color: '#fff',
  background: '#000',
};

// TODO(nick): convert to a variable, that is:
// const ContactDataSubmissionComponent = () => {
class ContactDataSubmissionComponent extends React.Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    this.props.onCompleteTask(this.props.task.sid);
  }

  getEndTaskButton() {
    if (this.props.task && this.props.task.status === 'wrapping') {
      return (
        <div style={taskListStyles}>
          <button onClick={this.handleClick}>
            SUBMIT
          </button>
        </div>
      );
    }
    return null;
  }

  render() {
    return this.getEndTaskButton();
  }
};

export default ContactDataSubmissionComponent;
