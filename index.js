import Emitter from 'events/'

export default (input, output) => (
  new GenericMIDIController(input, output)
)

class GenericMIDIController extends Emitter {
  constructor (inputs, outputs) {
    super()

    this.input = null
    this.inputs = {}
    this.output = null
    this.outputs = {}
    this.outputBuffer = []

    outputs = outputs || {}
    inputs = inputs || {}
    this.midiMessage = this._midiMessage(inputs)

    Object.keys(outputs).forEach(group => {
      var data = this.outputs[group] = {}

      outputs[group].forEach((fn, id) => {
        var value = 0

        Object.defineProperty(data, id, {
          get: _ => value,
          set: _value => {
            fn(value = _value, data => this.send(data))
            this.emit('output', group, id, value)
          }
        })
      })
    })
  }

  setInput (input) {
    if (this.input) {
      this.input.removeEventListener('midimessage', this.midiMessage, false)
    }

    this.inputReady = false
    this.input = input
    this.input.open().then(_ => this.inputReady = true)
    this.input.addEventListener('midimessage', this.midiMessage, false)
  }

  setOutput (output) {
    this.outputReady = false
    this.output = output
    this.output.open().then(_ => {
      this.outputBuffer.forEach(msg => this.output.send(msg))
      this.outputBuffer = []
      this.outputReady = true
    })
  }

  send (data) {
    if (this.outputReady) {
      return this.output.send(data)
    } else {
      return this.outputBuffer.push(data)
    }
  }

  _midiMessage (inputs) {
    const keys = Object.keys(inputs)

    for (var i = 0; i < keys.length; i++) {
      var rows = inputs[keys[i]]
      var data = this.inputs[keys[i]] = []

      for (var j = 0; j < rows.length; j++) {
        data[j] = 0
      }
    }

    return event => {
      var message = event.data

      for (var i = 0; i < keys.length; i++) {
        var key = keys[i]
        var grp = inputs[key]

        for (var j = 0; j < grp.length; j++) {
          var val = grp[j](message)
          if (typeof val === 'number') {
            this.inputs[key][j] = val
            this.emit('input', key, j, val)
          }
        }
      }

      this.emit('message', event.data)
    }
  }
}
