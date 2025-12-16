const express = require('express');
const SocketIO = require('socket.io');
const vj = require('vjoy');


if (!vj.vJoy.isEnabled()) {
	console.log("vJoy is not enabled.");
	process.exit();
}

let device = vj.vJoyDevice.create(1);

const app = express();

app.use(express.static('pages'));

app.get('/', (req, res) => {
    res.redirect('/throttle.html');
});

const server = app.listen(5000, () => {
    console.log(`Server is running on port 5000`);
});

const io = SocketIO(server);
io.on('connection', (socket) => {
    socket.on('name', (data) => {
        console.log(data);
        socket.data.username = data;
    })
    socket.on('throttle', (data) => {
        device.axes.Slider1.set(Math.floor(data+0.5));
    });
    socket.on('button_press', (data) => {
        device.buttons[data].set(true);
    });
    socket.on('button_release', (data) => {
        device.buttons[data].set(false);
    });
    socket.on('button_once', (data) => {
        device.buttons[data].set(true);
        setTimeout(() => {
            device.buttons[data].set(false);
        }, 100);
    });
});


process.on('exit', (code)=>{
    device.free();
});