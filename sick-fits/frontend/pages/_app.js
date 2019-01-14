import App, { Container } from 'next/app';

class CustomApp extends App {
  render() {
    const { Component } = this.props;

    return (
      <Container>
        <p>Hey! I'm on every page!</p>
        <Component />
      </Container>
    );
  }
}

export default CustomApp;
