import { get } from './helpers/rest';
import database from '../realm';

import buildMessage from './helpers/buildMessage';

async function loadMessagesForRoomRest(rid, end) {
	console.log('loadMessagesForRoomRest');
	const { token, id } = this.ddp._login;
	const server = this.ddp.url.replace('ws', 'http');
	const data = await get({ token, id, server }, 'channels.history', { rid, end });
	return data.messages;
}


async function loadMessagesForRoomDDP(rid, end) {
	console.log('loadMessagesForRoomDDP');
	const data = await this.ddp.call('loadHistory', rid, end, 20);
	if (!data || !data.messages.length) {
		return [];
	}
	return data.messages;

	// }
	// 	if (cb) {
	// 		cb({ end: data && data.messages.length < 20 });
	// 	}
	// 	return data.message;
	// }, (err) => {
	// 	if (err) {
	// 		if (cb) {
	// 			cb({ end: true });
	// 		}
	// 		return Promise.reject(err);
	// 	}
	// });
}

export default async function(...args) {
	const data = await (this.ddp._logged ? loadMessagesForRoomDDP.call(this, ...args) : loadMessagesForRoomRest.call(this, ...args));
	database.write(() => {
		data.map(buildMessage).forEach((message) => {
			database.create('messages', message, true);
		});
	});
	return data;
}