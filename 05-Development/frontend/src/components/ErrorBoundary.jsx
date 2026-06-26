import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "50px", color: "red", backgroundColor: "white", zIndex: 9999, position: "relative" }}>
          <h1>Fatal Error</h1>
          <pre style={{ whiteSpace: "pre-wrap", fontSize: "16px" }}>{this.state.error && this.state.error.toString()}</pre>
          <pre style={{ whiteSpace: "pre-wrap", fontSize: "12px", marginTop: "20px" }}>{this.state.error && this.state.error.stack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}
