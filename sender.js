document.addEventListener("DOMContentLoaded", () => {

    let remoteVideo = document.getElementById("video")
    let stream, peerConnection

    let message = document.getElementById("message")

    let socket = io("https://st2.magicbit.cc:7777")

    socket.on("connect", async () => {
        console.log("connected to server")
        
        // startStream()
    
    })

    function startStream(){
        navigator.mediaDevices.getUserMedia({ video: {
            facingMode: 'environment',
            width: { min: 1280, ideal: 1920 },
            height: { min: 480 }
            
          }})
        .then(stream => {
            remoteVideo.srcObject = stream

            let configuration = {
                iceServers: [
                    { urls: "stun:stun.l.google.com:19302" },
                    { urls: "stun:stun.l.google.com:5349" },
                    { urls: "stun:stun1.l.google.com:3478" },
                    { urls: "stun:stun1.l.google.com:5349" },
                    { urls: "stun:stun2.l.google.com:19302" },
                    { urls: "stun:stun2.l.google.com:5349" },
                    { urls: "stun:stun3.l.google.com:3478" },
                    { urls: "stun:stun3.l.google.com:5349" },
                    { urls: "stun:stun4.l.google.com:19302" },
                    { urls: "stun:stun4.l.google.com:5349" },
                    
                    {
                        urls: "turn:20.106.210.106:33478",
                        username: "realroboturn",
                        credential: "Wknlhna@1"
                    }
                ]
            }

            peerConnection = new RTCPeerConnection(configuration)
            peerConnection.addStream(stream)

            peerConnection.onicecandidate = event => {
                if (event.candidate) {
                    console.log("sending candidate")
                    socket.send(JSON.stringify({
                        type: "candidate",
                        candidate: event.candidate
                    }))
                }
            }

            peerConnection.createOffer()
                .then(offer => {
                    peerConnection.setLocalDescription(offer)
                    console.log("sending offer")
                    socket.send(JSON.stringify({
                        type: "offer",
                        offer: offer
                    }))
                })
                .catch(err => {
                    console.log(err)
                })

        })
    }

    socket.on("message", (data) => {
        data = JSON.parse(data)

        if (data.type === "candidate") {
            peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate))
        } else if (data.type === "answer") {
            peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer)) 
            console.log("answer received")
        }else if (data.type === "request") {
            startStream()

        }else if (data.type === "stop"){
            window.location.reload()
        }

    })
})