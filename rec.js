document.addEventListener("DOMContentLoaded", () => {

    let remoteVideo = document.getElementById("video")
    let requestBtn = document.getElementById("start")
    let stopBtn = document.getElementById("stop")

    let peerConnection

    let message = document.getElementById("message")

    requestBtn.disabled = false
    stopBtn.disabled = true

    let socket = io("https://st2.magicbit.cc:7777")

    

    socket.on("connect", () => {
        requestBtn.disabled = false
        stopBtn.disabled = true
    })

    socket.on("message", (msg) => {

        msg = JSON.parse(msg)
        console.log(msg.type)


        if (msg.type === "offer") {
        
            peerConnection.setRemoteDescription(new RTCSessionDescription(msg.offer))
            peerConnection.createAnswer().then((answer) => {
                
                console.log("sending answer")
                peerConnection.setLocalDescription(answer)
                socket.send(JSON.stringify({
                    type: "answer",
                    answer: answer
                }))
            })


        }else if (msg.type === "candidate"){
            console.log("adding candidate")

            peerConnection.addIceCandidate(new RTCIceCandidate(msg.candidate))

        }

    })

    requestBtn.addEventListener("click", () => {

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
        peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                console.log("sending candidate")
                socket.send(JSON.stringify({
                    type: "candidate",
                    candidate: event.candidate
                }))
            }
        }

        peerConnection.ontrack = (event) => {
            remoteVideo.srcObject = event.streams[0]
        }

        socket.send(JSON.stringify({
            type: "request",
            
        }))
        requestBtn.disabled = true
        stopBtn.disabled = false
    })

    stopBtn.addEventListener("click", () => {

        peerConnection.close()
        requestBtn.disabled = false 
        stopBtn.disabled = true 

        socket.send(JSON.stringify({type: "stop"}))

    })


    

    
})
