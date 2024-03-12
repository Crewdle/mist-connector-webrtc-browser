import adapter from 'webrtc-adapter';

import { MediaStreamPriority, IPeerConnectionDataChannelConnector, IPeerConnectionOfferOptions, IPeerConnectionSenderMap, IPeerConnectionSender, IPeerConnectionTrackEvent, IPeerConnectionDataChannelEvent, IPeerConnectionSessionDescription, IPeerConnectionHandshakeCandidate, IPeerConnectionHandshakeCandidateEvent, IPeerConnectionConnector, IPeerConnectionConfiguration, PeerConnectionStatsReport } from '@crewdle/web-sdk';

/**
 * WebRTC connector for the browser environment for peer connections.
 * @category Connector
 */
export class WebRTCBrowserPeerConnectionConnector implements IPeerConnectionConnector {
  /**
   * The underlying WebRTC peer connection.
   * @ignore
   */
  private connection: RTCPeerConnection;

  /**
   * The constructor.
   * @param config The configuration for the peer connection.
   */
  constructor(config: IPeerConnectionConfiguration) {
    const rtcConfig: RTCConfiguration = {
      iceServers: config.handshakeServers,
    };
    this.connection = new RTCPeerConnection(rtcConfig);

    adapter.disableLog(false);
  }

  /**
   * Whether candidates can be added to the connection.
   * @returns True if candidates can be added, false otherwise.
   */
  get canAddCandidates(): boolean {
    return this.connection.remoteDescription !== null;
  }

  /**
   * Whether the handshake can be restarted using the function `restartHandshake`.
   * @returns True if the handshake can be restarted, false otherwise.
   */
  get canRestartHandshake(): boolean {
    return this.connection.restartIce !== undefined;
  }

  /**
   * The current connection state.
   * @returns The current connection state.
   */
  get connectionState(): string {
    return this.connection.connectionState;
  }

  /**
   * The current gathering state.
   * @returns The current gathering state.
   */
  get gatheringState(): string {
    return this.connection.iceGatheringState;
  }

  /**
   * The current handshake state.
   * @returns The current handshake state.
   */
  get handshakeState(): string {
    return this.connection.iceConnectionState;
  }

  /**
   * The current signaling state.
   * @returns The current signaling state.
   */
  get signalingState(): string {
    return this.connection.signalingState;
  }

  /**
   * The callback for when a candidate is added.
   */
  set onCandidate(callback: ((event: IPeerConnectionHandshakeCandidateEvent) => void) | null) {
    this.connection.onicecandidate = callback;
  }

  /**
   * The callback for when the connection state changes.
   */
  set onConnectionStateChange(callback: (() => void) | null) {
    this.connection.onconnectionstatechange = callback;
  }

  /**
   * The callback for when a data channel is received.
   */
  set onDataChannel(callback: ((event: IPeerConnectionDataChannelEvent) => void) | null) {
    if (callback === null) {
      this.connection.ondatachannel = callback;
      return;
    }

    this.connection.ondatachannel = (event) => {
      callback({ channel: createDataChannel(event.channel) });
    };
  }

  /**
   * The callback for when the gathering state changes.
   */
  set onGatheringStateChange(callback: (() => void) | null) {
    this.connection.onicegatheringstatechange = callback;
  }

  /**
   * The callback for when the handshake state changes.
   */
  set onHandshakeStateChange(callback: (() => void) | null) {
    this.connection.oniceconnectionstatechange = callback;
  }

  /**
   * The callback for when a track is received.
   */
  set onTrack(callback: ((event: IPeerConnectionTrackEvent) => void) | null) {
    this.connection.ontrack = callback;
  }

  /**
   * Adds a candidate to the connection.
   * @param candidate The candidate to add.
   * @returns A promise that resolves when the candidate has been added.
   */
  addCandidate(candidate: IPeerConnectionHandshakeCandidate): Promise<void> {
    return this.connection.addIceCandidate(candidate);
  }

  /**
   * Adds a track to the connection.
   * @param track The track to add.
   * @param stream The stream to add the track to.
   * @returns The sender for the track.
   */
  addTrack(track: MediaStreamTrack, stream: MediaStream): IPeerConnectionSender {
    return this.connection.addTrack(track, stream);
  }

  /**
   * Closes the connection.
   */
  close(): void {
    this.connection.close();
  }

  /**
   * Collects the stats for the receivers.
   * @param receivers The receivers to collect the stats for.
   * @param collector The collector to send the stats to.
   * @returns A promise that resolves when the stats have been collected.
   */
  async collectReceiversStats(receivers: Map<string, Set<MediaStreamTrack>>, collector: (stats: PeerConnectionStatsReport[][], streamId: string) => void): Promise<void> {
    for (const [streamId, tracks] of receivers) {
      const stats: PeerConnectionStatsReport[][] = [];
      for (const track of tracks) {
        const trackStats = await this.connection.getStats(track);
        if (trackStats) {
          stats.push(convertStatsReport(trackStats));
        }
      }
      if (stats.length === 0) {
        continue;
      }
      collector(stats, streamId);
    }
  }

  /**
   * Collects the stats for the senders.
   * @param senders The senders to collect the stats for.
   * @param collector The collector to send the stats to.
   * @returns A promise that resolves when the stats have been collected.
   */
  async collectSendersStats(senders: Map<string, IPeerConnectionSenderMap>, collector: (stats: PeerConnectionStatsReport[][], streamId: string) => void): Promise<void> {
    for (const [streamId, stream] of senders) {
      const stats: PeerConnectionStatsReport[][] = [];
      if (stream.tracks.video?.track && stream.tracks.video?.sender) {
        const videoStats = await this.connection.getStats(stream.tracks.video.track);
        if (videoStats) {
          stats.push(convertStatsReport(videoStats));
        }
      }
      if (stream.tracks.audio?.track && stream.tracks.audio?.sender) {
        const audioStats = await this.connection.getStats(stream.tracks.audio.track);
        if (audioStats) {
          stats.push(convertStatsReport(audioStats));
        }
      }
      if (stats.length === 0) {
        continue;
      }
      collector(stats, streamId);
    }
  }

  /**
   * Creates an answer for an offer.
   * @param offer The offer to create an answer for.
   * @returns A promise that resolves with the answer.
   */
  async createAnswer(offer: IPeerConnectionSessionDescription): Promise<IPeerConnectionSessionDescription> {
    await this.connection.setRemoteDescription(offer as RTCSessionDescriptionInit);
    const answer = await this.connection.createAnswer();
    await this.connection.setLocalDescription(answer);
    return answer;
  }

  /**
   * Creates a data channel.
   * @param label The label for the data channel.
   * @returns The data channel.
   */
  createDataChannel(label: string): IPeerConnectionDataChannelConnector {
    return createDataChannel(this.connection.createDataChannel(label));
  }

  /**
   * Creates an offer.
   * @param options The options for the offer.
   * @returns A promise that resolves with the offer.
   */
  async createOffer(options?: IPeerConnectionOfferOptions): Promise<IPeerConnectionSessionDescription> {
    const webRTCOptions: RTCOfferOptions = {};
    if (options?.handshakeRestart) {
      webRTCOptions.iceRestart = true;
    }
    const offer = await this.connection.createOffer(webRTCOptions);
    await this.connection.setLocalDescription(offer);
    return offer;
  }

  /**
   * Handles an answer.
   * @param answer The answer to handle.
   * @param negotiationHandler - The handler to call when a negotiation is needed.
   * @returns A promise that resolves when the answer has been handled.
   */
  async handleAnswer(answer: IPeerConnectionSessionDescription, negotiationHandler: () => void): Promise<void> {
    await this.connection.setRemoteDescription(answer as RTCSessionDescriptionInit);
    if (!this.connection.onnegotiationneeded) {
      this.connection.onnegotiationneeded = negotiationHandler;
    }
  }

  /**
   * Removes a track from the connection.
   * @param sender The sender to remove the track from.
   */
  removeTrack(sender: IPeerConnectionSender): void {
    this.connection.removeTrack(sender as RTCRtpSender);
  }

  /**
   * Replaces a track in the connection.
   * @param track The track to replace.
   * @param sender The sender to replace the track for.
   * @returns A promise that resolves when the track has been replaced.
   */
  async replaceTrack(track: MediaStreamTrack, sender: IPeerConnectionSender): Promise<void> {
    const rtcSender = sender as RTCRtpSender;
    await rtcSender.replaceTrack(track);
    this.connection.getTransceivers().forEach((transceiver) => {
      if (transceiver.sender === rtcSender) {
        transceiver.direction = 'sendrecv';
      }
    });
  }

  /**
   * Restarts the handshake.
   */
  restartHandshake(): void {
    this.connection.restartIce();
  }

  /**
   * Sets the encoding parameters for a sender.
   * @param sender The sender to set the encoding parameters for.
   * @param scaleResolutionDownBy The scale resolution down by value.
   * @param maxFramerate The max framerate.
   * @param maxBitrate The max bitrate.
   * @param priority The priority.
   */
  setEncodingParameters(sender: IPeerConnectionSender, scaleResolutionDownBy: number, maxFramerate: number, maxBitrate: number, priority: MediaStreamPriority): void {
    const rtcSender = sender as RTCRtpSender;
    const parameters = rtcSender.getParameters();
    if (!parameters) {
      return;
    }
    parameters.encodings.forEach((encoding) => {
      encoding.scaleResolutionDownBy = scaleResolutionDownBy;
      encoding.maxFramerate = maxFramerate;
      encoding.maxBitrate = maxBitrate;
      encoding.priority = convertPriority(priority);
    });
    rtcSender.setParameters(parameters).catch(() => {});
  }
}

/**
 * Creates a data channel connector from a data channel.
 * @param dataChannel The data channel to create the connector from.
 * @returns The data channel connector.
 * @ignore
 */
function createDataChannel(dataChannel: RTCDataChannel): IPeerConnectionDataChannelConnector {
  return {
    get bufferedAmount() {
      return dataChannel.bufferedAmount;
    },
    get bufferedAmountLowThreshold() {
      return dataChannel.bufferedAmountLowThreshold;
    },
    get state() {
      return dataChannel.readyState;
    },
    set bufferedAmountLowThreshold(value: number) {
      dataChannel.bufferedAmountLowThreshold = value;
    },
    set onBufferedAmountLow(callback: (() => void) | null) {
      dataChannel.onbufferedamountlow = callback;
    },
    set onClose(callback: (() => void) | null) {
      dataChannel.onclose = callback;
    },
    set onMessage(callback: ((message: MessageEvent) => void) | null) {
      dataChannel.onmessage = callback;
    },
    close() {
      dataChannel.close();
    },
    send(data: string | ArrayBuffer) {
      if (data instanceof ArrayBuffer) {
        dataChannel.send(data);
        return;
      }
      dataChannel.send(data);
    },
  };
}

/**
 * Converts a stats report to an array of stats reports.
 * @param report The stats report to convert.
 * @returns The array of stats reports.
 * @ignore
 */
function convertStatsReport(report: RTCStatsReport): PeerConnectionStatsReport[] {
  const stats: PeerConnectionStatsReport[] = [];
  report.forEach((value) => {
    stats.push(value);
  });
  return stats;
}

/**
 * Converts a media stream priority to an RTC priority type.
 * @param priority The priority to convert.
 * @returns The converted priority.
 * @ignore
 */
function convertPriority(priority: MediaStreamPriority): RTCPriorityType {
  switch (priority) {
    case MediaStreamPriority.Low:
      return 'low';
    case MediaStreamPriority.High:
      return 'high';
    default:
      return 'medium';
  }
}
