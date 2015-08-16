# generic-midi-controller
![](http://img.shields.io/badge/stability-experimental-orange.svg?style=flat)
![](http://img.shields.io/npm/v/generic-midi-controller.svg?style=flat)
![](http://img.shields.io/npm/dm/generic-midi-controller.svg?style=flat)
![](http://img.shields.io/npm/l/generic-midi-controller.svg?style=flat)

A common interface for handling different MIDI controller input/output devices using the Web MIDI API.

## Usage

[![NPM](https://nodei.co/npm/generic-midi-controller.png)](https://nodei.co/npm/generic-midi-controller/)

### `controller = GenericMIDI(input, output)`

Creates a `Controller` instance. Input/output handling is customizable using the `input` and `output` functions:

#### `input`

An object where each property contains an array of functions for determining updated values on receiving MIDI input messages. Optional.

``` javascript
const controller = GenericMIDI({
  buttons: [
    msg => msg[1] === 72 ? msg[2] : null,
    msg => msg[1] === 73 ? msg[2] : null,
    msg => msg[1] === 74 ? msg[2] : null,
    msg => msg[1] === 75 ? msg[2] : null
  ]
})
```

The above controller listens to events for value changes on inputs 72 through 75. Note that `null` is returned when a value should not be updated.

Once set up as such, the following should be possible:

``` javascript
controller.setInput(midiInput)

// ...after receiving some MIDI messages:
controller.inputs.buttons[0] // 127
controller.inputs.buttons[1] // 24
controller.inputs.buttons[2] // 0
controller.inputs.buttons[3] // 38
```

#### `output`

An object where each property contains an array of functions for triggering output MIDI messages using `send`. Optional.

``` javascript
const controller = GenericMIDI(null, {
  buttons: [
    (value, send) => send([152, 72, value]),
    (value, send) => send([152, 73, value]),
    (value, send) => send([152, 74, value]),
    (value, send) => send([152, 75, value])
  ]
})
```

Once set up as such, the following should be possible:

``` javascript
controller.setOutput(midiOutput)

controller.outputs.buttons[0] = 127 // sends "127" to button 0
controller.outputs.buttons[1] = 24  // sends "24" to button 1
controller.outputs.buttons[2] = 0   // sends "0" to button 2
controller.outputs.buttons[3] = 38  // sends "38" to button 3
```

### `controller.setInput(input)`

Sets the input MIDI device.

### `controller.setOutput(output)`

Sets the output MIDI device.

``` javascript
navigator.requestMIDIAccess({
  sysex: true
}).then(function (midi) {
  var outputs = []
  var inputs = []

  for (var input of midi.inputs.values()) {
    inputs.push(input)
  }
  for (var output of midi.outputs.values()) {
    outputs.push(output)
  }

  controller.setInput(inputs[0])
  controller.setOutput(outputs[0])
})
```

### `controller.on('input', fn(group, i, value))`

Fired whenever an `input` message is received and handled:

``` javascript
controller.on('input', (group, id, value) => {
  console.log(`${group} #${id} has been set to ${value}`)
})
```

### `controller.on('output', fn(group, i, value))`

Fired whenever an `output` update is triggered:

``` javascript
controller.on('input', (group, id, value) => {
  console.log(`${group} #${id} has been set to ${value}`)
})
```

## See Also

* [midi-controller](https://github.com/mmckegg/midi-controller)

## License

MIT. See [LICENSE.md](http://github.com/lazurite-app/generic-midi-controller/blob/master/LICENSE.md) for details.
