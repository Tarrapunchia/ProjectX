// poi andra' in .env

const BE = '';
const WS_PROTOCOL = window.location.protocol === 'https:' ? 'wss' : 'ws';
const WS = `${WS_PROTOCOL}://${window.location.host}/ws`;

export default {
    BE: BE,
	WS:	WS
}