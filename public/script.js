const startBtn = document.getElementById("startBtn");
const localVideo = document.getElementById("localVideo");
const remoteVideo = document.getElementById("remoteVideo");

let localStream;
let pc;

// Conectar al servidor WebSocket
const ws = new WebSocket("https://appmultiplataforma.onrender.com");

ws.onmessage = async (event) => {
    const message = JSON.parse(event.data);

    if (message.offer) {
        await pc.setRemoteDescription(new RTCSessionDescription(message.offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        ws.send(JSON.stringify({ answer }));
    }

    if (message.answer) {
        await pc.setRemoteDescription(new RTCSessionDescription(message.answer));
    }

    if (message.candidate) {
        try {
            await pc.addIceCandidate(message.candidate);
        } catch (e) {
            console.error("Error al añadir candidato:", e);
        }
    }
};

startBtn.onclick = async () => {
    localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localVideo.srcObject = localStream;

    pc = new RTCPeerConnection({
        iceServers: [
            { urls: "stun:stun.l.google.com:19302" } // STUN de Google
        ]
    });

    // Enviar nuestra cámara
    localStream.getTracks().forEach(track => pc.addTrack(track, localStream));

    // Mostrar la del remoto
    pc.ontrack = (event) => {
        remoteVideo.srcObject = event.streams[0];
    };

    // Enviar candidatos ICE al servidor
    pc.onicecandidate = (event) => {
        if (event.candidate) {
            ws.send(JSON.stringify({ candidate: event.candidate }));
        }
    };

    // Crear oferta
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    ws.send(JSON.stringify({ offer }));
};