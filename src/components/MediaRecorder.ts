class MediaRecorder{
    private readonly context: AudioContext
    private readonly bufferSize: number
    private stream: MediaStream
    private source: MediaStreamAudioSourceNode
    private script: ScriptProcessorNode
    private analyser: AnalyserNode
    private buffers: AudioBuffer[]
    
    // onstart callback
    public onstart: () => void

    // onstop callback
    public onstop: () => void

    // ondata callback
    public ondata: (buffer: AudioBuffer) => void

    constructor(audioContext: AudioContext, bufferSize = 16384){
        this.context = audioContext
        this.bufferSize = bufferSize
        this.buffers = []

        this.onstart = () => console.log("recording started")
        this.onstop = () => console.log("recording stopped")
        this.ondata = data => console.log("data available")

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
            const source = this.context.createBufferSource()
            source.buffer = inputBuffer
            source.connect(this.context.destination)
            source.start()
            this.buffers.push(inputBuffer)
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

    /*private exportData(buffers: Float32Array){
        const totalLength = buffers.reduce((acc, buffer) => acc + this.bufferSize, 0)
        const audioBuffer = this.context.createBuffer(1, totalLength, this.context.sampleRate)
        const outChannel = audioBuffer.getChannelData(0)

        outChannel.set(buffers, 0)

        this.ondata(audioBuffer)
    }*/
}

export default MediaRecorder