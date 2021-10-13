const staticCacheName = 's-app-v3';
const dynamicCacheName = 'd-app-v3';

const assetUrls = ['index.html', '/js/app.js', '/css/main.css', 'offline.html'];

self.addEventListener('install', async (event) => {
	const cahce = await caches.open(staticCacheName);

	await cahce.addAll(assetUrls);
});

self.addEventListener('activate', async (event) => {
	const cache_keys = await caches.keys();

	await Promise.all(
		cache_keys
			.filter((item) => item !== staticCacheName)
			.filter((item) => item !== dynamicCacheName)
			.map((item) => caches.delete(item)),
	);
});

self.addEventListener('fetch', async (event) => {
	const { request } = event;

	const url = new URL(request.url);

	if (url.origin === location.origin) {
		event.respondWith(Fetch(request));
	} else {
		console.log('Hello!');
		event.respondWith(networkFirst(request));
	}
});

async function Fetch(request) {
	const cache = await caches.match(request);

	return cache ?? (await fetch(request));
}

async function networkFirst(request) {
	const cache = await caches.open(dynamicCacheName);

	try {
		const response = await fetch(request);
		await cache.put(request, response.clone());
		return response;
	} catch (e) {
		const cached = await cache.match(request);
		return cached ?? (await caches.open('/offline.html'));
	}
}
