
module.exports = {
    name: "help",
    description: "Show available commands.",

    execute(socket) {
        socket.send(JSON.stringify({
            type: "system",
            msg: "Help system is active."
        }));
    }
};
