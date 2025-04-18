import { CID } from "./cid"
import { Client as LibsqlClient, createClient } from "@libsql/client/web";

const validTLDs = new Set(["888","academy","actor","agency","altimist","anime","app","archi","army","art","ask","associates","austin","bald","band","bargains","basenji","bay","bch","bet","bike","binanceus","bio","bitcoin","bitget","bitscrunch","black","blockchain","blue","bobi","boo","boomer","boston","bot","boutique","broker","ca","calicoin","care","cash","casino","caw","cc","center","channel","chat","cheap","chomp","church","city","claims","clay","club","co","codes","coffee","com","company","computer","consulting","cool","coupons","credit","crypto","dad","dance","dao","dating","day","deal","delivery","design","dev","dfz","digital","direct","directory","doctor","doga","donut","dream","email","emir","energy","engineering","enterprises","esq","estate","eth","ethermail","events","exchange","express","family","farm","finance","financial","fitness","foo","forex","forsale","free","fun","furniture","fyi","games","global","go","gold","golf","group","grow","guru","haus","hegecoin","her","hi","hiphop","hockey","host","hot","house","how","info","ing","institute","international","investments","io","kim","kingdom","kitchen","klever","kresus","kryptic","land","lfg","lgbt","life","link","live","llc","loans","ltc","ltd","manga","markets","mba","me","media","meme","mery","metropolis","miami","miku","ministry","mobi","moi","money","moon","mov","movie","mumu","net","network","new","news","nexus","nft","nibi","ninja","now","npc","onchain","online","org","organic","page","partners","parts","pastor","pet","phd","photography","photos","pink","pizza","plus","podcast","pog","poker","polygon","press","privacy","pro","productions","prof","promo","properties","propykeys","pudgy","pw","quantum","rad","raiin","recipes","red","rentals","repair","report","restaurant","retardio","rip","rocks","rsvp","run","sale","secret","services","show","singles","site","ski","smobler","social","software","solutions","south","soy","space","spot","stepn","store","studio","style","support","systems","tax","taxi","tball","tea","team","tech","technology","tips","today","tools","town","toys","training","tribe","twin","u","ubu","uno","unstoppable","video","vin","vip","vote","voto","wallet","watch","website","wif","wifi","wine","witg","work","works","world","wrkx","wtf","x","xec","xmr","xyz","zil","zip","zone"]);
const validGateways = new Set(["dweb", "nfts", "w3s", "4el", "arag", "hbin"]);
const validSites = new Set(["os", "osp", "scan", "eden", "tofu", "rari"]);
const gatewayUrls = {
	"dweb": (hash: string) => `${hash}.ipfs.dweb.link`, // dweb.link
	"nfts": (hash: string) => `${hash}.ipfs.nftstorage.link`, // NFT.Storage
	"w3s": (hash: string) => `${hash}.ipfs.w3s.link`, // Web3.Storage
	"4el": (hash: string) => `${hash}.ipfs.4everland.io`, // 4everland
	"arag": (hash: string) => `ipfs.eth.aragon.network/ipfs/${hash}`, // Aragon Network
	"hbin": (hash: string) => `hardbin.com/ipfs/${hash}`, // Hardbin
}; // Updated using origin-separated gateways listed at https://ipfs.github.io/public-gateway-checker/

export interface Env {
	API_KEY?: string;
	API_URL?: string;
	TURSO_URL?: string;
	TURSO_AUTH_TOKEN?: string;
}

function builtLibsqlClient(environment: Env): LibsqlClient | undefined {
	const url = environment.TURSO_URL?.trim();
	const authToken = environment.TURSO_AUTH_TOKEN?.trim();
	if (url === undefined || authToken === undefined) { return undefined; }
	return createClient({ url, authToken });
}

async function countRequest(client: LibsqlClient): Promise<void> {
	try {
		await client.execute("update request_count set count = count + 1 where id = 1");
	} catch (error) {
		console.error("Error executing SQL query:", error);
	}
}

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
		const client = builtLibsqlClient(environment); // Get libsql client, connected to database
		if (client !== undefined) { await countRequest(client); } // Increment request count
		if (domain == "about" || domain == "") {
			return new Response(null, {
				headers: {
					"location": "https://docs.udl.ink/",
					"content-type": "text/html;charset=UTF-8",
					"referrer-policy": "no-referrer"
				},
				status: 303
			});
		} else if (tld === undefined || !validTLDs.has(tld.toLowerCase())) { // If invalid TLD, 400 Bad Request, with valid TLD options
			return new Response(null, {
				headers: {
					"location": `https://docs.udl.ink/error?e=tld&domain=${domain}`,
					"content-type": "text/html;charset=UTF-8",
					"referrer-policy": "no-referrer"
				},
				status: 303
			});
		} else if (gateway === "me") { // Redirect to ud.me page if gateway is "me"
			return new Response(null, {
				headers: {
					"location": `https://ud.me/${sld}.${tld}`,
					"content-type": "text/html;charset=UTF-8",
					"referrer-policy": "no-referrer"
				},
				status: 303
			});
		} else if (gateway !== undefined && !validGateways.has(gateway) && !validSites.has(gateway)) { // If invalid gateway, 400 Bad Request, with valid gateway options
			return new Response(null, {
				headers: {
					"location": `https://docs.udl.ink/error?e=gateway&gateway=${gateway}`,
					"content-type": "text/html;charset=UTF-8",
					"referrer-policy": "no-referrer"
				},
				status: 303
			});
		} else if (gateway !== undefined && validSites.has(gateway)) { // Redirect to listing / scanner page
			const { networkId, registry, tokenId }: { networkId: number, registry: string, tokenId: string }
				= await fetch(environment.API_URL + sld + "." + tld, {
					method: "GET",
					headers: { Authorization: `Bearer ${environment.API_KEY}` },
					// @ts-expect-error
				}).then(response => response.json()).then(json => json.meta);
			if (tokenId === null) {
				return new Response(null, {
					headers: {
						"location": `https://docs.udl.ink/error?e=tokenid&domain=${domain}`,
						"content-type": "text/html;charset=UTF-8",
						"referrer-policy": "no-referrer"
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
					"location": url,
					"content-type": "text/html;charset=UTF-8",
					"referrer-policy": "no-referrer"
				},
				status: 303
			});
		}
		const domainHash: string | undefined = await fetch(environment.API_URL + sld + "." + tld, {
			method: "GET",
			headers: { Authorization: `Bearer ${environment.API_KEY}` },
			// @ts-expect-error
		}).then(response => response.json()).then(json => json.records?.["ipfs.html.value"] || json.records?.["dweb.ipfs.hash"] || undefined);
		if (domainHash === undefined) { // If no domain hash, 404 Not Found
			return new Response(null, {
				headers: {
					"location": `https://docs.udl.ink/error?e=nohash&domain=${domain}`,
					"content-type": "text/html;charset=UTF-8",
					"referrer-policy": "no-referrer"
				},
				status: 303
			});
		} else if (gateway !== undefined) {// If valid gateway and domain hash, redirect to gateway
			return new Response(null, {
				headers: {
					"location": "https://" + gatewayUrls[gateway as keyof typeof gatewayUrls](CID.parse(domainHash).toV1().toString()) + "/" + paths.join("/"),
					"content-type": "text/html;charset=UTF-8",
					"referrer-policy": "no-referrer"
				},
				status: 303
			});
		} else {// Valid domain hash, no gateway selected, use default gateway
			return new Response(null, {
				headers: {
					"location": "https://" + gatewayUrls["hbin"](CID.parse(domainHash).toV1().toString()) + "/" + paths.join("/"),
					"content-type": "text/html;charset=UTF-8",
					"referrer-policy": "no-referrer"
				},
				status: 303
			});
		}
	},
};

// https://docs.unstoppabledomains.com/developer-toolkit/resolution-integration-methods/resolution-service/endpoints/get-records-for-a-domain/
