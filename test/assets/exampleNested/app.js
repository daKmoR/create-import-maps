import { html } from 'lit-html';
import { LitElement } from 'lit-element';

class MyElement extends LitElement {
  render() {
    return html`
      <h1>Hello world</h1>
    `;
  }
}

customElements.define('my-element', MyElement);
