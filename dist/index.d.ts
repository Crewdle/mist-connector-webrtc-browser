import { MediaStreamPriority, IPeerConnectionDataChannelConnector, IPeerConnectionOfferOptions, IPeerConnectionSenderMap, IPeerConnectionSender, IPeerConnectionTrackEvent, IPeerConnectionDataChannelEvent, IPeerConnectionSessionDescription, IPeerConnectionHandshakeCandidate, IPeerConnectionHandshakeCandidateEvent, IPeerConnectionConnector, IPeerConnectionConfiguration, PeerConnectionStatsReport } from '@crewdle/web-sdk';
/**
 * WebRTC connector for the browser environment for peer connections.
 * @category Connector
 */
export declare class WebRTCBrowserPeerConnectionConnector implements IPeerConnectionConnector {
    /**
     * The underlying WebRTC peer connection.
     * @ignore
     */
    private connection;
    /**
     * The constructor.
     * @param config The configuration for the peer connection.
     */
    constructor(config: IPeerConnectionConfiguration);
    /**
     * Whether candidates can be added to the connection.
     * @returns True if candidates can be added, false otherwise.
     */
    get canAddCandidates(): boolean;
    /**
     * Whether the handshake can be restarted using the function `restartHandshake`.
     * @returns True if the handshake can be restarted, false otherwise.
     */
    get canRestartHandshake(): boolean;
    /**
     * The current connection state.
     * @returns The current connection state.
     */
    get connectionState(): string;
    /**
     * The current gathering state.
     * @returns The current gathering state.
     */
    get gatheringState(): string;
    /**
     * The current handshake state.
     * @returns The current handshake state.
     */
    get handshakeState(): string;
    /**
     * The current signaling state.
     * @returns The current signaling state.
     */
    get signalingState(): string;
    /**
     * The callback for when a candidate is added.
     */
    set onCandidate(callback: ((event: IPeerConnectionHandshakeCandidateEvent) => void) | null);
    /**
     * The callback for when the connection state changes.
     */
    set onConnectionStateChange(callback: (() => void) | null);
    /**
     * The callback for when a data channel is received.
     */
    set onDataChannel(callback: ((event: IPeerConnectionDataChannelEvent) => void) | null);
    /**
     * The callback for when the gathering state changes.
     */
    set onGatheringStateChange(callback: (() => void) | null);
    /**
     * The callback for when the handshake state changes.
     */
    set onHandshakeStateChange(callback: (() => void) | null);
    /**
     * The callback for when a track is received.
     */
    set onTrack(callback: ((event: IPeerConnectionTrackEvent) => void) | null);
    /**
     * Adds a candidate to the connection.
     * @param candidate The candidate to add.
     * @returns A promise that resolves when the candidate has been added.
     */
    addCandidate(candidate: IPeerConnectionHandshakeCandidate): Promise<void>;
    /**
     * Adds a track to the connection.
     * @param track The track to add.
     * @param stream The stream to add the track to.
     * @returns The sender for the track.
     */
    addTrack(track: MediaStreamTrack, stream: MediaStream): IPeerConnectionSender;
    /**
     * Closes the connection.
     */
    close(): void;
    /**
     * Collects the stats for the receivers.
     * @param receivers The receivers to collect the stats for.
     * @param collector The collector to send the stats to.
     * @returns A promise that resolves when the stats have been collected.
     */
    collectReceiversStats(receivers: Map<string, Set<MediaStreamTrack>>, collector: (stats: PeerConnectionStatsReport[][], streamId: string) => void): Promise<void>;
    /**
     * Collects the stats for the senders.
     * @param senders The senders to collect the stats for.
     * @param collector The collector to send the stats to.
     * @returns A promise that resolves when the stats have been collected.
     */
    collectSendersStats(senders: Map<string, IPeerConnectionSenderMap>, collector: (stats: PeerConnectionStatsReport[][], streamId: string) => void): Promise<void>;
    /**
     * Creates an answer for an offer.
     * @param offer The offer to create an answer for.
     * @returns A promise that resolves with the answer.
     */
    createAnswer(offer: IPeerConnectionSessionDescription): Promise<IPeerConnectionSessionDescription>;
    /**
     * Creates a data channel.
     * @param label The label for the data channel.
     * @returns The data channel.
     */
    createDataChannel(label: string): IPeerConnectionDataChannelConnector;
    /**
     * Creates an offer.
     * @param options The options for the offer.
     * @returns A promise that resolves with the offer.
     */
    createOffer(options?: IPeerConnectionOfferOptions): Promise<IPeerConnectionSessionDescription>;
    /**
     * Handles an answer.
     * @param answer The answer to handle.
     * @param negotiationHandler - The handler to call when a negotiation is needed.
     * @returns A promise that resolves when the answer has been handled.
     */
    handleAnswer(answer: IPeerConnectionSessionDescription, negotiationHandler: () => void): Promise<void>;
    /**
     * Removes a track from the connection.
     * @param sender The sender to remove the track from.
     */
    removeTrack(sender: IPeerConnectionSender): void;
    /**
     * Replaces a track in the connection.
     * @param track The track to replace.
     * @param sender The sender to replace the track for.
     * @returns A promise that resolves when the track has been replaced.
     */
    replaceTrack(track: MediaStreamTrack, sender: IPeerConnectionSender): Promise<void>;
    /**
     * Restarts the handshake.
     */
    restartHandshake(): void;
    /**
     * Sets the encoding parameters for a sender.
     * @param sender The sender to set the encoding parameters for.
     * @param scaleResolutionDownBy The scale resolution down by value.
     * @param maxFramerate The max framerate.
     * @param maxBitrate The max bitrate.
     * @param priority The priority.
     */
    setEncodingParameters(sender: IPeerConnectionSender, scaleResolutionDownBy: number, maxFramerate: number, maxBitrate: number, priority: MediaStreamPriority): void;
}
