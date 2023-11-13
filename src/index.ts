import { CID } from './cid'

const validTLDs = new Set(["888", "anime", "bitcoin", "blockchain", "coin", "crypto", "dao", "go", "hi", "klever", "kresus", "manga", "nft", "polygon", "wallet", "x", "zil"]);
const validGateways = new Set(["cf", "dweb", "nfts", "w3s", "4evl"]);
const validSites = new Set(["os", "osp", "scan", "eden", "tofu", "rari"]);
const gatewayUrls = {
	"cf": ".ipfs.cf-ipfs.com", // Cloudflare
	"dweb": ".ipfs.dweb.link", // dweb.link
	"nfts": ".ipfs.nftstorage.link", // NFT.Storage
	"w3s": ".ipfs.w3s.link", // Web3.Storage
	"4evl": ".ipfs.4everland.io", // 4everland
}; // Updated using origin-separated gateways listed at https://ipfs.github.io/public-gateway-checker/

export interface Env { }

export default {
	async fetch(
		request: Request,
		environment: Env,
		context: ExecutionContext
	): Promise<Response> {
		const url: URL = new URL(request.url); // Convert to URL object
		const gateway: string | undefined = url.hostname.match(/(\w*).udl.ink/)?.[1]; // Get potential gateway
		const [domain, ...paths]: string[] = url.pathname.split("/").slice(1); // Get requested targets
		let domains: string[] = domain.split("."); // Split requested tld by . separator
		const tld = domains.pop(); // Get TLD
		const sld = domains.join("."); // Join SLDs together
		if (domain == "about" || domain == "") {
			return new Response(null, {
				headers: {
					'location': "https://docs.udl.ink/",
					'content-type': 'text/html;charset=UTF-8',
					'referrer-policy': 'no-referrer'
				},
				status: 303
			});
		} else if (tld === undefined || !validTLDs.has(tld.toLowerCase())) { // If invalid TLD, 400 Bad Request, with valid TLD options
			return new Response(null, {
				headers: {
					'location': `https://docs.udl.ink/error?e=tld&domain=${domain}`,
					'content-type': 'text/html;charset=UTF-8',
					'referrer-policy': 'no-referrer'
				},
				status: 303
			});
		} else if (gateway !== undefined && !validGateways.has(gateway) && !validSites.has(gateway)) { // If invalid gateway, 400 Bad Request, with valid gateway options
			return new Response(null, {
				headers: {
					'location': `https://docs.udl.ink/error?e=gateway&gateway=${gateway}`,
					'content-type': 'text/html;charset=UTF-8',
					'referrer-policy': 'no-referrer'
				},
				status: 303
			});
		} else if (gateway === "me") { // Redirect to ud.me page if gateway is "me"
			return new Response(null, {
				headers: {
					'location': `https://ud.me/${sld}.${tld}`,
					'content-type': 'text/html;charset=UTF-8',
					'referrer-policy': 'no-referrer'
				},
				status: 303
			});
		} else if (gateway !== undefined && validSites.has(gateway)) { // Redirect to listing / scanner page
			const { networkId, registry, tokenId }: { networkId: number, registry: string, tokenId: string }
				= await fetch(environment["API_URL" as keyof Env] + sld + "." + tld, {
					method: 'GET',
					headers: { Authorization: `Bearer ${environment["API_KEY" as keyof Env]}` },
					// @ts-expect-error
				}).then(response => response.json()).then(json => json.meta);
			if (tokenId === null) {
				return new Response(null, {
					headers: {
						'location': `https://docs.udl.ink/error?e=tokenid&domain=${domain}`,
						'content-type': 'text/html;charset=UTF-8',
						'referrer-policy': 'no-referrer'
					},
					status: 303
				});
			}
			let url;
			if (gateway === "os") {
				url = `https://opensea.io/assets/${networkId == 1 ? "ethereum" : "matic"}/${registry}/${tokenId}`;
			} else if (gateway === "osp") {
				url = `https://pro.opensea.io/nft/${networkId == 1 ? "ethereum" : "polygon"}/${registry}/${tokenId}`;
			} else if (gateway === "eden") {
				url = `https://magiceden.io/item-details/${networkId == 1 ? "ethereum" : "polygon"}/${registry}/${tokenId}`;
			} else if (gateway === "tofu") {
				url = `https://tofunft.com/nft/${networkId == 1 ? "eth" : "polygon"}/${registry}/${tokenId}`;
			} else if (gateway === "rari") {
				url = `https://rarible.com/token/${networkId == 1 ? "" : "polygon/"}${registry}:${tokenId}`;
			} else if (networkId == 1) {
				url = `https://etherscan.io/nft/${registry}/${tokenId}`;
			} else {
				url = `https://polygonscan.com/token/${registry}?a=${tokenId}`;
			}
			return new Response(null, {
				headers: {
					'location': url,
					'content-type': 'text/html;charset=UTF-8',
					'referrer-policy': 'no-referrer'
				},
				status: 303
			});
		}
		const domainHash: string | undefined = await fetch(environment["API_URL" as keyof Env] + sld + "." + tld, {
			method: 'GET',
			headers: { Authorization: `Bearer ${environment["API_KEY" as keyof Env]}` },
			// @ts-expect-error
		}).then(response => response.json()).then(json => json.records?.["ipfs.html.value"] || undefined);
		if (domainHash === undefined) { // If no domain hash, 404 Not Found
			return new Response(null, {
				headers: {
					'location': `https://docs.udl.ink/error?e=nohash&domain=${domain}`,
					'content-type': 'text/html;charset=UTF-8',
					'referrer-policy': 'no-referrer'
				},
				status: 303
			});
		} else if (gateway !== undefined) {// If valid gateway and domain hash, redirect to gateway
			return new Response(null, {
				headers: {
					'location': `https://${CID.parse(domainHash).toV1().toString() + gatewayUrls[gateway as keyof typeof gatewayUrls] + "/" + paths.join("/")}`,
					'content-type': 'text/html;charset=UTF-8',
					'referrer-policy': 'no-referrer'
				},
				status: 303
			});
		} else {// Valid domain hash, no gateway selected, use default gateway
			return new Response(null, {
				headers: {
					'location': `https://${CID.parse(domainHash).toV1().toString() + gatewayUrls.cf + "/" + paths.join("/")}`,
					'content-type': 'text/html;charset=UTF-8',
					'referrer-policy': 'no-referrer'
				},
				status: 303
			});
		}
	},
};

// https://docs.unstoppabledomains.com/developer-toolkit/resolution-integration-methods/resolution-service/endpoints/get-records-for-a-domain/
