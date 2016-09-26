# Modal
> A easy to use modal component.

## Installation
```bash
npm install victorwpbastos/modal
```

## How to use

### Alert
```js
import Modal from 'modal';

Modal.alert({
  header: 'Message',
  body: 'Hello, it\'s me',
  closeOnEsc: true // close modal when pressing "Esc" key. default: true
});
```

### Confirm
```js
import Modal from 'modal';

Modal.confirm({
  header: 'Confirm',
  body: 'Are you sure?',
  btnLabels: ['No', 'Yes'], // button labels. default: ['No', 'Yes']
  showCloseButton: false, // show a "x" button to close modal. default: false
  closeOnEsc: true, // close modal when pressing "Esc" key. default: true
  onClose (answer) {
    console.log(answer);
  }
});
```

### Prompt
```js
import Modal from 'modal';

// simple
// body would be a input field
Modal.prompt({
  header: 'What\'s your name?',
  btnLabel: 'Confirm', // button label. default: 'Confirm'
  closeOnEsc: false, // close modal when pressing "Esc" key. default: false
  showCloseButton: false, // show a "x" button to close modal. default: false
  onClose (answer) {
    console.log(answer);
  }
});

// custom
// body would be a combo box
// has a validate function to validate the option selected
Modal.prompt({
  header: 'Choose your favorite fruit?',
  btnLabel: 'Confirm', // button label. default: 'Confirm'
  closeOnEsc: false, // close modal when pressing "Esc" key. default: false
  showCloseButton: false, // show a "x" button to close modal. default: false
  body: `
    <select>
      <option value="">-- choose --</option>
      <option value="apple">Apple</option>
      <option value="banana">Banana</option>
      <option value="orange">Orange</option>
    </select>
  `,
  validate (fields) {
    if (fields.val() === '') {
      return 'Required';
    }
    
    if (fields.val() === 'banana') {
      return 'Can\'t banana';
    }
  },
  onClose (answer) {
    console.log(answer);
  }
});

```

### getDefaults
```js
import Modal from 'modal';

console.log( Modal.getDefaults() );
```

### setDefaults
```js
import Modal from 'modal';

Modal.setDefaults({
  alert: {
    header: 'Message' // all alert modals would have this header by default
  }
});
```

### Default options

```js
alert: {
  header: '',
  body: '',
  onClose: () => {},
  closeOnEsc: true
},

confirm: {
  header: '',
  body: '',
  footer: `
    <button type="button" class="btn btn-default btn-no">{{btnNo}}</button>
    <button type="button" class="btn btn-success btn-yes">{{btnYes}}</button>
  `,
  btnLabels: ['No', 'Yes'],
  showCloseButton: false,
  onClose: () => {},
  closeOnEsc: true
},

prompt: {
  header: '',
  body: `
    <input type="text" class="form-control"/>
  `,
  footer: `
    <button type="button" class="btn btn-success btn-confirm">{{btnLabel}}</button>
  `,
  btnLabel: 'Confirm',
  validate: null,
  showCloseButton: false,
  onClose: () => {},
  closeOnEsc: false
}
```
