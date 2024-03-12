# Crewdle Mist WebRTC Browser Connector

## Introduction

The Crewdle Mist WebRTC Browser Connector utilizes the WebRTC API provided by web browsers to establish peer-to-peer connections within the Crewdle Mist platform. This connector enables direct communication and data transfer between peers, leveraging the WebRTC protocol for real-time interactions. Its integration with browser-based WebRTC functions eliminates the need for external plugins or software. This connector is particularly useful for developers requiring real-time communication capabilities in their applications, providing a straightforward method to incorporate these features within the decentralized Crewdle Mist architecture.

## Getting Started

Before diving in, ensure you have installed the [Crewdle Mist SDK](https://www.npmjs.com/package/@crewdle/web-sdk).

## Installation

```bash
npm install @crewdle/mist-connector-webrtc-browser
```

## Usage

```TypeScript
import { WebRTCBrowserPeerConnectionConnector } from '@crewdle/mist-connector-webrtc-browser';

// Create a new SDK instance
const sdk = await SDK.getInstance('[VENDOR ID]', '[ACCESS TOKEN]', {
  peerConnectionConnector: WebRTCBrowserPeerConnectionConnector,
});
```

## Need Help?

Reach out to support@crewdle.com or raise an issue in our repository for any assistance.

## Join Our Community

For an engaging discussion about your specific use cases or to connect with fellow developers, we invite you to join our Discord community. Follow this link to become a part of our vibrant group: [Join us on Discord](https://discord.gg/XJ3scBYX).
