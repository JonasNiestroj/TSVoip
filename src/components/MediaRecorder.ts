import { WebGroup } from 'netflux'

/*interface ISocketIOMessage {
    data: ISocketIOData
}

interface ISocketIOData {
    data: string
}
*/

class MediaRecorder{
    private readonly context: AudioContext
    private readonly bufferSize: number
    private stream: MediaStream
    private source: MediaStreamAudioSourceNode
    private script: ScriptProcessorNode
    private analyser: AnalyserNode
    // private socket: SocketIOClient.Socket
    private webGroup: WebGroup
    
    // onstart callback
    public onstart: () => void

    // onstop callback
    public onstop: () => void

    // ondata callback
    public ondata: (buffer: AudioBuffer) => void

    constructor(audioContext: AudioContext, socket: SocketIOClient.Socket){
        this.context = audioContext
        this.bufferSize = 16384
        // this.socket = socket
        this.webGroup = new WebGroup()

        this.webGroup.onMemberJoin = id => {
            console.log("Member joined")
        }

        this.webGroup.onMessage = (id, data) => {
            console.log("new")
            const floatArray = new Float32Array(JSON.parse(data.toString()))
            const buffer = this.context.createBuffer(1, 16384, 48000)
            buffer.copyToChannel(floatArray, 0, 0)
            const source = that.context.createBufferSource()
            source.buffer = buffer
            source.connect(that.context.destination)
            source.start()
        }

        this.webGroup.join('buaergäijahsdf')

        this.onstart = () => console.log("recording started")
        this.onstop = () => console.log("recording stopped")
        this.ondata = data => console.log("data available")

        const that = this

        /*this.socket.on('d', (data: ISocketIOMessage) => {
            console.log("new")
            const floatArray = new Float32Array(JSON.parse(data.data.data))
            const buffer = this.context.createBuffer(1, 16384, 48000)
            buffer.copyToChannel(floatArray, 0, 0)
            const source = that.context.createBufferSource()
            source.buffer = buffer
            source.connect(that.context.destination)
            source.start()
        })*/
    }

    public start(){
        navigator.mediaDevices.enumerateDevices().then(device => {
            this.context
            .resume()
            .then(() => navigator.mediaDevices.getUserMedia({ audio: {
                deviceId: device[2].deviceId
            }, video: false }))
            .then(stream => this.startStream(stream))
            .catch(err => console.log(err))
        })
    }

    private startStream(stream: MediaStream){
        const mediaStreamSource = this.context.createMediaStreamSource(stream)
        const script = this.context.createScriptProcessor(this.bufferSize, 1, 1)
        const analyser = this.context.createAnalyser()
        script.onaudioprocess = event => {
            const inputBuffer = event.inputBuffer
            const floatArray = inputBuffer.getChannelData(0)
            if(!location.href.endsWith("mute")){
                this.webGroup.send(JSON.stringify(Array.from(floatArray)))
                // this.socket.emit('data', { data: JSON.stringify(Array.from(floatArray))})
            }
        }

        analyser.smoothingTimeConstant = 1
        analyser.fftSize = 2048

        mediaStreamSource.connect(analyser)
        analyser.connect(script)
        script.connect(this.context.destination)

        this.stream = stream
        this.source = mediaStreamSource
        this.analyser = analyser
        this.script = script
        this.onstart()
    }

    public stop(){
        this.stream.getTracks().forEach(track => track.stop())

        this.source.disconnect()
        this.analyser.disconnect()
        this.script.disconnect()

        this.onstop()
    }
}

export default MediaRecorder