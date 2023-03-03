import { CID } from './cid'

const html = (title: string, body: string, bodyStyle?: string) => `<!DOCTYPE html>
<html lang="en">
	<head>
		<title>${title}</title>
		<link rel="preconnect" href="https://fonts.bunny.net">
		<link href="https://fonts.bunny.net/css?family=nova-mono:400" rel="stylesheet" />
		<meta name="referrer" content="no-referrer" />
		<meta name="viewport" content="width=device-width, initial-scale=1" />
		<link rel="icon" type="image/x-icon" href="data:image/png;base64,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">
		<style>
			:root { color-scheme: light dark; }
			body { font-family: 'Nova Mono', monospace; background-color: #000000; } a,h1 { color: #00c9ff; } p { color: #fffcf0; }
			@media (prefers-color-scheme: light) { body { background-color: #fffcf0; } a,h1 { color: #0d67fe; } p { color: #000000; } }
			table { text-align: left; }
		</style>
	</head>
	<body ${bodyStyle}>
		${body}
	</body>
	<footer>
		<p>Note: UDlink will continue to work as is, but development on new features is slow at the moment. Thank you for understanding</p>
	</footer>
</html>`;
const validTLDs = new Set(["bitcoin", "blockchain", "coin", "crypto", "dao", "hi", "klever", "nft", "wallet", "x", "zil", "888"]);
const validGateways = new Set(["cf", "gwc", "dweb", "nfts", "w3s", "4evl", "jole"]);
const gatewayUrls = {
	"cf": ".ipfs.cf-ipfs.com", // Cloudflare
	"gwc": ".ipfs.ipfs-gateway.cloud", // IPFS-Gateway.cloud
	"dweb": ".ipfs.dweb.link", // dweb.link
	"nfts": ".ipfs.nftstorage.link", // NFT.Storage
	"w3s": ".ipfs.w3s.link", // Web3.Storage
	"4evl": ".ipfs.4everland.io", // 4everland
	"jole": ".ipfs.ipfs.joaoleitao.org", // Joao Leitao (Individual)
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
		} else if (gateway === "os" && tld !== undefined && validTLDs.has(tld.toLowerCase())) { // Redirect to Opensea listing if gateway is "os"
			const { networkId, registry, namehash }: { networkId: number, registry: string, namehash: string }
				= await fetch(environment["API_URL" as keyof Env] + sld + "." + tld, {
					method: 'GET',
					headers: { Authorization: `Bearer ${environment["API_KEY" as keyof Env]}` },
					// @ts-expect-error
				}).then(response => response.json()).then(json => json.meta);
			if (namehash === null) {
				return Response.redirect("https://udl.ink/", 303);
			}
			return new Response(null, {
				headers: {
					'location': `https://opensea.io/assets/${networkId == 1 ? "ethereum" : "matic"}/${registry}/${BigInt(namehash)}`,
					'content-type': 'text/html;charset=UTF-8',
					'referrer-policy': 'no-referrer'
				},
				status: 303
			});
		} else if (gateway !== undefined && !validGateways.has(gateway)) { // If invalid gateway, 400 Bad Request, with valid gateway options
			return new Response(html(
				"UDlink: Invalid Gateway",
				`<h1>Invalid IPFS Gatway selected for redirect</h1>
				<p>Requested Gateway Code: ${gateway}</p>
				<p>Valid Gateway Codes include: ${Array.from(validGateways).join(", ")}</p>`,
				"https://udl.ink/invalid-gateway"
			), {
				headers: {
					'content-type': 'text/html;charset=UTF-8',
					'referrer-policy': 'no-referrer'
				},
				status: 400
			});
		} else if (tld === undefined || !validTLDs.has(tld.toLowerCase())) { // If invalid TLD, 400 Bad Request, with valid TLD options
			return new Response(html(
				"UDlink: Invalid TLD",
				`<h1>Invalid Unstoppable Domains TLD</h1>
				<p>Requested Domain: ${domain}</p>
				<p>Valid TLDs include: ${Array.from(validTLDs).join(", ")}</p>`,
				"https://udl.ink/invalid-tld"
			), {
				headers: {
					'content-type': 'text/html;charset=UTF-8',
					'referrer-policy': 'no-referrer'
				},
				status: 400
			});
		}
		const domainHash: string | undefined = await fetch(environment["API_URL" as keyof Env] + sld + "." + tld, {
			method: 'GET',
			headers: { Authorization: `Bearer ${environment["API_KEY" as keyof Env]}` },
			// @ts-expect-error
		}).then(response => response.json()).then(json => json.records?.["ipfs.html.value"] || undefined);
		if (domainHash === undefined) { // If no domain hash, 404 Not Found
			return new Response(html(
				"UDlink: Missing IPFS Hash",
				`<h1>Requested Domain does not have a linked IPFS hash</h1>
				<p>Requested Domain: ${sld}.${tld}</p>
				<p>You can check your domain records <a href="https://unstoppabledomains.com/manage?page=website&domain=${sld}.${tld}">here</a></p>
				<p>If you just made the change to your domain, it may take a few minutes for the new hash to be recognised.</p>`,
				"https://udl.ink/missing-hash"
			), {
				headers: {
					'content-type': 'text/html;charset=UTF-8',
					'referrer-policy': 'no-referrer'
				},
				status: 404
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
