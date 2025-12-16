# X-Plane UDP DataRef wrapper (Node.js)

This small module helps subscribe and unsubscribe to X-Plane datarefs over UDP using the RREF protocol described in the attached X-Plane UDP documentation.

Files added:
- `lib/xplane-dataref.js` — main wrapper class `XPlaneDatarefClient` (EventEmitter)
- `examples/demo.js` — example showing how to subscribe to latitude/longitude

Quick usage:

1. Install Node.js (tested with Node 14+).
2. From the workspace root run the example:

```powershell
node examples/demo.js
```

By default the client binds to local UDP port `49001` and sends RREF subscribe packets to `127.0.0.1:49000`. Adjust parameters in the constructor if your X-Plane instance is on a different host or port.

API (short):

- `new XPlaneDatarefClient({ remoteHost, remotePort, localPort })` — construct and bind.
- `.subscribe(dref, freqHz = 10, senderIndex)` — subscribe to a dataref; returns the sender index used.
- `.unsubscribe(senderIndex)` — stop subscription for that index.
- `.on('data', callback)` — receives objects `{index, value, from}` for incoming dataref values.
- `.close()` — close the socket.

Notes / Implementation details:
- This module constructs RREF packets that match X-Plane's expected struct layout: each request includes a 4-byte frequency, a 4-byte sender index, and a fixed 400-byte null-terminated dataref path.
- To stop a subscription the wrapper sends the same sender index with frequency `0` (as required by X-Plane).
- Incoming RREF reply packets are parsed into 8-byte records (int index + float value) and emitted as `data` events.

If you want, I can:
- add TypeScript typings
- provide examples that set/unset subscriptions programmatically
- add a small unit test or CI workflow
