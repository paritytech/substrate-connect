/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import React, { Component, ErrorInfo, ReactNode } from "react";
import { logger } from '@polkadot/util';
import { BURNR_WALLET } from '../utils/constants';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

const l = logger(BURNR_WALLET);

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public static getDerivedStateFromError(_: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    l.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return <h1>There was an error</h1>;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
